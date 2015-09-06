'use strict';

angular.module('myApp', [])
    .controller('RepoController', function ($scope, $http) {
        var self = this;
        self.getDetails = function (repoUrl) {

            $http.get('/getRepoDetails?repoUrl=' + repoUrl).success(function (data) {
                self.issues = data;
                console.log(self.issues)
            }).error(function (err) {
                console.log(err);
                var msg = "Some Error Occurred";
                if (err.code === 404) {
                    msg = 'Repository not found, or may be Private';
                }
                alert(msg);
            });
        };
    });
