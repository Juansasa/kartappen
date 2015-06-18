(function() {
    'use strict';
    angular.module('your-position')
        .controller('YourPositionController', mapJ);

    /*@ngInject*/
    function mapJ($scope, geolocation, massGeoCoder, usSpinnerService, offices, $filter, logger) {
        offices.all().then(initOfficeData).then(initControls).then(populateOfficesOnMap);
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

        $scope.$on('mapInitialized', function(event, map) {
            var defaultlat = 59.3293235,
                defaultLng = 18.0685808;
            $scope.defaultBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(defaultlat, defaultLng));
            map.fitBounds($scope.defaultBounds);

            // Init map options
            map.setOptions($scope.mapOptions);
            $scope.map = map;
        });


        function initOfficeData(response) {
            var officesJson = Papa.parse(response.data, {
                header: true,
                dynamicTyping: true
            });

            return $filter('valid')(officesJson.data);
        }

        function initControls(officeList) {
            $scope.locationField = [{
                type: 'location-search',
                key: 'locationSearch',
                templateOptions: {
                    placeholder: 'Enter your location',
                    placeChanged: function(newPosition) {
                        initUserLocation(newPosition);
                    },
                    userLocationChanged: function(newPosition) {
                        initUserLocation(newPosition);
                    }
                }
            }];

            $scope.officeSearchField = [{
                type: 'office-search',
                key: 'officeSearch',
                templateOptions: {
                    options: officeList,
                    selected: function(office) {
                        var position = new google.maps.LatLng(office.geocodeAddress.lat, office.geocodeAddress.lng);
                        var marker = getMarkerByID(office.geocodeAddress.formattedAddress);
                        $scope.map.panTo(position);
                        office.scope.showInfoWindow(null, office.geocodeAddress.formattedAddress, marker);
                    }
                }
            }];

            $scope.model.MOFilter = $filter('MO')(officeList);
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
                        console.log(s.model);
                    }
                }
            }];

            return officeList;
        }

        $scope.setScope = function(event, scope) {
            scope.office.scope = scope;
        };

        $scope.showOfficeInfo = function(event, office) {
            console.log(office.scope);
            var marker = getMarkerByID(office.geocodeAddress.formattedAddress);
            office.scope.showInfoWindow(null, 'officeInfo', marker);
        };

        function populateOfficesOnMap(officeList) {
            _.forEach(officeList, function(office) {
                if (!office.FilialAdress) {
                    return;
                }
                var adress = office.FilialAdress.trim() + ', ' + office.FilialPostnr + ', ' + office.FilialOrt.trim() + ', sweden';
                massGeoCoder.geocodeAddress({
                    address: adress
                }).then(function(result) {
                    office.geocodeAddress = result;
                }, function(err) {
                    logger.error(err.type, err.message);
                });
            });

            $scope.offices = officeList;
        }

        function getMarkerByID(markerID) {
            if (markerID && $scope.map && $scope.map.markers) {
                return $scope.map.markers[markerID];
            }

            return null;
        }

        function getInfoWindowByID(infowID) {
            if (infowID && $scope.map && $scope.map.infoWindows) {
                return $scope.map.infoWindows[infowID];
            }

            return null;
        }

        function initUserLocation(newPosition) {
            var posLatLng = new google.maps.LatLng(newPosition.lat, newPosition.lng);
            if ($scope.userPositionMarker) {
                $scope.userPositionMarker.setPosition(posLatLng);
            } else {
                $scope.userPositionMarker = new google.maps.Marker({
                    map: $scope.map,
                    draggable: true,
                    position: posLatLng
                });
                google.maps.event.addListener($scope.userPositionMarker, 'click', function() {
                    $scope.userInfoWindow.open($scope.map, $scope.userPositionMarker);
                });

                var contentString = '<div>' +
                    '<b>Din position</b>' +
                    '<pre>' + newPosition.formattedAddress + '</pre>' +
                    '</div>';
                $scope.userInfoWindow = new google.maps.InfoWindow({
                    content: contentString
                });
            }
            $scope.map.panTo(posLatLng);
            $scope.userPositionMarker.setAnimation(google.maps.Animation.DROP);
            $scope.userInfoWindow.open($scope.map, $scope.userPositionMarker);
        }
    }
})();