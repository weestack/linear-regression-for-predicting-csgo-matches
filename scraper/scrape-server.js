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
let url = require('url');
let fs = require('fs');
let https = require('https');
let http = require('http');
let mathjs = require("mathjs");

/* Import the required javascript*/
let regression = require("../prediction_lib/index.js");



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
    let dataFiles = fs.readdirSync("data/").filter(name => {
        return name.endsWith(".json");
    });

    /* The team names are put into a set so there are no duplicates */
    let teams = new Set();
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
        teams.add(matchJSON[0].name);
        teams.add(matchJSON[1].name);
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
        amountOfTeams: teams.size,
        teams: Array.from(teams),
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

/* Prediction code starts here. Revisit when its ready*/

function do_prediction(request, response){
    let regressor = new regressor.Regressor("data/");
    console.log(regressor);
    let body = [];
    request.on("data", chunk => {
        body.push(chunk);
    });
    request.on("end", () => {
        body = Buffer.concat(body).toString();
        let bodyjson = JSON.parse(body);
        let team1 = bodyjson.team1;
        let team2 = bodyjson.team2;
        let [prediction, probability] = regressor.predict_winner(team1, team2);
        let responseobject = {
            winner: prediction,
            probability,
        }
        let responsejson = JSON.stringify(responseobject, undefined, 4);
        response.write(responsejson);
        response.end();
    });
}
