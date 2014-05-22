/* global angular */
var noteDbControllers = angular.module('noteDbControllers', []);

noteDbControllers.controller('HomeCtrl', ['$scope', '$rootScope', '$location',  'persistanceService', function($scope, $rootScope, $location, persistanceService) {
	
	function getNotes() {
		persistanceService.getNotes().then(function(res) {
			$scope.notes = res;
		});
	}
	
	$scope.loadNote = function(key) {
		persistanceService.getNote(key).then(function(note) {
			$scope.note = note;
			$scope.noteSelected=true;
		});
	};
	
	$scope.deleteNote = function(key) {
		persistanceService.deleteNote(key).then(function() {
			//refresh the list - there is probably a better way to do this
			getNotes();
		});
	};
	
	if(persistanceService.supportsIDB()) {
	   getNotes();
	} else {
		$location.path('/unsupported');
	}
}]);

noteDbControllers.controller('EditCtrl', ['$scope', '$rootScope', '$routeParams', '$location', 'persistanceService', function($scope, $rootScope, $routeParams, $location, persistanceService) {
		
	if($routeParams.key) {
		persistanceService.getNote(Number($routeParams.key)).then(function(note) {
			$scope.note = note;
			$scope.tagString = "";
			if(note.tags.length) $scope.tagString = note.tags.join(",");
		});
	}
	
	$scope.saveNote = function() {
		var note = {};
		note.title = $scope.note.title;
		note.body = $scope.note.body;
		note.tags = $scope.tagString;
		if($scope.note.id !== "") note.id = $scope.note.id;
		
		persistanceService.saveNote(note).then(function() {
			$location.path('/home');
		});

	};

}]);
