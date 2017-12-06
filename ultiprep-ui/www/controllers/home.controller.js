var app = angular.module('ultiprep');

app.controller('homeController', ["$state", "authentication", function($state, authentication) {
    var vm = this;

    vm.registerCredentials = {
        name: '',
        email: '',
        password: ''
    };

    vm.signinCredentials = {
        email: '',
        password: ''
    };

    vm.signUp = function() {

        if (typeof vm.registerCredentials.email !== 'string' || vm.registerCredentials.email.length == 0) {
            alertToast('Email address invalid.');
            return;
        }

        if (typeof vm.registerCredentials.name !== 'string' || vm.registerCredentials.name.length == 0 ||
            typeof vm.registerCredentials.email !== 'string' || vm.registerCredentials.email.length == 0 ||
            typeof vm.registerCredentials.password !== 'string' || vm.registerCredentials.password.length == 0) {
            alertToast('Required fields must not be empty.');
            return;
        }

        authentication.signUp(vm.registerCredentials)
            .error(function(err) {
                alertToast(err.message);
            })
            .then(function() {
                swal({
                        title: '',
                        text: 'Please wait..',
                        timer: 1000,
                        showConfirmButton: false,
                    },
                    function() {
                        $state.go('notes.state-notes');
                    });

                setTimeout(function() {
                    $state.go('notes.state-notes');
                }, 1000);
            });
    };

    vm.logIn = function() {

        if (typeof vm.signinCredentials.email !== 'string' || vm.signinCredentials.email.length == 0) {
            alertToast('Email address is invalid.');
            return;
        }

        if (typeof vm.signinCredentials.email !== 'string' || vm.signinCredentials.email.length == 0 ||
            typeof vm.signinCredentials.password !== 'string' || vm.signinCredentials.password.length == 0) {
            alertToast('Required fields must not be empty.');
            return;
        }

        authentication.logIn(vm.signinCredentials)
            .error(function(err) {
                alertToast(err.message);
            })
            .then(function() {
                swal({
                        title: '',
                        text: 'Please wait...',
                        imageUrl: 'assets/images/animation-loading.gif',
                        timer: 1000,
                        showConfirmButton: false,
                    },
                    function() {
                        $state.go('notes.state-notes');
                    });

                setTimeout(function() {
                    $state.go('notes.state-notes');
                }, 1000);
            });
    };
}])
