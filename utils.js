'use strict';

module.exports = {
	mapClamp: function (value, low1, high1, low2, high2) {
		var val = low2 + (high2 - low2) * (value - low1) / (high1 - low1);
        return Math.max(low2, Math.min(high2, val))
	}
};
