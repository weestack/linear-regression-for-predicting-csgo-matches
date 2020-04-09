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
        for (let i = 0; i < column.length; i++) {
            sum += parseFloat(column[i])
        }
        return sum / column.length
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
        let ceoficcients = math_js.multiply(x_y, inverse_times_trans_ind);
        /* block to calculate B_0 */
        /* formula mean_y - transpose(ceoficcients)* mean_x_vec */
        let mean_y = this.mean(y);
        let means_x = this.mean_vector(x);
        let placeholder = math_js.multiply( math_js.transpose(ceoficcients), means_x  )
        let intercept = math_js.subtract( mean_y,  placeholder)


        return [intercept, ceoficcients]
    }

    Ordenary_Least_Squares(coeficcients, output_dots ){
        let variables = Array();
        for (let i = 1; i < coeficcients.length; i++){

        }

    }

    rss(coeficcients, independent, prediction){
        /*(Y − Xβ) * (Y − Xβ)*/
        let difference_trans = math_js.transpose( math_js.subtract(prediction, math_js.multiply(coeficcients, independent ))  );
        let difference = math_js.subtract(prediction, math_js.multiply(coeficcients, independent));

        return math_js.multiply(difference_trans, difference);
    }

    test_function(coeficcients, point){
        return math_js.multiply(point, coeficcients);
    }

    r_squared(rss, syy){
        return 1 - rss/syy;
    }

    variance(sigmoid_squared, independent){
        indepen_trans = math_js.transpose(independent);
        inde_times_inde_trans = math_js.multiply(indepen_trans, independt);

        return math_js.multiply(sigmoid_squared, math_js.inv(inde_times_inde_trans));
    }

    sigmoid_squared(rss, independent){
        let [length_of_cases, amount_of_independent_variables] = independent.size();

        return rss/(length_of_cases - amount_of_independent_variables);
    }
}


const fs = require("fs");

let rawdata = fs.readFileSync("sample_data/heights.json");
let raw = JSON.parse(rawdata);
/*let independt = Array( Array(), Array(), Array(),Array(), Array(), Array(),Array(), Array(), Array(),Array(), Array() );*/
let prediction = Array( Array(), Array() );
for (let i=1; i < raw.length; i++){
    prediction[0].push(parseFloat(raw[i][0].replace(/\\n/g, "")));
    prediction[1].push(parseFloat(raw[i][1].replace(/\\n/g, "")));

}



let simple = new Simple_Linear_regression;
let [slope, intercept, simple_rss] = simple.estimate_best_coeficcient(prediction[0], prediction[1]);
//console.log(multiple.estimate_best_coeficcients(prediction[0], prediction[1]));
console.log(slope)
console.log(intercept)
console.log(simple_rss)

//console.log(independt);


let multiple = new Multi_Linear_Regression;

let independent = math_js.matrix(prediction)

independent = math_js.transpose( independent );
//console.log(independent)
//console.log(math_js.column(independent, 1))

let [_intercept, terms] = multiple.estimate_best_coeficcients(math_js.column(independent, 0 ),math_js.column(independent, 1 ));
console.log(_intercept, terms)

//let test = math_js.matrix(prediction[0])


//let coeffi = multiple.estimate_best_coeficcients(prediction[0], prediction[1]);
//let __rss  = multiple.rss(coeffi, prediction[0], prediction[1]);

//console.log(coeffi)
//console.log(__rss)
