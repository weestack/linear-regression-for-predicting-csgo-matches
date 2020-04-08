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


    mean( column ) {
        // TODO: add type checking later
        let sum = 0;
        for (let i = 0; i < array.length; i++) {
            sum += parseFloat(array[i])
        }
        return sum / array.length
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
    estimate_best_coeficcients(x, y){

        let prediction = math_js.matrix(y);
        let independent = math_js.matrix(x);

        //console.log("THis is prediction:", prediction, "this is independent:", independent)

        let transpose_independent = math_js.transpose(independent);

        //console.log("This is transpose:", transpose_independent);

        let independent_times_transpose_ind = math_js.multiply(independent, transpose_independent);

        //console.log("this is long name:", independent_times_transpose_ind);

        let inverse_times_trans_ind = math_js.inv(independent_times_transpose_ind);
        //console.log("This is inverse:", inverse_times_trans_ind);
        let x_y = math_js.multiply(prediction, transpose_independent);

        let ceoficcients = math_js.multiply(x_y, inverse_times_trans_ind);

        return ceoficcients
    }

    Ordenary_Least_Squares(coeficcients, output_dots ){
        let variables = Array();
        for (let i = 1; i < coeficcients.length; i++){

        }

    }

    rss(coeficcients, independent, prediction){
        let difference = math_js.subtract(prediction, math_js.multiply(coeficcients, independt));

        return math_js.multiply(math_js.transpose(difference), difference);
    }

    test_function(coeficcients, point){
        return math_js.multiply(point, coeficcients);
    }
}



const fs = require("fs");

let rawdata = fs.readFileSync("sample_data/highway.json");
let raw = JSON.parse(rawdata);
let independt = Array( Array(), Array(), Array(),Array(), Array(), Array(),Array(), Array(), Array(),Array(), Array() );
let prediction = Array();
for (let i=1; i < raw.length; i++){
    prediction.push(raw[i][0].replace(/\\n/g, ""));

    for (let j=1; j < 12; j++){
        independt[j-1].push( raw[i][j].replace(/\\n/g, "" ));
    }

}
//console.log(independt);

independt = [[12, 13, 15, 16, 18], [32, 35, 45, 50, 65]];
prediction = [241132, 261035, 301065, 321050, 361065];

let multiple = new Multi_Linear_Regression;

let coeffi = multiple.estimate_best_coeficcients(independt, prediction);
let __rss  = multiple.rss(coeffi, independt, prediction);

console.log(coeffi);
console.log(__rss);