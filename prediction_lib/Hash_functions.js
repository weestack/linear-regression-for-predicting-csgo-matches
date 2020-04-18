

/* Hasttable for the team names */
let data_for_each_team = Array(50000);
function hashing_function(name_as_string){
    let hash_value = 0;
    let prim_close_to_two = 16061;
    let prim_far_from_two = 82591;
    for(let i = 0; i < name_as_string.length; i++){
        hash_value += name_as_string[i].charCodeAt(0) * prim_far_from_two % prim_close_to_two;
    }

    return hash_value % 50000;
}

function insert_object_in_hash_table(hash_table, team_name){
    let hash_value = hashing_function(team_name);
    let collision_delta = 683;
    let current_index;
    for(let i = 0; i < hash_table.length; i++){
        current_index = hash_value+i*collision_delta; 
        if(hash_table[current_index] == -1 || hash_table[current_index] == undefined){
            hash_table[current_index] = team_name;
            return current_index;
        }
    }
}

function delete_object_in_hash_table(hash_table, team_name){
    let hash_value = hashing_function(team_name);
    let collision_delta = 683;
    let current_index;
    for(let i = 0; i < hash_table.length; i++){
        current_index = hash_value+i*collision_delta; 
        if(hash_table[current_index] == team_name){
            hash_table[current_index] = -1;
            return current_index;
        }
    }
}

function find_object_in_hash_table(hash_table, team_name){
    let hash_value = hashing_function(team_name);
    let collision_delta = 683;
    let current_index;
    for(let i = 0; i < hash_table.length; i++){
        current_index = hash_value+i*collision_delta; 

        if(hash_table[current_index] == team_name){
            return current_index;
        }
        if(hash_table[current_index] == undefined){
            return -1;
        }
    }
}

console.log("I'm inserting 'hello world' in index:", insert_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm inserting 'hello world' in index:", insert_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm looking 'hello world' up in the index:",find_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm deleting 'hello world' in index:", delete_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm looking 'hello world' up in the index:",find_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm deleting 'hello world' in index:", delete_object_in_hash_table(data_for_each_team, "hello world"));
console.log("I'm looking 'hello world' up in the index:",find_object_in_hash_table(data_for_each_team, "hello world"));

/* console.log("'helloworld' becomes:",hashing_function("helloworld"), "in the hashing function.");
console.log("'jelloworld' becomes:",hashing_function("jelloworld"), "in the hashing function.");
console.log("'helloorld' becomes:",hashing_function("helloorld"), "in the hashing function.");
console.log("'hellloworld' becomes:",hashing_function("hellloworld"), "in the hashing function.");
console.log("'elloworld' becomes:",hashing_function("elloworld"), "in the hashing function.");
console.log("'elloworl' becomes:",hashing_function("elloworl"), "in the hashing function.");
console.log("'he11oworld' becomes:",hashing_function("he11oworld"), "in the hashing function."); */
