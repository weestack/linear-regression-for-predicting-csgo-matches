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
        /* bind prediction */
        this.prediction = this.get_prediction_label(data);
        /* Bind independt */
        this.independent = this.get_independent_variables(data);
        /* Init statistics */
        this.bind_statistics(data, this.independent, this.prediction);
    }

    load_matches(path) {
        let mdata = new match_data(path)
        let [data, _] = mdata.filter_all_files();

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
        let rss = this.regression_obj.rss(summary_statics.subset(math_js.index(1,1)), summary_statics.subset(math_js.index(0,0)), this.coefficients);
        let r_squared = this.regression_obj.r_squared(this.coefficients, independt, prediction);
        let sigmond = this.regression_obj.sigmoid_squared(rss.subset(math_js.index(0,0)), independt);
        let varians = this.regression_obj.variance(sigmond, independt);
        let pearsons_coeficcient = this.regression_obj.pearson_corrolations(math_js.column(independt, 1), prediction );

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



/*
 * Creating a CSV file to store the data.
 */

/*const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
   path: 'out.csv',
   header: [
     {id: 'winner', title: 'winner'},
     {id: 'team1_last_match', title: 'team1_last_match'},
     {id: 'team1_win_lose_ratio', title: 'team1_win_lose_ratio'},
     {id: 'team1_wins_last_20', title: 'team1_wins_last_20'},
     {id: 'team1_winstreak', title: 'team1_winstreak'},
     {id: 'team1_player_mean_time_on_team', title: 'team1_player_mean_time_on_team'},
     {id: 'team1_mean_headshot', title: 'team1_mean_headshot'},
     {id: 'team1_sum_kda', title: 'team1_sum_kda'},
     {id: 'team2_last_match', title: 'team2_last_match'},
     {id: 'team2_win_lose_ratio', title: 'team2_win_lose_ratio'},
     {id: 'team2_wins_last_20', title: 'team2_wins_last_20'},
     {id: 'team2_winstreak', title: 'team2_winstreak'},
     {id: 'team2_player_mean_time_on_team', title: 'team2_player_mean_time_on_team'},
     {id: 'team2_mean_headshot', title: 'team2_mean_headshot'},
     {id: 'team2_sum_kda', title: 'team2_sum_kda'},
     {id: 'team1_matches_in_last_50_days', title: 'team1_matches_in_last_50_days'},
     {id: 'team2_matches_in_last_50_days', title: 'team2_matches_in_last_50_days'},
     {id: 'win_loose_ratio_50', title: 'win_loose_ratio_50'},
     {id: 'win_lose_ratio_150', title: 'win_lose_ratio_150'},
     {id: 'win_lose_ratio_370', title: 'win_lose_ratio_370'},
     {id: 'win_lose_ratio_all_time', title: 'win_lose_ratio_all_time'},
   ]
 });


let [csv_rows, csv_columns] = independt.size();

const csv_data = Array(csv_rows);

for(let i = 0; i < csv_rows; i++){
   csv_data[i] = {
       winner: prediction.subset(math_js.index(i, 0)),
       team1_last_match: independt.subset(math_js.index(i, 1 - 1)),
       team1_win_lose_ratio: independt.subset(math_js.index(i, 2 - 1)),
       team1_wins_last_20: independt.subset(math_js.index(i, 3 - 1)),
       team1_winstreak: independt.subset(math_js.index(i, 4 - 1)),
       team1_player_mean_time_on_team: independt.subset(math_js.index(i, 5 - 1)),
       team1_mean_headshot: independt.subset(math_js.index(i, 6 - 1)),
       team1_sum_kda: independt.subset(math_js.index(i, 7 - 1)),

       team2_last_match: independt.subset(math_js.index(i, 8 - 1)),
       team2_win_lose_ratio: independt.subset(math_js.index(i, 9 - 1)),
       team2_wins_last_20: independt.subset(math_js.index(i, 10 - 1)),
       team2_winstreak: independt.subset(math_js.index(i, 11 - 1)),
       team2_player_mean_time_on_team: independt.subset(math_js.index(i, 12 - 1)),
       team2_mean_headshot: independt.subset(math_js.index(i, 13 - 1)),
       team2_sum_kda: independt.subset(math_js.index(i, 14 - 1)),

       team1_matches_in_last_50_days: independt.subset(math_js.index(i, 15 - 1)),
       team2_matches_in_last_50_days: independt.subset(math_js.index(i, 16 - 1)),

       win_loose_ratio_50: independt.subset(math_js.index(i, 17 - 1)),
       win_lose_ratio_150: independt.subset(math_js.index(i, 18 - 1)),
       win_lose_ratio_370: independt.subset(math_js.index(i, 19 - 1)),
       win_lose_ratio_all_time: independt.subset(math_js.index(i, 20 - 1)),
   }
}

csvWriter.writeRecords(csv_data).then(() => console.log('The CSV file was written successfully'));

*/
let regressor = new Regressor("actual_data");
console.log(regressor.coefficients)
console.log(regressor.statistics)
console.log(regressor.statistics.rss)
console.log(regressor.statistics.r_squared)
console.log(regressor.statistics.pearsons_coeficcient)
console.log(regressor.statistics.summary_statics)
module.exports = {Regressor:Regressor};
