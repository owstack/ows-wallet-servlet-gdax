'use strict';

angular.module('owsWalletPlugin.services').factory('gdaxService', function($rootScope, $log, lodash, moment,
  /* @namespace owsWalletPluginClient.api */ Http) {

  var root = {};

  var credentials = {};
  var gdaxApi;

  // GDAX static configuration.
  var currencies = [{
    pair: 'BTC-USD',
    label: 'Bitcoin'
  }, {
    pair: 'BCH-USD',
    label: 'Bitcoin Cash'
  }, {
    pair: 'ETH-USD',
    label: 'Ether'
  }, {
    pair: 'LTC-USD',
    label: 'Litecoin'
  }];

  var granularity = {
    '1-minute': 60,
    '5-minute': 300,
    '15-minute': 900,
    '1-hour': 3600,
    '6-hour': 21600,
    '1-day': 86400
  };

  // Invoked via the servlet API to initialize our environment using the provided configuration (typically from applet plugin configuration).
  root.init = function(config) {
    return new Promise(function(resolve, reject) {
      // Use plugin configuration to setup for communicating with GDAX.
      setCredentials(config);

      // Gather some additional information for the client. This information only during this initialization sequence.
      var info = {};
      info.urls = getUrls();

      return resolve({
        info: info
      });

    });
  };

  root.candles = function(currencyPair, startDate, endDate, interval) {
    return new Promise(function(resolve, reject) {

      // Check inputs.
      var c = lodash.find(currencies, function(c) {
        return c.pair == currencyPair;
      });

      if (!c) {
        reject('Invalid currency pair');
      }

      try {
        startDate = moment(startDate,'x').toISOString();
        endDate = moment(endDate,'x').toISOString();
      } catch(ex) {
        reject('Invalid date format');
      }

      if (!granularity[interval]) {
        reject('Invalid interval')
      }

      gdaxApi.get('products/' + currencyPair + '/candles?start=' + startDate + '&end=' + endDate + '&granularity=' + granularity[interval]).then(function(response) {
        resolve(response.data);
      }).catch(function(error) {
        $log.error('GDAX: GET historical price ' + error.status + '. ' + getErrorsAsString(error.data));
        reject(error.data);
      });
    });
  };

  /**
   * Private functions
   */

  function setCredentials(config) {
    /**
     * Development: 'testnet'
     * Production: 'livenet'
     */
    credentials.NETWORK = 'livenet';

    if (credentials.NETWORK.indexOf('testnet') >= 0) {
      credentials.API = config.sandbox.api;
    } else {
      credentials.API = config.production.api;
    };

    // Using these credentials, create an API provider.
    createGdaxApiProvider();
  };

  function createGdaxApiProvider() {
    gdaxApi = new Http(credentials.API, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  };

  function getUrls() {
    return {
      supportUrl: 'https://support.gdax.com/'
    };
  };

  function getErrorsAsString(data) {
    var errData;
    try {
      if (data && data.errors) {
        errData = data.errors;
      } else if (data && data.error) {
        errData = data.error_description;
      } else {
        return 'Unknown error';
      }

      if (!lodash.isArray(errData)) {
        errData = errData && errData.message ? errData.message : errData;
        return errData;
      }

      if (lodash.isArray(errData)) {
        var errStr = '';
        for (var i = 0; i < errData.length; i++) {
          errStr = errStr + errData[i].message + '. ';
        }
        return errStr;
      }

      return JSON.stringify(errData);
    } catch(e) {
      $log.error(e);
    };
  };

  return root;
});
