"use strict";
const math_js = require("mathjs");

class Regression {
    /*
    * Base object, packed with methods both for:
    * Linear regression
    * Multi variable regression
    */


    rss(coe0, coe1, x, y ){
        let sum = 0;
        for (let i = 0; i < y.length; i++){
            sum += (y[i] - (coe0 + coe1*x[i]))**2
        }
        return sum;



    }

    standardize () {
        /*  standardization (or Z-score normalization) means centering the variable at zero and standardizing the variance at 1. */
    }

    normalize ( column ) {
        /* normalize = (x - x_min)/(x_max-x_min) */
        let new_column = Array();
        let min = Math.min.apply(Math, column);
        let max = Math.max.apply(Math, column);

        for (let i = 0; i < column.length; i++) {
            new_column.push( (column[i]-min)/(max-min) )
        }

        return new_column


    }


    cross_deviation (x, mean_x, y, mean_y) {
        /* Formula sum(x*y) - n*mean(x)*mean(y) */
        if (x.length !== y.length) {
            throw "x, and y should be of same length, error!"
        }

        let sum_multiply = 0;

        for (let i = 0; i < x.length; i++) {
            sum_multiply += (x[i] * y[i])
        }

        return sum_multiply - (x.length * mean_x * mean_y);

    };


    mean_simple( column ) {
        // TODO: add type checking later
        let sum = 0;
        for (let i = 0; i < column.length; i++) {
            sum += parseFloat(column[i])
        }
        return sum / column.length
    }


    pearson_corrolations(X, Y) {
        /*
        * p = -1 stærk, negativ graf, (linear afhængig)
        * -1 < p < 0 - Nogen lunde linear sammenhæng, jo tættere på 0, jo dårligere sammenhæng.
        * 0 < p < 1 - Jo tættere på 1 jo bedre sammenhæng, hvis p=0, er der 100% inden lineære sammenhæng
        * p = 1 100% lineære sammenhæng
        * p= 0 ingen lineære sammenhæng!
        * */


        let pearson_coeficcient = 0;
        X = X.toArray()
        Y = Y.toArray()
        if ( X.length !== Y.length ) {
            return 0;
        }

        let denomenator = 0;
        let delta_x_square = 0;
        let delta_y_square = 0;

        let mean_x = this.mean_simple(X);
        let mean_y = this.mean_simple(Y);

        for (let i =0; i < X.length; i++){
            denomenator += (X[i] - mean_x) * (Y[i] - mean_y );
            delta_x_square += (X[i] - mean_x)**2
            delta_y_square += (Y[i] - mean_y)**2
        }

        return (denomenator) / (Math.sqrt(delta_x_square) * Math.sqrt(delta_y_square) )
    }



}

class Simple_Linear_regression extends Regression {
    /* equation to expect from object Y_i = b_0 + b_1*x_i  */
    estimate_best_coeficcient (x, y) {


        /* numeric Length of dataset */
        let len = y.length;

        /* Mean of both y and x */
        let x_mean = this.mean(x);
        let y_mean = this.mean(y);

        /* Cross_deviation and deviation */
        let ssxy = this.cross_deviation(x, x_mean, y, y_mean);
        let ssxx = this.cross_deviation(x, x_mean, x, x_mean);

        let ssyy = this.cross_deviation(y, y_mean, y, y_mean);

        /* sdx_square */
        let sdx_square = ssxx/( len -1 );
        let sdx = Math.sqrt(sdx_square);

        let sdy_squre = ssyy/( len -1 );
        let sdy = Math.sqrt(sdx_square);

        let sample_covariance = ssxy/(len - 1);
        let sample_corrolation = sample_covariance / ( sdx * sdy );

        let intercept = ssxy / ssxx;
        let slope = y_mean - intercept * x_mean;
        let _rss = this.rss(slope, intercept, x, y);

        /* slope corrosponds to B_0 nad intercept corrosponds to B_1 */
        return [slope, intercept, _rss]


    }

    estimate_cost() {

    }
}

class Multi_Linear_Regression extends Regression {
    /* equation to expect from object Y_i = b_0 + b_1*x_i + ... b_n*x_i */

    mean(matrix_column) {
        let matrix = math_js.matrix(matrix_column);
        let sum = 0;
        let length = 0;
        matrix.map( (value) => {sum += value; length++} )

        return sum / length


    }
    mean_vector( matrix ) {
        let [rows, columns] = matrix.size();
        let means = math_js.matrix();
        for (let i=0; i < columns; i++) {
            means.subset(
                math_js.index(i), // grap the value at the i'th place
                this.mean( math_js.column( matrix, i ) ) // pass in the i'th column to the mean function
            )
        }
        return means;
    }


    decomposition( matrix) {
        //let _ma = math_js.matrix(matrix);
        //console.log(matrix)
        let [rows, columns ] = matrix.size();
        if (columns === "undefined"){
            columns = 1;
        }
        let means = [];
        /* get all the means */
        for (let column = 0; column < columns; column++){
            means[column] = this.mean(math_js.column(matrix, column))
        }
        /* compute the new column values */
        let new_matrix = math_js.matrix();
        for (let column = 0; column < columns; column++){
            for (let row = 0; row < rows; row ++){
                let ij_val = matrix.subset(math_js.index( row,column  ))
                ij_val = ij_val - [means[column]];
                new_matrix.subset(math_js.index(row, column),   ij_val)
            }
        }


        return new_matrix;

    }
    estimate_best_coeficcients(x, y){
        let decomp_prediction = this.decomposition(y);
        let decomp_independent =  this.decomposition(x);

        /* block for calculating b_1 ... b_n coeficcients */
        let transpose_independent = math_js.transpose(decomp_independent);
        let independent_times_transpose_ind = math_js.multiply(transpose_independent, decomp_independent);
        let inverse_times_trans_ind = math_js.inv(independent_times_transpose_ind);
        let x_y = math_js.multiply(transpose_independent, decomp_prediction);
        let ceoficcients = math_js.multiply(inverse_times_trans_ind, x_y);
        /* block to calculate B_0 */
        /* formula mean_y - transpose(ceoficcients)* mean_x_vec */
        let mean_y = this.mean(y);
        let means_x = this.mean_vector(x);
        let placeholder = math_js.multiply( math_js.transpose(ceoficcients), means_x  );
        let intercept = math_js.subtract( mean_y,  placeholder);

        let coefi = math_js.matrix([intercept.toArray(), ... ceoficcients.toArray()]);
        return coefi;

    }

    summary_statictis(independent, prediction){
        let [number_of_points, _] = independent.size()

        let decomp_independent = this.decomposition(independent);
        let decomp_prediction  = this.decomposition(prediction);

        let point_one_one_raw = math_js.multiply(math_js.transpose(decomp_independent), decomp_independent);
        let point_one_two_raw = math_js.multiply(math_js.transpose(decomp_independent), decomp_prediction);
        let point_two_one_raw = math_js.multiply(math_js.transpose(decomp_prediction), decomp_independent);
        let point_two_two_raw = math_js.multiply(math_js.transpose(decomp_prediction), decomp_prediction);

        let array = [[point_one_one_raw.subset(math_js.index(0, 0)),point_one_two_raw.subset(math_js.index(0, 0))], [point_two_one_raw.subset(math_js.index(0, 0)), point_two_two_raw.subset(math_js.index(0, 0))]];

        return math_js.matrix(array);
        /*
        let scalar = (1/(number_of_points - 1));
        
        return math_js.multiply(scalar, output_matrix);
        */ 
    }


    rss(SYY, SXX, coeficcients){
        /* convert to array, to remove B_0 */
        let coe = coeficcients.toArray();
        coe.shift();
        /* beta star */
        coe =  math_js.matrix(coe);
        /* transposed beta star */
        let transpose_coe = math_js.transpose( coe  );

        /* trans posed beta star * SXX */
        let b_ssx = math_js.multiply(transpose_coe, SXX);
        /* b_ssx * beta */
        let b_b = math_js.multiply(b_ssx, coe);

        return math_js.subtract(SYY, b_b);
        
    }

    calculate_yi(coeficcients, point){
        let coe = coeficcients.toArray();

        let b_0 = coe.shift()[0];

        let coeffi = math_js.matrix(coe);

        let value_without_b0 = math_js.multiply(point, coeffi).toArray()[0][0];

        return b_0 + value_without_b0;
    }

    r_squared(coefficients, independent, prediction){
        let mean_y = this.mean(prediction);
        let y_array = prediction.toArray();

        let y_current_guess;
        let sum_our_prediction = 0;
        let total_sum = 0;

        for(let i = 0; i < y_array.length; i++){
            y_current_guess = this.calculate_yi(coefficients, math_js.row(independent, i));

            sum_our_prediction += (y_array[i][0] - y_current_guess)**2;

            total_sum += (y_array[i][0] - mean_y)**2;
        }
        
        return (total_sum - sum_our_prediction) / total_sum;
    }

    variance(sigmoid_squared, independent){
        let indepen_trans = math_js.transpose(independent);
        let inde_times_inde_trans = math_js.multiply(indepen_trans, independent);

        return math_js.multiply(sigmoid_squared, math_js.inv(inde_times_inde_trans));
    }

    sigmoid_squared(rss, independent){
        let [length_of_cases, amount_of_independent_variables] = independent.size();

        return rss/(length_of_cases - amount_of_independent_variables);
    }
}


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

"use strict";
const fs = require("fs");
const path = require("path");


class file_sanatiser {
    openfile(){
        // This is just used as a normal file opener function.

        let file = fs.readFileSync(this.path);

        return file;
    }

    json_converter(json_data){
        return JSON.parse(json_data);
    }


}


class match_obect {
    constructor(first_kills, win_lose_ratio, last_match_date, matches, mean_time_in_team, mean_kda, mean_headshots) {
        this.first_kills = first_kills;
    }
}



class match_data extends file_sanatiser {
    /*
    * Factory class that should prepare CS:GO data for regression
    */
    constructor(absolute_path){
        /* path is expected to be folder for all data */
        super();
        this.path = absolute_path;

        /*let file = this.openfile();
        file = this.filter_file(file);

        this.data = file;*/
    }

    filter_all_files(){
        let directory = path.join(__dirname, this.path);

        let files = fs.readdirSync(directory, {"encoding":"utf-8"});

        let test = Math.floor(files.length/4);
        let fit = files.length - test;
        let fit_matrix = Array();

        for (let i = 0; i < fit; i++){
            //console.log(files[i])
            let data = fs.readFileSync(this.path+"/"+files[i]);
            //let data = fs.readFileSync(this.path+"/"+"101394.json");
            let parsed_data = JSON.parse(data)
            //console.log(parsed_data[0].last_matches)
            delete parsed_data["id"];
            fit_matrix[i] = this.filter_file(parsed_data);
        }


        let test_matrix = Array();
        for (let i = fit; i < files.length; i++){
            //console.log(files[i])
            let data = fs.readFileSync(this.path+"/"+files[i]);
            //let data = fs.readFileSync(this.path+"/"+"101394.json");
            let parsed_data = JSON.parse(data)
            //console.log(parsed_data[0].last_matches)
            delete parsed_data["id"];
            test_matrix[i % fit] = this.filter_file(parsed_data);
        }

        return [fit_matrix, test_matrix];
    }

    filter_file(parsed_data){
        let methods = [
            "win_loose_for_team",
            /*"best_n_worst_map_per_team",
            "win_loose_between_team_and_current_opponent",
            "most_used_weapons",
            "most_deaths_to_weapons",
            "mean_headshots",
            "first_kill",
            "time_sine_last_match",
            "time_players_has_played_together_in_teams",
            "mean_death_kill_ratio"*/
        ]

        /* [0] = win or loose, [1] = first_kills, [2] = win_lost_raio,
         * [3] = wins_last 20 matches, [4] = win_streak, [5] = mean time on team,
         * [6] = mean headshots, [7] = sum_kda,
         *
         */
        let data = Array(15);

        let teams = [parsed_data[0], parsed_data[1]]
        //console.log(parsed_data.winner)
        let victor = (parsed_data.winner == 1) ? 0.5 : 1;
        data[0] = victor;
        let date  = parsed_data.date;
        let date_hours = this.convert_date_to_hours(date);
        //console.log("victor",victor)
        //console.log("date",date)

        for (let team_id in teams) {
            let epsilon = 7*team_id;

            data[1+epsilon] = teams[team_id].first_kills;
            data[2+epsilon] = (teams[team_id].win_lose_ratio !== null) ?teams[team_id].win_lose_ratio:0 ;

            //console.log(team_id)
            //console.log(teams[team_id].last_matches)
            //console.log("first_kills ",teams[team_id].first_kills)
            //console.log("win loose ratio ",teams[team_id].win_lose_ratio)
            //console.log("last match date",teams[team_id].last_match_date) // Rewrite to hours since last match

            let last_20 = this.last_x_matches(teams[team_id], 20);
            [data[4+epsilon], data[3+epsilon]] = this.current_winstreak(last_20);

            //console.log(this.convert_date_to_hours(teams[team_id].last_match_date));
            //console.log("mean time in team", ) // carefull not to devide by 0
            //console.log("headshots ", ) // carefull not to devide by 0
            //console.log("kda ", ) // carefull not to devide by 0

            let [mean_time_in_team, mean_headshots, sum_kda] = this.extract_mean_values_from_players(teams[team_id].player_data);
            data[5 + epsilon] = mean_time_in_team;
            data[6 + epsilon] = mean_headshots;
            data[7 + epsilon] = sum_kda;
            //console.log(a,b,c)
            //console.log(a,b,c)

        }
        //console.log(data);

        return data;
    }

    convert_date_to_hours(date){
        let date_object = new Date(date);
        return (Date.now() - date_object.getTime()) / (1000 * 60 * 60);
    }

    current_winstreak(matches){
        let winning = 1;
        let in_row = 0;
        let wins_all = 0;
        for(let i = 0; i < matches.length; i++){
            if(matches[i][0] == 0){
                wins_all++;

                if(winning == 1){
                    in_row++;
                }
            } else {
                winning = 0;
            }
        }
        return [in_row, wins_all];
    }


    last_x_matches(team, limit){
        let arr = [];
        let length = (team.last_matches.length > limit) ? limit: team.last_matches.length;
        for(let i=0; i < length; i++){

            arr.push([
                (team.last_matches[i].winner == team.last_matches[i].team1) ? 0: 1, // log the winner
                team.last_matches[i].date
            ])
        }
        return arr;
    }

    extract_mean_values_from_players(players_object) {
        let mean_time_in_team = 0.00;
        let mean_tit_count = 0;

        let mean_headshots = 0.00;
        let mean_head_count = 0;

        let sum_kda = 0.00
        for (let id in players_object) {
            /* days in team */
            if (players_object[id].days_in_team != null ) {
                mean_time_in_team += players_object[id].days_in_team
                mean_tit_count++;
            }
            /* Headshot */
            if (players_object[id].headshots != null ) {
                mean_headshots += players_object[id].headshots
                mean_head_count++;
            }
            /* KDA */
            if (players_object[id].kda != null ) {
                sum_kda += players_object[id].kda
            }
        }
        return  [(mean_tit_count == 0) ? 0 : mean_time_in_team/mean_tit_count, (mean_head_count == 0)? 0 : mean_headshots/mean_head_count, sum_kda]
    }


    filter_for_type(name, datarow){

    }

    win_loose_for_team(datarow, data_object_string_name){
        /* D1 */
        console.log(data_object_string_name)
    }


    best_n_worst_map_per_team(){
        /* D2 */
    }

    win_loose_between_team_and_current_opponent(){
        /* D3 */
    }

    most_used_weapons(){
        /* D4 */
    }

    most_deaths_to_weapons(){
        /* D5 */
    }

    mean_headshots(){
        /* D6 */
    }

    first_kill(){
        /* D7 */
    }

    time_sine_last_match(){
        /* D8 */
    }


    time_players_has_played_together_in_teams(){
        /* D9 */
    }

    mean_death_kill_ratio(){
        /* D10 */
    }

}

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
