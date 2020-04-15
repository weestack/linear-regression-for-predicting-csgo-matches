"use strict"
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
        startScraperButton.disabled = true;
        await scrape_n_matches(matches);
        startScraperButton.disabled = false;
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
    for(let i in data.teams){
        let li = document.createElement("li");
        li.textContent = data.teams[i];
        teamsList.appendChild(li);
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