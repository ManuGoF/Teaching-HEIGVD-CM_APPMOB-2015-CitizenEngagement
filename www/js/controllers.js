angular.module('citizen-engagement.controllers', ['citizen-engagement.constants', 'citizen-engagement.services', 'citizen-engagement.auth', 'geolocation'])

        .controller("MapController", function ($state, $scope, mapboxMapId, mapboxAccessToken, IssueService, geolocation) {

            var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
            mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}@2x.png?access_token=" + mapboxAccessToken;
            $scope.mapDefaults = {
                tileLayer: mapboxTileLayer
            };

            $scope.mapMarkers = [];
                $scope.mapCenter = {
                    lat: 52.7752435,
                    lng: 6.638055,
                    zoom: 14
                };

            var geolocPromise = geolocation.getLocation().then(function (data) {
                $scope.mapCenter = {};
                $scope.mapCenter.lat = data.coords.latitude;
                $scope.mapCenter.lng = data.coords.longitude;
                $scope.mapCenter.zoom = 14;
            }, function (error) {
                $log.error("Could not get location: " + error);
                $scope.mapCenter = {
                    lat: 52.7752435,
                    lng: 6.638055,
                    zoom: 14
                };
            });

               var issueList = IssueService.getIssues({});
                issueList.success(function (issues) {
                    console.log("I have " + issues.length + " issues to display on the map");
                    angular.forEach(issues, function (issue) {
                        $scope.mapMarkers.push({
                            lat: issue.lat,
                            lng: issue.lng,
                            message: '<p>{{ issue.description }}</p><img src="{{ issue.imageUrl }}" width="200px" /><a class="button icon-right ion-chevron-right button-calm" ng-controller="IssueController" ng-click="issueDetails(issue.id)">Details</a>',
                            getMessageScope: function () {
                                var scope = $scope.$new();
                                scope.issue = issue;
                                return scope;
                            }
                        });
                    });
                });


            console.log($scope.mapCenter);
            $scope.backToMap = function () {
                $state.go('app.issueMap');
            };
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


        .controller("IssueController", function ($state, $scope, $log, IssueService, geolocation) {

            $scope.search = {type: "", radius: "", text: "", geoData: {}};
            var geoData = {};
            $scope.radiusPlaceholder = "Searching position...";

            geolocation.getLocation().then(function (data) {
                geoData.lat = data.coords.latitude;
                geoData.lng = data.coords.longitude;
                $scope.radiusPlaceholder = "Search by radius";
                $scope.positionFound = true;
            }, function (error) {
                $log.error("Could not get location: " + error);
                $scope.radiusPlaceholder = "Not accessible position..";
            }); 

            var issueList = IssueService.getIssues($scope.search);
            issueList.success(function (issues) {
                $scope.issues = issues;
            });

            $scope.$watch("search", function(search){
                console.log("Etape 1: IssueController, scope WATCH");
                search.geoData = geoData;
                console.log(search);
                IssueService.getIssues(search).success(function(issues) {
                    $scope.issues = issues;
                });
            }, true);

            $scope.issueDetails = function (issue) {
                $state.go('app.issueDetails', {issueId: issue});
            };
        })

        .controller("IssueTypeController", function ($state, $scope, IssueTypeService) {

            var issueTypeList = IssueTypeService.getIssueTypes();
            issueTypeList.success(function (issuetypes) {
                $scope.issuetypes = issuetypes;
                console.log(issuetypes);
            });


        })
        .controller("IssuesByUserController", function ($state, $scope, IssuesByUserService, AuthService) {

            var issueTypeList = IssuesByUserService.getIssuesByUser(AuthService.currentUserId);
            issueTypeList.success(function (issuesByUser) {
                $scope.issues = issuesByUser;
            });
            $scope.issueDetails = function (issue) {
                $state.go('app.ownIssueDetails', {issueId: issue});
            };


        })

        .controller("IssueDetailsController", function ($scope, $stateParams, IssueService, mapboxMapId, mapboxAccessToken) {
            $scope.visibility = 'ng-hide';
            $scope.issue;
            IssueService.getIssue($stateParams.issueId).success(function (issue) {
                $scope.issue = issue;
                $scope.formatDate = function (date) {
                    var dateOut = new Date(date);
                    return dateOut;
                };
                $scope.getMap = function (lat, lng) {
                    return "http://api.tiles.mapbox.com/v4/" + mapboxMapId + "/pin-s-star+f44(" + lat + "," + lng + ",14)/" + lat + "," + lng + ",14/500x300@2x.png?access_token=" + mapboxAccessToken + "";
                };
                $scope.setVisibility = function () {
                    if ($scope.visibility === 'ng-hide') {
                        $scope.visibility = 'ng-show';
                    } else {
                        $scope.visibility = 'ng-hide';
                    }
                };
            });
        })

        .controller("IssueActionDetailsController", function ($state, $scope, $stateParams, IssueService, ActionService, mapboxMapId, mapboxAccessToken) {
            $scope.visibility = 'ng-hide';
            IssueService.getIssue($stateParams.issueId).success(function (issue) {
                $scope.issue = issue;
                $scope.formatDate = function (date) {
                    var dateOut = new Date(date);
                    return dateOut;
                };
                $scope.getMap = function (lat, lng) {
                    return "http://api.tiles.mapbox.com/v4/" + mapboxMapId + "/pin-s-star+f44(" + lat + "," + lng + ",14)/" + lat + "," + lng + ",14/500x300@2x.png?access_token=" + mapboxAccessToken + "";
                };
                $scope.setVisibility = function () {
                    if ($scope.visibility === 'ng-hide') {
                        $scope.visibility = 'ng-show';
                    } else {
                        $scope.visibility = 'ng-hide';
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
            };
        })

        .controller('CreateIssue', function ($scope, $state) {
            $scope.createIssue = function () {
                $state.go('app.newIssue');
            };
        })

        .controller('CameraController', function ($scope, CameraService, $ionicPopup, qimgUrl, qimgToken, $http, IssueService) {

            $scope.imageUrl = "img/camera.png";


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
                                var options = {
                                    maximumImagesCount: 10,
                                    width: 800,
                                    height: 800,
                                    quality: 80
                                };


                                window.imagePicker.getPictures(options)
                                        .then(function (results) {
                                            for (var i = 0; i < results.length; i++) {
                                                console.log('Image URI: ' + results[i]);
                                            }
                                        }, function (error) {
                                            // error getting photos
                                        });

                            }
                        },
                        {
                            text: '<img width="30%" src="img/camera2.png">',
                            type: 'button-positive',
                            onTap: function (e) {
//                                CameraService.getPicture({
//                                    quality: 75,
//                                    targetWidth: 400,
//                                    targetHeight: 300,
//                                    destinationType: Camera.DestinationType.DATA_URL
//                                }).then(function (imageData) {
//                                    $http({
//                                        method: "POST",
//                                        url: qimgUrl + "/images",
//                                        headers: {
//                                            Authorization: "Bearer " + qimgToken,
//                                            'Content-Type': 'application/json'
//                                        },
//                                        data: {
//                                            data: imageData
//                                        }
//                                    }).success(function (data) {
//                                        var imageUrl = data.url;
//                                        $scope.imageUrl = imageUrl;
//                                        console.log(mapMarkers);
//
//// do something with imageUrl
//                                    });
//                                });


                                $http({
                                    method: "POST",
                                    url: qimgUrl + "/images",
                                    headers: {
                                        Authorization: "Bearer " + qimgToken,
                                        'Content-Type': 'application/json'
                                    },
                                    data: {
                                        data: "imageData"
                                    }
                                }).success(function (data) {
                                    var imageUrl = data.url;
                                    $scope.imageUrl = imageUrl;
                                    console.log(mapMarkers[0].lat, mapMarkers[0].lng);

                                });


                            }
                        }
                    ]
                });

            };


        });
