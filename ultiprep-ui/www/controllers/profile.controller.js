var app = angular.module('ultiprep');

app.controller('profileController', function($scope, $state, authentication, data) {
    var vm = this;

    vm.isEditingName = false;
    vm.isEditingEmail = false;

    vm.currentUser = {};
    vm.dummyUser = {};
    vm.changePassword = {
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    };
    vm.removeUserConfirmation = {
        password: ''
    };

    data.getUser()
        .success(function(data) {
            vm.dummyUser._id = data._id;
            vm.dummyUser.name = data.name;
            vm.dummyUser.email = data.email;
            vm.currentUser = data;
        })
        .error(function(err) {
            alertToast('Could not load user details. ' + err.message);
        });

    vm.updateUser = function() {
        if (vm.isEditingName) {
            if (typeof vm.dummyUser.name !== 'string' || vm.dummyUser.name.length == 0) {
                alertToast('Name is required.');
                vm.dummyUser.name = vm.currentUser.name;
                return;
            }
        }

        if (vm.isEditingEmail) {
            if (typeof vm.dummyUser.email !== 'string' || vm.dummyUser.email.length == 0) {
                alertToast('Valid email address is required.');
                vm.dummyUser.email = vm.currentUser.email;
                return;
            }
        }

        data.updateUser(vm.dummyUser)
            .success(function() {
                vm.isEditingName = false;
                vm.isEditingEmail = false;
                alertToast('Saved.', 'success');

                data.getUser()
                    .success(function(data) {
                        vm.dummyUser._id = data._id;
                        vm.dummyUser.name = data.name;
                        vm.dummyUser.email = data.email;
                        vm.currentUser = data;
                        $scope.$parent.currentUser = data;
                    })
                    .error(function(err) {
                        alertToast('Could not load user details. ' + err.message);
                    });
            })
            .error(function(err) {
                alertToast(err.message);
                return;
            });
    };

    vm.changeUserPassword = function() {
        if (typeof vm.changePassword.oldPassword !== 'string' || typeof vm.changePassword.newPassword !== 'string' || typeof vm.changePassword.confirmNewPassword !== 'string' ||
            vm.changePassword.oldPassword.length === 0 || vm.changePassword.newPassword.length === 0 || vm.changePassword.confirmNewPassword.length === 0) {
            alertToast('Please enter your old password, new password and its confirmation.');
            return;
        }

        if (vm.changePassword.newPassword !== vm.changePassword.confirmNewPassword) {
            alertToast('The passwords do not match.');
            return;
        }

        data.changeUserPassword(vm.changePassword)
            .success(function() {
                $('#change-password-modal').modal('hide');
                alertToast('Saved.', 'success');
            })
            .error(function(err) {
                alertToast(err.message);
            });
    };

    vm.removeUser = function() {

        if (typeof vm.removeUserConfirmation.password !== 'string' || vm.removeUserConfirmation.password.length === 0) {
            alertToast('Passeord is required for confirmation.');
            return;
        }

        data.removeUser(vm.removeUserConfirmation.password)
            .success(function() {
                $('#delete-account-modal').modal('hide');
                authentication.logOut();

                swal({
                        title: '',
                        text: 'Deleted.',
                        imageUrl: 'assets/images/animation-removed.gif',
                        confirmButtonText: 'OK'
                    },
                    function() {
                        location.reload();
                    });
            })
            .error(function(err) {
                alertToast(err.message);
            });
    };

    setBackButtonToModalClose();
    setLayout(5);
});
