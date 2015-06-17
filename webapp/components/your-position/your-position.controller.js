(function() {
    'use strict';
    angular.module('your-position')
        .controller('YourPositionController', mapJ);

    /*@ngInject*/
    function mapJ($scope, geolocation, GeoCoder, usSpinnerService, MAP_IDS, offices, $filter) {
        offices.all().then(initOfficeData).then(initControls);


        function initOfficeData(data) {
            var officesJson = Papa.parse(data.data, {
                header: true,
                dynamicTyping: true
            });

            return $filter('valid')(officesJson.data);
        }

        function initControls(data) {
            $scope.locationField = [{
                type: 'location-search',
                key: 'locationSearch',
                templateOptions: {
                    placeholder: 'Enter your location',
                    placeChanged: function(v) {
                        console.log(v);
                    },
                    userLocationChanged: function(cords) {
                        console.log(cords);
                    }
                }
            }];

            $scope.officeSearchField = [{
                type: 'office-search',
                key: 'officeSearch',
                templateOptions: {
                    options: data
                }
            }];

            $scope.model.MOFilter = $filter('MO')(data);
            $scope.MOfilter = [{
                className: 'horisontalCheckbox',
                key: 'MOFilter',
                type: 'horizontalCheckbox',
                templateOptions: {
                    options: _.map($scope.model.MOFilter, function(item) {
                        return {
                            name: item,
                            value: item
                        };
                    }),
                    onBlur: function(v, o, s) {
                        console.log(s);
                    }
                }
            }];

            return data;
        }


        // Variables
        $scope.isLoadingUserPosition = false;
        $scope.getGeoLocation = getUserLocation;
        $scope.userPosition = {
            id: MAP_IDS.USER_POSITION
        };
        $scope.mapOptions = {
            zoom: 15,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT
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
        };

        // Functions
        $scope.searchPosition = searchPosition;
        $scope.clearInput = clearInput;

        $scope.$on('mapInitialized', function(event, map) {
            $scope.defaultBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(59.3293235, 18.0685808));
            map.fitBounds($scope.defaultBounds);

            // Init map options
            map.setOptions($scope.mapOptions);

            usSpinnerService.stop('mapLoadSpinner');
            $scope.map = map;
        });

        function getUserLocation() {
            usSpinnerService.spin('userGeoLocSpinner');
            $scope.isLoadingUserPosition = true;
            geolocation.getLocation()
                .then(function(data) {
                    $scope.userPosition.coordinate = [data.coords.latitude, data.coords.longitude];
                    $scope.isLoadingUserPosition = false;

                    setBounds(data.coords.latitude, data.coords.longitude);
                    var input = angular.element('#userLocationInput');
                    input.val('Nuvarande position');
                });
        }

        function searchPosition() {
            usSpinnerService.spin('userGeoLocSpinner');
            var input = angular.element('#userLocationInput');
            GeoCoder.geocode({
                address: input.val()
            }).then(function(result) {
                $scope.userPosition.coordinate = [result[0].geometry.location.lat(), result[0].geometry.location.lng()];
                setBounds($scope.userPosition.coordinate[0], $scope.userPosition.coordinate[1]);
                usSpinnerService.stop('mapLoadSpinner');
            });
        }

        function clearInput() {
            var input = angular.element('#userLocationInput');
            input.val('');
        }

        function setBounds(lat, long) {
            if ($scope.map) {
                $scope.defaultBounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(lat, long));
                $scope.map.fitBounds($scope.defaultBounds);
                $scope.map.setZoom($scope.mapOptions.zoom);
            }
        }
    }
})();