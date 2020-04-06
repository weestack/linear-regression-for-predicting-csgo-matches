"use strict";

console.log("Scraper");
let test ={
    url: "https://www.hltv.org/stats/teams/6665/Astralis",
    location: "div.columns:nth-child(5) > div.col:nth-child(2) > div.large-strong",
    handle: element => {console.log(element)},
}

async function run_scraper(scraper){
    let response = await fetch(scraper.url);
    if (response.status == 200){
        let html = await response.text();
        let domparser = new DOMParser();
        let dom = domparser.parseFromString(html, "text/html");
        console.log(dom);
    }
}