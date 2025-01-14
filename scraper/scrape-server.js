"use strict"

/*
 * This file contains the backend code for the scraper and the website.
 * It is implemented as a http server using the node http package.
 *
 * The other packages used are all included in node.js by default:
 *   url: For parsing a url into its parts,
 *   https: For making https requests to external websites,
 *   http: For creating the http server,
 *   fs: For file system access and other file related functions.
 */

/* Import the required modules */
let fs = require('fs');
let https = require('https');
let http = require('http');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const math_js = require("mathjs");
/* Import the required javascript for the regression */
let regression = require("../prediction_lib/index.js");

/* Global variable which stores the regressor object */
let regressor = null;

/* Create the data/ and cache/ folders if they dont exist. */
fs.mkdirSync("./data", {recursive: true}, err => {
    if(err) {
        console.log(err);
    }
});
fs.mkdirSync("./cache", {recursive: true}, err => {
    if(err) {
        console.log(err);
    }
});

/* Create the http server itself, which will handle incomming HTTP requests on port 8090 */
let server = http.createServer((request, response) => {
	/* At each incomming request the current time, url and the method is printed to the terminal. */
	console.log(new Date() + " " + request.method + " " + request.url);

	/* A chain of if statements select which function should handle the request */
    if(request.url == "/store" && request.method == "PUT"){
        store_data(request, response);
    }
    else if(request.url == "/fetch" && request.method == "POST"){
        fetch_website(request, response);
    }
    else if(request.url == "/dataStatus" && request.method == "GET"){
        data_status(request, response);
    }
    else if(request.url == "/prediction" && request.method == "POST"){
        do_prediction(request, response);
    }
    else if(request.url == "/statistics" && request.method == "GET"){
        do_statistics(request, response);
    }
    else if (request.url == "/coefficients" && request.method == "GET"){
        get_coefficients(request, response);
    }
    else if(request.url == "/refreshRegressor" && request.method == "POST"){
        refresh_regressor(request, response);
    }
    /* If none of the specific cases matched, we try to serve a file from the static folder */
    else if(request.method == "GET"){
        serve_file(request, response)
    }
    else {
        response.writeHead(404);
        response.end();
    }
})
server.listen(8090);

/* The data status function handles a request on the /dataStatus endpoint.
 * It examines the data/ and cache/ folders and returns information such as
 * space used, and which teams have been collected.
 */
function data_status(request, response){
	/* Find all filenames which are actual json files */
    let dataFiles = fs.readdirSync("data/");

    let teams = {};
    let dataFolderSize = 0;

    /* newest and oldest match are set to some initial values which are almost
     * guarantied to be overwritten by the first match found in the folder.
     * If no matches are fold, those dates will be wrong.
     */
    let newestMatch = new Date(2000);
    let oldestMatch = new Date();
    for(let i in dataFiles){
        let fileStats = fs.statSync("data/" + dataFiles[i]);
        dataFolderSize += fileStats.size;
        let matchData = fs.readFileSync("data/" + dataFiles[i]);
        let matchJSON = JSON.parse(matchData);
        teams[matchJSON[0].name] = matchJSON[0].id;
        teams[matchJSON[1].name] = matchJSON[1].id;
        let matchDate = new Date(matchJSON.date);
        if(matchDate.getTime() > newestMatch.getTime()){
            newestMatch = matchDate;
        }
        if(matchDate.getTime() < oldestMatch.getTime()){
            oldestMatch = matchDate;
        }
    }
    let cacheFiles = fs.readdirSync("cache/");
    let cacheFolderSize = 0;
    for(let i in cacheFiles){
        let fileStats = fs.statSync("cache/" + cacheFiles[i]);
        cacheFolderSize += fileStats.size;
    }

    let data = {
        amountOfMatches: dataFiles.length,
        amountOfTeams: Object.keys(teams).length,
        teams: teams,
        dataFolderSize: (dataFolderSize / Math.pow(1024, 2)).toFixed(2) + "MB",
        newestMatch,
        oldestMatch,
        cacheFolderSize: (cacheFolderSize / Math.pow(1024, 2)).toFixed(2) + "MB",
    }
    let result = JSON.stringify(data, undefined, 4);
    response.write(result);
    response.end();
}

/* The store data function handles the /store endpoint and it saves the JSON
 * JSON encoded match from the body of the HTTP request to a file named by
 * the match id.
 */
function store_data(request, response){
    let body = [];
    request.on("data", chunk => {
        body.push(chunk);
    })

    request.on("end", () => {
        body = Buffer.concat(body).toString();
        let match_data = JSON.parse(body);
        let fileName = match_data.id + ".json";
        fs.writeFileSync("data/" + fileName, body, error => {
            if(error){
                console.log(error);
            }
        });
        response.writeHead(200);
        response.end();
    })
}

/* The fetch website function handles the /fetch endpoint and it serves as a
 * kind of proxy used to fetch websites with a delay, and cache their result.
 */
function fetch_website(request, response){
    let body = [];
    request.on("data", chunk => {
        body.push(chunk);
    });
    request.on("end", async () => {
        body = Buffer.concat(body).toString();
        /* The actual data from the website is fetched using the get function. */
        let result = await get(body);
        if (result == null) {
        	response.writeHead(404);
        } else {
        	response.write(result);
        }
        response.end();
    });
}

/* The serve file function handles all other endpoints by trying to lookup the resource
 * named by the url in the static/ folder. If no file is found, a 404 is returned. */
function serve_file(request, response){
    let filePath = "static" + request.url;
    if(filePath == "static/"){
    	/* As a convinience / is an alias for /index.html */
        filePath = "static/index.html";
    }
    if(fs.existsSync(filePath)){
        let stats = fs.statSync(filePath);
        if(stats.isFile()){
            let content = fs.readFileSync(filePath).toString();
            response.write(content);
            response.end();
            return;
        }
    }
    response.writeHead(404);
    response.end();
}

/* The get function performs a HTTP Get on the link given as the argument.
 * The fetch is only performed if the file is not already in the cache.
 * After a fetch, the file is saved in the cache, and it is never removed again,
 * even if the website changes. */
async function get(link){
	/* Try to find the result in the cache first */
    let cacheResult = cache_lookup(link);
    if(cacheResult != null){
        return cacheResult;
    }
    else{
    	/* Sleep to be nice the the external website */
        await sleep(1000);
        let url = new URL(link);
        let path = url.pathname + url.search + url.hash
        console.log(path + " was not found in the cache.");

		/* Since the https.get function is itself using callbacks, we cannot
		 * just return its result, since it exits before it is done. Therefore
		 * it is wrapped in a Promise which we then wait for. */
        return await new Promise(resolve => {
            https.get({
                host: url.hostname,
                path: path
            }, response => {
                let body = [];
                response.on("data", chunk => {
                    body.push(chunk);
                })
                response.on("end", () => {
                    console.log(response.statusCode);
                    body = Buffer.concat(body).toString();
                    if(response.statusCode != 200){
                        resolve(null);
                    }
                    else{
                        cache(link, body);
                        resolve(body);
                    }
                });
            }).on("error", error => {
            	/* In case there was an error fetching the site, the result from get will be null */
            	console.log("Error in fetching " + link + " so it is skipped...");
            	resolve(null);
            });
        });

    }
}

/* The cache function saves the data in the body argument to a
 * file which name is determined by the link. Caches are stored in the cache/ folder.
 */
function cache(link, body){
    let fileName = cache_filename(link);
    fs.writeFileSync("cache/" + fileName, body, error => {
        if(error){
            console.log(error);
        }
    })
}

/* The cache lookup tries to find a cache entry for the website with the link given as input. */
function cache_lookup(link){
    let fileName = cache_filename(link);
    if(fs.existsSync("cache/" + fileName)){
        return fs.readFileSync("cache/" + fileName).toString();
    }
    else{
        return null;
    }
}

/* The cache filename functions converts a url into a valid filename.
 * It does so by replacing the illigal characters with other characters.
 * In theory there might be collisions, but in practice there is not.
 */
function cache_filename(link){
    return link.replace(/\//g, "_").replace(/:/g, ".").replace(/\?/g, "q").replace(/&/g, "AND").trim();
}

/* sleep is a promise which resolves after some milliseconds. It allows us to sleep in async code. */
function sleep(milliseconds){
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/* The do_prediction function handles requests on /prediction, and it tries to predict the winner of two matches
 * which are given in the request body.
 */
function do_prediction(request, response){
    if (regressor == null) {
        regressor = make_regressor();
        if(regressor == null){
            response.writeHead(500);
            response.end();
            return;
        }
    }
    let body = [];
    request.on("data", chunk => {
        body.push(chunk);
    });
    request.on("end", () => {
        body = Buffer.concat(body).toString();
        let bodyjson = JSON.parse(body);
        let team1 = bodyjson.team1;
        let team2 = bodyjson.team2;
        let result = regressor.predict_winner(team1, team2);
        response.write(result);
        response.end();
    });
}

/* The do_statistics function returns the statistics object from the current regressor as JSON.
 */
function do_statistics(request, response){
    if (regressor == null) {
        regressor = make_regressor();
        if(regressor == null){
            response.writeHead(500);
            response.end();
            return;
        }
    }
    let statistics = regressor.statistics;
    let statisticsjson = JSON.stringify(statistics, undefined, 4);
    response.write(statisticsjson);
    response.end();
}


function get_coefficients(request, response){
    if (regressor == null) {
        regressor = make_regressor();
        if (regressor == null) {
            response.writeHead(500);
            response.end();
            return;
        }
    }
        let responseobject = {
            coefficients: regressor.cleaned_coefficients,
            pearson_coefficients: regressor.statistics.pearsons_coefficients,
            header: regressor.header
        }
        let responsejson = JSON.stringify(responseobject, undefined, 4);
        response.write(responsejson);
        response.end();
}

/* Refresh regressor refreshes the regressor :D */
function refresh_regressor(request, response){
    regressor = make_regressor();
    if(regressor == null){
        response.writeHead(500);
        response.end();
        return;
    }
    update_csv_file();
    response.writeHead(200);
    response.end();
}

function update_csv_file(){
    const csvWriter = createCsvWriter({
        path: 'static/csv_files/regression_data.csv',
        header: regressor.header
    });

    let prediction = regressor.prediction
    let independent = regressor.normalized_independent;

    let [csv_rows, csv_columns] = independent.size();

    const csv_data = Array(csv_rows);

    for(let i = 0; i < csv_rows; i++){
        csv_data[i] = {
            winner:             prediction.subset(math_js.index(i, 0)),
            powerscore_delta:   independent.subset(math_js.index(i, 0)),
            win_loose_delta:    independent.subset(math_js.index(i, 1)),
            kda_delta:          independent.subset(math_js.index(i, 2)),
            headshot_delta:     independent.subset(math_js.index(i, 3)),
            time_in_team_delta: independent.subset(math_js.index(i, 4)),
        }
    }

    csvWriter.writeRecords(csv_data);
}

function make_regressor(){
    try {
        let reg = new regression.Regressor("data/");
        return reg;
    }
    catch (e){
        console.log(e);
        return null;
    }
}