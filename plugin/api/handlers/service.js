'use strict';

angular.module('owsWalletPlugin.apiHandlers').service('service', function(gdaxService) {

	var root = {};

  root.respond = function(message, callback) {
    // Request parameters.
    var state = message.request.data.state;
    var pluginConfig = message.request.data.config;

    if (!state) {
      message.response = {
        statusCode: 500,
        statusText: 'REQUEST_NOT_VALID',
        data: {
          message: 'Missing required state.'
        }
      };
      return callback(message);
    };

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
