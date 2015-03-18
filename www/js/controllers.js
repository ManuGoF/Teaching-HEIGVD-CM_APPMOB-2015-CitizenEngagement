angular.module('citizen-engagement.controllers', ['citizen-engagement.constants', 'citizen-engagement.services', 'citizen-engagement.auth', 'geolocation', ])

        .controller("MapController", function ($state, $scope, mapboxMapId, mapboxAccessToken, IssueService, geolocation) {

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
            var issueList = IssueService.getIssues();
            issueList.success(function (issues) {
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
            geolocation.getLocation().then(function (data) {
                $scope.mapCenter.lat = data.coords.latitude;
                $scope.mapCenter.lng = data.coords.longitude;
            }, function (error) {
                $log.error("Could not get location: " + error);
            });
            console.log($scope.mapCenter);
            $scope.backToMap = function () {
                $state.go('app.issueMap');
            };
        })

        .controller("IssueController", function ($state, $scope, IssueService) {

            $scope.search = {type: "", radius: "", text: ""};

            var issueList = IssueService.getIssues($scope.search);
            issueList.success(function (issues) {
                $scope.issues = issues;
            });

            $scope.$watch("search", function (search) {
                console.log(search.type);
                IssueService.getIssues(search).success(function (issues) {
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
        });