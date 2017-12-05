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

    window.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };

    data.getUsageData()
        .success(function(data) {

            console.log(data.userResults);

            var randomScalingFactor = function() {
                return Math.round(Math.random() * 100);
            };

            var chartData = {
                labels: ["Early morning", "Morning", "Noon", "Evening", "Night"],
                datasets: [{
                    type: 'line',
                    label: 'Your Usage',
                    borderColor: window.chartColors.blue,
                    borderWidth: 2,
                    fill: false,
                    data: data.otherResults
                }, {
                    type: 'bar',
                    label: 'Other users\' Usage',
                    backgroundColor: window.chartColors.red,
                    data: data.userResults,
                    borderColor: 'white',
                    borderWidth: 2
                }]
            };

            var ctx = document.getElementById("usage-canvas").getContext("2d");
            window.myMixedChart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Usage Statistics'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: true
                    }
                }
            });

        })
        .error(function(err) {
            alertToast(err.message);
            return;
        });

    data.getFavoriteTags()
        .success(function(newData) {
            console.log(newData);

            var data = [];
            var labels = [];

            for (var i = 0; i < newData.length; i++) {
                data.push(newData[i].data);
                labels.push(newData[i]._id.label);
            }

            var config = {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            window.chartColors.red,
                            window.chartColors.orange,
                            window.chartColors.yellow,
                            window.chartColors.green,
                            window.chartColors.blue,
                        ],
                        label: 'Dataset'
                    }],
                    labels: labels
                },
                options: {
                    responsive: true,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Hot Topics'
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            };
            var ctx = document.getElementById("tags-canvas").getContext("2d");
            window.myDoughnut = new Chart(ctx, config);

        })
        .error(function(err) {
            alertToast(err.message);
            return;
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
                        vm.$parent.currentUser = data;
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
            alertToast('Password is required for confirmation.');
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
