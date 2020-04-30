let fs = require("fs");
let http = require("http");
let puppeteer = require("puppeteer");
let scrapeScript = require("./scraper/static/scrape-script.js");


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

        let players1 = matchData["0"].player_data;
        let players2 = matchData["1"].player_data;
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
        expect(result).toBeFalsy();
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
