let path = require('path');

let math_js = require("mathjs");

let filereader = require(path.resolve(__dirname, "./FileReader.js"))
let match_data = filereader.match_data;

let regression = require(path.resolve(__dirname, "./regression.js"));
let Multi_Linear_Regression =  regression.Multi_Linear_Regression;

class Regressor {

    constructor(path_to_data_folder) {
        /* The Regressor obejct is used as a factory class
        * Meaning, that all the logic resides elsewhere
        * and the main objetive of this object is to initialize the regression
        * in a predefined way.
        * */
        this.regression_obj = new Multi_Linear_Regression;
        /* Load in matches, binds them to prediction and independent.
         * Also binds the match data to mdata */
        this.load_matches(path_to_data_folder);

        this.bind_to_normalized_data();

        /* calculate coefficients */
        this.coefficients = this.calculate_coefficients();
        this.cleaned_coefficients = math_js.transpose(this.coefficients).toArray()[0];
        /* Init statistics */
        this.bind_statistics();
    }
    bind_to_normalized_data(){
        /* normalize the independent columns and bind them, for use in scatter plot later on */
        this.normalized_independent = this.regression_obj(this.independent)

    }
    load_matches(path) {
        /* Load all the matches into two seperate matrixes, Outcome and Indepedent variables */
        let all_data = new match_data(path);
        this.match_data = all_data;

        let match_results = all_data.match_results;
        this.prediction = Array();
        this.independent = Array();

        for (let i = 0; i < match_results.length; i++) {
            let [team1, team2, index] = match_results[i];
            this.prediction[i] = [index];
            let datapoints = all_data.cached_team[team1].length
            this.independent[i] = Array();

            for (let j = 0; j < datapoints; j++) {
                this.independent[i][j] = all_data.cached_team[team1][j] - all_data.cached_team[team2][j];
            }

        }

        this.prediction = math_js.matrix(this.prediction);
        this.independent = math_js.matrix(this.independent);
        this.header = all_data.header;
    }

    calculate_coefficients() {
        /* Wrapper that calls regression obj for coefficients calculation */
        return this.regression_obj.estimate_best_coefficients(this.independent, this.prediction)
    }

    predict_winner(team1, team2) {
        /* Team_1 and Team_2 are supposed to be the IDs of the teams competing */
        let team1data = this.match_data.cached_team[team1];
        let team2data = this.match_data.cached_team[team2];

        let independent_variables = [];
        for (let i = 0; i < team1data.length; i++) {
            independent_variables[i] = team1data[i] - team2data[i];
        }

        let coefficients = this.cleaned_coefficients;
        let output = coefficients[0]; /* initialise the prediction to B0 */
        for (let n = 1; n < coefficients.length; n++) {
            output += independent_variables[n-1] * coefficients[n];
        }

        if (output >= 0.5) {
            return team1;
        } else {
            return team2;
        }
    }

    bind_statistics() {
        if (this.coefficients === undefined) {
            return 0;
        }
        let independent = this.independent;
        let prediction = this.prediction;

        /* rss returns singular value */
        let rss = this.regression_obj.rss(independent, prediction, this.coefficients);
        let r_squared = this.regression_obj.r_squared(this.coefficients, independent, prediction);
        let sigma = Math.sqrt(this.regression_obj.sigma_squared(rss, independent));
        let pearsons_coefficients = this.regression_obj.pearson_correlations(this.independent, prediction);

        /* bind the calculated statistics to the object */
        this.statistics = {
            rss: rss,
            r_squared: r_squared,
            sigma: sigma,
            pearsons_coefficients: pearsons_coefficients
        };
    }
}

module.exports = {Regressor: Regressor};
