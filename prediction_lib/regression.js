

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

    const ss_xy = (x, y ) => {
        /* Formula sum(x*y) - n*mean(x)*mean(y) */
        if (x.length !== y.length) {
            throw "x, and y should be of same length, error!"
        }

        let mean_x = mean(x);
        let mean_y = mean(y);

        let sum_multiply = 0;

        for (let i=0; i < x.length; i++ ) {
            sum_multiply += (x[i] * y[i])
        }

        return sum_multiply - (x.length * mean_x * mean_y);

    };

    const ss_xx = (x) => {
        let mean_x = mean(x);
        let sum_multiply = 0;

        for (let i=0; i < x.length; i++ ) {
            sum_multiply += (x[i] * x[i])
        }

        return sum_multiply - (x.length * mean_x * mean_x);

    }


};


export default Linear_regression;