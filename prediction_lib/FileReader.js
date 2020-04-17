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
        let directory = this.path;

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
            let parsed_data = JSON.parse(data);
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


        /* */
        /* [0] = win or loose, [1 / 8] time since last game, [2/9] = win_lost_raio, 
         * [3/10] = wins_last 20 matches, [4/11] = win_streak, [5/12] = mean time on team,
         * [6/13] = mean headshots, [7/14] = sum_kda, 
         * [15/16] How many matches have the team played in the last 50 days, 
         * [17 /20] Win / loose ratio between the two teams (In the last 50 / 150 / 370 / all time), 
         * ******
         * [x / ...] All the weapons, 
         * [Weapons most efficient against team]
         */
        let data = Array(21);
        let teams = [parsed_data[0], parsed_data[1]]
        //console.log(parsed_data.winner)
        let victor = (parsed_data.winner == 1) ? 0.5 : 1;
        data[0] = victor;
        let date  = parsed_data.date;
        let date_hours = this.convert_date_to_hours(date);
        [data[17], data[18], data[19], data[20]] = this.win_lose_ratio_between_teams(50, 150, 370, teams);
        //console.log("victor",victor)
        //console.log("date",date)

        for (let team_id in teams) {
            let epsilon = 7*team_id;

            data[15+parseInt(team_id)] = this.matches_played_since(teams[team_id].last_matches, 50);
            data[1+epsilon] = this.convert_date_to_hours(teams[team_id].last_match_date);
            data[2+epsilon] = (teams[team_id].win_lose_ratio != null) ? teams[team_id].win_lose_ratio : 0;

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

    win_lose_ratio_between_teams(first_quator, second_quator, third_quator, teams){
        /* Numbers of wins for hold1, and overall matches between the two teams. */
        let all_time = [0, 0];
        let first_quator_counter = [0, 0];
        let second_quator_counter = [0, 0];
        let third_quator_counter = [0, 0];

        let [matches, team1, team2, team_id_team_one] = (teams[0].last_matches.length > teams[1].last_matches.length) ? [teams[1].last_matches, teams[1].name, teams[0].name, 1] : [teams[0].last_matches, teams[0].name, teams[1].name, 0]
        let team_one_winner;

        for(let i = 0; i < matches.length; i++){
            if(matches[i].team1 == team1 && matches[i].team2 == team2){
                all_time[1]++;
                
                team_one_winner = (matches[i].winner == team1) ? 1 : 0;

                all_time[0] += team_one_winner;
                first_quator_counter = (first_quator * 24 <= this.convert_date_to_hours(matches[i].date)) ? [first_quator_counter[0] + team_one_winner, first_quator_counter[1] + 1] : first_quator_counter;
                second_quator_counter = (second_quator * 24 <= this.convert_date_to_hours(matches[i].date)) ? [second_quator_counter[0] + team_one_winner, second_quator_counter[1] + 1] : second_quator_counter;
                third_quator_counter = (third_quator * 24 <= this.convert_date_to_hours(matches[i].date)) ? [third_quator_counter[0] + team_one_winner, third_quator_counter[1] + 1] : third_quator_counter;
            }
        }
        if(team_id_team_one != 0){
            first_quator_counter[0] = first_quator_counter[1] - first_quator_counter[0];
            second_quator_counter[0] = second_quator_counter[1] - second_quator_counter[0];
            third_quator_counter[0] = third_quator_counter[1] - third_quator_counter[0];
            all_time[0] = all_time[1] - all_time[0];
        }

        let sub_one = (first_quator_counter[1] - first_quator_counter[0] == 0) ? 1 : first_quator_counter[1] - first_quator_counter[0];
        let sub_two = (second_quator_counter[1] - second_quator_counter[0] == 0) ? 1 : second_quator_counter[1] - second_quator_counter[0];
        let sub_three = (third_quator_counter[1] - third_quator_counter[0] == 0) ? 1 : third_quator_counter[1] - third_quator_counter[0];
        let sub_all = (all_time[1] - all_time[0] == 0) ? 1 : all_time[1] - all_time[0];

        let return_first =  (first_quator_counter[0]  / sub_one   == 0) ? 1 : first_quator_counter[0]  / sub_one;
        let return_second = (second_quator_counter[0] / sub_two   == 0) ? 1 : second_quator_counter[0] / sub_two;
        let return_third =  (third_quator_counter[0]  / sub_three == 0) ? 1 : third_quator_counter[0]  / sub_three;
        let return_all =    (all_time[0]              / sub_all   == 0) ? 1 : all_time[0]              / sub_all;

        
        return [return_first, return_second, return_third, return_all];
    }

    matches_played_since(matches, days){
        let hours = days * 24;
        let number_of_matches = 0;
        for(let i = 0; i < matches.length; i++){
            if(this.convert_date_to_hours(matches[i].date) < hours){
                number_of_matches++;
            } else {
                break;
            }
        }

        return number_of_matches;
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