angular.module('citizen-engagement.services', ['citizen-engagement.constants'])

        .factory("IssueService", function ($http, apiUrl) {
            return {
                getIssues: function (search) {
                    console.log(search);

//                    if (search.type !== "") {
//                        console.log('recherche');
//                    }
//                    else {
                    return $http({
                        url: apiUrl + "/issues"
                    });
//                    }
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

        .factory("IssuesByUserService", function ($http, apiUrl) {
            return {
                getIssuesByUser: function (owner_id) {
                    console.log(owner_id)
                    return $http({
                        url: apiUrl + "/issues/search",
                        method: "POST",
                        data: '{"_owner":"' + owner_id + '"}'
                    });
                }
            };
        })

        .factory("ActionService", function ($http, apiUrl) {
            return {
                getActions: function (issueId) {
                    return $http({
                        url: apiUrl + "/issues/" + issueId + "/actions"
                    });
                }
            };
        })

        .factory("CameraService", function ($q) {
            return {
                getPicture: function (options) {
                    var deferred = $q.defer();
                    navigator.camera.getPicture(function (result) {
// do any magic you need
                        deferred.resolve(result);
                    }, function (err) {
                        deferred.reject(err);
                    }, options);
                    return deferred.promise;
                }
            }
        });
;
        