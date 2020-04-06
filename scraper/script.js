"use strict";

console.log("Scraper");
let D1 ={
    url: "https://www.hltv.org/stats/teams/6665/Astralis",
    location: "div.columns:nth-child(5) > div.col:nth-child(2) > div.large-strong",
    handle: element => {console.log(element.textContent)},
}

let D2 ={
    
}

let D3 ={
    
}

let D4 ={
    url: "https://www.hltv.org/results?team=6665",
    location: "div.result-con",
    scrape_many: true,
    sub_scrapers: {
        team1: {
            location: "div.team1 > div.team",
            handle: element => {return element.textContent},
        },
        team2: {
            location: "div.team2 > div.team",
            handle: element => {return element.textContent},
        },
        winner: {
            location: "div.team-won",
            handle: element => {return element.textContent},
        },
    },
    handle: element => {console.log(element)},
}

let D5 ={
    
}

let D6 ={
    
}

let D7 ={
    
}

let D8 ={
    
}

let D9 ={
    
}

let D10 ={
    
}


async function run_scraper(scraper, dom){
    let elements = [];
    let results = [];
    if(dom == undefined){
        let proxy = "http://localhost:8080/";
        let response = await fetch(proxy + scraper.url);
        if (response.status == 200){
            let html = await response.text();
            let domparser = new DOMParser();
            dom = domparser.parseFromString(html, "text/html");
            console.log(dom);
        }
    }
    if (scraper.scrape_many){
        elements = Array.from(dom.querySelectorAll(scraper.location));
    }
    else {
        elements = [dom.querySelector(scraper.location)];
    }
    if ('sub_scrapers' in scraper){
        let scrapers = scraper.sub_scrapers;
        for(let i in elements){
            let result = {};
            for(let s in scrapers){
                result[s] = await run_scraper(scrapers[s], elements[i]);
            }
            results.push(result);
        }
    }
    else {
        results = elements;
    }

    try{
        if (scraper.scrape_many){
            return scraper.handle(results);
        }
        else {
            
            return scraper.handle(results[0]);
        }
    }
    catch(e){
        console.log(e);
        return null;
    }
}