/* global angular,window */

var noteDbApp = angular.module('noteDbApp', [
	'ngRoute',
	'noteDbControllers',
	'noteDbServices',
	'noteDbFilters'
]);

noteDbApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
		when('/home', {  
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl',
			title: 'Note Database'
		}).
		when('/edit', {
			templateUrl: 'partials/edit.html',
			controller: 'EditCtrl'
		}).
		when('/edit/:key', {
			templateUrl: 'partials/edit.html',
			controller: 'EditCtrl'
		}).
		when('/about', {
			templateUrl: 'partials/about.html'
		}).
		when('/unsupported', {
			templateUrl: 'partials/unsupported.html'
		}).
		otherwise({
			redirectTo: '/home'
		});
  }]).run(['$rootScope','$location','persistanceService', function($rootScope,$location,persistanceService) {

	
	$rootScope.$on("$routeChangeStart", function(event,currentRoute, previousRoute){
		if(!persistanceService.ready() && ($location.path() != '/home' && $location.path() != '/unsupported')) {
			$location.path('/home');
		};

	});

}]);
