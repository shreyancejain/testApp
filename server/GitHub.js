var async = require('async');
var GitHubApi = require("github");
var github = new GitHubApi({
    version: "3.0.0",
    headers: {
        "user-agent": "shreyancejain"
    }
});


function getOpenIssuesCount(userName, repoName, startDate, callback) {

    var totalCount = 0;

    function getCount(pageNo) {
        github.issues.repoIssues({
            user: userName,
            repo: repoName,
            state: "open",
            sort: "created",
            direction: "desc",
            page: pageNo,
            per_page: 100,
            since: new Date(startDate).toISOString()
        }, function (err, res) {
            res = res || [];
            var count = res.length;
            if (count === 100) { //checking if more issues available
                totalCount += count;
                getCount(++pageNo);
            } else {
                callback(err, totalCount + count)
            }
        });
    }

    getCount(1)
}


exports.getRepoDetail = function (repoOwner, repoName, callback) {
    var today = new Date();
    var yesterday = today.getTime() - (24 * 3600 * 1000);
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    lastWeek = lastWeek.getTime();

    var tasks = {};
    tasks.totalOpenCount = function (asyncCallback) {
        github.repos.get({
            user: repoOwner,
            repo: repoName
        }, function (err, res) {
            var openIssues = res && res.open_issues || res.open_issues_count;
            asyncCallback(err, openIssues);
        });
    };
    tasks.openWithinADay = function (asyncCallback) {
        getOpenIssuesCount(repoOwner, repoName, yesterday, function (err, count) {
            asyncCallback(err, count);
        });
    };
    tasks.openWithinLastWeek = function (asyncCallback) {
        getOpenIssuesCount(repoOwner, repoName, lastWeek, function (err, count) {
            asyncCallback(err, count)
        });
    };

    async.parallel(tasks, function (err, results) {
        if (err) {
            return callback(err)
        }

        callback(err, results)
    });

};