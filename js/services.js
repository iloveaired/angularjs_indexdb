/* global angular,window */
var noteDbServices = angular.module('noteDbServices', []);

noteDbServices.factory('persistanceService', ['$q', function($q) {

	var setUp=false;
	var db;
		
	function init() {
		var deferred = $q.defer();

		if(setUp) {
			deferred.resolve(true);
			return deferred.promise;
		}
		
		var openRequest = window.indexedDB.open("indexeddb_angular",1);
	
		openRequest.onerror = function(e) {
			console.log("Error opening db");
			console.dir(e);
			deferred.reject(e.toString());
		};

		openRequest.onupgradeneeded = function(e) {
	
			var thisDb = e.target.result;
			var objectStore;
			
			//Create Note OS
			if(!thisDb.objectStoreNames.contains("note")) {
				objectStore = thisDb.createObjectStore("note", { keyPath: "id", autoIncrement:true });
				objectStore.createIndex("titlelc", "titlelc", { unique: false });
				objectStore.createIndex("tags","tags", {unique:false,multiEntry:true});
			}
	
		};

		openRequest.onsuccess = function(e) {
			db = e.target.result;
			
			db.onerror = function(event) {
				// Generic error handler for all errors targeted at this database's
				// requests!
				deferred.reject("Database error: " + event.target.errorCode);
			};
	
			setUp=true;
			deferred.resolve(true);
		
		};	

		return deferred.promise;
	}
	
	function isSupported() {
		return ("indexedDB" in window);		
	}
	
	function deleteNote(key) {
		var deferred = $q.defer();
		var t = db.transaction(["note"], "readwrite");
		var request = t.objectStore("note").delete(key);
		t.oncomplete = function(event) {
			deferred.resolve();
		};
		return deferred.promise;
	}
	
	function getNote(key) {
		var deferred = $q.defer();

		var transaction = db.transaction(["note"]);  
		var objectStore = transaction.objectStore("note");  
		var request = objectStore.get(key);  

		request.onsuccess = function(event) {  
			var note = request.result;
			deferred.resolve(note);
		}; 
		
		return deferred.promise;
	}
	
	function getNotes() {
		var deferred = $q.defer();
		
		init().then(function() {

			var result = [];

			var handleResult = function(event) {  
				var cursor = event.target.result;
				if (cursor) {
					result.push({key:cursor.key, title:cursor.value.title, updated:cursor.value.updated});
					cursor.continue();
				}
			};  
			
			var transaction = db.transaction(["note"], "readonly");  
			var objectStore = transaction.objectStore("note");
            objectStore.openCursor().onsuccess = handleResult;

			transaction.oncomplete = function(event) {
				deferred.resolve(result);
			};
		
		});
		return deferred.promise;
	}
	
	function ready() {
		return setUp;
	}
	
	function saveNote(note) {
		//Should this call init() too? maybe
		var deferred = $q.defer();

		if(!note.id) note.id = "";
		
		var titlelc = note.title.toLowerCase();
		
		//handle tags
		var tags = [];
		if(note.tags && note.tags.length) tags = note.tags.split(",");
		
		var t = db.transaction(["note"], "readwrite");
		
        if(note.id === "") {
            t.objectStore("note")
                            .add({title:note.title,body:note.body,updated:new Date().getTime(),titlelc:titlelc,tags:tags});
        } else {
            t.objectStore("note")
                            .put({title:note.title,body:note.body,updated:new Date(),id:Number(note.id),titlelc:titlelc,tags:tags});
        }

		t.oncomplete = function(event) {
			deferred.resolve();
		};

		return deferred.promise;
	}
	
	function supportsIDB() {
		return "indexedDB" in window;	
	}
	
	return {
		isSupported:isSupported,
		deleteNote:deleteNote,
		getNote:getNote,
		getNotes:getNotes,
		ready:ready,
		saveNote:saveNote,
		supportsIDB:supportsIDB
	};

}]);


