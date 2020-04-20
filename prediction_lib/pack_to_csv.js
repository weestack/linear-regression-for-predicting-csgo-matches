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