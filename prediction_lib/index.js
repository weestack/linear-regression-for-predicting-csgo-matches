let path = require('path');

let math_js = require("mathjs");

let filereader = require(path.resolve(__dirname, "./FileReader.js" ))
let match_data = filereader.match_data;

let regression = require(path.resolve(__dirname, "./regression.js" ));
let Multi_Linear_Regression = regression.Multi_Linear_Regression;

/*const fs = require("fs");

let rawdata = fs.readFileSync("sample_data/highway.json");
let raw = JSON.parse(rawdata);*/
/*let independt = Array( Array(), Array(), Array(),Array(), Array(), Array(),Array(), Array(), Array(),Array(), Array() );*/
/*let prediction = Array();
let independt = Array();
let placeholder = [];


for (let j = 1; j < raw.length; j++) {
    prediction[j-1] = [parseFloat( raw[j][0].replace( /\\n/g, ""))];
    independt[j-1] = Array();
    for (let i = 1; i < raw[j].length; i++){
        independt[j-1][i-1] = parseFloat( raw[j][i].replace( /\\n/g, "") );
    }
}*/


/*
prediction = [
    [0],
    [0],
    [4],
    [8],
    [8],
    [12],
    [20],
    [16],
    [16],
    [20],
    [20],
    [26],
]

independt = [
    [1],
    [2],
    [3],
    [4],
    [231],
    [6],
    [7],
    [8],
    [9],
    [10],
    [11],
    [12],
]
*/



let data = new match_data("actual_data")
let [all, test] = data.filter_all_files();

all = math_js.matrix(all)

let prediction = math_js.column(all, 0);
all = math_js.transpose(all).toArray()
all.shift();

let independt = math_js.transpose(math_js.matrix(all))
// pearson xx  -0.22397976406802955 - index -1
// pearson xx  -0.22397976406802955 - index 1
// pearson xx  0.14547471879860624 - Index 2
// pearson xx  0.24415658960451783 - index 4
// pearson xx  -0.27156858160118486 - index 5
// pearson xx  0.12787838271344057 - index 6
// pearson xx  0.4573067748408908 - index 7
// pearson xx  -0.46255977167703427 - index 8
// pearson xx  -0.028569805298589743 - index 9




let multiple = new Multi_Linear_Regression;
let coefficients = multiple.estimate_best_coeficcients(independt, prediction)
console.log("coefficients ", coefficients);
let summary_statics = multiple.summary_statictis(independt, prediction)
console.log("summary statics ", summary_statics);
let rss = multiple.rss(summary_statics.subset(math_js.index(1,1)), summary_statics.subset(math_js.index(0,0)), coefficients);
console.log("rss ", rss);
let r_squared = multiple.r_squared(coefficients, independt, prediction);
console.log("r**2 ", r_squared);
let sigmond = multiple.sigmoid_squared(rss.subset(math_js.index(0,0)), independt);
console.log("sigmonds ", sigmond);
let varians = multiple.variance(sigmond, independt);
//console.log("varians ",varians);

console.log("pearson xx ", multiple.pearson_corrolations(math_js.column(independt, 1), prediction ))

//independt = math_js.matrix( placeholder );



/*for (let i=1; i < raw.length; i++){

    prediction[0].push(parseFloat(raw[i][0].replace(/\\n/g, "")));
    prediction[1].push(parseFloat(raw[i][1].replace(/\\n/g, "")));

}*/


function calculate_yi(coeficcients, point){
    let coe = coeficcients.toArray();

    let b_0 = coe.shift()[0];

    let coeffi = math_js.matrix(coe);

    let value_without_b0 = math_js.multiply(point, coeffi).toArray()[0][0];

    return b_0 + value_without_b0;
}

let count = 0;
test = math_js.matrix(test);
let test_prediction = math_js.column(test, 0);
test = math_js.transpose(test).toArray();
test.shift();

let [rows, columsn] = test_prediction.size();
let test_independt = math_js.transpose(math_js.matrix(test));
for (let i=0; i < rows; i++){
    let our_pred = calculate_yi(coefficients, math_js.row(test_independt, i));
    let delta = test_prediction.subset(math_js.index(i, 0)) - our_pred**2;

    if (our_pred > 0.25 && our_pred < 0.75) {
        our_pred = 0.5;
    }else if (our_pred < 0.25){
        our_pred = 0;
    }else {
        our_pred = 1;
    }
    console.log("predicted outcome is ", our_pred, " actual was", test_prediction.subset(math_js.index(i, 0)), "correct? ", test_prediction.subset(math_js.index(i, 0)) == our_pred)
    if (test_prediction.subset(math_js.index(i, 0)) == our_pred){
        count++;
    }
    //console.log("our", our_pred)
    //console.log("actual", prediction.subset(math_js.index(i, 0)))
    //console.log("delta", delta)
    //sum += delta;
}
console.log("rows ",rows, " count", count)

//let simple = new Simple_Linear_regression;
//let [slope, intercept, simple_rss] = simple.estimate_best_coeficcient(prediction[0], prediction[1]);
//console.log(multiple.estimate_best_coeficcients(prediction[0], prediction[1]));
//console.log(slope)
//console.log(intercept)
//console.log(simple_rss)

//console.log(independt);



//let X = math_js.matrix(independent)
//let Y = math_js.matrix(prediction)



/*
 * Creating a CSV file to store the data.
 */

 const createCsvWriter = require('csv-writer').createObjectCsvWriter;
 const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
      {id: 'name', title: 'Name'},
      {id: 'surname', title: 'Surname'},
      {id: 'age', title: 'Age'},
      {id: 'gender', title: 'Gender'},
    ]
  });