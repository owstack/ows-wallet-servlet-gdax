"use strict";angular.module("owsWalletPlugin",["angularMoment","gettext","ngLodash","owsWalletPluginClient","owsWalletPlugin.apiHandlers","owsWalletPlugin.services"]),angular.module("owsWalletPlugin.apiHandlers",[]),angular.module("owsWalletPlugin.services",[]),angular.module("owsWalletPlugin").config(["$pluginConfigProvider",function($pluginConfigProvider){$pluginConfigProvider.router.routes([{path:"/candles/:currencyPair/:startDate/:endDate/:interval",method:"GET",handler:"getCandles"},{path:"/service",method:"PUT",handler:"service"}])}]).run(function(){owswallet.Plugin.ready(function(){})}),angular.module("owsWalletPlugin").run(["gettextCatalog",function(gettextCatalog){}]),angular.module("owsWalletPlugin.services").factory("gdaxService",["$rootScope","$log","lodash","moment","owsWalletPluginClient.api.Http",function($rootScope,$log,lodash,moment,Http){function setCredentials(config){credentials.NETWORK="livenet",credentials.API=config.production.api,createGdaxApiProvider()}function createGdaxApiProvider(){gdaxApi=new Http(credentials.API,{headers:{"Content-Type":"application/json",Accept:"application/json"}})}function getUrls(){return{supportUrl:"https://support.gdax.com/"}}function getErrorsAsString(data){var errData;try{if(data&&data.errors)errData=data.errors;else{if(!data||!data.error)return"Unknown error";errData=data.error_description}if(!lodash.isArray(errData))return errData=errData&&errData.message?errData.message:errData;if(lodash.isArray(errData)){for(var errStr="",i=0;i<errData.length;i++)errStr=errStr+errData[i].message+". ";return errStr}return JSON.stringify(errData)}catch(e){$log.error(e)}}var gdaxApi,root={},credentials={},currencies=[{pair:"BTC-USD",label:"Bitcoin"},{pair:"BCH-USD",label:"Bitcoin Cash"},{pair:"ETH-USD",label:"Ether"},{pair:"LTC-USD",label:"Litecoin"}],granularity={"1-minute":60,"5-minute":300,"15-minute":900,"1-hour":3600,"6-hour":21600,"1-day":86400};return root.init=function(config){return new Promise(function(resolve,reject){setCredentials(config);var info={};return info.urls=getUrls(),resolve({info:info})})},root.candles=function(currencyPair,startDate,endDate,interval){return new Promise(function(resolve,reject){lodash.find(currencies,function(c){return c.pair==currencyPair})||reject("Invalid currency pair");try{startDate=moment(startDate,"x").toISOString(),endDate=moment(endDate,"x").toISOString()}catch(ex){reject("Invalid date format")}granularity[interval]||reject("Invalid interval"),gdaxApi.get("products/"+currencyPair+"/candles?start="+startDate+"&end="+endDate+"&granularity="+granularity[interval]).then(function(response){resolve(response.data)}).catch(function(error){$log.error("GDAX: GET historical price "+error.status+". "+getErrorsAsString(error.data)),reject(error.data)})})},root}]),angular.module("owsWalletPlugin.apiHandlers").service("getCandles",["gdaxService","owsWalletPluginClient.api.Utils",function(gdaxService,Utils){var root={},REQUIRED_PARAMS=["currencyPair","startDate","endDate","interval"];return root.respond=function(message,callback){var missing=Utils.checkRequired(REQUIRED_PARAMS,message.request.params);if(missing.length>0)return message.response={statusCode:400,statusText:"REQUEST_NOT_VALID",data:{message:"The request does not include "+missing.toString()+"."}},callback(message);var currencyPair=message.request.params.currencyPair,startDate=message.request.params.startDate,endDate=message.request.params.endDate,interval=message.request.params.interval;gdaxService.candles(currencyPair,startDate,endDate,interval).then(function(response){return message.response={statusCode:200,statusText:"OK",data:response},callback(message)}).catch(function(error){return message.response={statusCode:500,statusText:"UNEXPECTED_ERROR",data:{message:error}},callback(message)})},root}]),angular.module("owsWalletPlugin.apiHandlers").service("service",["gdaxService","owsWalletPluginClient.api.Utils",function(gdaxService,Utils){var root={},REQUIRED_DATA=["state"];return root.respond=function(message,callback){var missing=Utils.checkRequired(REQUIRED_DATA,message.request.data);if(missing.length>0)return message.response={statusCode:400,statusText:"REQUEST_NOT_VALID",data:{message:"The request does not include "+missing.toString()+"."}},callback(message);var state=message.request.data.state,pluginConfig=message.request.data.config;switch(state){case"initialize":if(!pluginConfig)return message.response={statusCode:500,statusText:"REQUEST_NOT_VALID",data:{message:"Missing required configuration."}},callback(message);gdaxService.init(pluginConfig).then(function(data){return message.response={statusCode:200,statusText:"OK",data:data},callback(message)}).catch(function(error){return message.response={statusCode:500,statusText:"UNEXPECTED_ERROR",data:{message:error}},callback(message)});break;default:return message.response={statusCode:500,statusText:"REQUEST_NOT_VALID",data:{message:"Unrecognized state."}},callback(message)}},root}]);