'use strict';

const request = require('request');
const key = require('./key')["key"];
const timeInterval = 172.8;
const options = {
	url: 'http://api.worldweatheronline.com/premium/v1/weather.ashx',
	qs: {
		"q": "9.7499,112.999",
		"key": key,
		"format": "json"
	}
};
const coordinates = [
	"9.7499,112.999",
	"16.027,112.546"
];
let coordinatesIncrementer = 0;

class App {
	constructor() {
		// We should set up the axidraw here, eventually
		// probably using cncserver
		// 
		// Set up an interval to check the weather
		this.sendRequest = this.sendRequest.bind(this);
		this.interval = null;
		this.addListeners();
	}
	addListeners() {
		this.interval = setInterval(this.sendRequest, timeInterval * 1000);
	}
	sendRequest() {
		let coordinate = coordinates[coordinatesIncrementer];
		options.qs["q"] = coordinate;
		coordinatesIncrementer = (coordinatesIncrementer + 1) % coordinates.length;
		request(options, (error, response, body) => {
			let data = JSON.parse(body);
			let currentCondition = data.data["current_condition"];
			console.log(currentCondition);
		});
	}
}

new App();