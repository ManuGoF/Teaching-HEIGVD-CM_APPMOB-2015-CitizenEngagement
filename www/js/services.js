angular.module('citizen-engagement.services', ['citizen-engagement.constants'])

        .factory("IssueService", function ($http, apiUrl) {
            return {
                getIssues: function (search) {
                    console.log("Etape 2: IssueService");
                    console.log(search.type);
                    console.log(search.radius);
                    console.log(search.text);
                    console.log(search.geoData);

                      
                    if (search === undefined) {
                        search = {};
                    }
                    if (search.type === undefined) {
                        search.type = "";
                    }
                    if (search.text === undefined) {
                        search.text = "";
                    }
                    if (search.geoData === undefined) {
                        search.geoData = {};
                    }

                    var dataSearch;


                    // Search with type and text
                    if (search.type !== "" && search.text !== "" && search.radius == "") {
                        dataSearch = { $and: [ 
                                {'description': {'$regex': search.text, '$options': "si"}}, 
                                {_issueType: search.type} 
                            ] 
                        };
                    }              

                    // Search with type and text and radius
                    else if (search.type !== "" && search.text !== "" && search.radius !== "") {
                        dataSearch = { $and: [ 
                                {'description': {'$regex': search.text, '$options': "si"}}, 
                                {_issueType: search.type},
                                { loc: {
                                    '$geoWithin': {
                                        '$centerSphere' : [
                                        [ search.geoData.lng , search.geoData.lat ], search.radius/0.62137/3959 ]
                                    }
                                }
                            }] 
                        };
                    }

                    // Search with text only
                    if (search.text !== "") {
                        dataSearch = {'description': {'$regex': search.text, '$options': "si"}};
                    }

                    // Search with type only
                    else if (search.type !== "") {
                        dataSearch = {_issueType: search.type};
                    }

                    // Search with radius only
                    else if (search.radius !== "") {
                        dataSearch = {
                                loc: {
                                    '$geoWithin': {
                                        '$centerSphere' : [
                                        [ search.geoData.lng , search.geoData.lat ], search.radius/0.62137/3959 ]
                                }
                            }
                        };
                    }

                    else {
                        dataSearch = {};
                    }

                    return $http({
                        url: apiUrl + "/issues/search",
                        method: "POST",
                        data: dataSearch,
                        headers:{
                            'x-pagination': '0;*'
                        }
                    }).success(function(data){
                        console.log(data);
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
        
        .factory("IssuesByUserService", function ($http, apiUrl) {
            return {
                getIssuesByUser: function (owner_id) {
                    return $http({
                        url: apiUrl + "/issues/search",
                        method: "POST",
                        data: '{"_owner":"'+owner_id+'"}'
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
        