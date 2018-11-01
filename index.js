'use strict';

const request = require('request');
const key = require('./key')["key"];
const timeInterval = 20;
const options = {
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

class App {
	constructor() {
		// Set up an interval to check the weather
		this.sendRequest = this.sendRequest.bind(this);
		this.interval = null;
		this.addListeners();
		this.draw('0,0', 1);
		//this.sendRequest();
	}
	addListeners() {
		this.interval = setInterval(this.sendRequest, timeInterval * 1000);
	}
	sendRequest() {
		let coordinate = coordinates[coordinatesIncrementer];
		options.qs["q"] = coordinate;
		coordinatesIncrementer = (coordinatesIncrementer + 1) % coordinates.length;
		request(options, (error, response, body) => {
			if (error) {
				throw error;
			} else {
				let data = JSON.parse(body);
				let currentCondition = data.data["current_condition"];
				console.log(currentCondition[0].cloudcover);
				let cloudCover = parseInt(currentCondition[0].cloudcover)/100;
				this.draw(coordinate, cloudCover);
			}
		});
	}
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