'use strict';

angular.module('owsWalletPlugin').config(function($pluginConfigProvider) {

  /**
   * API routes for our service.
   * A match is made by searching routes in order, the first match returns the route.
   */
  $pluginConfigProvider.router.routes([
    { path: '/candles/:currencyPair/:startDate/:endDate/:interval', method: 'GET',  handler: 'getCandles' },
    { path: '/service',                                             method: 'PUT',  handler: 'service' }
  ]);

})
.run(function() {

  owswallet.Plugin.ready(function() {

    // Do initialization here.

  });

});
