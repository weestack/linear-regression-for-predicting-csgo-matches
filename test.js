let fs = require("fs");
let http = require("http");
let puppeteer = require("puppeteer");

/* Test to see if the GET endpoints on the backend are available. */
describe("Backend connection test", () => {
    test("index.html exists", done => {
        http.get("http://localhost:8090/index.html", (response) => {
            let statusCode = response.statusCode;
            expect(statusCode).toBe(200);
            done();
        });
    });
    test("/dataStatus works", done => {
        http.get("http://localhost:8090/dataStatus", (response) => {
            let statusCode = response.statusCode;
            expect(statusCode).toBe(200);
            done();
        });
    }, 20000); // Allow the test to run for 20 seconds since it might be slow
    test("/statistics works", done => {
        http.get("http://localhost:8090/statistics", (response) => {
            let statusCode = response.statusCode;
            expect(statusCode).toBe(200);
            done();
        });
    }, 20000); // This one might also be slow
    test("/coeficcients works", done => {
        http.get("http://localhost:8090/coeficcients", (response) => {
            let statusCode = response.statusCode;
            expect(statusCode).toBe(200);
            done();
        });
    }, 20000); // This one might also be slow
});

describe("Scraper code in browser", async () => {
    let browser = await puppeteer.launch({
        headless: false,
    });

    test("scraper progress should be 0 by default", async () => {
        let page = browser.newPage();
        await page.goto("http://localhost:8090");
    });
});
