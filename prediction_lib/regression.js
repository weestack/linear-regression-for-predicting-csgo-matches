

const Linear_regression = () => {
    /* TODO: mean should be calculated 1 place only! */
    const mean = (array) => {
        // TODO: add type checking later
        let sum = 0;
        for(let i=0;i < array.length; i++){
            sum += parseFloat( array[i] )
        }
        return sum/array.length
    };

    const cross_deviation = (x, mean_x, y, mean_y ) => {
        /* Formula sum(x*y) - n*mean(x)*mean(y) */
        if (x.length !== y.length) {
            throw "x, and y should be of same length, error!"
        }

        let sum_multiply = 0;

        for (let i=0; i < x.length; i++ ) {
            sum_multiply += (x[i] * y[i])
        }

        return sum_multiply - (x.length * mean_x * mean_y);

    };


    const estimate_best_coeficcient = (x, y) => {

        /* numeric Length of dataset */
        let len = y.length;

        /* Mean of both y and x */
        let x_mean = mean(x);
        let y_mean = mean(y);

        /* Cross_deviation and deviation */
        let ssxy = ss_xy(x, x_mean, y, y_mean);
        let ssxx = ss_xy(x, x_mean, x, x_mean);

        let intercept = ssxy / ssxx;
        let slope = y_mean - intercept*x_mean;

        /* slope corrosponds to B_0 nad intercept corrosponds to B_1 */
        return [slope, intercept]





    }


};


export default Linear_regression;