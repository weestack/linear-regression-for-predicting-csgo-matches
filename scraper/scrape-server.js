"use strict"

let fs = require('fs');
let http = require('http');
let server = http.createServer((request, response) => {
    console.log(request.method);
    console.log(request.url);
    if(request.url == "/store"){
        if(request.method == "OPTIONS"){
            response.writeHead(200, {
                "Access-Control-Allow-Methods": "PUT",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "content-type"
            });
            response.end();
        }
        if(request.method == "PUT"){
            store_data(request, response);
        }
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
        response.writeHead(200, {
            "Access-Control-Allow-Origin": "*"
        });
        response.write("Helluu werld");
        response.end();
    })
}