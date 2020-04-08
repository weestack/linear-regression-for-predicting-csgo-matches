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

}
