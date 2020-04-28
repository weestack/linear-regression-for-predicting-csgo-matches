let fs = require("fs");
let http = require("http");
let puppeteer = require("puppeteer");
let scrapeScript = require("./scraper/static/scrape-script.js");


let browser = undefined;
let page = undefined;

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
    test("Scraper should be able to scrape a match", async () => {
        await page.goto("http://localhost:8090");
        let matchData = await page.evaluate(async () => {
            let data = await scrape_n_matches(1);
            return data;
        });

        expect(matchData).not.toBeNull();
    }, 5 * 60 * 1000); // Allow this test to run for a full 5 minutes since it might be slow

    test("Should throw errors on invalid data", async () => {
        await page.goto("http://localhost:8090");
        expect(() => {
            page.evaluate(scrape_player, "12345", "AalborgUniversitet") // this is not a real player
        }).toThrow();
    });

    test("Should not throw errors on good data", async () => {
        await page.goto("http://localhost:8090");
        expect(() => {
            page.evaluate(scrape_player, "7592", "device") // this is a real player
        }).toThrow();
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
});