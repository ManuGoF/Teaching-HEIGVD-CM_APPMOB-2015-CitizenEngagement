angular.module('citizen-engagement')
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
                                templateUrl: "templates/newIssue.html",
                                controller: "CameraController",
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
                                templateUrl: "templates/issueDetails.html"
                            }
                        }

                    })
                    .state('app.ownIssueDetails', {
                        url: '/ownIssueDetails/:issueId',
                        views: {
                            'menuContent': {
                                templateUrl: "templates/ownIssueDetails.html"
                            }
                        }

                    })
                    ;
            // Define the default state (i.e. the first screen displayed when the app opens).
            $urlRouterProvider.otherwise(function ($injector) {
                $injector.get('$state').go('app.issueMap'); // Go to the new issue tab by default.
            });
        });