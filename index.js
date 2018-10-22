'use strict';

const request = require('request');
let key = require('./key')["key"];
const options = {
	url: 'http://api.worldweatheronline.com/premium/v1/weather.ashx',
	qs: {
		"q": "q=9.7499,112.999",
		"key": key,
		"format": "json"
	}
}

class Index {
	constructor() {
		request(options, (error, response, body) => {
			console.log(JSON.parse(body).data["current_condition"]);
		});
	}
}

new Index();