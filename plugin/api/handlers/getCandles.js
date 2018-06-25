'use strict';

angular.module('owsWalletPlugin.apiHandlers').service('getCandles', function(gdaxService) {

	var root = {};

  root.respond = function(message, callback) {
    // Request parameters.
    var currencyPair = message.request.params.currencyPair;
    var startDate = message.request.params.startDate;
    var endDate = message.request.params.endDate;
    var interval = message.request.params.interval;


    if (!currencyPair || !startDate || !endDate || !interval) {
      message.response = {
        statusCode: 500,
        statusText: 'REQUEST_NOT_VALID',
        data: {
          message: 'Must provide currencyPair, startDate, endDate, interval.'
        }
      };
      return callback(message);
    };

    gdaxService.candles(currencyPair, startDate, endDate, interval).then(function(response) {

      message.response = {
        statusCode: 200,
        statusText: 'OK',
        data: response
      };
      return callback(message);

    }).catch(function(error) {

      message.response = {
        statusCode: 500,
        statusText: 'UNEXPECTED_ERROR',
        data: {
          message: error
        }
      };
      return callback(message);

    });
	};

  return root;
});
