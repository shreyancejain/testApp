var async = require('async');
var GitHubApi = require("github");
var github = new GitHubApi({   //initialized instance
    version: "3.0.0",
    headers: {
        "user-agent": "shreyancejain"
    }
});

//function to count openIssues by repoOwner, repoName and date
function getOpenIssuesCount(repoOwner, repoName, startDate, callback) {

    var totalCount = 0;

    function getCount(pageNo) {
        github.issues.repoIssues({
            user: repoOwner,
            repo: repoName,
            state: "open",
            sort: "created",
            direction: "desc",
            page: pageNo,
            per_page: 100,
            since: new Date(startDate).toISOString()
        }, function (err, res) {
            res = res || [];
            for (var count = 0; count < res.length; count++) {  //counting issues actually created before start Date
                if (new Date(res[count].created_at).getTime() < startDate) {
                    break;
                }
            }
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

    //calculating timestamp of a day ago
    var yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    yesterday = yesterday.getTime();

    //calculating date of last Week
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    lastWeek = lastWeek.getTime();

    var tasks = {};
    tasks.totalOpenCount = function (asyncCallback) { // task to fetch all open issues count
        github.repos.get({
            user: repoOwner,
            repo: repoName
        }, function (err, res) {
            var openIssues = res && (res.open_issues || res.open_issues_count);
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

    async.parallel(tasks, function (err, results) { //executing all requests in parallel
        if (err) {
            return callback(err)
        }

        callback(err, results)
    });

};