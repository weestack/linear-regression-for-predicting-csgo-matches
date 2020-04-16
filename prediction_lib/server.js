var express = require('express');
var app = express();
var path = require('path');


let filereader = require(path.resolve(__dirname, "./FileReader.js" ))

console.log(filereader)