"use strict";

/* Returns the win/loose ratio for the team */
function D1(team_id, team_name) {
    return {
        url: "https://www.hltv.org/stats/teams/" + team_id + "/" + team_name,
        location: "div.columns:nth-child(5) > div.col:nth-child(2) > div.large-strong",
        handle: element => {
            let textParts = element.textContent.split(" / ");
            let wins = parseInt(textParts[0]);
            let losses = parseInt(textParts[2]);
            return wins/losses;
        },
    };
}

/* Returns the name of the team's best map */
function D2(team_id, team_name) {
    return {
        url: "https://www.hltv.org/stats/teams/maps/" + team_id + "/" + team_name,
        location: "a.map-stats > div.map-pool-map-name",
        handle: element => {
            let mapName = element.textContent.split(" ")[0];
            return mapName;
        },
    };
}

/* returns the last 100 matches (team1 team2 winner link) for team1 */
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
            link: {
                location: "a",
                handle: element => {return element.href},
            },
        },
        handle: element => {
            return element;
        },
    };
}

/* Returns an object with weapons as keys, and uses as values */
function D4(player_id, player_name) {
    return {
        url: "https://www.hltv.org/stats/players/weapon/" + player_id + "/" + player_name,
        location: "div.stats-row",
        scrape_many: true,
        sub_scrapers: {
            weapon: {
                location: "div > span:nth-child(2)",
                handle: element => {
                    return element.textContent.trim();
                },
            },
            uses: {
                location: ":scope > span",
                handle: element => {
                    return parseInt(element.textContent);
                },
            }
        },
        handle: element => {
            let result = {};
            for (let i in element) {
                let weapon = element[i].weapon;
                let uses = element[i].uses;
                result[weapon] = uses;
            }
            return result;
        },
    }
}

/* Returns the number of kills each team has made and which weapons they used */
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
            return output;
        }
    }
}

/* Returns the percentage of headshots that the player made */
function D6(player_id, player_name) {
    return {
        url: "https://www.hltv.org/stats/players/" + player_id + "/" + player_name,
        location: "div.stats-rows:nth-child(1) > div.stats-row:nth-child(2) >span:nth-child(2)",
        handle: element => {
            return parseFloat(element.textContent)
        },
    }
}

/* Returns the number of first kills that each team got */
function D7(match_id, match_name) {
    return {
        url: "https://www.hltv.org/stats/matches/mapstatsid/" + match_id + "/" + match_name,
        location: "div.match-info-row:nth-child(6) > div.right",
        handle: element => {
            let textParts = element.textContent.split(" : ");
            let result = {
                team1: parseInt(textParts[0]),
                team2: parseInt(textParts[1]),
            };
            return result;
        },
    }
}

/* Returns the date of the team's last match as a Date object */
function D8(team_id) {
    return {
        url: "https://www.hltv.org/results?team=" + team_id,
        location: "div.results-sublist:nth-child(1) > .standard-headline",
        handle: element => {
            let dateString = element.textContent.slice(12);
            let parts = dateString.split(" ");
            let monthString = parts[0];
            let month = null;
            switch (monthString) {
                case "January": month = 0; break;
                case "February": month = 1; break;
                case "March": month = 2; break;
                case "April": month = 3; break;
                case "May": month = 4; break;
                case "June": month = 5; break;
                case "July": month = 6; break;
                case "August": month = 7; break;
                case "September": month = 8; break;
                case "October": month = 9; break;
                case "November": month = 10; break;
                case "December": month = 11; break;
            }
            let day = parseInt(parts[1].slice(0,-2));
            let year = parseInt(parts[2]);
            return new Date(year, month, day);
        },
    }
}

/* Returns the number of days that the player has been his the current team */
function D9(player_id, player_name) {
    return {
        url: "https://www.hltv.org/player/" + player_id + "/" + player_name + "#tab-teamsBox",
        location: "div.tab-content > div.highlighted-stats-box >div.highlighted-stat:nth-child(2) > div.stat",
        handle: element => {
            return parseInt(element.textContent);
        },
    }
}

/* Returns the kill to death ratio of the player */
function D10(player_id, player_name) {
    return {
        url: "https://www.hltv.org/stats/players/" + player_id + "/" + player_name,
        location: "div.stats-rows:nth-child(1) > div.stats-row:nth-child(4) >span:nth-child(2)",
        handle: element => {
            return parseFloat(element.textContent);
        },
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
            let base = dom.createElement("base");
            base.href = "https://hltv.org"
            dom.head.appendChild(base);
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

/*Team info used in D1, D2, D3, D8*/
function scrape_team(team_id, team_name){

}

/*Match info used in D5, D7*/
function scrape_match(match_id, match_name){

}


/*Player info used in D4, D6, D9, D10. KDA = Kills/Deaths/Assist*/ 
async function scrape_player(player_id, player_name){
    let most_used_weapons = await run_scraper(D4(player_id, player_name));
    let headshots = await run_scraper(D6(player_id, player_name));
    let days_in_team = await run_scraper(D9(player_id, player_name));
    let kda = await run_scraper(D10(player_id, player_name));
    return {most_used_weapons, headshots, days_in_team, kda};
}