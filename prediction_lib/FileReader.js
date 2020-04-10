"use strict";
const fs = require("fs"); 


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
    * */
    constructor(path){
        super();
        this.path = path;

        let file = this.openfile();
        file = this.filter_file(file);
        
        this.data = file;
    }

    filter_file(file){
        let data = this.json_converter(file);

        return data;
    }



    filter_for_type(name, datarow){

    }

    win_loose_for_team(name="win_loose", datarow){
        /* D1 */
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
