'use strict';

/**
 * Requires
 */
const request = require('request');
const key = require('./key')["key"];

/**
 * Variables
 */
const timeInterval = 172.8;
const timeIntervalTest = 20;
const weatherRequestOptions = {
	url: 'http://api.worldweatheronline.com/premium/v1/weather.ashx',
	qs: {
		"q": "9.7499,112.999",
		"key": key,
		"format": "json"
	}
};
const penURL = 'http://localhost:4242/v1/pen';
const header = {
	'Content-Type': 'application/json; charset=UTF-8'
};
const coordinates = [
	"9.7499,112.999",
	"16.027,112.546"
];
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
		// Set up an interval to check the weather
		this.sendRequest = this.sendRequest.bind(this);
		this.interval = null;
		this.addListeners();
		this.draw('0,0', 1);
	}
	/**
	 * addListeners [set interval listener to send requests to get weather data]
	 */
	addListeners() {
		this.interval = setInterval(this.sendRequest, timeInterval * 1000);
	}
	/**
	 * sendRequest [send a request to worldweatheronline]
	 */
	sendRequest() {
		let coordinate = coordinates[coordinatesIncrementer];
		weatherRequestOptions.qs["q"] = coordinate;
		coordinatesIncrementer = (coordinatesIncrementer + 1) % coordinates.length;
		request(weatherRequestOptions, (error, response, body) => {
			if (error) {
				throw error;
			} else {
				let data = JSON.parse(body);
				let currentCondition = data.data["current_condition"];
				console.log(currentCondition[0].cloudcover);
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
		let coordinateArr = coordinate.split(',');
		let xCoord = parseFloat(coordinateArr[0]);
		let yCoord = parseFloat(coordinateArr[1]);
		request.put(penURL, {
			headers: header,
			body: JSON.stringify({
				"state": 0
			})
		}, (error, response, body) => {
			if (error) throw error;
			request.put(penURL, {
				headers: header,
				body: JSON.stringify({
					"x": xCoord,
					"y": yCoord
				})
			}, (error, response, body) => {
				if (error) throw error;
				request.put(penURL, {
					headers: header,
					body: JSON.stringify({
						"state": 1 - cloudCover
					})
				}, (error, response, body) => {
					if (error) throw error;
					console.log(response.body);
				});
			});
		});
	}
}

new App();