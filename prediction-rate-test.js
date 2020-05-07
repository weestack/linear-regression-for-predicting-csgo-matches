let fs = require("fs");
let os = require("os");
let regression = require("./prediction_lib/index.js");

let dataFiles = fs.readdirSync("scraper/data/");
let filesCount = dataFiles.length;
let chunks = Math.floor(filesCount / 500);

console.log(`A total of ${filesCount} matches will be tested in chunks of 500 each (giving ${chunks} tests).`);

let tmpDir = os.tmpdir();

for (let i = 0; i < chunks; i++) {
	let files = dataFiles.slice(500*i, 500*(i+1));
	let folderName = fs.mkdtempSync(tmpDir + "/test-data-");

	for (let file in files) {
		let fileName = files[file];
		fs.copyFileSync("scraper/data/"+fileName, folderName + "/" + fileName);
	}

	let reg = new regression.Regressor(folderName);
	
	let corrects = 0;
	for (let file in files) {
		let fileName = folderName + "/" + files[file];
		let textData = fs.readFileSync(fileName);
		let json = JSON.parse(textData);
		let team1 = json[0].id;
		let team2 = json[1].id;
		let actualWinner = json.winner;
		let predictedWinner = reg.predict_winner(team1, team2);
		if (predictedWinner == team1 && actualWinner == 0) {
			corrects++;
		} else if (predictedWinner == team2 && actualWinner == 1) {
			corrects++;
		}
	}
	let pct = (corrects / 500) * 100;
	console.log(`Got ${corrects} matches right out of 500 (${pct.toFixed(2)}%).`);
}