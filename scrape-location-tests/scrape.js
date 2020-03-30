"use strict";

document.addEventListener("DOMContentLoaded", e => {
	let runButton = document.getElementById("runTests");
	runButton.addEventListener("click", e => runTests());
});


async function runTests() {
	let allTests = [testD1, testD2, testD3, testD5, testD6, testD7, testD8, testD9, testD10, testD11, testE1, testE2];

	for (let test of allTests) {
		let result = await test();
		showResult(result);
	}
}

function showResult(result) {
	let testTitle = document.createElement("h2");
	let testExpected = document.createElement("pre");
	let testActual = document.createElement("pre");
	let testPassed = document.createElement("h3");

	testTitle.textContent = result.title + " - ";
	testExpected.textContent = "Expected: " + result.expected
	testActual.textContent = "Actual: " + result.actual;

	if (result.passed) {
		testPassed.textContent = "OK";
		testPassed.style.color = "green";
	} else {
		testPassed.textContent = "Error";
		testPassed.style.color = "red";
	}

	document.body.appendChild(testTitle);
	document.body.appendChild(testPassed);
	document.body.appendChild(testExpected);
	document.body.appendChild(testActual);
}

function makeTestResult(title, expected, actual) {
	let expectedJSON = JSON.stringify(expected, undefined, 4);
	let actualJSON = JSON.stringify(actual, undefined, 4);
	let passed = expectedJSON == actualJSON;
	let res = {
		title,
		expected: expectedJSON,
		actual: actualJSON,
		passed,
	};
	return res;
}

// scrapeLinkLocation returns the element found if many = false,
// or all elements found if many = true.
// If the request failed, the function returns null.
async function scrapeLinkLocation(link, location, many) {
	let proxy = "http://localhost:8080/"; // use the cors-anywhere proxy to bypass CORS
	let response = await fetch(proxy + link);
	if (response.status == 200) {
		let html = await response.text();
		let domParser = new DOMParser();
		let pageDOM = domParser.parseFromString(html, "text/html");
		if (many) {
			return pageDOM.querySelectorAll(location);
		} else {
			return pageDOM.querySelector(location);
		}
	} else {
		return null;
	}
}

// Testcases
async function testD1() {
	let location = "div.columns:nth-child(5) > div.col:nth-child(2) > div.large-strong";
	let link = "https://www.hltv.org/stats/teams/7533/North";
	let elem = await scrapeLinkLocation(link, location, false);

	let actual = elem.textContent;

	let expected = "378 / 2 / 285";
	return makeTestResult("D1", expected, elem.textContent);
}

async function testD2() {
	let location = "a.map-stats > div.map-pool-map-name";
	let link = "https://www.hltv.org/stats/teams/maps/7092/5POWER";
	let elems = await scrapeLinkLocation(link, location, true);

	let actual = Array.from(elems).map(e => e.textContent);

	let expected = ["Inferno - 58.3%","Mirage - 57.6%","Dust2 - 57.3%","Cobblestone - 53.8%","Nuke - 51.7%","Train - 51.7%","Cache - 48.2%","Overpass - 48.0%","Vertigo - 33.3%"];

	return makeTestResult("D2", expected, actual);
}

async function testD3() {
	let link = "https://www.hltv.org/results?team=4411";
	let wrapperLocation = "div.result-con"
	let wrapperElems = await scrapeLinkLocation(link, wrapperLocation, true);

	let actual = [];
	// We limit ourselves to the first 3 matches
	for (let i = 0; i < 3; i++) {
		let w = wrapperElems[i];
		let a = {};
		a.team1 = w.querySelector("div.team1 > div.team").textContent;
		a.team2 = w.querySelector("div.team2 > div.team").textContent;
		a.winner = w.querySelector("div.team-won").textContent;
		actual.push(a);
	}

	let expected = [{"team1":"NiP","team2":"ENCE","winner":"ENCE"}, {"team1":"NiP","team2":"Vitality","winner":"Vitality"}, {"team1":"NiP","team2":"GODSENT","winner":"NiP"}];
	return makeTestResult("D3", expected, actual);
}

async function testD5(){
	let link = "https://www.hltv.org/stats/players/weapon/7938/XANTARES";
	let wrapperLocation = "div.stats-row";
	let wrapperElems = await scrapeLinkLocation(link, wrapperLocation, true);

	let actual = [];
	// We limit ourselves to the first 3 weapons
	for (let i = 0; i < 3; i++) {
		let w = wrapperElems[i];
		let a = {};
		a.weapon = w.querySelector("div > span:nth-child(2)").textContent;
		a.uses = w.querySelector(":scope > span").textContent;
		actual.push(a);
	}

	let expected = [{"weapon":" ak47","uses":"11868"},{"weapon":" m4a1","uses":"5944"},{"weapon":" deagle","uses":"1076"}];
	return makeTestResult("D5", expected, actual);
}

async function testD6(){
	let link = "https://www.hltv.org/stats/matches/heatmap/mapstatsid/100738/big-chillin-vs-prospects";
	let wrapperLocation = "div.players";
	let wrapperElems = await scrapeLinkLocation(link, wrapperLocation, true);

	let actual = [];
	for (let i = 0; i < wrapperElems.length; i++) {
		let w = wrapperElems[i];
		let playerWrappers = w.querySelectorAll("div.player");
		let weapons = [];
		for (let j = 0; j < playerWrappers.length; j++) {
			let playerW = playerWrappers[j];
			let weaponKills = playerW.querySelectorAll("option:not(:last-child)");
			let player = [];
			for (let k = 0; k < weaponKills.length; k++) {
				player.push(weaponKills[k].textContent);
			}
			weapons.push(player);
		}
		actual.push(weapons);
	}

	let expected = [[["m4a1 (1)","sg556 (4)","mp9 (1)"],["ak47 (4)","m4a1 (6)","sg556 (13)","mp9 (1)","awp (2)"],["deagle (1)","m4a1 (10)","sg556 (7)","glock (2)","mp9 (5)"],["mac10 (1)","m4a1 (6)","sg556 (9)","usp_silencer (2)","p250 (1)","famas (1)"],["deagle (3)","m4a1 (1)","sg556 (4)","usp_silencer (4)","glock (1)","p250 (1)","awp (6)"]],[["ak47 (2)","mac10 (1)","sg556 (1)","p250 (1)","famas (1)"],["ak47 (7)","deagle (2)","m4a1 (2)","sg556 (21)","usp_silencer (2)","glock (1)","tec9 (3)","mp9 (1)"],["ak47 (3)","hegrenade (1)","m4a1 (2)","sg556 (5)","m4a1_silencer (1)","p250 (1)","mp9 (2)","inferno (1)"],["ak47 (8)","m4a1 (7)","usp_silencer (3)","mp9 (2)"],["deagle (1)","mac10 (2)","sg556 (3)","usp_silencer (2)","famas (3)","awp (10)"]]];
	return makeTestResult("D6", expected, actual);
}

async function testD7(){
	let link = "https://www.hltv.org/stats/players/13776/Jame";
	let location = "div.stats-rows:nth-child(1) > div.stats-row:nth-child(2) >span:nth-child(2)";
	let elem = await scrapeLinkLocation(link, location, false);

	let actual = elem.textContent;
	let expected = "25.7%";
	return makeTestResult("D7", expected, actual);
}

async function testD8(){
	let link = "https://www.hltv.org/stats/matches/mapstatsid/100731/serac-vs-rise";
	let location = "div.match-info-row:nth-child(6) > div.right";
	let elem = await scrapeLinkLocation(link, location, false);

	let actual = elem.textContent;
	let expected = "25 : 23";
	return makeTestResult("D8", expected, actual);
}

async function testD9(){
	let link = "https://www.hltv.org/results?team=9996";
	let location = "div.results-sublist:nth-child(1) > .standard-headline";
	let elem = await scrapeLinkLocation(link, location, false);
	let actual = elem.textContent;
	let expected = "Results for March 29th 2020";
	return makeTestResult("D9", expected, actual);
}

async function testD10(){
	return makeTestResult("D8", "not implemented", "Not implemented");
}

async function testD11(){
	return makeTestResult("D8", "not implemented", "Not implemented");
}

async function testE1(){
	return makeTestResult("D8", "not implemented", "Not implemented");
}

async function testE2(){
	return makeTestResult("D8", "not implemented", "Not implemented");
}
