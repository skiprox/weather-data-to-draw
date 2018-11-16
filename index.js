'use strict';

/**
 * Requires
 */
const request = require('request');
const key = require('./key')["key"];
const coordinates = require('./coordinates');
const utils = require('./utils');

/**
 * Variables
 */
let minPercentX = 3;
let minPercentY = 6;
let maxPercentX = 79;
let maxPercentY = 88;
const penURL = 'http://localhost:4242/v1/pen';
const penHeader = {
	'Content-Type': 'application/json; charset=UTF-8'
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
		// Calibrate
		this.runCalibrate();
	}
	/**
	 * [runCalibrate Calibrate the device]
	 */
	runCalibrate() {
		request.put(penURL, {
			headers: penHeader,
			body: JSON.stringify({
				"state": 0
			})
		}, (error, response, body) => {
			if (error) throw error;
			console.log(response.body);
			request.put(penURL, {
				headers: penHeader,
				body: JSON.stringify({
					"x": minPercentX,
					"y": minPercentY
				})
			}, (error, response, body) => {
				if (error) throw error;
				console.log(response.body);
				request.put(penURL, {
					headers: penHeader,
					body: JSON.stringify({
						"state": 1
					})
				}, (error, response, body) => {
					if (error) throw error;
					console.log(response.body);
					request.put(penURL, {
						headers: penHeader,
						body: JSON.stringify({
							"x": maxPercentX,
							"y": minPercentY
						})
					}, (error, response, body) => {
						if (error) throw error;
						console.log(response.body);
						request.put(penURL, {
							headers: penHeader,
							body: JSON.stringify({
								"x": maxPercentX,
								"y": maxPercentY
							})
						}, (error, response, body) => {
							if (error) throw error;
							console.log(response.body);
							request.put(penURL, {
								headers: penHeader,
								body: JSON.stringify({
									"x": minPercentX,
									"y": maxPercentY
								})
							}, (error, response, body) => {
								if (error) throw error;
								console.log(response.body);
								request.put(penURL, {
									headers: penHeader,
									body: JSON.stringify({
										"x": minPercentX,
										"y": minPercentY
									})
								}, (error, response, body) => {
									if (error) throw error;
									console.log(response.body);
									request.put(penURL, {
										headers: penHeader,
										body: JSON.stringify({
											"state": 0
										})
									}, (error, response, body) => {
										if (error) throw error;
										console.log(response.body);
										request.put(penURL, {
											headers: penHeader,
											body: JSON.stringify({
												"x": 0,
												"y": 0
											})
										}, (error, response, body) => {
											if (error) throw error;
											console.log(response.body);
										})
									})
								})
							})
						})
					})
				})
			})
		})
	}
}

new App();