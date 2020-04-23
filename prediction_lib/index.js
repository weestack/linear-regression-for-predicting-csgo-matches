let path = require('path');

let math_js = require("mathjs");

let filereader = require(path.resolve(__dirname, "./FileReader.js"))
let match_data = filereader.match_data;

let regression = require(path.resolve(__dirname, "./regression.js"));
let Multi_Linear_Regression = regression.Multi_Linear_Regression;

class Regressor {

    constructor(path_to_data_folder) {
        this.regression_obj = new Multi_Linear_Regression;
        /* Load in matches, binds them to prediction and independent.
         * Also binds the match data to mdata */
        this.load_matches(path_to_data_folder);

        /* Train with the loaded matches */
        this.coefficients = this.train_regressor();
        this.cleaned_coeficcients = math_js.transpose(this.coefficients).toArray()[0];
        /* Init statistics */
        this.bind_statistics();
    }

    load_matches(path) {
        let mdata = new match_data(path);
        this.mdata = mdata;

        let match_results = mdata.match_results;
        this.prediction = Array();
        this.independent = Array();

        for (let i = 0; i < match_results.length; i++) {
            let [team1, team2, index] = match_results[i];
            this.prediction[i] = [index];
            let datapoints = mdata.cached_team[team1].length
            this.independent[i] = Array();

            for (let j = 0; j < datapoints; j++) {
                this.independent[i][j] = mdata.cached_team[team1][j] - mdata.cached_team[team2][j];
            }

        }

        this.prediction = math_js.matrix(this.prediction);
        this.independent = math_js.matrix(this.independent);
    }

    train_regressor() {
        let coefficients = this.regression_obj.estimate_best_coeficcients(this.independent, this.prediction)
        return coefficients;
    }

    predict_winner(team1, team2) {
        /* Team_1 and Team_2 are supposed to be the IDs of the teams competing */
        let team1data = this.mdata.cached_team[team1];
        let team2data = this.mdata.cached_team[team2];

        let independent_variables = [];
        for (let i = 0; i < team1data.length; i++) {
            independent_variables[i] = team1data[i] - team2data[i];
        }

        let coefficients = this.cleaned_coeficcients;
        let output = coefficients[0]; /* initialise the prediction to B0 */
        for (let n = 1; n < coefficients.length; n++) {
            output += independent_variables[n-1] * coefficients[n];
        }

        if (output >= 0.5) {
            return {
                winner: team1,
                how_sure: output,
            }
        } else {
            return {
                winner: team2,
                how_sure: 1-output,
            }
        }
    }

    bind_statistics() {
        if (this.coefficients === undefined) {
            return 0;
        }
        let independt = this.independent;
        let prediction = this.prediction;

        let summary_statics = this.regression_obj.summary_statictis(independt, prediction)
        /* rss returns singular value */
        let rss = this.regression_obj.rss(summary_statics.subset(math_js.index(1, 1)), summary_statics.subset(math_js.index(0, 0)), this.coefficients);
        let r_squared = this.regression_obj.r_squared(this.coefficients, independt, prediction);
        let sigma = this.regression_obj.sigma_squared(rss.subset(math_js.index(0, 0)), independt);
        let varians = this.regression_obj.variance(sigma, independt);
        let pearsons_coeficcient = this.regression_obj.pearson_corrolations(math_js.column(independt, 1), prediction);

        /* bind the raw value rather than matrix obj */
        rss = rss.subset(math_js.index(0, 0))
        /* bind the raw values of summary, ranther than using matrix obj */
        summary_statics = {
            sxx: summary_statics.subset(math_js.index(0, 0)),
            syy: summary_statics.subset(math_js.index(1, 1)),
            sxy: summary_statics.subset(math_js.index(0, 1))
        }
        this.statistics = {
            summary_statics: summary_statics,
            rss: rss,
            r_squared: r_squared,
            sigma: sigma,
            varians: varians,
            pearsons_coeficcient: pearsons_coeficcient
        };
        return 1;

    }
}

module.exports = {Regressor: Regressor};
