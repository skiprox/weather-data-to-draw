'use strict';

/**
 * Requires
 */
const request = require('request');
const key = require('./key')["key"];
let coordinates = require('./coordinates');
const utils = require('./utils');
const say = require('say');
const five = require('johnny-five');
const board = new five.Board();

/**
 * Variables
 */
let minPercentX = 3;
let minPercentY = 6;
let maxPercentX = 79;
let maxPercentY = 88;
let xMin, xMax, yMin, yMax;
const timeInterval = 10;
const weatherRequestOptions = {
	url: 'http://api.worldweatheronline.com/premium/v1/weather.ashx',
	qs: {
		"q": "9.7499,112.999",
		"key": key,
		"format": "json"
	}
};
const penURL = 'http://localhost:4242/v1/pen';
const penHeader = {
	'Content-Type': 'application/json; charset=UTF-8'
};
let coordinatesIncrementer = 0;
let led;
let anode;

/**
 * APP
 * Our application
 */
class App {
	/**
	 * constructor [set everything up]
	 */
	constructor() {
		this.setupCoordinates();
		console.log('the coordinates', coordinates);
		console.log('the min, max', xMin, xMax, yMin, yMax);
		board.on("ready", () => {
			anode = new five.Led.RGB({
				pins: {
					red: 6,
					green: 5,
					blue: 3
				},
				isAnode: true
			});
			anode.intensity(0);
			anode.color("#FFFFFF");
			anode.intensity(0);
			this.sendRequest();
		});
	}
	/**
	 * setupCoordinates [set up the randomized coordinates]
	 */
	setupCoordinates() {
		coordinates = this.shuffleArray(coordinates);
		coordinates = coordinates.slice(0, 11);
		let xCoordinates = coordinates.map(coord => coord.x);
		let yCoordinates = coordinates.map(coord => coord.y);
		xMin = Math.min(...xCoordinates);
		xMax = Math.max(...xCoordinates);
		yMin = Math.min(...yCoordinates);
		yMax = Math.max(...yCoordinates);
	}
	/**
	 * shuffleArray [Shuffle the coordinates array]
	 * @return {array} [the shuffled array]
	 *
	 * https://stackoverflow.com/a/2450976
	 */
	shuffleArray(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}
	/**
	 * sendRequest [send a request to worldweatheronline]
	 */
	sendRequest() {
		if (coordinatesIncrementer == coordinates.length) {
			console.log('~~~~~~~~~~~~~~~ WE ARE EXITING ~~~~~~~~~~~~~~~');
			anode.intensity(0);
			say.speak('STOP');
			process.exit();
		}
		let coordinate = coordinates[coordinatesIncrementer];
		weatherRequestOptions.qs["q"] = `${coordinate.x},${coordinate.y}`;
		coordinatesIncrementer++;
		request(weatherRequestOptions, (error, response, body) => {
			if (error) {
				throw error;
			} else {
				let data = JSON.parse(body);
				let currentCondition = data.data["current_condition"];
				let cloudCover = parseFloat(currentCondition[0].cloudcover)/100;
				this.draw(coordinate, cloudCover);
			}
		});
	}
	/**
	 * draw [draw on the axidraw]
	 * @param  {String} coordinate [lat&lng coordinates in the form of e.g. '13.42,9.58']
	 * @param  {Float} cloudCover [cloud cover, from 0 to 1 (drawn as 1 - cloudCover)]
	 *
	 * What we do here is send a request to localhost to reset the state of the pen
	 * to 0 (UP), then send a request to move it to the appropriate coordinates,
	 * then send a request to set the state of the pen to whatever the cloud coverage is
	 */
	draw(coordinate, cloudCover) {
		// TODO
		// put this into promises
		let xCoord = coordinate.x;
		let yCoord = coordinate.y;
		let percentX = utils.mapClamp(xCoord, xMin, xMax, minPercentX, maxPercentX);
		let percentY = utils.mapClamp(yCoord, yMin, yMax, minPercentY, maxPercentY);
		request.put(penURL, {
			headers: penHeader,
			body: JSON.stringify({
				"state": 0
			})
		}, (error, response, body) => {
			if (error) throw error;
			request.put(penURL, {
				headers: penHeader,
				body: JSON.stringify({
					"x": percentX,
					"y": percentY
				})
			}, (error, response, body) => {
				if (error) throw error;
				console.log(response.body);
				anode.intensity(100 - (cloudCover * 100));
				setTimeout(() => {
					console.log('we send another request');
					anode.intensity(0);
					this.sendRequest();
				}, timeInterval * 1000);
			});
		});
	}
}

new App();