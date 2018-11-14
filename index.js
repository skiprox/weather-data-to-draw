'use strict';

/**
 * Requires
 */
const request = require('request');
const key = require('./key')["key"];
const coordinates = require('./coordinates');
const utils = require('./utils');
const say = require('say');

/**
 * Variables
 */
const weatherRequestOptions = {
	url: 'http://api.worldweatheronline.com/premium/v1/weather.ashx',
	qs: {
		"q": "9.7499,112.999",
		"key": key,
		"format": "json"
	}
};

/**
 * APP
 * Our application
 */
class App {
	/**
	 * constructor [set everything up]
	 */
	constructor() {
		this.testPoint(8.35, 115.34);
	}
	/**
	 * sendRequest [send a request to worldweatheronline]
	 */
	testPoint(lat, lng) {
		weatherRequestOptions.qs["q"] = `${lat},${lng}`;
		request(weatherRequestOptions, (error, response, body) => {
			if (error) {
				throw error;
			} else {
				let data = JSON.parse(body);
				console.log(data.data);
			}
		});
	}
}

new App();