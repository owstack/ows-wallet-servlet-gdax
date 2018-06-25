'use strict';

angular.module('owsWalletPlugin', [
	'angularMoment',
	'gettext',
	'ngLodash',
	'owsWalletPluginClient',
  'owsWalletPlugin.apiHandlers',
  'owsWalletPlugin.services'
]);

angular.module('owsWalletPlugin.apiHandlers', []);
angular.module('owsWalletPlugin.services', []);
