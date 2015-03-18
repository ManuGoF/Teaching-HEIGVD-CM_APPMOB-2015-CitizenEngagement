angular.module('citizen-engagement.services', ['citizen-engagement.constants'])

        .factory("IssueService", function ($http, apiUrl) {
            return {
                getIssues: function () {
                    return $http({
                        url: apiUrl + "/issues"
                    });
                },
                getIssue: function (issueId) {
                    return $http({
                        url: apiUrl + "/issues/" + issueId
                    });
                }
            };
        })

        .factory("IssueTypeService", function ($http, apiUrl) {
            return {
                getIssueTypes: function () {
                    return $http({
                        url: apiUrl + "/issuetypes"
                    });
                }
                };
        })
        
        .factory("IssueByUserService", function ($http, apiUrl) {
            return {
                getIssuesByUser: function (owner_id) {
                    return $http({
                        url: apiUrl + "/issues/search",
                        method: "POST",
                        data: '{"_owner":"'+owner_id+'"}'
                    });
                }
                };
        });
        