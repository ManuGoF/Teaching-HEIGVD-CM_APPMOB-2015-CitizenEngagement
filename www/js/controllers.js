angular.module('citizen-engagement.controllers', ['citizen-engagement.constants', 'citizen-engagement.services', 'citizen-engagement.auth', 'geolocation', 'citizen-engagement.directives'])

        .controller("MapController", function ($state, $scope, mapboxMapId, mapboxAccessToken, IssueService, geolocation, $ionicLoading, leafletData) {



            $ionicLoading.show({
                template: '<ion-spinner icon="ios"></ion-spinner>'
            });

            var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
            mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}@2x.png?access_token=" + mapboxAccessToken;
            $scope.mapDefaults = {
                tileLayer: mapboxTileLayer
            };

            var markerVersion = 1;
            $scope.mapMarkers = {};

            $scope.mapCenter = {
                lat: 46.381907,
                lng: 6.239630,
                zoom: 14
            };

            leafletData.getMap().then(function (map) {

                if (map._controlCorners.bottomleft.childElementCount === 0) {
                    L.control.locate({position: 'bottomleft', follow: true}).addTo(map);
                }


            });




            var issueList = IssueService.getIssues({});
            issueList.success(function (issues) {
                angular.forEach(issues, function (issue) {
                    //console.log(issue.description)
                    $scope.mapMarkers[markerVersion + ':' + issue.id] = {
                        lat: issue.lat,
                        lng: issue.lng,
                        message: '<p>{{issue.description}}</p><img ng-src="{{issue.imageUrl}}" fallback-src="img/default.png" width="200px" /><a class="button icon-right ion-chevron-right button-calm" ng-controller="IssueMarkerController" ng-click="issueDetails(issue.id)">Details</a>',
                        getMessageScope: function () {
                            var scope = $scope.$new();
                            scope.issue = issue;
                            return scope;
                        }
                    };
                });
                $ionicLoading.hide();
            });

            $scope.backToMap = function () {
                $state.go('app.issueMap');
            };

            $scope.$on("issueFilterEvent", function (event, issues) {
//                console.log("IssueFilterEvent")
                markerVersion++;
                $scope.mapMarkers = {};
                angular.forEach(issues, function (issue) {

                    $scope.mapMarkers[markerVersion + ':' + issue.id] = {
                        lat: issue.lat,
                        lng: issue.lng,
                        message: '<p>{{issue.description}}</p><img ng-src="{{issue.imageUrl}}" fallback-src="img/default.png" width="200px" /><a class="button icon-right ion-chevron-right button-calm" ng-controller="IssueMarkerController" ng-click="issueDetails(issue.id)">Details</a>',
                        getMessageScope: function () {
                            var scope = $scope.$new();
                            scope.issue = issue;
                            return scope;
                        }
                    };
                });
            })
        })

        .controller("MapPickerController", function ($state, $scope, mapboxMapId, mapboxAccessToken, IssueService, geolocation) {

            var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
            mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}@2x.png?access_token=" + mapboxAccessToken;
            $scope.mapDefaults = {
                tileLayer: mapboxTileLayer
            };
            $scope.mapCenter = {
                lat: 52.7752435,
                lng: 6.638055,
                zoom: 14
            };

            $scope.mapMarkers = [];

            geolocation.getLocation().then(function (data) {
                $scope.mapCenter.lat = data.coords.latitude;
                $scope.mapCenter.lng = data.coords.longitude;
                $scope.mapMarkers.push({
                    lat: data.coords.latitude,
                    lng: data.coords.longitude,
                    draggable: true

                });
            }, function (error) {
                $log.error("Could not get location: " + error);
            });
            return mapMarkers = $scope.mapMarkers;
            $scope.backToMap = function () {
                $state.go('app.issueMap');
            };
        })


        .controller("IssueController", function ($state, $scope, $log, IssueService, geolocation, $rootScope) {

            $scope.search = {type: "", radius: "", text: "", geoData: {}};
            var geoData = {};
            $scope.radiusPlaceholder = "Searching position...";

            geolocation.getLocation().then(function (data) {
                geoData.lat = data.coords.latitude;
                geoData.lng = data.coords.longitude;
                $scope.radiusPlaceholder = "Search by radius [meter]";
                $scope.positionFound = true;
            }, function (error) {
                $log.error("Could not get location: " + error);
                $scope.radiusPlaceholder = "Not accessible position..";
            });

            var issueList = IssueService.getIssues($scope.search);
            issueList.success(function (issues) {
                $scope.issues = issues;
            });

            $scope.$watch("search", function (search) {
//                console.log("Etape 1: IssueController, scope WATCH");
                search.geoData = geoData;
//                console.log(search);
                IssueService.getIssues(search).success(function (issues) {
                    $scope.issues = issues;
                    $rootScope.$broadcast("issueFilterEvent", issues);

                });
            }, true);


        })

        .controller("IssueMarkerController", function ($state, $scope, IssueTypeService) {

            $scope.issueDetails = function (issue) {
                $state.go('app.issueDetails', {issueId: issue});
            };


        })

        .controller("IssueTypeController", function ($state, $scope, IssueTypeService) {

            var issueTypeList = IssueTypeService.getIssueTypes();
            issueTypeList.success(function (issuetypes) {
                $scope.issuetypes = issuetypes;
//                console.log(issuetypes);
            });


        })
        .controller("IssuesByUserController", function ($state, $scope, IssuesByUserService, AuthService) {
            $scope.doRefresh = function () {
                IssuesByUserService.getIssuesByUser(AuthService.currentUserId)
                        .success(function (issuesByUser) {
                            $scope.issues = issuesByUser;
                        })
                        .finally(function () {
                            // Stop the ion-refresher from spinning
                            $scope.$broadcast('scroll.refreshComplete');
                        });
            }
            var issueTypeList = IssuesByUserService.getIssuesByUser(AuthService.currentUserId);
            issueTypeList.success(function (issuesByUser) {
                $scope.issues = issuesByUser;
            });
            $scope.issueDetails = function (issue) {
                $state.go('app.ownIssueDetails', {issueId: issue});
            };


        }
        )

        .controller("IssueDetailsController", function ($scope, $stateParams, IssueService, mapboxMapId, mapboxAccessToken) {
            $scope.visibility = 'ng-hide';
            $scope.issue;
            $scope.doRefresh = function () {
                IssueService.getIssue($stateParams.issueId)
                        .success(function (issue) {
                            $scope.issue = issue;
                        })
                        .finally(function () {
                            // Stop the ion-refresher from spinning
                            $scope.$broadcast('scroll.refreshComplete');
                        });
            }

            IssueService.getIssue($stateParams.issueId).success(function (issue) {
                $scope.issue = issue;
                $scope.formatDate = function (date) {
                    var dateOut = new Date(date);
                    return dateOut;
                };
                $scope.getMap = function (lat, lng) {
                    return "http://api.tiles.mapbox.com/v4/" + mapboxMapId + "/pin-s-star+f44(" + lat + "," + lng + ",14)/" + lat + "," + lng + ",14/268x357@2x.png?access_token=" + mapboxAccessToken + "";
                };

                $scope.setVisibility = function () {
                    if ($scope.visibility === 'ng-hide') {
                        $scope.visibility = 'ng-show';
                    } else {
                        $scope.visibility = 'ng-hide';
                    }
                };
                $scope.input = {};
                $scope.addComment = function () {

                    if ($scope.input.comment !== undefined) {
                        IssueService.addComment($stateParams.issueId, $scope.input.comment).success(function (commentedIssue) {
                            console.log(commentedIssue);

                            $scope.issue = commentedIssue;
                            $scope.input.comment = "";
                        });
                    }


                };
            });
        })

        .controller("IssueActionDetailsController", function ($state, $scope, $stateParams, IssueService, ActionService, mapboxMapId, mapboxAccessToken) {
            $scope.visibility = 'ng-hide';
            $scope.doRefresh = function () {
                IssueService.getIssue($stateParams.issueId)
                        .success(function (issue) {
                            $scope.issue = issue;
                        })
                        .finally(function () {
                            // Stop the ion-refresher from spinning
                            $scope.$broadcast('scroll.refreshComplete');
                        });
            }
            IssueService.getIssue($stateParams.issueId).success(function (issue) {
                console.log(issue);
                $scope.issue = issue;
                $scope.formatDate = function (date) {
                    var dateOut = new Date(date);
                    return dateOut;
                };
                $scope.getMap = function (lat, lng) {
                    return "http://api.tiles.mapbox.com/v4/" + mapboxMapId + "/pin-s-star+f44(" + lat + "," + lng + ",14)/" + lat + "," + lng + ",14/268x357@2x.png?access_token=" + mapboxAccessToken + "";
                };
                $scope.setVisibility = function () {
                    if ($scope.visibility === 'ng-hide') {
                        $scope.visibility = 'ng-show';
                    } else {
                        $scope.visibility = 'ng-hide';
                    }
                };
                $scope.input = {};
                $scope.addComment = function () {

                    if ($scope.input.comment !== undefined) {
                        IssueService.addComment($stateParams.issueId, $scope.input.comment).success(function (commentedIssue) {
                            $scope.issue = commentedIssue;
                            $scope.input.comment = "";
                        });
                    }


                };
            });

            ActionService.getActions($stateParams.issueId).success(function (actions) {
                $scope.actions = actions;
            });
            $scope.backToMyIssues = function () {
                $state.go('app.myIssues');
            };


        })

        .controller('MenuController', function ($scope, $state, $ionicScrollDelegate) {
            $scope.toggleSearch = function () {
                if (!$scope.searchVisible) {
                    $scope.searchVisible = true;
                    $ionicScrollDelegate.scrollTop();
                }
                else {
                    $scope.searchVisible = false;
                }
            };
            /*
             $scope.showTextSearch = function () {
             $scope.textSearchVisible = true;
             $scope.radiusSearchVisible = false;
             $scope.typeSearchVisible = false;
             $scope.showMineOnly = false;
             };
             
             $scope.showRadiusSearch = function () {
             $scope.textSearchVisible = false;
             $scope.radiusSearchVisible = true;
             $scope.typeSearchVisible = false;
             $scope.showMineOnly = false;
             };
             
             $scope.showTypeSearch = function () {
             $scope.textSearchVisible = false;
             $scope.radiusSearchVisible = false;
             $scope.typeSearchVisible = true;
             $scope.showMineOnly = false;
             };
             
             $scope.showMineIssues = function () {
             $scope.textSearchVisible = false;
             $scope.radiusSearchVisible = false;
             $scope.typeSearchVisible = false;
             $scope.showMineOnly = true;
             };*/

            /*            $scope.blankField = function () {
             $scope.textPlaceholder = "";
             };*/
        })

        .controller('myAccount', function ($scope, $state, AuthService, UserService) {
            $scope.doRefresh = function () {
                UserService.getUser(AuthService.currentUserId).success(function (user) {
                    $scope.user = user;
                    $scope.lastlogin = AuthService.lastLogin;
                })
                        .finally(function () {
                            // Stop the ion-refresher from spinning
                            $scope.$broadcast('scroll.refreshComplete');
                        });
            }

            UserService.getUser(AuthService.currentUserId).success(function (user) {
                $scope.user = user;
                $scope.lastlogin = AuthService.lastLogin;
            })

        })

        .controller('CreateIssue', function ($scope, $state) {
            $scope.createIssue = function () {
                $state.go('app.newIssue');
            };
        })


        .controller('CameraController', function ($state, $scope, CameraService, $ionicPopup, qimgUrl, qimgToken, $http, IssueService, UserService, AuthService) {
            imageUrl = "img/camera.png";
            $scope.imageUrl = imageUrl;
            $scope.input = {};




            UserService.getUser(AuthService.currentUserId).success(function (user) {
                $scope.user = user;
            });

            $scope.createIssue = function () {
                if (imageUrl !== "img/camera.png" && $scope.input.description !== undefined && $scope.input.issueTypeId !== undefined) {
                    IssueService.createIssue($scope.input.description, mapMarkers[0].lng, mapMarkers[0].lat, imageUrl, $scope.input.issueTypeId).success(function (data) {
                        $state.go('app.ownIssueDetails', {issueId: data.id});
                    });
                } else if (imageUrl === "img/camera.png") {
                    console.log($scope.input.issueTypeId);
                    console.log($scope.input.description);
                    $ionicPopup.alert({title: "Do you really want to be a good citizen?", subTitle: "Looks like you forgot step 1"});
                } else {
                    $ionicPopup.alert({title: "Do you really want to be a good citizen?", subTitle: "Looks like you forgot something in step 3"});
                }


            };




            $scope.showPopup = function () {
                $scope.data = {};



                // An elaborate, custom popup
                $ionicPopup.show({
                    title: 'Please choose the source of your pic',
                    subTitle: 'Either your photo stream or camera',
                    buttons: [
                        {
                            text: '<img width="30%" src="img/stream.png">',
                            type: 'button-positive',
                            onTap: function (e) {
                                CameraService.getPicture({
                                    quality: 75,
                                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                                    targetWidth: 400,
                                    targetHeight: 300,
                                    destinationType: Camera.DestinationType.DATA_URL
                                }).then(function (imageData) {
                                    $http({
                                        method: "POST",
                                        url: qimgUrl + "/images",
                                        headers: {
                                            Authorization: "Bearer " + qimgToken,
                                            'Content-Type': 'application/json'
                                        },
                                        data: {
                                            data: imageData
                                        }
                                    }).success(function (data) {
                                        imageUrl = data.url;
                                        $scope.imageUrl = imageUrl;

                                    });
                                });




                            }
                        },
                        {
                            text: '<img width="30%" src="img/camera2.png">',
                            type: 'button-positive',
                            onTap: function (e) {
                                CameraService.getPicture({
                                    quality: 75,
                                    sourceType: Camera.PictureSourceType.CAMERA,
                                    targetWidth: 400,
                                    targetHeight: 300,
                                    destinationType: Camera.DestinationType.DATA_URL
                                }).then(function (imageData) {
                                    $http({
                                        method: "POST",
                                        url: qimgUrl + "/images",
                                        headers: {
                                            Authorization: "Bearer " + qimgToken,
                                            'Content-Type': 'application/json'
                                        },
                                        data: {
                                            data: imageData
                                        }
                                    }).success(function (data) {
                                        imageUrl = data.url;
                                        $scope.imageUrl = imageUrl;

// do something with imageUrl
                                    });
                                });


//                                $http({
//                                    method: "POST",
//                                    url: qimgUrl + "/images",
//                                    headers: {
//                                        Authorization: "Bearer " + qimgToken,
//                                        'Content-Type': 'application/json'
//                                    },
//                                    data: {
//                                        data: "imageData"
//                                    }
//                                }).success(function (data) {
//                                    imageUrl = data.url;
//                                    $scope.imageUrl = imageUrl;
//
//
//                                });


                            }
                        }
                    ]
                });

            };




        });













