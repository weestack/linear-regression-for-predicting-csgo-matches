"use strict"
document.addEventListener("DOMContentLoaded", () => {
    switch_view("main1");
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
})


function switch_view(id){
    let mains = document.querySelectorAll("main");
    for(let i = 0; i < mains.length; i++){
        console.log(mains[i]);
        mains[i].style.display = "none";
    }
    let active = document.getElementById(id);
    active.style.display = "block";
}