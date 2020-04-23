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
        /* Estimated least squares */
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
        /* reference page 57 apllied linear algebra */
        let [number_of_points, _] = independent.size()

        let decomp_independent = this.decomposition(independent);
        let decomp_prediction  = this.decomposition(prediction);

        let point_one_one_raw = math_js.multiply(math_js.transpose(decomp_independent), decomp_independent);
        let point_one_two_raw = math_js.multiply(math_js.transpose(decomp_independent), decomp_prediction);
        let point_two_one_raw = math_js.multiply(math_js.transpose(decomp_prediction), decomp_independent);
        let point_two_two_raw = math_js.multiply(math_js.transpose(decomp_prediction), decomp_prediction);

        let array = [[point_one_one_raw.subset(math_js.index(0, 0)),point_one_two_raw.subset(math_js.index(0, 0))], [point_two_one_raw.subset(math_js.index(0, 0)), point_two_two_raw.subset(math_js.index(0, 0))]];

        return math_js.matrix(array);
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

    sigma_squared(rss, independent){
        let [length_of_cases, amount_of_independent_variables] = independent.size();

        return rss/(length_of_cases - amount_of_independent_variables);
    }
}


module.exports = {
    Multi_Linear_Regression: Multi_Linear_Regression,
}

