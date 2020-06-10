let fs = require("fs");
let http = require("http");
let puppeteer = require("puppeteer");
let scrapeScript = require("./scraper/static/scrape-script.js");

let regression = require("./prediction_lib/regression");
let linear_regression = new regression.Multi_Linear_Regression;
/* index 0 is Y, index 1 is x input */
let small_dataset_for_regression = [
    [1, 2],
    [2, 4],
    [4, 8],
    [8, 16]
];


let fileReader = require("./prediction_lib/FileReader")
let math_js = require("mathjs");



let browser = undefined;
let page = undefined;
let matchData = undefined; /* Data for a scraped match */
let players = [];



beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: false,
    });
    page = await browser.newPage();
    return;
});

afterAll(async () => {
    browser.close();
});

/* Test to see if the GET endpoints on the backend are available. */

describe("Backend connection test", () => {
    test("index.html exists", done => {
        http.get("http://localhost:8090/index.html", (response) => {
            let statusCode = response.statusCode;
            expect(statusCode).toBe(200);
            done();
        });
    });
});

describe("Scraper code in browser", () => {
    beforeAll(async () => {
        await page.goto("http://localhost:8090");
        [matchData] = await page.evaluate(async () => {
            let data = await scrape_n_matches(1);
            return data;
        });

        for (let team = 0; team < 2; team++) {
            for (let playerName in matchData[team].player_data) {
                players.push([team, playerName]);
            }
        }
    }, 5 * 60 * 1000); // Allow this setup to run for a full 5 minutes since it might be slow

    test("Scraper should be able to scrape a match", async () => {
		expect(matchData).not.toBeNull();
    });

    test("Should throw errors on invalid data", async () => {
        await page.goto("http://localhost:8090");
        let result = await page.evaluate(async () => {
            try {
                await scrape_match("12345667", "gamers-vs-gamers");
                return true; // true means it did not throw an error
            } catch (e) {
                return false;
            }
        });
        expect(result).toBeFalsy();
    }, 2 * 60 * 1000); // give it two minutes

    test("Should not throw errors on good data", async () => {
        await page.goto("http://localhost:8090");
        let result = await page.evaluate(async () => {
            try {
                await scrape_match("101887", "copenhagen-flames-vs-godsent");
                return true; // true means it did not throw an error
            } catch (e) {
                return false;
            }
        });
        expect(result).toBeTruthy();
    }, 2 * 60 * 1000); // give it two minutes

    test.each([
        "0",
        "1",
        "winner",
        "team1Rounds",
        "team2Rounds",
        "id",
        "date"
    ])("match data should contain a field named %s", fieldName => {
        expect(matchData[fieldName]).not.toBeUndefined();
    });

    let teamFields = ["id", "best_maps", "kills", "last_match_date", "last_matches", "name", "player_data", "win_loose_ratio"];
    let teamFieldsCombinations = [];
    for (let i in teamFields) {
        teamFieldsCombinations.push(["0", teamFields[i]]);
        teamFieldsCombinations.push(["1", teamFields[i]]);
    }

    test("The number of players should not be 0", () => {
        expect(players.length).not.toBe(0);
    });

    test.each(teamFieldsCombinations)("team %i should have a field named %s", (team, fieldName) => {
        expect(matchData[team][fieldName]).not.toBeUndefined();
    });

    let playerFields = ["kda", "days_in_team", "headshots", "most_used_weapons"];
    test.each(playerFields)("All players should have a field named %s", fieldName => {
        expect(() => {
            for (let p in players) {
                let [team, player] = players[p];
                if (matchData[team].player_data[player][fieldName] == undefined) {
                    throw new Error("Field " + fieldName + " was undefined for player " +
                                    player + " on team " + team);
                }
            }
        }).not.toThrow();
    });
});

describe("Website tests", () => {
    test("scraper progress should be 0 by default", async () => {
        await page.goto("http://localhost:8090");
        let progress = await page.evaluate(() => {
            let text = document.getElementById("matches").textContent;
            return parseInt(text);
        });
        expect(progress).toBe(0);
    });

    test("Progress percent after a scrape should be 100.00%", async () => {
        await page.goto("http://localhost:8090");
        await page.evaluate(async () => {
            await scrape_n_matches(1);
        });
        let pct = await page.evaluate(() => {
            return document.getElementById("MatchProgressProcent").textContent;
        });
        expect(pct).toMatch("100.00%");
    }, 5 * 60 * 1000);
});


/* tests for Prediction */
describe("Testing methods in linear regression objects", () => {
    test("Test basic regression", () => {
        let test_matrix = math_js.matrix(small_dataset_for_regression);
        let coe = linear_regression.estimate_best_coefficients(math_js.column(test_matrix, 1), math_js.column(test_matrix, 0))
        let intercept = coe.subset(math_js.index(0, 0));
        let slope = coe.subset(math_js.index(1, 0));
        /* match the coefficients for linear output stated at index 0 in variable arr */
        for (let i = 0; i < small_dataset_for_regression.length; i++) {
            expect(small_dataset_for_regression[i][0] === (intercept + (slope * small_dataset_for_regression[i][1]))).toBeTruthy();
        }
    });

    test("Test for correct mean calculations! ", () => {
        /* Mean is calculated by summing up a column and divide by number of elements */
        let test_column = math_js.transpose(math_js.matrix(small_dataset_for_regression)).toArray()[1];
        let mean = linear_regression.mean(test_column)
        let calculated_mean = small_dataset_for_regression.reduce((val, itt) => val + itt[1], 0) / small_dataset_for_regression.length;
        expect(mean).toEqual(calculated_mean);
    });

    test("create mean vector from matrix ", () => {
        let test_matrix = math_js.matrix(small_dataset_for_regression);
        let mean_vec = linear_regression.mean_vector(test_matrix).toArray();

        let calculated_mean_x = small_dataset_for_regression.reduce((val, itt) => val + itt[1], 0) / small_dataset_for_regression.length;
        let calculated_mean_y = small_dataset_for_regression.reduce((val, itt) => val + itt[0], 0) / small_dataset_for_regression.length;

        expect(mean_vec[1]).toEqual(calculated_mean_x)
        expect(mean_vec[0]).toEqual(calculated_mean_y)

    });

    test("Test rss from linear regression obj ", () => {
        let test_matrix = math_js.matrix(small_dataset_for_regression)

        let X = math_js.column(test_matrix, 1);
        let Y = math_js.column(test_matrix, 0);
        let coe = linear_regression.estimate_best_coefficients(X, Y);
        let rss = linear_regression.rss(X, Y, coe);
        expect(rss).toBe(0);
    });
    ;


    test("r_squared from linear regression", () => {
        let test_matrix = math_js.matrix(small_dataset_for_regression);
        let coe = linear_regression.estimate_best_coefficients(math_js.column(test_matrix, 1), math_js.column(test_matrix, 0));
        let r_squared = linear_regression.r_squared(coe, math_js.column(test_matrix, 1), math_js.column(test_matrix, 0));
        expect(r_squared).toBe(1);
    });

    test("Pearson_correlation between dependent and independent variable linear regression", () => {
        let test_matrix = math_js.matrix(small_dataset_for_regression);
        let pearson = linear_regression.pearson_correlations(math_js.column(test_matrix, 1), math_js.column(test_matrix, 0))
        expect(pearson[0]).toBeGreaterThanOrEqual(1);
    });

    test("sigma_squared ", () => {
        let test_matrix = math_js.matrix(small_dataset_for_regression);
        let X = math_js.column(test_matrix, 1);
        let Y = math_js.column(test_matrix, 0);
        let coe = linear_regression.estimate_best_coefficients(X, Y);
        let rss = linear_regression.rss(X, Y, coe);
        let sigma_squared = linear_regression.sigma_squared(rss, X);
        expect(sigma_squared).toEqual(0);
    });
});

/* Tests for filereader */
describe("Testing methods defined in the filereader", () => {

    /* init test filereader */
    let directory = "./test_files/";
    let match_data = new fileReader.match_data(directory);


    test("Read in files from a directory", () => {
        /* we know there are 12 json files in ./test_files/ */
        let files = match_data.read_in_files();
        expect(files.length).toEqual(12)

    });

    test ("Check that header is valid!", () => {
        let header = match_data.header
        /* testing ids */
        expect(header[0].id).toEqual("winner")
        expect(header[1].id).toEqual("powerscore_delta")
        expect(header[2].id).toEqual("win_loose_delta")
        expect(header[3].id).toEqual("kda_delta")
        expect(header[4].id).toEqual("headshot_delta")
        expect(header[5].id).toEqual("time_in_team_delta")
        /* check length */
        expect(header.length).toEqual(6)
    });

    test("Validate data readin from file and test output of data processing", () => {
        let file = "";
        let files = match_data.read_in_files();
        for (let f in files){
            if (files[f] === "92595.json"){
                file = files[f];
            }
        }
        expect(file).toEqual("92595.json");

        let data = match_data.read_in_data([file])
        /* 0 means team 1 wins */
        let winner_id = data[0].winner;
        expect(winner_id).toEqual(0)
        /* by this, it can be confimed that the reader has read in the file corretly! */


        let match_results = match_data.process_raw_data(data);
        /* winner id is always at first index, then the losing id is always the second */
        let winner = match_results[0][0];
        expect(winner).toEqual(data[0][winner_id]["id"])
    });
});
