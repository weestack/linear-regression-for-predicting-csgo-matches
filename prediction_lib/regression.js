const math_js = require("mathjs");

const mean = (array) => {
    // TODO: add type checking later
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += parseFloat(array[i])
    }
    return sum / array.length
};

const cross_deviation = (x, mean_x, y, mean_y) => {
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


function rss(coe0, coe1, x, y ){
    let sum = 0;
    for (let i = 0; i < y.length; i++){
        sum += (y[i] - (coe0 + coe1*x[i]))**2
    }
    return sum;



}




class Regression {
    constructor( ...dataset ) {
        /* y should be the first array, and the independent variables should come after  */
        this.dataset = dataset;
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




}


const Linear_regression = () => {
    /* equation to expect from object Y_i = b_0 + b_1*x_i + ... b_n*x_i */
    /* TODO: mean should be calculated 1 place only! */



    const estimate_best_coeficcient = (x, y) => {

        /* numeric Length of dataset */
        let len = y.length;

        /* Mean of both y and x */
        let x_mean = mean(x);
        let y_mean = mean(y);

        /* Cross_deviation and deviation */
        let ssxy = ss_xy(x, x_mean, y, y_mean);
        let ssxx = ss_xy(x, x_mean, x, x_mean);

        let ssyy = ss_xy(y, y_mean, y, y_mean);

        /* sdx_square */
        let sdx_square = ssxx/( len -1 );
        let sdx = Math.sqrt(sdx_square);

        let sdy_squre = ssyy/( len -1 );
        let sdy = Math.sqrt(sdx_square);

        let sample_covariance = ssxy/(len - 1);
        let sample_corrolation = sample_covariance / ( sdx * sdy );





        let intercept = ssxy / ssxx;
        let slope = y_mean - intercept * x_mean;
        let _rss = rss(slope, intercept, x, y);

        /* slope corrosponds to B_0 nad intercept corrosponds to B_1 */
        return [slope, intercept, _rss]


    }

    const cost_function = () => {

    }


};




const estimate_best_coeficcient = (y, x) => {

    /* numeric Length of dataset */
    let len = y.length;

    /* Mean of both y and x */
    let x_mean = mean(x);
    let y_mean = mean(y);

    /* Cross_deviation and deviation */
    let ssxy = cross_deviation(x, x_mean, y, y_mean);
    let ssxx = cross_deviation(x, x_mean, x, x_mean);

    let ssyy = cross_deviation(y, y_mean, y, y_mean);

    /* sdx_square */
    let sdx_square = ssxx/( len -1 );
    let sdx = Math.sqrt(sdx_square);

    let sdy_squre = ssyy/( len -1 );
    let sdy = Math.sqrt(sdx_square);

    let sample_covariance = ssxy/(len - 1);
    let sample_corrolation = sample_covariance / ( sdx * sdy );





    let intercept = ssxy / ssxx;
    let slope = y_mean - intercept * x_mean;
    let _rss = rss(slope, intercept, x, y);

    /* slope corrosponds to B_0 nad intercept corrosponds to B_1 */
    return [slope, intercept, _rss]


}

/* x = vector & y = matrix */
function get_multiple_independent_varialbes(x, y){
    let array = [[-3.7, 3.5, 2.5, 11.5, 5.7], [3, 4, 5, 6, 2], [8, 5, 7, 3, 1]];

    let prediction = math_js.matrix(array[0]);
    let independent = math_js.matrix([array[1], array[2]]);
    
    //console.log("THis is prediction:", prediction, "this is independent:", independent)

    let transpose_independent = math_js.transpose(independent);

    //console.log("This is transpose:", transpose_independent);
    
    let independent_times_transpose_ind = math_js.multiply(independent, transpose_independent);
    
    //console.log("this is long name:", independent_times_transpose_ind);

    let inverse_times_trans_ind = math_js.inv(independent_times_transpose_ind);
    //console.log("This is inverse:", inverse_times_trans_ind);

    let temp = math_js.multiply(independent, transpose_independent);
    console.log("ind:", math_js.multiply(temp, inverse_times_trans_ind));

     let x_y = math_js.multiply(prediction, transpose_independent);

    let curificents = math_js.multiply(x_y, inverse_times_trans_ind);

    console.log(curificents);
}

get_multiple_independent_varialbes(2,3);

let intercapt;
let _rss;

const fs = require("fs");

/*
let rawdata = fs.readFileSync("sample_data/forbes.json");
raw = JSON.parse(rawdata);
console.log(raw)
let new_array = Array( Array(), Array(), Array() );

for (let i=1; i < raw.length; i++){
    new_array[0].push( raw[i][0].replace(/\\n/g, "") );
    new_array[1].push(  raw[i][1].replace(/\\n/g, "") );
    new_array[2].push( parseFloat( raw[i][2].replace(/\\n/g, "")) / 100 );


}
console.log(new_array);



[slope, intercapt, _rss] = estimate_best_coeficcient(new_array[2], new_array[0]);

console.log(slope);
console.log(intercapt);
console.log(_rss);

*/


//export default Linear_regression;