"use strict"
let scraperIsRunning = false;

window.addEventListener("beforeunload", (event) => {
    if(scraperIsRunning == true){
       event.preventDefault();
       event.returnValue = "";
    }
})

document.addEventListener("DOMContentLoaded", () => {
    switch_view("main1");
    render_data_status();
    let viewLinks = document.querySelectorAll(".viewSwitcher");
    for(let i = 0; i < viewLinks.length; i++){
        viewLinks[i].addEventListener("click", () => {
            let name = viewLinks[i].getAttribute("data-view");
            switch_view(name);
            
        })
    }
    let startScraperButton = document.getElementById("startScraper");
    startScraperButton.addEventListener("click", async () => {
        let matches = document.getElementById("matchAmount").value;
        scraperIsRunning = true;
        startScraperButton.disabled = true;
        await scrape_n_matches(matches);
        startScraperButton.disabled = false;
        scraperIsRunning = false;
    })
    let refreshDataStatus = document.getElementById("dataStatusRefresh");
    refreshDataStatus.addEventListener("click", render_data_status);
})

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

async function render_data_status(){
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
    
    let dropDownMenu1 = document.getElementById("team1Select");
    while (dropDownMenu1.firstChild) {
    	dropDownMenu1.removeChild(dropDownMenu1.lastChild);
    }
    let dropDownMenu2 = document.getElementById("team2Select");
    while (dropDownMenu2.firstChild) {
    	dropDownMenu2.removeChild(dropDownMenu2.lastChild);
    }
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

}

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
let status_checked_teams = 0;
let status_total_matches = 0;
let status_done_matches = 0;
let status_total_teams = 0;
let status_done_teams = 0;
let status_current_job = "doing nothing";

function reset_html_status_variables() {
    status_checked_teams = 0;
    status_total_matches = 0;
    status_done_matches = 0;
    status_total_teams = 0;
    status_done_teams = 0;
    status_current_job = "doing nothing";
}

function update_html_status() {
    
	document.getElementById("matches").textContent = status_total_matches;
	document.getElementById("done_matches").textContent = status_done_matches;
	document.getElementById("potential_teams").textContent = status_total_matches * 2;
	document.getElementById("checked_teams").textContent = status_checked_teams;
	document.getElementById("unique_teams").textContent = status_total_teams;
	document.getElementById("done_teams").textContent = status_done_teams;
	document.getElementById("current_job").textContent = status_current_job;
	
	let match_progress = 100 * status_done_matches / status_total_matches;
	let team_discover_progress = 100 * status_checked_teams / (2 * status_total_matches);
	let team_progress = 100 * status_done_teams / status_total_teams;
	document.getElementById("match_progress").style.width = `${match_progress}%`;
	document.getElementById("team_discover_progress").style.width = `${team_discover_progress}%`;
	document.getElementById("team_progress").style.width = `${team_progress}%`;
}