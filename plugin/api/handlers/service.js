'use strict';

angular.module('owsWalletPlugin.apiHandlers').service('service', function(gdaxService,
  /* @namespace owsWalletPluginClient.api */ Utils) {

  var root = {};

  var REQUIRED_DATA = [
    'state'
  ];

  root.respond = function(message, callback) {
    // Check required parameters.
    var missing = Utils.checkRequired(REQUIRED_DATA, message.request.data);
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

    var state = message.request.data.state;
    var pluginConfig = message.request.data.config;

    switch (state) {
      case 'initialize':

        if (!pluginConfig) {
          message.response = {
            statusCode: 500,
            statusText: 'REQUEST_NOT_VALID',
            data: {
              message: 'Missing required configuration.'
            }
          };
          return callback(message);
        }

        gdaxService.init(pluginConfig).then(function(data) {

          message.response = {
            statusCode: 200,
            statusText: 'OK',
            data: data
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

        break;

      /**
       *  Invalid request.
       */
      default:

        message.response = {
          statusCode: 500,
          statusText: 'REQUEST_NOT_VALID',
          data: {
            message: 'Unrecognized state.'
          }
        };
        return callback(message);

        break;
    }

	};

  return root;
});
