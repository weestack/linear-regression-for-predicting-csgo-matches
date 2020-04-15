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

/* Returns the teams best maps and win ratio */
function D2(team_id, team_name) {
    return {
        url: "https://www.hltv.org/stats/teams/maps/" + team_id + "/" + team_name,
        location: "a.map-stats > div.map-pool-map-name",
        scrape_many: true,
        handle: elements => {
            let result = {};
            for(let i in elements){
                let textParts = elements[i].textContent.split(" ");
                let mapName = textParts[0];
                result[mapName] = parseFloat(textParts[2]);
            }
            return result;
        },
    };
}

function D3(team_id, offset){
    return {
        url: "https://www.hltv.org/results?team=" + team_id + "&offset=" + offset,
        location: "div.results-sublist",
        scrape_many: true,
        sub_scrapers: {
            date: {
                location: "div.results-sublist > .standard-headline",
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
            },
            matches: {
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
                handle: element => {
                    return element;
                },
            }
        },
        handle: elements => {
            let results = [];
            for(let i in elements){
                let date = elements[i].date;
                for(let t in elements[i].matches){
                    let match = elements[i].matches[t];
                    match.date = date;
                    results.push(match);
                }
            }
            return results;
        }
    }
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
            let output = {};
            output.team1 = e[0].teams;
            output.team2 = e[1].teams;
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

/* Returns the number of first kills that each team got in a match*/
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

/*Scraper players in teams*/
function team_players(team_id, team_name){
    return {
        url: "https://www.hltv.org/team/" + team_id + "/" + team_name,
        location: "a.col-custom",
        scrape_many: true,
        handle: elements => {
            let players = {};
            for(let i in elements){
                let link = elements[i].href
                let linkParts = link.split("/").reverse();
                let name = linkParts[0];
                let id = linkParts[1];
                players[id] = name;
            }
            return players;
        }
    }
}

/*Scrape which teams played in a specific match*/
function match_teams(match_id, match_name){
    return {
        url: "https://www.hltv.org/stats/matches/mapstatsid/" + match_id + "/" + match_name,
        location: "div.team-left > a,div.team-right > a",
        scrape_many: true,
        handle: elements => {
            let teams = {};
            for(let i in elements){
                let link = elements[i].href
                let linkParts = link.split("/").reverse();
                let name = linkParts[0];
                let id = linkParts[1];
                teams[i] = {name, id};
            }
            return teams;
        }
    }
}

function match_winner(match_id, match_name){
    return {
        url: "https://www.hltv.org/stats/matches/mapstatsid/" + match_id + "/" + match_name,
        location: ".team-left > .bold, .team-right > .bold",
        scrape_many: true,
        handle: elements => {
            let score1 = parseInt(elements[0].textContent);
            let score2 = parseInt(elements[1].textContent);
            let winner = (score1 > score2) ? 0: 1;
            return winner;
        }

    }
}

async function run_scraper(scraper, dom){
    let elements = [];
    let results = [];
    if(dom == undefined){
        let response = await fetch_link(scraper.url);
        console.log("Scraaaaaping " + scraper.url);
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
async function scrape_team(team_id, team_name){
    let win_lose_ratio = await run_scraper(D1(team_id, team_name));
    let best_maps = await run_scraper(D2(team_id, team_name));
    let last_matches = [];
    let done = false;
    for(let offset = 0; done == false; offset += 100){
        let matches = await run_scraper(D3(team_id, offset));
        if(matches.length == 0){
            done = true;
        }
        else {
            last_matches = last_matches.concat(matches);
        }
    }
    let last_match_date = await run_scraper(D8(team_id));
    let players = await run_scraper(team_players(team_id, team_name));
    let player_data = {};
    for(let player_id in players){
        player_data[player_id] = await scrape_player(player_id, players[player_id]);
    }
    return {
        win_lose_ratio,
        best_maps,
        last_matches,
        last_match_date,
        player_data
    };
}

/*Match info used in D5, D7*/
async function scrape_match(match_id, match_name){
    let teams = await run_scraper(match_teams(match_id, match_name));
    let team_kills = await run_scraper(D5(match_id, match_name));
    let first_kills = await run_scraper(D7(match_id, match_name));
    teams[0].kills = team_kills.team1;
    teams[1].kills = team_kills.team2;
    teams[0].first_kills = first_kills.team1;
    teams[1].first_kills = first_kills.team2;
    return teams;
}


/*Player info used in D4, D6, D9, D10. KDA = Kills/Deaths/Assist*/ 
async function scrape_player(player_id, player_name){
    let most_used_weapons = await run_scraper(D4(player_id, player_name));
    let headshots = await run_scraper(D6(player_id, player_name));
    let days_in_team = await run_scraper(D9(player_id, player_name));
    let kda = await run_scraper(D10(player_id, player_name));
    return {most_used_weapons, headshots, days_in_team, kda};
}

function scrape_match_list(offset) {
    return{
        url: "https://www.hltv.org/stats/matches?offset=" + offset,
        location: "td.date-col",
        scrape_many: true,
        sub_scrapers: {
            date: {
                location: "a > div.time",
                handle: element => {
                    let dateText = element.textContent;
                    let parts = dateText.split("/");
                    let year = parseInt("20" + parts[2]);
                    let month = parseInt(parts[1]);
                    let day = parseInt(parts[0]);
                    let date = new Date(year, month - 1, day);
                    return date;
                }
            },
            match: {
                location: "a",
                handle: element => {
                    let link = element.href
                    let linkParts = link.split("/").reverse();
                    let matchName = linkParts[0];
                    let matchId = linkParts[1];
                    return {matchName, matchId};
                },
            },
        },
        handle: elements => {
            let result = [];
            for(let i in elements){
                let match = elements[i].match;
                result[i] = {matchId: match.matchId, matchName: match.matchName, date: elements[i].date};
            }
            console.log(result);
            return result;
        },
    };
}

async function scrape_n_matches(amount_of_matches){
    total_matches = amount_of_matches; /* DEBUGGING */
    current_job = "finding matches" /* DEBUGGING */
    update_html_status(); /* DEBUGGING */
    let matchList = [];
    let done = false;
    let resultList = [];
    for(let offset = 0; done == false; offset += 50){
        let matches = await run_scraper(scrape_match_list(offset));
        matchList = matchList.concat(matches);
        if(matchList.length >= amount_of_matches){
            done = true;
            matchList = matchList.slice(0, amount_of_matches);
        }
    }

    current_job = "finding teams"; /* DEBUGGING */
    let teamsToScrape = {}
    for(let i in matchList){
        let matchId = matchList[i].matchId;
        let matchName = matchList[i].matchName;
        let matchTeams = await run_scraper(match_teams(matchId, matchName));
        matchList[i].teams = matchTeams;
        for(let index in matchTeams){
            let teamId = matchTeams[index].id;
            let teamName = matchTeams[index].name;
            if (!(teamId in teamsToScrape)) {
                teamsToScrape[teamId] = teamName;
                total_teams++; /* DEBUGGING */
                update_html_status(); /* DEBUGGING */
            }
        }
    }

    current_job = "scraping teams"; /* DEBUGGING */
    let teams = {};
    for (let teamId in teamsToScrape) {
        if(!(teamId in teams)){
            let teamName = teamsToScrape[teamId];
            teams[teamId] = await scrape_team(teamId, teamName);
            done_teams++ /* DEBUGGING */
            update_html_status(); /* DEBUGGING */
        }
    }

    current_job = "scraping matches"; /* DEBUGGING */
    for(let i in matchList){
        let matchId = matchList[i].matchId;
        let matchName = matchList[i].matchName;
        resultList[i] = await scrape_match(matchId, matchName);
        let matchTeams = matchList[i].teams;
        resultList[i].winner = await run_scraper(match_winner(matchId, matchName));
        resultList[i].date = matchList[i].date;
        resultList[i].id = matchId;
        for(let t = 0; t < 2; t++){
            let teamData = teams[matchTeams[t].id];
            for(let dataName in teamData){
                resultList[i][t][dataName] = teamData[dataName];
            }
        }
        save_data(resultList[i]);
        done_matches++; /* DEBUGGING */
        update_html_status();
    }
    current_job = "nothing :)"; /* DEBUGGING */
    update_html_status(); /* DEBUGGING */
    return resultList;
}

/* This is mostly intended for debugging and should be removed later. */
let total_matches = 0;
let done_matches = 0;
let total_teams = 0;
let done_teams = 0;
let current_job = "nothing";
function update_html_status() {
	document.getElementById("matches").textContent = `Scraping ${total_matches} matches (done with ${done_matches})`;
	document.getElementById("teams").textContent = `Scraping ${total_teams} teams (done with ${done_teams})`;
	document.getElementById("current_job").textContent = "The scraper is currently doing: " + current_job;
}

async function save_data(match_data){
    let result = await fetch("http://localhost:8090/store", {
        method: "PUT",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(match_data, undefined, 4),
    })
}

async function fetch_link(link){
    let result = await fetch("http://localhost:8090/fetch", {
        method: "POST",
        body: link
    });
    return result;
}
