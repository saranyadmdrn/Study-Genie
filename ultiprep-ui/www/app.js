var app = angular.module('ultiprep', ['froala', 'ui.router', 'angular-loading-bar']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('landing', {
            name: 'landing',
            url: '/',
            templateUrl: '/views/home.view.html',
            controller: 'homeController as vm',
        })
        .state('notes', {
            name: 'notes',
            url: '/notes',
            templateUrl: '/views/notes.view.html',
            controller: 'notesController as vm',
        })
        .state('notes.state-notes', {
            url: '/notes',
            templateUrl: 'views/sub-views/notes.notes.view.html'
        })
        .state('notes.state-pin', {
            url: '/pin',
            templateUrl: 'views/sub-views/notes.pin.view.html'
        })
        .state('notes.state-trash', {
            url: '/trash',
            templateUrl: 'views/sub-views/notes.trash.view.html'
        })
        .state('notes.state-tags', {
            url: '/tags',
            templateUrl: 'views/sub-views/notes.tags.view.html'
        })
        .state('notes.state-profile', {
            url: '/profile',
            templateUrl: 'views/sub-views/notes.profile.view.html',
            controller: 'profileController as vm',
        });

    //  $locationProvider.html5Mode(true);
});

app.run(function($rootScope, $state, authentication) {

    $rootScope
        .$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

            console.log('stateChangeStart');
            $('#ui-view').addClass('hidden');
            $('.page-loading').removeClass('hidden');

            if (toState.name === 'notes' && !authentication.isLoggedIn()) {
                event.preventDefault();
                $state.go('landing');
            } else if (toState.name === 'notes.state-notes' && !authentication.isLoggedIn()) {
                event.preventDefault();
                $state.go('landing');
            } else if (toState.name === 'notes.state-pin' && !authentication.isLoggedIn()) {
                event.preventDefault();
                $state.go('landing');
            } else if (toState.name === 'notes.state-trash' && !authentication.isLoggedIn()) {
                event.preventDefault();
                $state.go('landing');
            } else if (toState.name === 'notes.state-labels' && !authentication.isLoggedIn()) {
                event.preventDefault();
                $state.go('landing');
            } else if (toState.name === 'notes.state-profile' && !authentication.isLoggedIn()) {
                event.preventDefault();
                $state.go('landing');
            } else if (toState.name === 'landing' && authentication.isLoggedIn()) {
                event.preventDefault();
                $state.go('notes.state-notes', null, { reload: true });
            }
        });
    $rootScope
        .$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

            console.log('stateChangeSuccess');
            $('#ui-view').removeClass('hidden');
            $('.page-loading').addClass('hidden');
        });
});

app.filter('searchFor', function() {

    return function(arr, searchString) {

        if (!searchString) {
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();
        angular.forEach(arr, function(item) {
            if (item.title.toLowerCase().indexOf(searchString) !== -1 ||
                item.content.toLowerCase().indexOf(searchString) !== -1) {
                result.push(item);
            }
        });

        return result;
    };
});

app.filter('filterTags', function() {

    return function(notes, selectedTags) {

        if (!selectedTags || selectedTags.length === 0) {
            return notes;
        }

        return notes.filter(function(note) {

            console.log(note.tags);
            for (var i in note.tags) {
                if (selectedTags.indexOf(note.tags[i]) != -1)
                    return true;
            }

            return false;
        });
    };
});

app.filter('ngRepeatFinish', function($timeout) {

    return function(data, scope) {

        var me = scope;
        var flagProperty = '__finishedRendering__';

        if (!data[flagProperty]) {

            Object.defineProperty(
                data,
                flagProperty, { enumerable: false, configurable: true, writable: false, value: {} }
            );

            $timeout(function() {
                delete data[flagProperty];
                me.$emit('ngRepeatFinished');
            }, 0, false);
        }

        return data;
    };
});

app.directive('editModalsLoadedDirective', function() {

    return function(scope, element, attrs) {

        if (scope.$last) {
            textareaAutoResizer();
            setBackButtonToModalClose();
            initLayout();
        }
    }
});

app.filter('noteTilePrettify', function() {

    return function(content) {

        var res = content;

        var dummyElem = document.createElement('span');
        dummyElem.innerHTML = res;
        var textLength = $(dummyElem).text().length;

        if (textLength < 40) {

            var beg = '<span style = "font-size: 24px; font-weight: 300;">';
            var end = '</span>';
            res = beg + res + end;
        } else if (textLength < 60) {

            var beg = '<span style = "font-size: 22px; font-weight: 300;">';
            var end = '</span>';
            res = beg + res + end;
        } else if (textLength < 120) {

            var beg = '<span style = "font-size: 20px; font-weight: 300;">';
            var end = '</span>';
            res = beg + res + end;
        } else if (textLength < 140) {

            var beg = '<span style = "font-size: 18px; font-weight: 300;">';
            var end = '</span>';
            res = beg + res + end;
        } else if (textLength < 160) {

            var beg = '<span style = "font-size: 16px; font-weight: 300;">';
            var end = '</span>';
            res = beg + res + end;
        }

        if (textLength > 400) {
            res = res.substring(0, 400) + '...';
        }

        return res;
    };
});

app.filter('noteModalPrettify', function() {

    return function(content) {

        var res = content;

        var dummyElem = document.createElement('span');
        dummyElem.innerHTML = res;
        var textLength = $(dummyElem).text().length;

        if (textLength < 40) {

            var beg = '<span style = "font-size: 24px; font-weight: 300;">';
            var end = '</span>';
            res = beg + res + end;
        } else if (textLength < 60) {

            var beg = '<span style = "font-size: 22px; font-weight: 300;">';
            var end = '</span>';
            res = beg + res + end;
        } else if (textLength < 120) {

            var beg = '<span style = "font-size: 20px; font-weight: 300;">';
            var end = '</span>';
            res = beg + res + end;
        } else if (textLength < 140) {

            var beg = '<span style = "font-size: 18px; font-weight: 300;">';
            var end = '</span>';
            res = beg + res + end;
        } else if (textLength < 160) {

            var beg = '<span style = "font-size: 16px; font-weight: 300;">';
            var end = '</span>';
            res = beg + res + end;
        }

        return res;
    };
});

app.filter('userNameFormat', function() {

    return function(name) {

        if (typeof name === 'string') {
            if (name.length > 25) {
                name = name.substring(0, 25) + '...';
            }
            return name;
        }

        return 'Loading...';
    };
});
