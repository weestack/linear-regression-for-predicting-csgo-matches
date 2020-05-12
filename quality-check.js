let fs = require("fs");
let os = require("os");
let regression = require("./prediction_lib/index.js");

let dataFiles = fs.readdirSync("scraper/data/");
let filesCount = dataFiles.length;
let chunks = Math.floor(filesCount / 500);
let total_tests = chunks * (chunks - 1);
console.log(`A total of ${filesCount} matches will be tested in chunks of 500 each (giving ${total_tests} tests).`);

let tmpDir = os.tmpdir();

/* Set the summary variables to initial values */
let lowest_error_difference = 100000;
let highest_error_difference = -100000;
let total_error_difference = 0;
let lowest_prediction_rate = 100;
let highest_prediction_rate = 0;
let total_prediction_rate = 0;

for (let i = 0; i < chunks; i++) {
	for (let j = 0; j < chunks; j++) {
		if (j == i) {
			continue; /* We do not want to use the same data for the training
			           * as the testing */
		}

		let trainingFiles = dataFiles.slice(500*i, 500*(i+1));
		let trainingFolderName = fs.mkdtempSync(tmpDir + "/test-data-");

		let controlFiles = dataFiles.slice(500*j, 500*(j+1));
		let controlFolderName = fs.mkdtempSync(tmpDir + "/control-data-");

		for (let file in trainingFiles) {
			let fileName = trainingFiles[file];
			fs.copyFileSync("scraper/data/"+fileName, trainingFolderName + "/" + fileName);
		}

		for (let file in controlFiles) {
			let fileName = controlFiles[file];
			fs.copyFileSync("scraper/data/"+fileName, controlFolderName + "/" + fileName);
		}

		let trainingReg = new regression.Regressor(trainingFolderName);
		let trainingError = trainingReg.statistics.sigma;

		let controlReg = new regression.Regressor(controlFolderName);
		let controlRSS = controlReg.regression_obj.rss(
			controlReg.independent,
			controlReg.prediction,
			trainingReg.coefficients /* Remember to use the coefficients calculated by the training data. */
		);
		let controlError = Math.sqrt(controlReg.regression_obj.sigma_squared(
			controlRSS,
			controlReg.independent
		));
		let error_difference = controlError - trainingError;

		let corrects = 0;
		for (let file in controlFiles) {
			let fileName = controlFolderName + "/" + controlFiles[file];
			let textData = fs.readFileSync(fileName);
			let json = JSON.parse(textData);
			let team1 = json[0].id;
			let team2 = json[1].id;
			let actualWinner = json.winner;

			/* The following code is mostly copy pasted from the index.js file, with small
			 * modifications to make it predict winners in unknown data.
			 */
			let team1data = controlReg.match_data.cached_team[team1];
			let team2data = controlReg.match_data.cached_team[team2];
			let independent_variables = [];
        	for (let i = 0; i < team1data.length; i++) {
				independent_variables[i] = team1data[i] - team2data[i];
        	}

        	let coefficients = trainingReg.cleaned_coefficients;
        	let output = coefficients[0]; /* initialise the prediction to B0 */
        	for (let n = 1; n < coefficients.length; n++) {
            	output += independent_variables[n-1] * coefficients[n];
        	}

			if (output >= 0.5 && actualWinner == 0) {
				corrects++;
			} else if (output < 0.5 && actualWinner == 1) {
				corrects++;
			}
		}
		let pct = (corrects / 500) * 100;

		console.log(`Using matches ${500*i}-${500*(i+1)} for training, and using matches ${500*j}-${500*(j+1)} for control:`);
		console.log(`\tTraining error: ${trainingError.toFixed(4)}`);
		console.log(`\tControl error: ${controlError.toFixed(4)}`);
		console.log(`\tError difference (large positive value means overfitting): ${error_difference.toFixed(4)}`);
		console.log(`Prediction rate: ${corrects} correct out of 500 (${pct.toFixed(2)}%)`);

		/*Update the status variables*/
		total_prediction_rate += pct;
		if (pct < lowest_prediction_rate) {
			lowest_prediction_rate = pct;
		}
		if (pct > highest_prediction_rate) {
			highest_prediction_rate = pct;
		}

		total_error_difference += error_difference;
		if (error_difference < lowest_error_difference) {
			lowest_error_difference = error_difference;
		}
		if (error_difference > highest_error_difference) {
			highest_error_difference = error_difference;
		}
	}
}

console.log("Summary:");
console.log("\tError difference between training data and control data:");
console.log("\t\tLowest:  ", lowest_error_difference);
console.log("\t\tHighest: ", highest_error_difference);
console.log("\t\tAverage: ", total_error_difference / total_tests);
console.log("\tPrediction rates:");
console.log("\t\tLowest:  ", lowest_prediction_rate);
console.log("\t\tHighest: ", highest_prediction_rate);
console.log("\t\tAverage: ", total_prediction_rate / total_tests);