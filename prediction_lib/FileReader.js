"use strict";
const fs = require("fs");
const path = require("path");



class match_data {
    /*
    * Factory class that should prepare CS:GO data for regression
    */
    constructor(absolute_path){
        /* cached_team is an object with the transformed team data.
         * The keys are the team ids.
         */
        this.cached_team = {};
        /* path is expected to be folder for all data */
        this.path = absolute_path;
        /* get a List of all files in the path folder */
        let files = this.read_in_files();

        let raw_data = this.read_in_data(files);
        this.match_results = this.process_raw_data(raw_data);

        /* set data header */
        this.set_header();
    }

    read_in_files() {
        let directory = this.path;
        return fs.readdirSync(directory, {"encoding":"utf-8"});
    }

    set_header(){

        this.header = [
            {id: 'winner', title: 'Winner'},
            {id: 'powerscore_delta', title: 'Experince'},
            {id: 'win_loose_delta', title: 'Win Loose Ratio'},
            {id: 'kda_delta', title: 'Kill Death Ratio'},
            {id: 'headshot_delta', title: 'Mean Headshots'},
            {id: 'time_in_team_delta', title: 'Experince as a team'},
        ]

    }

    read_in_data(files){
        /* in in and store each file in memory, according to this.path + filename */
        let data = Array();
        for (let i = 0; i < files.length; i++) {
            let _data = fs.readFileSync(this.path + "/" + files[i]);

            let parsed_data = JSON.parse(_data);
            data[i] = parsed_data;
        }
        return data;
    }

    process_raw_data(data_array) {
        /* Calculate an array of match results from the data, and return that.
         * Also cache the team data under this.cached_team.
         */
        let match_results = Array();
        for (let i = 0; i < data_array.length; i++){
            let team_1_id = data_array[i][0]['id'];
            let team_2_id = data_array[i][1]['id'];
            if (! (team_1_id in this.cached_team)){
                this.cached_team[team_1_id] = this.get_team_info(data_array[i][0])
            }

            if (! (team_2_id in this.cached_team)){
                this.cached_team[team_2_id] = this.get_team_info(data_array[i][1])
            }
            match_results.push(this.calculate_match_result(data_array[i]));

        }
        return match_results
    }

    calculate_match_result(match){
        let looser_id = 0;
        if (match[match.winner]['id'] === match[0]['id']){
            looser_id = match[1]['id'];
        } else {
            looser_id = match[0]['id'];
        }

		let team1rounds = match.team1Rounds;
		let team2rounds = match.team2Rounds;
		let total_rounds = team1rounds + team2rounds;
		let winner_score = team1rounds / total_rounds;

        return [
            match[match.winner]['id'],
            looser_id,
            winner_score,
        ];
    }

    get_team_info(team){
        let data = [];

        data[0] = this.experience_score(team);
        data[1] = this.win_loose_ratio(team);
        data[2] = this.kda(team);
        data[3] = this.headshots(team);
        data[4] = this.time_in_team(team);
        return data;
    }

    experience_score(team_info){
        /* The experience score is larger if the team has played more matches */
        let score = 0;
        for (let i = 0; i < team_info.last_matches.length; i++){
            score += 1 // experince
        }
        return score;
    }

    win_loose_ratio(team_info){
        let score = 0;
        let wins = 0;
        let looses = 0;
        for (let i = 0; i < team_info.last_matches.length; i++){
            if (team_info.name === team_info.last_matches[i].winner ) {
                wins += 1;
            }else if (team_info.name !== team_info.last_matches[i].winner && team_info.last_matches[i].winner !== null){
                looses += 1;
            }
        }

        /* The score is the win rate */
        score = wins / (wins+looses);
        return score;
    }

    kda(team) {
        let mean_values = this.extract_mean_values_from_players(team.player_data);
        return mean_values.mean_kda;
    }

    headshots(team) {
        let mean_values = this.extract_mean_values_from_players(team.player_data);
        return mean_values.mean_headshots;
    }

    time_in_team(team) {
        let mean_values = this.extract_mean_values_from_players(team.player_data);
        return mean_values.mean_days_in_team;
    }

    extract_mean_values_from_players(players_object) {
        let total_time_in_team = 0.00;
        let total_headshots = 0.00;
        let total_kda = 0.00;

        let player_count = 0;

        for (let id in players_object) {
            player_count++;
            total_time_in_team += players_object[id].days_in_team
            total_headshots += players_object[id].headshots
            total_kda += players_object[id].kda;
        }

        let mean_days_in_team = total_time_in_team / player_count;
        let mean_headshots = total_headshots / player_count;
        let mean_kda = total_kda / player_count;

        return  {
            mean_days_in_team,
            mean_headshots,
            mean_kda,
        }
    }
}

module.exports = {match_data:match_data};