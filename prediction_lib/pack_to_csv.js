/*
 * Creating a CSV file to store the data.
 */
let path = require('path');

let math_js = require("mathjs");

let regressor = require(path.resolve(__dirname, "./index.js"))
let regression = new regressor.Regressor(("../scraper/data"));

/*let regression = require(path.resolve(__dirname, "./regression.js"));
let Multi_Linear_Regression = regression.Multi_Linear_Regression;*/
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
   path: 'out.csv',
   header: [
     {id: 'winner', title: 'winner'},
     {id: 'powerscore_delta', title: 'powerscore_delta'},
     {id: 'win_loose_delta', title: 'win_loose_delta'},
     {id: 'kda_delta', title: 'kda_delta'},
     {id: 'headshot_delta', title: 'headshot_delta'},
     {id: 'time_in_team_delta', title: 'time_in_team_delta'},
   ]
 });

let prediction = regression.prediction
let independt = regression.independent;


let [csv_rows, csv_columns] = independt.size();

const csv_data = Array(csv_rows);

for(let i = 0; i < csv_rows; i++){
   csv_data[i] = {
       winner: prediction.subset(math_js.index(i, 0)),
       powerscore_delta: independt.subset(math_js.index(i, 0)),
       win_loose_delta: independt.subset(math_js.index(i, 1)),
       kda_delta: independt.subset(math_js.index(i, 2)),
       headshot_delta: independt.subset(math_js.index(i, 3)),
       time_in_team_delta: independt.subset(math_js.index(i, 4)),
   }
}

csvWriter.writeRecords(csv_data).then(() => console.log('The CSV file was written successfully'));