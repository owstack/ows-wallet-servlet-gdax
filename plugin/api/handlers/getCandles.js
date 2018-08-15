'use strict';

angular.module('owsWalletPlugin.apiHandlers').service('getCandles', function(gdaxService,
  /* @namespace owsWalletPluginClient.api */ Utils) {

  var root = {};

  var REQUIRED_PARAMS = [
    'currencyPair',
    'startDate',
    'endDate',
    'interval'
  ];

  root.respond = function(message, callback) {
    // Check required parameters.
    var missing = Utils.checkRequired(REQUIRED_PARAMS, message.request.params);
    if (missing.length > 0) {
      message.response = {
        statusCode: 400,
        statusText: 'REQUEST_NOT_VALID',
        data: {
          message: 'The request does not include ' + missing.toString() + '.'
        }
      };
      return callback(message);
    }

    var currencyPair = message.request.params.currencyPair;
    var startDate = message.request.params.startDate;
    var endDate = message.request.params.endDate;
    var interval = message.request.params.interval;

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
