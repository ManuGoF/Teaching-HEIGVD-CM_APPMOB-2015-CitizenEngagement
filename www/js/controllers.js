angular.module('citizen-engagement.controllers', ['citizen-engagement.constants', 'citizen-engagement.services', 'citizen-engagement.auth'])

        .controller("MapController", function ($state, $scope, mapboxMapId, mapboxAccessToken, IssueService) {

            var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
            mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}@2x.png?access_token=" + mapboxAccessToken;
            $scope.mapDefaults = {
                tileLayer: mapboxTileLayer
            };
            $scope.mapCenter = {
                lat: 46.7752435,
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
            $scope.backToMap = function () {
                $state.go('app.issueMap');
            };
        })

        .controller("IssueController", function ($state, $scope, IssueService) {

            var issueList = IssueService.getIssues();
            issueList.success(function (issues) {
                $scope.issues = issues;
            });
            $scope.issueDetails = function (issue) {
                $state.go('app.issueDetails', {issueId: issue});
            };
        })

        .controller("IssueTypeController", function ($state, $scope, IssueTypeService) {
            
            var issueTypeList = IssueTypeService.getIssueTypes();
            issueTypeList.success(function(issuetypes){
                $scope.issuetypes = issuetypes;
                console.log(issuetypes);
            });
            
            
        })
        .controller("IssuesByUserController", function ($state, $scope, IssueTypeService, AuthService) {
            
            var issueTypeList = IssueTypeService.getIssuesByUser(AuthService.currentUserId);
            issueTypeList.success(function(issuesByUser){
                //$scope.issuetypes = issuetypes;
                console.log(issuesByUser);
            });
            
            
        })

        .controller("IssueDetailsController", function ($scope, $stateParams, IssueService, mapboxMapId, mapboxAccessToken) {
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
            });
        })

        .controller('MenuController', function ($scope, $state) {
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
