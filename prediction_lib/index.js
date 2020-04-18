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
      {id: 'winner', title: 'winner'},
      {id: 'team1_last_match', title: 'team1_last_match'},
      {id: 'team1_win_lose_ratio', title: 'team1_win_lose_ratio'},
      {id: 'team1_wins_last_20', title: 'team1_wins_last_20'},
      {id: 'team1_winstreak', title: 'team1_winstreak'},
      {id: 'team1_player_mean_time_on_team', title: 'team1_player_mean_time_on_team'},
      {id: 'team1_mean_headshot', title: 'team1_mean_headshot'},
      {id: 'team1_sum_kda', title: 'team1_sum_kda'},
      {id: 'team2_last_match', title: 'team2_last_match'},
      {id: 'team2_win_lose_ratio', title: 'team2_win_lose_ratio'},
      {id: 'team2_wins_last_20', title: 'team2_wins_last_20'},
      {id: 'team2_winstreak', title: 'team2_winstreak'},
      {id: 'team2_player_mean_time_on_team', title: 'team2_player_mean_time_on_team'},
      {id: 'team2_mean_headshot', title: 'team2_mean_headshot'},
      {id: 'team2_sum_kda', title: 'team2_sum_kda'},
      {id: 'team1_matches_in_last_50_days', title: 'team1_matches_in_last_50_days'},
      {id: 'team2_matches_in_last_50_days', title: 'team2_matches_in_last_50_days'},
      {id: 'win_loose_ratio_50', title: 'win_loose_ratio_50'},
      {id: 'win_lose_ratio_150', title: 'win_lose_ratio_150'},
      {id: 'win_lose_ratio_370', title: 'win_lose_ratio_370'},
      {id: 'win_lose_ratio_all_time', title: 'win_lose_ratio_all_time'},
    ]
  });


let [csv_rows, csv_columns] = independt.size();

const csv_data = Array(csv_rows);

for(let i = 0; i < csv_rows; i++){
    csv_data[i] = {
        winner: prediction.subset(math_js.index(i, 0)),
        team1_last_match: independt.subset(math_js.index(i, 1 - 1)),
        team1_win_lose_ratio: independt.subset(math_js.index(i, 2 - 1)),
        team1_wins_last_20: independt.subset(math_js.index(i, 3 - 1)),
        team1_winstreak: independt.subset(math_js.index(i, 4 - 1)),
        team1_player_mean_time_on_team: independt.subset(math_js.index(i, 5 - 1)),
        team1_mean_headshot: independt.subset(math_js.index(i, 6 - 1)),
        team1_sum_kda: independt.subset(math_js.index(i, 7 - 1)),
        team2_last_match: independt.subset(math_js.index(i, 8 - 1)),
        team2_win_lose_ratio: independt.subset(math_js.index(i, 9 - 1)),
        team2_wins_last_20: independt.subset(math_js.index(i, 10 - 1)),
        team2_winstreak: independt.subset(math_js.index(i, 11 - 1)),
        team2_player_mean_time_on_team: independt.subset(math_js.index(i, 12 - 1)),
        team2_mean_headshot: independt.subset(math_js.index(i, 13 - 1)),
        team2_sum_kda: independt.subset(math_js.index(i, 14 - 1)),
        team1_matches_in_last_50_days: independt.subset(math_js.index(i, 15 - 1)),
        team2_matches_in_last_50_days: independt.subset(math_js.index(i, 16 - 1)),
        win_loose_ratio_50: independt.subset(math_js.index(i, 17 - 1)),
        win_lose_ratio_150: independt.subset(math_js.index(i, 18 - 1)),
        win_lose_ratio_370: independt.subset(math_js.index(i, 19 - 1)),
        win_lose_ratio_all_time: independt.subset(math_js.index(i, 20 - 1)),
    }
}

//csvWriter.writeRecords(csv_data).then(() => console.log('The CSV file was written successfully'));


/* Hasttable for the team names */
let data_for_each_team = Array(50000);
function hashing_function(name_as_string){
    let hash_value = 0;
    let prim_close_to_two = 16061;
    let prim_far_from_two = 82591;
    for(let i = 0; i < name_as_string.length; i++){
        hash_value += name_as_string[i].charCodeAt(0) * prim_far_from_two % prim_close_to_two;
    }

    return hash_value % 50000;
}

function insert_object_in_hash_table(hash_table, team_name){
    let hash_value = hashing_function(team_name);
    let collision_delta = 683;
    let current_index;
    for(let i = 0; i < hash_table.length; i++){
        current_index = hash_value+i*collision_delta; 
        if(hash_table[current_index] == -1 || hash_table[current_index] == undefined){
            hash_table[current_index] = team_name;
            return current_index;
        }
    }
}

function delete_object_in_hash_table(hash_table, team_name){
    let hash_value = hashing_function(team_name);
    let collision_delta = 683;
    let current_index;
    for(let i = 0; i < hash_table.length; i++){
        current_index = hash_value+i*collision_delta; 
        if(hash_table[current_index] == team_name){
            hash_table[current_index] = -1;
            return current_index;
        }
    }
}

function find_object_in_hash_table(hash_table, team_name){
    let hash_value = hashing_function(team_name);
    let collision_delta = 683;
    let current_index;
    for(let i = 0; i < hash_table.length; i++){
        current_index = hash_value+i*collision_delta; 

        if(hash_table[current_index] == team_name){
            return current_index;
        }
        if(hash_table[current_index] == undefined){
            return -1;
        }
    }
}

console.log("I'm inserting 'hello world' in index:", insert_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm inserting 'hello world' in index:", insert_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm looking 'hello world' up in the index:",find_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm deleting 'hello world' in index:", delete_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm looking 'hello world' up in the index:",find_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm deleting 'hello world' in index:", delete_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm looking 'hello world' up in the index:",find_object_in_hash_table(data_for_each_team, "hello world"));

/* console.log("'helloworld' becomes:",hashing_function("helloworld"), "in the hashing function.");
console.log("'jelloworld' becomes:",hashing_function("jelloworld"), "in the hashing function.");
console.log("'helloorld' becomes:",hashing_function("helloorld"), "in the hashing function.");
console.log("'hellloworld' becomes:",hashing_function("hellloworld"), "in the hashing function.");
console.log("'elloworld' becomes:",hashing_function("elloworld"), "in the hashing function.");
console.log("'elloworl' becomes:",hashing_function("elloworl"), "in the hashing function.");
console.log("'he11oworld' becomes:",hashing_function("he11oworld"), "in the hashing function."); */
