"use strict";

/*
 * This file contains the code which performs the actual webscraping. It
 * must be used from a browser, since it depends on the fetch api and
 * on the DOMparser, which are not available in node.js
 *
 * The file is split into two parts. The first part defines the scrapers
 * as objects which have a fixed format of {url, location, scrape_many, sub_scrapers, handle}.
 * The object format is described in more detail in the report.
 * The first part also defines a function which executes those scraper objects. This
 * means that writing a scraper is much simpler since we don't have to worry
 * about how to fetch the website or parse the dom and so on. The scrapers which
 * have names such as D1 D2 D4 and so on are described more in detail in the report.
 *
 * The next part of the file contains the code which uses those scrapers to collect
 * and combine all the needed information. The main entrypoint in this file is
 * the scrape_n_matches function.
 */

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

/* Returns a list of 100 matches the specific team has played and the date and who played in all matches.
 * The 100 matches are found at a given offset.
 */
function D3(team_id, offset){
    return {
        url: "https://www.hltv.org/results?team=" + team_id + "&offset=" + offset,
        /* This location is a wrapper which has a date and the matches from that date. */
        location: "div.results-sublist",
        scrape_many: true,
        sub_scrapers: {
            date: { /* This subscraper finds the date of the matches in a block. */
                location: "div.results-sublist > .standard-headline",
                handle: element => {
                    let dateString = element.textContent.slice(12);
                    let parts = dateString.split(" ");
                    let monthString = parts[0];
                    let month = month_string_to_number(monthString);
                    let day = parseInt(parts[1].slice(0,-2));
                    let year = parseInt(parts[2]);
                    return new Date(year, month, day);
                },
            },
            matches: { /* This subscraper finds the matches played on that day */
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
            let matches = [];
            for(let i in elements){
            	/* The relevant date is appended to all the match objects. */
                let date = elements[i].date;
                for(let t in elements[i].matches){
                    let match = elements[i].matches[t];
                    match.date = date;
                    matches.push(match);
                }
            }
            return matches;
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
            teams: { /* This subscraper handles one of the teams. */
                location: "div.player",
                scrape_many: true,
                sub_scrapers:{
                    player: { /* This subscraper finds all the fills that a specific player has made,
                               * and which weapons he used. */
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
                handle: playerList => {
                	/* Here all the player kills and weapons are combined */
                    let result = {};
                    for(let i in playerList){
                        let playerkills = playerList[i].player;
                        for(let weapon in playerkills){
                            let kills = playerkills[weapon];
                            if(weapon in result){
                                result[weapon] += kills;
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
        	/* Here the two team kills and weapons are put into an object instead of a list */
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
            let month = month_string_to_number(monthString);
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

/* The next few scrape objects are not described in the report section 7, but they were needed
 * to run the D scrapers in such a way that the data could be combines in a meaningful way.
 */

/* Returns the player ids and names of the players in the given team. */
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

/* Returns which teams have played in a specific match */
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
                let name = elements[i].textContent;
                let id = linkParts[1];
                teams[i] = {name, id};
            }
            return teams;
        }
    }
}

/* Returns which team won the given match. 0 means the first team, 1 means the second. */
function match_winner(match_id, match_name){
    return {
        url: "https://www.hltv.org/stats/matches/mapstatsid/" + match_id + "/" + match_name,
        location: ".team-left > .bold, .team-right > .bold",
        scrape_many: true,
        handle: elements => {
            let score1 = parseInt(elements[0].textContent);
            let score2 = parseInt(elements[1].textContent);
            let winner = null;
            /* It is assumed that there was a winner. */
            if (score1 > score2) {
            	winner = 0;
            } else {
            	winner = 1;
            }
            return {
                score1,
                score2, 
                winner
            }
        }
    }
}

/* A helper scraper which finds all the matches played and their date. It only finds
 * 50 at a time an must be run in a loop to get more. */
function scrape_match_list(offset) {
    return {
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
                result[i] = {
                    matchId: match.matchId,
                    matchName: match.matchName,
                    date: elements[i].date
                };
            }
            return result;
        },
    };
}


/* This functions execute the scraper objects and returns their result.
 * It does so by first fetching the website at the defined and parsing it into a DOM
 * After that, the location given is looked up either a single time or many times,
 * depending on the scrape_many setting.
 * All the found elements are then handled one by one in the following way:
 *   If the scraper had any subscraper, the run_scraper is run recursively, but instead of
 *   fetching a website, it is given the element as its DOM. The results from the subscrapers
 *   are stored in an object where the fields have the same names as the subscrapers.
 *   Those values are stored in a list called results. If there were no subscrapers, then
 *   the results list is just the same as the elements list found earlier.
 *
 * The results lists is then passed onto the scrapers handle function. If the scraper
 * was not a scrape_many scraper, only the first (and only) element is passed the the handle
 * function. The result of the handle function is returned.
 */
async function run_scraper(scraper, dom){
    /* Only fetch and parse a dom is none was given as input */
    if(dom == undefined){
        let response = await fetch_link(scraper.url);
        console.log("Scraping " + scraper.url);
        if (response.status == 200){
            let html = await response.text();
            let domparser = new DOMParser();
            dom = domparser.parseFromString(html, "text/html");
            let base = dom.createElement("base");
            base.href = "https://hltv.org"
            dom.head.appendChild(base);
        }
    }

    /* find the elements based on the location */
    let elements = [];
    if (scraper.scrape_many){
        elements = Array.from(dom.querySelectorAll(scraper.location));
    }
    else {
        elements = [dom.querySelector(scraper.location)];
    }

    /* Calculate the results of running the subscrapers. */
    let results = [];
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
    /* If no subscrapers exists, the results are just the same as the elements. */
    else {
        results = elements;
    }

	/* Sometimes there is 0 results in case the location didn't match anything.
	 * Here we just try to handle the elements and if it fails we return null. */
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

/* Team info used in D1, D2, D3, D8 */
async function scrape_team(team_id, team_name){
    let win_lose_ratio = await run_scraper(D1(team_id, team_name));
    let best_maps = await run_scraper(D2(team_id, team_name));

    /* Run D3 in a loop to get all the last matches. */
    let last_matches = [];
    let done = false;
    for(let offset = 0; done == false; offset += 100){
        let matches = await run_scraper(D3(team_id, offset));
        if(matches.length == 0){
        	/* If no new matches was found we are done */
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

/* Match info used in D5, D7 */
async function scrape_match(match_id, match_name){
    let teams = await run_scraper(match_teams(match_id, match_name));
    let team_kills = await run_scraper(D5(match_id, match_name));
    let first_kills = await run_scraper(D7(match_id, match_name));

    /* The data from team_kills and first_kills is combined with the team names and returned. */
    teams[0].kills = team_kills.team1;
    teams[1].kills = team_kills.team2;
    teams[0].first_kills = first_kills.team1;
    teams[1].first_kills = first_kills.team2;
    return teams;
}


/* Player info used in D4, D6, D9, D10. KDA = Kills/Deaths/Assist */
async function scrape_player(player_id, player_name){
    let most_used_weapons = await run_scraper(D4(player_id, player_name));
    let headshots = await run_scraper(D6(player_id, player_name));
    let days_in_team = await run_scraper(D9(player_id, player_name));
    let kda = await run_scraper(D10(player_id, player_name));
    return {
        most_used_weapons,
        headshots,
        days_in_team,
        kda
    };
}

/* The scrape_n_matches function scrapes n matches and stores their result on the backend.
 * It tries to be smart and looks at all the matches to find the unique teams which played.
 * This allows it to avoid scraping two teams for each match, and just scrape the unique teams
 * instead, which is much faster (see the report).
 *
 * To show live information on the website it sets some global status_xxxxx variables defined in
 * web-script.js and calls the update_html_status() function to trigger an update.
 */
async function scrape_n_matches(amount_of_matches){
    reset_html_status_variables();
    status_current_job = "finding matches";
    update_html_status();

    let matchList = [];
    let done = false;
    let resultList = [];
    /* First we find the ids and names of the wanted amount of matches */
    for(let offset = 0; done == false; offset += 50){
        let matches = await run_scraper(scrape_match_list(offset));
        matchList = matchList.concat(matches);
        if(matchList.length >= amount_of_matches){
            done = true;
            matchList = matchList.slice(0, amount_of_matches);
        }
        status_total_matches = matchList.length;
        update_html_status();
    }


    let teamsToScrape = {};
    for(let i in matchList){
        let matchId = matchList[i].matchId;
        let matchName = matchList[i].matchName;
        let matchTeams = await run_scraper(match_teams(matchId, matchName));
        matchList[i].teams = matchTeams;
        for(let teamNumber in matchTeams){
            let teamId = matchTeams[teamNumber].id;
            let teamName = matchTeams[teamNumber].name;
            /* We should only store the team if is not already stored. */
            if (!(teamId in teamsToScrape)) {
                teamsToScrape[teamId] = teamName;
                status_total_teams++; /* DEBUGGING */
            }
        }
        status_checked_teams += 2;
        update_html_status();
    }

	/* Now all the unique teams have been found, and they can be scraped */
    status_current_job = "scraping teams"; /* DEBUGGING */
    let teams = {};
    for (let teamId in teamsToScrape) {
        if(!(teamId in teams)){
            let teamName = teamsToScrape[teamId];
            teams[teamId] = await scrape_team(teamId, teamName);
            status_done_teams++ /* DEBUGGING */
            update_html_status(); /* DEBUGGING */
        }
    }

	/* Now all the team data is ready, so the final match data can be scraped and combined. */
    status_current_job = "scraping matches"; /* DEBUGGING */
    for(let i in matchList){
        let matchId = matchList[i].matchId;
        let matchName = matchList[i].matchName;
        resultList[i] = await scrape_match(matchId, matchName);
        let matchTeams = matchList[i].teams;
        let winnerData = await run_scraper(match_winner(matchId, matchName));
        resultList[i].team1Rounds = winnerData.score1;
        resultList[i].team2Rounds = winnerData.score2;
        resultList[i].winner = winnerData.winner;
        resultList[i].date = matchList[i].date;
        resultList[i].id = matchId;
        /* loop over the teams and add in the team data */
        for(let t = 0; t < 2; t++){
            let teamData = teams[matchTeams[t].id];
            /* Here all the data fields from the team data are copied over to the result. */
            for(let dataName in teamData){
                resultList[i][t][dataName] = teamData[dataName];
            }
        }

        /* The result data is stored on the backend. */
        save_data(resultList[i]);
        status_done_matches++;
        update_html_status();
    }
    status_current_job = "doing nothing";
    update_html_status();
    return resultList;
}

/* This functions performs a PUT request to store the match on the backend */
async function save_data(match_data){
    let result = await fetch("http://localhost:8090/store", {
        method: "PUT",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(match_data, undefined, 4),
    })
}

/* This function calls the backend to fetch a url. It does this because the backend
 * is able to cache the results and to provide the needed delay that prevents us from
 * being rate limited
 */
async function fetch_link(link){
    let result = await fetch("http://localhost:8090/fetch", {
        method: "POST",
        body: link
    });
    return result;
}

/* Convert a month string into a number. */
function month_string_to_number(str) {
	let month = null;
    switch (str) {
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
    return month;
}