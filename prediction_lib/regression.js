"use strict";
const math_js = require("mathjs");

class Multi_Linear_Regression {
    normalize (matrix) {
        /* normalize = (x - x_min)/(x_max-x_min)
        * Normalization reduces all datapoints to a number between 0 and 1.
        * This makes it easier to get an overview from a scatterplot matrix, with multiple data, being with in same range.
        */
        /* Features decides the range for the nomalization! */
        let feature_max = 1;
        let feature_min = 0;
        let [rows, columns] = matrix.size();
        let norm_matrix = Array(columns);

        for (let column = 0; column < columns; column++){
            let xcol = math_js.column(matrix, column);
            if (typeof(xcol) === typeof(0)) {
                xcol = [xcol];
            } else {
                xcol = xcol.toArray();
            }
            let xmin = Infinity;
            let xmax = -Infinity;
            xcol.map(x_i => {
                /* asumes that the matrix is only 2d! */
                if (xmin > x_i) {
                    xmin = x_i
                }
                if (xmax < x_i) {
                    xmax = x_i
                }
            })
            norm_matrix[column] = xcol.map( x_i =>  {
                let X = (x_i - xmin) / (xmax - xmin);
                return X*(feature_max - feature_min) + feature_min
                }
            )
        }
        return math_js.transpose(math_js.matrix(norm_matrix))
    }
    mean(matrix_column) {
        /* Calculates the mean of a matrix column */
        if (typeof(matrix_column) === typeof(0)) {
            matrix_column = [matrix_column];
        }
        let sum = 0;
        let length = 0;
        matrix_column.map((value) => {
            sum += value;
            length++
        })
        return sum / length
    }

    mean_vector(matrix) {
        /* Calculates the mean of each colum and creates a vector with an entrace
        for each column with its respective mean value */
        let [rows, columns] = matrix.size();
        let means = math_js.matrix();
        for (let i=0; i < columns; i++) {
            means.subset(
                math_js.index(i), // grab the value at the i'th place
                this.mean( math_js.column( matrix, i ) ) // pass in the i'th column to the mean function
            )
        }
        return means;
    }

    pearson_correlations(independent, prediction){
        /* Takes in all dependent and independent row and calculates the pearson correlation between
        * The dependent and each independt column! */
        let correlations = Array();
        let [rows, columns] = independent.size();
        for (let column = 0; column < columns; column++){
            correlations[column] = this.get_pearson_correlation(math_js.column(independent, column), prediction);
        }
        return correlations;
    }

    get_pearson_correlation(X, Y) {
        /* Calculates the correlation between two columns.
        * p = -1 stærk, negativ graf, (linear afhængig)
        * -1 < p < 0 - Nogen lunde linear sammenhæng, jo tættere på 0, jo dårligere sammenhæng.
        * 0 < p < 1 - Jo tættere på 1 jo bedre sammenhæng, hvis p=0, er der 100% inden lineære sammenhæng
        * p = 1 100% lineære sammenhæng
        * p= 0 ingen lineære sammenhæng!
        * */
        if (typeof(X) === typeof(0)) {
            X = [X];
        } else {
            X = X.toArray();
        }

        if (typeof(Y) === typeof(0)) {
            Y = [Y];
        } else {
            Y = Y.toArray();
        }

        if ( X.length !== Y.length ) {
            return 0;
        }

        let denomenator = 0;
        let delta_x_square = 0;
        let delta_y_square = 0;
        let mean_x = this.mean(X);
        let mean_y = this.mean(Y);

        for (let i = 0; i < X.length; i++){
            denomenator += (X[i] - mean_x) * (Y[i] - mean_y);
            delta_x_square += (X[i] - mean_x)**2
            delta_y_square += (Y[i] - mean_y)**2
        }

        return denomenator / (Math.sqrt(delta_x_square) * Math.sqrt(delta_y_square) )
    }

    decomposition(matrix) {
        /* This decomposition is described in the book Applied linear regression on page 56. */
        let [rows, columns ] = matrix.size();

        /* get all the means */
        let means = this.mean_vector(matrix);

        /* compute the new column values */
        let new_matrix = math_js.matrix();
        for (let column = 0; column < columns; column++){
            for (let row = 0; row < rows; row ++){
                let ij_val = matrix.subset(math_js.index(row, column));
                ij_val = ij_val - [means[column]];
                new_matrix.subset(math_js.index(row, column), ij_val);
            }
        }
        return new_matrix;
    }

    estimate_best_coefficients(x, y){
        /* Calculate the best coefficients using the OLS equation from the book at page 57 */
        let decomp_prediction = this.decomposition(y);
        let decomp_independent =  this.decomposition(x);

        /* code for calculating b_1 ... b_n coefficients */
        let transpose_independent = math_js.transpose(decomp_independent);
        let independent_times_transpose_ind = math_js.multiply(transpose_independent, decomp_independent);
        let inverse_times_trans_ind = math_js.inv(independent_times_transpose_ind);
        let x_y = math_js.multiply(transpose_independent, decomp_prediction);
        let coefficients = math_js.multiply(inverse_times_trans_ind, x_y);

        /* code to calculate B_0 */
        /* formula mean_y - transpose(coefficients)* mean_x_vec */
        let mean_y = this.mean(y);
        let means_x = this.mean_vector(x);
        let placeholder = math_js.multiply(math_js.transpose(coefficients), means_x);
        let intercept = math_js.subtract(mean_y, placeholder);

        return math_js.matrix([intercept.toArray(), ... coefficients.toArray()]);
    }

    rss(independent, prediction, coefficients){
        /* add a column of ones to create a full X matrix */
        let independent_rows = independent.toArray();
        independent_rows.map(row => {
            return row.unshift(1);
        });

        let X = math_js.matrix(independent_rows);
        let Y = prediction;
        let B = coefficients;

        let calculated_Y = math_js.multiply(X, B);
        let residuals = math_js.subtract(Y, calculated_Y);
        let residuals_transposed = math_js.transpose(residuals);
        let rss_matrix = math_js.multiply(residuals_transposed, residuals);

        let rss = rss_matrix.subset(math_js.index(0, 0));
        return rss;
    }

    flatten(array){
        let output = [];
        array.map(item => {
            if (typeof(item) === typeof(Array())) {
                output = output.concat(item);
            } else {
                output = output.concat([item]);
            }
        });
        return output;
    }

    calculate_yi(coefficients, independent_row){
        /* Calulates Y with a respective row eg:
        * yi = B_0 + B_1*x1 ... B_n*xn */
        if(typeof(independent_row) !== typeof(Array())){
            independent_row = [1, independent_row];
        }
        else{
            independent_row = independent_row.toArray();
            independent_row[0].unshift(1);
        }
        independent_row = math_js.matrix(independent_row);

        let values = this.flatten(math_js.multiply(independent_row, coefficients).toArray());
        return values[0];
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

    sigma_squared(rss, independent){
        let [length_of_cases, amount_of_independent_variables] = independent.size();
        return rss/(length_of_cases - amount_of_independent_variables - 1);
    }
}

let arr = math_js.matrix([[-1, 2], [-0.5, 6], [0, 10], [1, 18]]);
let reg = new Multi_Linear_Regression
console.log(reg.normalize(arr))

module.exports = {
    Multi_Linear_Regression: Multi_Linear_Regression,
}

