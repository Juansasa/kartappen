(function() {
    'use strict';
    angular.module('mapJ')
        .controller('MapJController', mapJ);

    /*@ngInject*/
    function mapJ($scope, geolocation, usSpinnerService, mapJService, $timeout) {
        // Exposed variables
        $scope.userPosition = {
            id: 'userLocationID',
            options: {
                visible: false
            }
        };
        $scope.polygons = [];
        $scope.map = null;

        $scope.destination = 'S:t Eriksgatan, Stockholm, Sweden';
        $scope.origin = 'stockholm, sweden';
        $scope.travelMode = google.maps.TravelMode.DRIVING;

        // Exposed functions
        $scope.toogleBusinessAreas = toogleBusinessAreas;

        $scope.$on('mapInitialized', function(event, map) {
            $scope.map = map;

            // Init map options
            map.setOptions({
                zoom: 15,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.TOP_CENTER
                },
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                scaleControl: true,
                streetViewControl: true,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP
                }
            });
            // initialize map area
            initBusinessAreas();

            // Fetch the user location
            initUserPosition(map);

            console.log(map);
        });

        function toogleBusinessAreas(id) {
            if ($scope.map === null) {
                return;
            }

            if (id === undefined || !id) {
                _.each($scope.map.shapes, function(shape) {
                    shape.setMap(shape.getMap() ? null : $scope.map);
                });
            } else {
                $scope.map.shapes[id].setMap($scope.map.shapes[id] ? null : $scope.map.shapes[id].setMap($scope.map));
            }
        }

        function initBusinessAreas() {
            $scope.polygons = mapJService.getAreas();
        }

        function initUserPosition(map) {
            $timeout(function() {
                geolocation.getLocation()
                    .then(function(data) {
                        $scope.userPosition.coordinate = [data.coords.latitude, data.coords.longitude];
                        $scope.userPosition.options = {
                            visible: true,
                            clickable: true,
                            draggable: true,
                        };
                        map.setCenter(new google.maps.LatLng(data.coords.latitude, data.coords.longitude));

                        // Turn off loading spinner
                        usSpinnerService.stop('userLocationLoading');
                    });
            }, 100);
        }

        function zoomToBounds(map, bounds) {
            map.fitBounds(bounds);
                map.setZoom(15);
        }
    }
})();