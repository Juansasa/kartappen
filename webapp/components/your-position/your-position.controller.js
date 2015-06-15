(function() {
    'use strict';
    angular.module('your-position')
        .controller('YourPositionController', mapJ);

    /*@ngInject*/
    function mapJ($scope, geolocation, GeoCoder, usSpinnerService, MAP_IDS, locationService, offices, $sce) {
        offices.all().then(
            function(data) {
                var officesJson = Papa.parse(data.data, {
                    header: true,
                    dynamicTyping: true
                });

                var fuzzySearch = new Fuse(officesJson.data, {
                    keys: ['Resultatenhetnamn', 'Resultatenhet', 'Ort', 'Postnr', 'Distrikt'],
                    shouldSort: true,
                    includeScore: true,
                    caseSensitive: false,
                    id: false,
                    threshold: 0.4,
                });

                function highlight(str, term) {
                    if (!str) {
                        return;
                    }

                    var highlightRegex = new RegExp('(' + term + ')', 'gi');
                    return str.replace(highlightRegex,
                        '<span class="highlight">$1</span>');
                }

                function fuzzySuggest(term) {
                    if (!term) {
                        return [];
                    }

                    return fuzzySearch
                        .search(term)
                        .slice(0, 10)
                        .map(function(i) {
                            var val = i.item;
                            return {
                                value: val,
                                label: $sce.trustAsHtml(
                                    '<div class="container-fluid">' +
                                    '  <div class="pull-left">' +
                                    highlight(val.Resultatenhetnamn, term) +
                                    '  </div>' +
                                    '  <div class="pull-right"> ' +
                                    '   <span class="badge">' +
                                    (Math.round(i.score * 100) / 100) +
                                    '   </span>' +
                                    ' </div>' +
                                    '</div>')
                            };
                        });
                }


                $scope.officeList = officesJson.data;
                $scope.acFuseOptions = {
                    suggest: fuzzySuggest,
                    'on_error': console.log
                };
            }
        );








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

        // Initializations
        locationService.getAllOffices().then(function(data) {
            $scope.offices = data;
        });

        $scope.$on('mapInitialized', function(event, map) {
            $scope.defaultBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(59.3293235, 18.0685808));
            map.fitBounds($scope.defaultBounds);

            // Init map options
            map.setOptions($scope.mapOptions);

            usSpinnerService.stop('mapLoadSpinner');
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