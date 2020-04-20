let path = require('path');

let math_js = require("mathjs");

let filereader = require(path.resolve(__dirname, "./FileReader.js" ))
let match_data = filereader.match_data;

let regression = require(path.resolve(__dirname, "./regression.js" ));
let Multi_Linear_Regression = regression.Multi_Linear_Regression;

class Regressor {

    constructor(path_to_data_folder) {
        this.regression_obj = new Multi_Linear_Regression;
        /* Load in matches */
        let data = this.load_matches(path_to_data_folder);
        /* Train with the loaded matches */
        this.coefficients = this.train_regressor(data);
        this.cleaned_coeficcients = math_js.transpose(this.coefficients ).toArray();
        /* bind prediction */
        this.prediction = this.get_prediction_label(data);
        /* Bind independt */
        this.independent = this.get_independent_variables(data);
        /* Init statistics */
        this.bind_statistics(data, this.independent, this.prediction);
    }

    load_matches(path) {
        let mdata = new match_data(path)

        let data = mdata.fitting;

        data = math_js.matrix(data);
        return data;
    }

    train_regressor(matches) {
        let coefficients = this.regression_obj.estimate_best_coeficcients(this.get_independent_variables(matches), this.get_prediction_label(matches))
        return coefficients;
    }

    get_prediction_label(matches) {
        return math_js.column(matches, 0);
    }
    get_independent_variables(matches){
        let all = math_js.transpose(matches).toArray()
        all.shift();
        return math_js.transpose(math_js.matrix(all))
    }
    predict_winner(team_1, team_2){
        /* Team_1 and Team_2 are supposed to be the string names of the teams competing */
        return [team_1, 1];
    }
    bind_statistics(matches, independt, prediction) {
        if (this.coefficients === undefined){
            return 0;
        }

        let summary_statics = this.regression_obj.summary_statictis(independt, prediction)
        /* rss returns singular value */
        let rss = this.regression_obj.rss(summary_statics.subset(math_js.index(1,1)), summary_statics.subset(math_js.index(0,0)), this.coefficients);
        let r_squared = this.regression_obj.r_squared(this.coefficients, independt, prediction);
        let sigmond = this.regression_obj.sigma_squared(rss.subset(math_js.index(0,0)), independt);
        let varians = this.regression_obj.variance(sigmond, independt);
        let pearsons_coeficcient = this.regression_obj.pearson_corrolations(math_js.column(independt, 1), prediction );

        /* bind the raw value rather than matrix obj */
        rss = rss.subset(math_js.index(0,0))
        /* bind the raw values of summary, ranther than using matrix obj */
        summary_statics = {
            sxx: summary_statics.subset(math_js.index(0,0)),
            syy: summary_statics.subset(math_js.index(1,1)),
            sxy: summary_statics.subset(math_js.index(0,1))
        }
        this.statistics = {
            summary_statics: summary_statics,
            rss: rss,
            r_squared: r_squared,
            sigmond: sigmond,
            varians: varians,
            pearsons_coeficcient:pearsons_coeficcient
        };
        return 1;

    }

    calculate_yi(coeficcients, point){
        /* use later on, as helper function predict team winner! */
        let coe = coeficcients.toArray();

        let b_0 = coe.shift()[0];

        let coeffi = math_js.matrix(coe);

        let value_without_b0 = math_js.multiply(point, coeffi).toArray()[0][0];

        return b_0 + value_without_b0;
    }

}
let regressor = new Regressor("../scraper/data");
console.log("coeficcients",regressor.cleaned_coeficcients)
//console.log("statistics".regressor.statistics)
console.log("sumary ",regressor.statistics.summary_statics)
console.log("rss,",regressor.rss)

console.log("r**",regressor.statistics.r_squared)
console.log("pearson ",regressor.statistics.pearsons_coeficcient)
module.exports = {Regressor:Regressor};
