var exerciseModel = require("../models/exerciseModel");

//Parses the String according to all possible Truth Tables then Saves it to database
module.exports.createAnswersForTruthTable = function(string) {

	var sentences = [];
	var values = [];

	//Finding all letters in the equation. Ex: P→Q => P,Q
	var letterList = [];
	for (var i = 0; i < string.length; i++) {
		if (string.charAt(i).match(/[A-Z]/i) && !letterList.includes(string.charAt(i))) {

			letterList.push(string.charAt(i));
		}
	}

	// size^2 for number of truth tables
	var rows = Math.pow(2, letterList.length);

	var booleanDictionary = {};
	//Creating Truth Table for all possibilities
	for (var i = rows - 1; i >= 0; i--) {
		booleanDictionary = {};
		for (var j = letterList.length - 1; j >= 0; j--) {
			booleanDictionary[letterList[letterList.length - 1 - j]] = parseInt((i / (Math.pow(2, j))) % 2);
		}
		//Parsing the Equation with specific Truth Table
		module.exports.parse(string, booleanDictionary);

		//Adding the results to a list
		var results = [];
		for (var j = 0; j < Object.keys(booleanDictionary).length; j++) {
			var value = booleanDictionary[Object.keys(booleanDictionary)[j]];
			results.push(value);
		}
		values.push(results);
	}



	//Adding the headings to a list
	for (j = 0; j < Object.keys(booleanDictionary).length; j++) {
		var key = Object.keys(booleanDictionary)[j];
		sentences.push(key);
	}

	//Creating the answer
	var answer = {};
	answer["sentences"] = sentences;
	answer["values"] = values;

	return answer
} 

module.exports.createAnswersForSymbolization = function(string) {

	var answer = {};

	//Finding all letters in the equation. Ex: P→Q => P,Q
	var letterList = [];
	for (var i = 0; i < string.length; i++) {
		if (string.charAt(i).match(/[A-Z]/i) && !letterList.includes(string.charAt(i))) {

			letterList.push(string.charAt(i));
		}
	}

	// size^2 for number of truth tables
	var rows = Math.pow(2, letterList.length);

	var booleanDictionary = {};
	//Creating Truth Table for all possibilities
	for (var i = rows - 1; i >= 0; i--) {
		booleanDictionary = {};
		for (var j = letterList.length - 1; j >= 0; j--) {
			booleanDictionary[letterList[letterList.length - 1 - j]] = parseInt((i / (Math.pow(2, j))) % 2);
		}
		//Parsing the Equation with specific Truth Table
		module.exports.parse(string, booleanDictionary);

		//Adding the results to a list
		var results = [];
		for (var j = 0; j < letterList.length; j++) {
			var key = Object.keys(booleanDictionary)[j];
			var value = booleanDictionary[key];
			if (!(key in answer)) {
				answer[key] = [];
			}
			answer[key].push(value);
		}
		var key = Object.keys(booleanDictionary).pop();
		var value = booleanDictionary[key];
		if (!("solution" in answer)) {
			answer["solution"] = [];
		}
		answer["solution"].push(value);
	}

	console.log("ANSWER:"+answer);

	return answer
}

//Parses the String according to Truth Table : Ex: string = 'P∨Q'  booleanDictionary = {'P':1, 'Q':0}
module.exports.parse = function(string, booleanDictionary) {
	var numberParanthesis = 0
	var start = 0
	var end = 0
	//Find the paranthesis and solves them first
	if (string.indexOf('(') > -1) {
		for (i = 0; i < string.length; i++) {
			if (string.charAt(i) == '(') {
				numberParanthesis++;
				if (numberParanthesis == 1) {
					start = i;
				}
			}
			else if (string.charAt(i) == ')') {
				numberParanthesis--;
				if (numberParanthesis == 0) {
					end = i;
					//Recurses the part in paranthesis
					module.exports.parse(string.substring(start + 1, end), booleanDictionary)
				}
				else if (numberParanthesis < 0) {
					//ERROR : Syntax ERROR - Paranthesis
				}
			}
		}
		if (numberParanthesis != 0) {
			//ERROR : Syntax ERROR - Paranthesis
		}
	}

	var equation = string;
	//Inputs truth values for keys
	for (var i = Object.keys(booleanDictionary).length - 1; i >= 0; i--) {
		var key = Object.keys(booleanDictionary)[i];
		var value = booleanDictionary[key];
		equation = module.exports.replaceAll(equation, key, value);
	}
	equation = equation.split('(').join('')
	equation = equation.split(')').join('')
	equation = module.exports.replaceAll(equation, '¬1', '0');
	equation = module.exports.replaceAll(equation, '¬0', '1');

	//Logic Operations
	var first = parseInt(equation.charAt(0));
	var last = parseInt(equation.charAt(equation.length - 1));

	if (equation.indexOf('∧') > -1) {
		equation = first && last;
	}
	else if (equation.indexOf('∨') > -1) {
		equation = first || last;
	}
	else if (equation.indexOf('→') > -1) {
		equation = !(first) || last;
	}
	else if (equation.indexOf('↔') > -1) {
		equation = first == last;
	}
	else if (equation.indexOf('|') > -1) {
		equation = !(first && last);
	}
	else if (equation.indexOf('↓') > -1) {
		equation = !(first || last);
	}

	//Saves the truth value of string equation in the dictionary
	booleanDictionary[string] = equation ? 1 : 0;
	return booleanDictionary;
}

//Replaces all `find` in `str` with `replace`
module.exports.replaceAll = function(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}
