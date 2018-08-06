'use strict';

angular.module('owsWalletPlugin.api.gdax').factory('GDAX', function (ApiMessage,
  /* @namespace owsWalletPluginClient.api */ ApiError,
  /* @namespace owsWalletPlugin.api.hello */ GDAXServlet,
  /* @namespace owsWalletPluginClient.api */ PluginApiHelper) {

  GDAX.interval = {
    ONE_MINUTE: '1-minute',
    FIVE_MINUTE: '5-minute',
    FIFTEEN_MINUTE: '15-minute',
    ONE_HOUR: '1-hour',
    SIX_HOUR: '6-hour',
    ONE_DAY: '1-day'
  };

  /**
   * Constructor.
   * @param {Object} configId - The configuration ID for the servlet.
   * @param {Function} onConnect - A callback function invoked when an oauth pairing event is received. Called with
   * the following arguments (error, haveAccount). 'error' specifies that an error occurred during the pairing process.
   * 'haveAccount' is true if we are paired with an account, false if pairing is still required (has not been done yet).
   * If an error occurred then 'hasAccount' is undefined.
   * @constructor
   *
   * Plugin dependency configuration example:
   *
   * "org.openwalletstack.wallet.plugin.servlet.gdax": {
   *   "package": {
   *     "@owstack/ows-wallet-servlet-gdax": "^0.0.1"
   *   },
   *   "options": {
   *     "startMode": "auto"
   *   },
   *   "default": {
   *     "sandbox": {
   *       "api": ""
   *     },
   *     "production": {
   *       "api": "https://api.gdax.com"
   *     }
   *   }
   * }
   *
   */
  function GDAX(configId, onConnect) {
    var self = this;

    this.urls;

    var servlet = new PluginApiHelper(GDAXServlet);
    var apiRoot = servlet.apiRoot();
    var config = servlet.getConfig(configId);

    var onGDAXConnect = onConnect;
    if (typeof onGDAXConnect != 'function') {
      throw {
        message: 'IMPLEMENTATION_ERROR',
        detail: 'You must provide an onConnect function to the constructor'
      };
    }

    doConnect();

    /**
     * Public functions
     */

    this.candles = function(currencyPair, startDate, endDate, interval) {
      var request = {
        method: 'GET',
        url: apiRoot + '/candles/' + currencyPair + '/' + startDate + '/' + endDate + '/' + interval
      };

      return new ApiMessage(request).send().then(function(response) {
        return response.data;

      }).catch(function(error) {
        throw new ApiError(error);
        
      });
    };

    /**
     * Private functions
     */

    function doConnect() {
      var request = {
        method: 'PUT',
        url: apiRoot + '/service',
        data: {
          state: 'initialize',
          config: config
        }
      };

      return new ApiMessage(request).send().then(function(response) {
        self.urls = response.data.info.urls;
        onGDAXConnect();

      }).catch(function(error) {
        onGDAXConnect(error);

      });
    };

    return this;
  };
 
  return GDAX;
});
