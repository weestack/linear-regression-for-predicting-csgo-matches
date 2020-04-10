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

            for (let i = 0; i < 1; i++){
                //console.log(files[i])
                let data = fs.readFileSync(this.path+"/"+files[i]);
                let parsed_data = JSON.parse(data)
                //console.log(parsed_data[0].last_matches)
                let team_id = parsed_data["id"];
                delete parsed_data["id"];
                console.log(team_id)
                vector_data[team_id] = this.filter_file(parsed_data);
            }

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
        let team_one = parsed_data[0];
        let team_two = parsed_data[1];

        console.log("test ",current_row)
        for (let D_object in parsed_data[current_row]){
            for (let m in methods){
                console.log("d ",parsed_data[current_row])
                let method_data = this[methods[m]](parsed_data[current_row][D_object], parsed_data[current_row]);
                console.log("method data",method_data);
                if (method_data !== undefined){
                    data.push(method_data);
                }
            }
        }



        return data;
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