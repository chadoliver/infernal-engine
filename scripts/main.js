 // create a skeleton module to gather all the controllers. The list indicates all the angularJS modules
 // that need to be loaded before the 'controllers' module can be initialised. (It's primitive dependency
 // management.)
angular.module('controllers', ['map']);

var app = angular.module('infernalEngine', ['controllers', 'constants']);

app.config(['$routeProvider', function($routeProvider) {
	// Associate URLs with templates and controllers.

	$routeProvider.when('/', { // each URL has an implicit '#' at the beginning.
		templateUrl: 'templates/map.html',
		controller: 'mapController',
	})
	.otherwise({
		redirectTo:'/'
	});

}]);


