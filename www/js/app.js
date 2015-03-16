// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('citizen-engagement', ['ionic', 'citizen-engagement.auth', 'citizen-engagement.constants', 'leaflet-directive'])

        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });
        })

        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state('app', {
                        url: "/app",
                        abstract: true,
                        templateUrl: "templates/menu.html",
                        //controller: 'AppCtrl'
                    })
                    .state('app.search', {
                        url: "/search",
                        views: {
                            'menuContent': {
                                templateUrl: "templates/search.html"
                            }
                        }
                    })
                    .state('app.browse', {
                        url: "/browse",
                        views: {
                            'menuContent': {
                                templateUrl: "templates/browse.html"
                            }
                        }
                    })

                    .state('app.newIssue', {
                        url: "/newIssue",
                        views: {
                            'menuContent': {
                                templateUrl: "templates/newIssue.html"
                            }
                        }
                    })

                    .state('app.issueMap', {
                        url: "/issueMap",
                        views: {
                            'menuContent': {
                                templateUrl: "templates/issueMap.html",
                                controller: "MapController"
                            }
                        }
                    })

                    .state('app.myIssues', {
                        url: "/myIssues",
                        views: {
                            'menuContent': {
                                templateUrl: "templates/myIssues.html"
                            }
                        }
                    })

                    .state('app.myAccount', {
                        url: "/myAccount",
                        views: {
                            'menuContent': {
                                templateUrl: "templates/myAccount.html"
                            }
                        }
                    })

                    .state('login', {
                        url: '/login',
                        controller: 'LoginCtrl',
                        templateUrl: 'templates/login.html'
                    })
                    .state('app.issueDetails', {
                        url: '/issueDetails/:issueId',
                        views: {
                            'menuContent': {
                                templateUrl: "templates/issueDetails.html",
                            }
                        }

                    })
                    ;
            // Define the default state (i.e. the first screen displayed when the app opens).
            $urlRouterProvider.otherwise(function ($injector) {
                $injector.get('$state').go('app.issueMap'); // Go to the new issue tab by default.
            });
        })

        .run(function (AuthService, $rootScope, $state) {

            // Listen for the $stateChangeStart event of AngularUI Router.
            // This event indicates that we are transitioning to a new state.
            // We have the possibility to cancel the transition in the callback function.
            $rootScope.$on('$stateChangeStart', function (event, toState) {

                // If the user is not logged in and is trying to access another state than "login"...
                if (!AuthService.currentUserId && toState.name != 'login') {

                    // ... then cancel the transition and go to the "login" state instead.
                    event.preventDefault();
                    $state.go('login');
                }
            });
        })
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
        })

        .controller("MapController", function ($state, $scope, mapboxMapId, mapboxAccessToken, IssueService) {

            var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
            mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxAccessToken;
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
                angular.forEach(issues, function (issue, key) {
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
                })
            });
            $scope.backToMap = function () {
                $state.go('app.issueMap');
            }
        })

        .controller("IssueController", function ($state, $scope, IssueService) {
            $scope.issues = [];
            var issueList = IssueService.getIssues();
            issueList.success(function (issues) {
                angular.forEach(issues, function (issue, key) {
                    $scope.issues.push({
                        id: issue.id,
                        description: issue.description,
                        img: issue.imageUrl
                    });
                })
                $scope.issueDetails = function (issue) {
                    $state.go('app.issueDetails', {issueId: issue});
                };
            });
        })

        .controller("IssueDetailsController", function ($scope, $stateParams, IssueService) {
            $scope.issue;
            IssueService.getIssue($stateParams.issueId).success(function (issue) {
                $scope.issue = issue;
                $scope.formatDate = function (date) {
                    var dateOut = new Date(date);
                    return dateOut; 
                };
                $scope.getMap = function(cord) {
                    console.log(cord)
                }
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
        })

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


        });
;
