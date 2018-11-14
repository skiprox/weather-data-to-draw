'use strict';

/**
 * Requires
 */
const request = require('request');
const key = require('./key')["key"];
let coordinates = require('./coordinates');
const utils = require('./utils');
const say = require('say');

/**
 * Variables
 */
let xCoordinates = coordinates.map(coord => coord.x);
let yCoordinates = coordinates.map(coord => coord.y);
let xMin = Math.min(...xCoordinates);
let xMax = Math.max(...xCoordinates);
let yMin = Math.min(...yCoordinates);
let yMax = Math.max(...yCoordinates);
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

/**
 * APP
 * Our application
 */
class App {
	/**
	 * constructor [set everything up]
	 */
	constructor() {
		coordinates = this.shuffleArray(coordinates);
		this.sendRequest();
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
		let percentX = utils.mapClamp(xCoord, xMin, xMax, 25, 75);
		let percentY = utils.mapClamp(yCoord, yMin, yMax, 25, 75);
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
				request.put(penURL, {
					headers: penHeader,
					body: JSON.stringify({
						"state": 1 - cloudCover
					})
				}, (error, response, body) => {
					if (error) throw error;
					console.log(response.body);
					setTimeout(() => {
						console.log('we send another request');
						this.sendRequest();
					}, timeInterval * 1000);
				});
			});
		});
	}
}

new App();