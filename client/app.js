'use strict';

angular.module('myApp', [])
    .controller('RepoController', function ($scope, $http) {
        var self = this;
        self.getDetails = function (repoUrl) {

            $http.get('/getRepoDetails?repoUrl=' + repoUrl).success(function (data) {
                self.issues = data.response;
            }).error(function (err) {
                console.log("error occurred while getting task list");
            })
        };
    });
