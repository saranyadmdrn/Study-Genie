var app = angular.module('ultiprep');

app.service('authentication', function($http, $window) {

	var getToken = function() {
		return $window.localStorage['ngn-token'];
	};

	var saveToken = function(token) {
		$window.localStorage['ngn-token'] = token;
	};

	var removeToken = function() {
		$window.localStorage.removeItem('ngn-token');
	};

	var isLoggedIn = function() {
		var token = getToken();

		if(token) {
			var payload = token.split('.')[1];
			
			payload = $window.atob(payload);
			payload = JSON.parse(payload);

			return payload.exp > Date.now() / 1000;
		}
		else {
			return false;
		}
	};

	var getCurrentUser = function() {
		if(isLoggedIn()) {
			var token = getToken();
			var payload = token.split('.')[1];

			payload = $window.atob(payload);
			payload = JSON.parse(payload);

			return payload;
		}
	};

	var signUp = function(user) {
		return $http.post('/api/signup', user).success(function(data) {
			saveToken(data.token);
		});
	};

	var logIn = function(user) {
		return $http.post('/api/login', user).success(function(data) {
			saveToken(data.token);
		});
	};

	var logOut = function() {
		removeToken();
	};

	return {
		getToken: getToken,
		saveToken: saveToken,
		removeToken: removeToken,
		isLoggedIn: isLoggedIn,
		getCurrentUser: getCurrentUser,
		signUp: signUp,
		logIn: logIn,
		logOut: logOut
	};
});
