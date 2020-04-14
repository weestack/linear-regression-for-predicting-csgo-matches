"use strict"

let url = require('url');
let fs = require('fs');
let https = require('https');
let http = require('http');
let server = http.createServer((request, response) => {
    console.log(request.method);
    console.log(request.url);
    if(request.url == "/store" && request.method == "PUT"){
        store_data(request, response);
    }
    else if(request.url == "/fetch" && request.method == "POST"){
        fetch_website(request, response);
    }
    else if(request.method == "GET"){
        serve_file(request, response)
    }
    else {
        response.writeHead(404);
        response.end();
    }
})

server.listen(8090);

function store_data(request, response){
    let body = [];
    request.on("data", chunk => {
        body.push(chunk);
    })

    request.on("end", () => {
        body = Buffer.concat(body).toString();
        let match_data = JSON.parse(body);
        console.log(match_data);
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

function fetch_website(request, response){
    let body = [];
    request.on("data", chunk => {
        body.push(chunk);
    })
    request.on("end", async () => {
        body = Buffer.concat(body).toString();
        let result = await get(body);
        response.writeHead(200);
        response.write(result);
        response.end();
    });
}

async function get(link){
    let url = new URL(link);
    let cacheResult = cache_lookup(link);
    if(cacheResult != null){
        return cacheResult;
    }
    else{
        await sleep(1000);
        console.log("Fandt ikke fil i cache");
        let path = url.pathname + url.search + url.hash
        console.log(path);
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
            })
        });
            
    }
}

function cache(link, body){
    let fileName = cache_filename(link);
    fs.writeFileSync("cache/" + fileName, body, error => {
        if(error){
            console.log(error);
        }
    })
}

function cache_lookup(link){
    let fileName = cache_filename(link);
    if(fs.existsSync("cache/" + fileName)){
        return fs.readFileSync("cache/" + fileName).toString();
    }
    else{
        return null;
    }
}

function cache_filename(link){
    return link.replace(/\//g, "_").replace(/:/g, ".").replace(/\?/g, "q").replace(/&/g, "AND")
}

function sleep(milliseconds){
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function serve_file(request, response){
    let filePath = "static" + request.url;
    if(filePath == "static/"){
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