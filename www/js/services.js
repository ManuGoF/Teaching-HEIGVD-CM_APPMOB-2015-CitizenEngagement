angular.module('citizen-engagement.services', ['citizen-engagement.constants'])

        .factory("IssueService", function ($http, apiUrl) {
            return {
                getIssues: function (search) {
                    /*                    console.log("Etape 2: IssueService");
                     console.log(search.type);
                     console.log(search.radius);
                     console.log(search.text);
                     console.log(search.geoData);*/


                    if (search === undefined) {
                        search = {};
                    }
                    if (search.type === undefined) {
                        search.type = "";
                    }
                    if (search.text === undefined) {
                        search.text = "";
                    }
                    if (search.radius === undefined) {
                        search.radius = "";
                    }
                    if (search.geoData === undefined) {
                        search.geoData = {};
                    }

                    var dataSearch = {
                        $and: []
                    };

                    if (search.text !== "") {
                        dataSearch.$and.push({'description': {'$regex': search.text, '$options': "si"}});
                    }

                    if (search.type !== "") {
                        dataSearch.$and.push({_issueType: search.type});
                    }

                    if (search.radius !== "") {
                        dataSearch.$and.push({loc: {'$geoWithin': {
                                    '$centerSphere': [[search.geoData.lng, search.geoData.lat], search.radius / 0.62137 / 1000 / 3959]
                                }}});
                    }

                    if (dataSearch.$and.length == 0) {
                        dataSearch = {};
                    }

                    return $http({
                        url: apiUrl + "/issues/search",
                        method: "POST",
                        data: dataSearch,
                        headers: {
                            'x-pagination': '0' + ';*'

                        }
                    }).success(function (data) {
//                        console.log(data);
                    });
                },
                getIssue: function (issueId) {
                    return $http({
                        url: apiUrl + "/issues/" + issueId
                    });
                },
                createIssue: function (description, lng, lat, imageUrl, issueTypeId) {
                    return $http({
                        method: 'POST',
                        url: apiUrl + '/issues',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data:
                                {
                                    description: description,
                                    lng: lng,
                                    lat: lat,
                                    imageUrl: imageUrl,
                                    issueTypeId: issueTypeId
                                }
                    });
                },
                addComment: function (issueId, comment) {
                    return $http({
                        method: 'POST',
                        url: apiUrl + '/issues/'+ issueId + '/actions',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data:
                                {
                                    type: "comment",
                                    payload: {
                                        text: comment
                                    }
                                }
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
        })

        .factory("UserService", function ($http, apiUrl) {
            return {
                getUser: function (userId) {
                    return $http({
                        url: apiUrl + "/users/" + userId
                    });
                }
            };
        })
        ;
        