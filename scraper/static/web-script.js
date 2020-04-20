"use strict"

/* This file contains the code that adds functionality to the website. */

let scraperIsRunning = false;

/* This is the entrypoint which is run when the side is fully loaded. */
document.addEventListener("DOMContentLoaded", () => {
    /* We start by switching to the first main view and render the data status page */
    switch_view("main1");
    render_data_status();

    /* Here we add actions to all the page links on the left. They don't actually goto a new page,
     * they just switch the view
     */
    let viewLinks = document.querySelectorAll(".viewSwitcher");
    for(let i = 0; i < viewLinks.length; i++){
        viewLinks[i].addEventListener("click", () => {
            let name = viewLinks[i].getAttribute("data-view");
            switch_view(name);
        })
    }

    /* When the start scraper button is pressed, the scraper is started and the button is disabled.
     * The button becomes re-enabled when the scraper finishes. This handler is async so it doesn't hang the
     * entire page while the scraper runs (which might take very long time). */
    let startScraperButton = document.getElementById("startScraper");
    startScraperButton.addEventListener("click", async () => {
        let matches = document.getElementById("matchAmount").value;
        scraperIsRunning = true;
        startScraperButton.disabled = true;
        await scrape_n_matches(matches);
        startScraperButton.disabled = false;
        scraperIsRunning = false;
    })

    /* The refresh button is setup so that it renders the data status again */
    let refreshDataStatus = document.getElementById("dataStatusRefresh");
    refreshDataStatus.addEventListener("click", render_data_status);

    /* The prediction button is setup so that the prediction runs when clicked*/
    let predictionButton = document.getElementById("team1vsteam2");
    predictionButton.addEventListener("click", run_prediction);
})

/* Try to warn the user when he tries to exit the page while the scraper is running. */
window.addEventListener("beforeunload", (event) => {
    if(scraperIsRunning == true){
       event.preventDefault();
       event.returnValue = "";
    }
})

/* This function fetches the data status from the backend. Note that this function takes a while to run on the backend
 * so the result takes a while to come back.
 */
async function data_status(){
    let response = await fetch("http://localhost:8090/dataStatus");
    if(response.status == 200){
        let data = await response.json();
        return data;
    }
    else{
        return null;
    }
}

/* This function fetches the data status using data_status(), and then it updates all the relevent DOM elements.
 * Since it waits for data_status() to finish, it can also take a while to execute, and therefore the user might experience a
 * noticeable delay on the page, which is why it also sets a "refreshing" text. */
async function render_data_status(){
    /* Change the button text to "refreshing..." and disable it */
    let refreshButton = document.getElementById("dataStatusRefresh");
    let originalText = refreshButton.textContent;
    refreshButton.textContent = "refreshing...";
    refreshButton.disabled = true;

    let data = await data_status();
    document.getElementById("status_matchAmount").textContent = `Amount of matches: ${data.amountOfMatches}`;
    document.getElementById("status_teamAmount").textContent = `Amount of teams: ${data.amountOfTeams}`;
    document.getElementById("status_dataFolderSize").textContent = `Size of data folder: ${data.dataFolderSize}`;
    document.getElementById("status_cacheFolderSize").textContent = `Size of cache folder: ${data.cacheFolderSize}`;
    document.getElementById("status_oldestMatch").textContent = `Oldest match in data folder: ${data.oldestMatch}`;
    document.getElementById("status_newestMatch").textContent = `Newest match in data folder: ${data.newestMatch}`;
    let teamsList = document.getElementById("status_teamsList");
    while(teamsList.firstChild){
        teamsList.removeChild(teamsList.lastChild);
    }

    /* Clear the drop down menus so they contain no elements */
    let dropDownMenu1 = document.getElementById("team1Select");
    while (dropDownMenu1.firstChild) {
    	dropDownMenu1.removeChild(dropDownMenu1.lastChild);
    }
    let dropDownMenu2 = document.getElementById("team2Select");
    while (dropDownMenu2.firstChild) {
    	dropDownMenu2.removeChild(dropDownMenu2.lastChild);
    }

    /* Add all the teams as options to both drop down menus.*/
    let teams = data.teams.sort();
    for(let i in teams){
        let li = document.createElement("li");
        li.textContent = teams[i];
        teamsList.appendChild(li);
        let option = document.createElement("option");
        option.value = teams[i];
        option.textContent = teams[i];
        dropDownMenu1.appendChild(option);
        dropDownMenu2.appendChild(option.cloneNode(true));
    }

    /* re-enable the refresh button and restore the original text */
    refreshButton.disabled = false;
    refreshButton.textContent = originalText;
}

/* This function switches the view between the main elements by unhiding all mains except the one given as input */
function switch_view(id){
    let mains = document.querySelectorAll("main");
    for(let i = 0; i < mains.length; i++){
        console.log(mains[i]);
        mains[i].style.display = "none";
    }
    let active = document.getElementById(id);
    active.style.display = "block";
}


/*Global variables to update the HTML status site*/
let status_total_matches = 0;
let status_done_matches = 0;
let status_skipped_matches = 0;
let status_done_teams = 0;
let status_current_job = "doing nothing";

/* Reset all the global status variables to their defaults. */
function reset_html_status_variables() {
    status_total_matches = 0;
    status_done_matches = 0;
    status_skipped_matches = 0;
    status_current_job = "doing nothing";
}

/* This function updates the relevant elements with the status_ variables.*/
function update_html_status() {
    document.getElementById("matches").textContent = status_total_matches;
    document.getElementById("done_matches").textContent = status_done_matches;
    document.getElementById("current_job").textContent = status_current_job;
    document.getElementById("skipped_matches").textContent = status_skipped_matches;
    let match_progress = 100 * status_done_matches / status_total_matches;
    document.getElementById("match_progress").style.width = `${match_progress}%`;
    document.getElementById("MatchProgressProcent").textContent = `${match_progress.toFixed(2)}%`;
}

async function run_prediction(){
    let team1 = document.getElementById("team1Select").value;
    let team2 = document.getElementById("team2Select").value;
    console.log("Predicting the winner", team1, team2);
    let bodyObject = {
        team1,
        team2
    }
    let bodyjson = JSON.stringify(bodyObject, undefined, 4);
    let response = await fetch("http://localhost:8090/prediction", {
        method: "POST",
        body: bodyjson
    });
    if(response.status == 200){
        let result = response.json();
        document.getElementById("predictionWinner").textContent = `The winner is predicted to be ${result.winner} with a certainty of ${result.probability * 100}%`;
    }
}    

async function statistics(){
    let response = await fetch("http://localhost:8090/statistics");
    if(response.status == 200){
        let data = await response.json();
        return data;
    }
    else{
        return null;
    }
}

async function render_statistics(){
    let stats = await statistics();
    let rSquared = document.getElementById("stats_rSquared");
    let pearson = document.getElementById("stats_pearson");
    let rss = document.getElementById("stats_rss");
    let sigma = document.getElementById("stats_sigma");
    let sxx = document.getElementById("stats_sxx");
    let sxy = document.getElementById("stats_sxy");
    let syy = document.getElementById("stats_syy");
    rSquared.textContent = stats.r_squared.toFixed(3);
    pearson.textContent = stats.pearsons_coeficcient.toFixed(3);
    rss.textContent = stats.rss.data[0][0].toFixed(3);
    sigma.textContent = stats.sigmond.toFixed(3);
    sxx.textContent = stats.summary_statics.data[0][0].toFixed(3);
    sxy.textContent = stats.summary_statics.data[0][1].toFixed(3);
    syy.textContent = stats.summary_statics.data[1][1].toFixed(3);
}