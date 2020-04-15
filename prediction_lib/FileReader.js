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

        //let files = fs.

        this.data = this.filter_all_files();


        /*let file = this.openfile();
        file = this.filter_file(file);
        
        this.data = file;*/
    }

    filter_all_files(){
        let directory = path.join(__dirname, this.path);
        let vector_data = [];
        fs.readdir(directory, (error, files) => {

            /*for (let i = 0; i < 1; i++){*/
                //console.log(files[i])
                //let data = fs.readFileSync(this.path+"/"+files[i]);
                let data = fs.readFileSync(this.path+"/"+"101394.json");
                let parsed_data = JSON.parse(data)
                //console.log(parsed_data[0].last_matches)
                let team_id = parsed_data["id"];
                delete parsed_data["id"];
                vector_data[team_id] = this.filter_file(parsed_data);
            /*}*/

        })
        return vector_data;
    }

    filter_file(parsed_data){
        let data = Array();
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
        let teams = [parsed_data[0], parsed_data[1]]
        console.log(parsed_data.winner)
        let victor = parsed_data.winner;
        let date  = parsed_data.date;
        console.log("victor",victor)
        console.log("date",date)

        for (let team_id in teams) {
            //console.log(team_id)
            data[teams[team_id].id] = Array();
            console.log(teams[team_id].last_matches)
            //console.log("first_kills ",teams[team_id].first_kills)
            //console.log("win loose ratio ",teams[team_id].win_lose_ratio)
            //console.log("last match date",teams[team_id].last_match_date) // Rewrite to hours since last match

            console.log(this.convert_date_to_hours(teams[team_id].last_match_date));

            console.log(this.last_x_matches(teams[team_id], 5));
            //console.log("mean time in team", ) // carefull not to devide by 0
            //console.log("headshots ", ) // carefull not to devide by 0
            //console.log("kda ", ) // carefull not to devide by 0

            let [a, b, c] = this.extract_mean_values_from_players(teams[team_id].player_data);
            //console.log(a,b,c)
            //console.log(a,b,c)

        }

        return data;
    }

    convert_date_to_hours(date){
        let date_object = new Date(date);
        return (Date.now() - date_object.getTime()) / (1000 * 60 * 60);
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
        return  [mean_time_in_team/mean_tit_count, mean_headshots/mean_head_count, sum_kda]
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

new match_data("actual_data")