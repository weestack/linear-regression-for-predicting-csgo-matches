"use strict";
const fs = require("fs");
const path = require("path");


class file_sanatiser {
    openfile(){
        // This is just used as a normal file opener function.

        let file = fs.readFileSync(this.path);

        return file;
    }

    json_converter(json_data){
        return JSON.parse(json_data);
    }


}


class match_obect {
    constructor(first_kills, win_lose_ratio, last_match_date, matches, mean_time_in_team, mean_kda, mean_headshots) {
        this.first_kills = first_kills;
    }
}



class match_data extends file_sanatiser {
    /*
    * Factory class that should prepare CS:GO data for regression
    */
    constructor(absolute_path){
        /* path is expected to be folder for all data */
        super();
        this.path = absolute_path;

        /*let file = this.openfile();
        file = this.filter_file(file);

        this.data = file;*/
    }

    filter_all_files(){
        let directory = path.join(__dirname, this.path);

        let files = fs.readdirSync(directory, {"encoding":"utf-8"});

        let test = Math.floor(files.length/4);
        let fit = files.length - test;
        let fit_matrix = Array();

        for (let i = 0; i < fit; i++){
            //console.log(files[i])
            let data = fs.readFileSync(this.path+"/"+files[i]);
            //let data = fs.readFileSync(this.path+"/"+"101394.json");
            let parsed_data = JSON.parse(data)
            //console.log(parsed_data[0].last_matches)
            delete parsed_data["id"];
            fit_matrix[i] = this.filter_file(parsed_data);
        }


        let test_matrix = Array();
        for (let i = fit; i < files.length; i++){
            //console.log(files[i])
            let data = fs.readFileSync(this.path+"/"+files[i]);
            //let data = fs.readFileSync(this.path+"/"+"101394.json");
            let parsed_data = JSON.parse(data)
            //console.log(parsed_data[0].last_matches)
            delete parsed_data["id"];
            test_matrix[i % fit] = this.filter_file(parsed_data);
        }

        return [fit_matrix, test_matrix];
    }

    filter_file(parsed_data){
        let methods = [
            "win_loose_for_team",
            /*"best_n_worst_map_per_team",
            "win_loose_between_team_and_current_opponent",
            "most_used_weapons",
            "most_deaths_to_weapons",
            "mean_headshots",
            "first_kill",
            "time_sine_last_match",
            "time_players_has_played_together_in_teams",
            "mean_death_kill_ratio"*/
        ]

        /* [0] = win or loose, [1] = first_kills, [2] = win_lost_raio,
         * [3] = wins_last 20 matches, [4] = win_streak, [5] = mean time on team,
         * [6] = mean headshots, [7] = sum_kda,
         *
         */
        let data = Array(15);

        let teams = [parsed_data[0], parsed_data[1]]
        //console.log(parsed_data.winner)
        let victor = (parsed_data.winner == 1) ? 0.5 : 1;
        data[0] = victor;
        let date  = parsed_data.date;
        let date_hours = this.convert_date_to_hours(date);
        //console.log("victor",victor)
        //console.log("date",date)

        for (let team_id in teams) {
            let epsilon = 7*team_id;

            data[1+epsilon] = teams[team_id].first_kills;
            data[2+epsilon] = (teams[team_id].win_lose_ratio !== null) ?teams[team_id].win_lose_ratio:0 ;

            //console.log(team_id)
            //console.log(teams[team_id].last_matches)
            //console.log("first_kills ",teams[team_id].first_kills)
            //console.log("win loose ratio ",teams[team_id].win_lose_ratio)
            //console.log("last match date",teams[team_id].last_match_date) // Rewrite to hours since last match

            let last_20 = this.last_x_matches(teams[team_id], 20);
            [data[4+epsilon], data[3+epsilon]] = this.current_winstreak(last_20);

            //console.log(this.convert_date_to_hours(teams[team_id].last_match_date));
            //console.log("mean time in team", ) // carefull not to devide by 0
            //console.log("headshots ", ) // carefull not to devide by 0
            //console.log("kda ", ) // carefull not to devide by 0

            let [mean_time_in_team, mean_headshots, sum_kda] = this.extract_mean_values_from_players(teams[team_id].player_data);
            data[5 + epsilon] = mean_time_in_team;
            data[6 + epsilon] = mean_headshots;
            data[7 + epsilon] = sum_kda;
            //console.log(a,b,c)
            //console.log(a,b,c)

        }
        //console.log(data);

        return data;
    }

    convert_date_to_hours(date){
        let date_object = new Date(date);
        return (Date.now() - date_object.getTime()) / (1000 * 60 * 60);
    }

    current_winstreak(matches){
        let winning = 1;
        let in_row = 0;
        let wins_all = 0;
        for(let i = 0; i < matches.length; i++){
            if(matches[i][0] == 0){
                wins_all++;

                if(winning == 1){
                    in_row++;
                }
            } else {
                winning = 0;
            }
        }
        return [in_row, wins_all];
    }


    last_x_matches(team, limit){
        let arr = [];
        let length = (team.last_matches.length > limit) ? limit: team.last_matches.length;
        for(let i=0; i < length; i++){

            arr.push([
                (team.last_matches[i].winner == team.last_matches[i].team1) ? 0: 1, // log the winner
                team.last_matches[i].date
            ])
        }
        return arr;
    }

    extract_mean_values_from_players(players_object) {
        let mean_time_in_team = 0.00;
        let mean_tit_count = 0;

        let mean_headshots = 0.00;
        let mean_head_count = 0;

        let sum_kda = 0.00
        for (let id in players_object) {
            /* days in team */
            if (players_object[id].days_in_team != null ) {
                mean_time_in_team += players_object[id].days_in_team
                mean_tit_count++;
            }
            /* Headshot */
            if (players_object[id].headshots != null ) {
                mean_headshots += players_object[id].headshots
                mean_head_count++;
            }
            /* KDA */
            if (players_object[id].kda != null ) {
                sum_kda += players_object[id].kda
            }
        }
        return  [(mean_tit_count == 0) ? 0 : mean_time_in_team/mean_tit_count, (mean_head_count == 0)? 0 : mean_headshots/mean_head_count, sum_kda]
    }


    filter_for_type(name, datarow){

    }

    win_loose_for_team(datarow, data_object_string_name){
        /* D1 */
        console.log(data_object_string_name)
    }


    best_n_worst_map_per_team(){
        /* D2 */
    }

    win_loose_between_team_and_current_opponent(){
        /* D3 */
    }

    most_used_weapons(){
        /* D4 */
    }

    most_deaths_to_weapons(){
        /* D5 */
    }

    mean_headshots(){
        /* D6 */
    }

    first_kill(){
        /* D7 */
    }

    time_sine_last_match(){
        /* D8 */
    }


    time_players_has_played_together_in_teams(){
        /* D9 */
    }

    mean_death_kill_ratio(){
        /* D10 */
    }

}


module.exports = {match_data:match_data};