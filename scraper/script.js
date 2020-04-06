"use strict";


function D1(team_id, team_name) {
    return {
        url: "https://www.hltv.org/stats/teams/" + team_id + "/" + team_name,
        location: "div.columns:nth-child(5) > div.col:nth-child(2) > div.large-strong",
        handle: element => {console.log(element.textContent)},
    };
}

function D2(team_id, team_name) {
    return {
        url: "https://www.hltv.org/stats/teams/maps/" + team_id + "/" + team_name,
        location: "a.map-stats > div.map-pool-map-name",
        handle: element => {console.log(element.textContent)},
    };
}

function D3(team_id) {
    return{
        url: "https://www.hltv.org/results?team=" + team_id,
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
    };
}

function D4(player_id, player_name) {
    return {
        url: "https://www.hltv.org/stats/players/weapon/" + player_id + "/" + player_name,
        location: "div.stats-row",
        scrape_many: true,
        sub_scrapers: {
            weapon: {
                location: "div > span:nth-child(2)",
                handle: element => {return element.textContent},
            },
            uses: {
                location: ":scope > span",
                handle: element => {return element.textContent},
            }
        },
        handle: element => {console.log(element)},
    }
}

function D5(match_id, match_name) {
    return {
        url: "https://www.hltv.org/stats/matches/heatmap/mapstatsid/" + match_id + "/" + match_name,
        location: "div.players",
        scrape_many: true,
        sub_scrapers: {
            teams: {
                location: "div.player",
                scrape_many: true,
                sub_scrapers:{
                    player: {
                        location: "option:not(:last-child)",
                        scrape_many: true,
                        handle: elements => {
                            let results = {};
                            for(let i in elements){
                                let text = elements[i].textContent;
                                let textparts = text.split(" ");
                                let weapon = textparts[0];
                                let kills = parseInt(textparts[1].slice(1, -1));
                                results[weapon] = kills; 
                            }
                            return results;
                        }

                    }
                },
                handle: list => {
                    let result = {};
                    for(let i in list){
                        let playerkills = list[i].player;
                        for(let weapon in playerkills){
                            let kills = playerkills[weapon];
                            if(weapon in result){
                                result[weapon]+= kills;
                            }
                            else
                                result[weapon] = kills;
                        }
                    }
                    return result;
                }
            }
        },
        handle: e => {
            let output = {
                team1: e[0].teams,
                team2: e[1].teams,
            };
            console.log(output);
            return output;
        }
    }
}

function D6(player_id, player_name) {
    return {
        url: "https://www.hltv.org/stats/players/" + player_id + "/" + player_name,
        location: "div.stats-rows:nth-child(1) > div.stats-row:nth-child(2) >span:nth-child(2)",
        handle: element => {console.log(element.textContent)},
    }
}

function D7(match_id, match_name) {
    return {
        url: "https://www.hltv.org/stats/matches/mapstatsid/" + match_id + "/" + match_name,
        location: "div.match-info-row:nth-child(6) > div.right",
        handle: element => {console.log(element.textContent)},
    }
}

function D8(team_id) {
    return {
        url: "https://www.hltv.org/results?team=" + team_id,
        location: "div.results-sublist:nth-child(1) > .standard-headline",
        handle: element => {console.log(element.textContent)},
    }
}

function D9(player_id, player_name) {
    return {
        url: "https://www.hltv.org/player/" + player_id + "/" + player_name + "#tab-teamsBox",
        location: "div.tab-content > div.highlighted-stats-box >div.highlighted-stat:nth-child(2) > div.stat",
        handle: element => {console.log(element.textContent)},
    }
}

function D10(player_id, player_name) {
    return {
        url: "https://www.hltv.org/stats/players/" + player_id + "/" + player_name,
        location: "div.stats-rows:nth-child(1) > div.stats-row:nth-child(4) >span:nth-child(2)",
        handle: element => {console.log(element.textContent)},
    }
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