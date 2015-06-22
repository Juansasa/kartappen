(function() {
    'use strict';
    angular.module('your-position')
        .controller('YourPositionController', mapJ);

    /*@ngInject*/
    function mapJ($scope, geolocation, massGeoCoder, usSpinnerService, offices, $filter, logger) {
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
        $scope.setScope = setScope;
        $scope.travelMode = 'DRIVING';
        $scope.showOfficeInfo = showOfficeInfo;
        $scope.fitBounds = fitBounds;
        $scope.navigate = navigate;

        init();

        $scope.$on('mapInitialized', function(event, map) {
            var defaultlat = 59.3293235,
                defaultLng = 18.0685808;
            var directionServiceOptions = {
                map: $scope.map,
                panel: document.getElementById('directions-panel') || document.querySelector('directions-panel'),
                suppressInfoWindows: true,
                suppressMarkers: true
            };

            $scope.defaultBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(defaultlat, defaultLng));
            map.fitBounds($scope.defaultBounds);

            // Init map options
            map.setOptions($scope.mapOptions);
            $scope.map = map;
            $scope.directionsService = new google.maps.DirectionsService();
            $scope.directionRenderer = new google.maps.DirectionsRenderer(directionServiceOptions);
        });

        function init() {
            offices.all().then(initOfficeData).then(initControls).then(populateOfficesOnMap);
        }

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
                        $scope.selectedOffice = office;
                        showOfficeInfo(null, office);
                    },
                    iconClicked: function() {
                        if ($scope.selectedOffice) {
                            var lat = $scope.selectedOffice.geocodeAddress.lat;
                            var lng = $scope.selectedOffice.geocodeAddress.lng;
                            $scope.map.panTo(new google.maps.LatLng(lat, lng));
                        }
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
                    onBlur: function() {
                        filterOfficesByMO();
                    }
                }
            }];

            return officeList;
        }

        function setScope(event, scope) {
            scope.office.scope = scope;
        }

        function showOfficeInfo(event, office) {
            $scope.model.officeSearch = office.geocodeAddress.formattedAddress;
            var marker = getMarkerByID(office.geocodeAddress.formattedAddress);
            getInfoWindowByID('officeInfo').__open($scope.map, office.scope, marker);
            $scope.map.panTo(marker.getPosition());
        }

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
            $scope.isNavigating = false;
            if ($scope.directionRenderer.getMap()) {
                $scope.directionRenderer.setMap(null);
            }

            if ($scope.userMarker) {
                $scope.userMarker.setPosition(posLatLng);
            } else {
                $scope.userMarker = new google.maps.Marker({
                    map: $scope.map,
                    draggable: true,
                    position: posLatLng,
                    icon: 'https://www.google.com/mapfiles/marker_green.png'
                });
                google.maps.event.addListener($scope.userMarker, 'click', function() {
                    $scope.userInfoWindow.open($scope.map, $scope.userMarker);
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
            $scope.userInfoWindow.open($scope.map, $scope.userMarker);
        }


        function navigate(office) {
            if (!$scope.model.locationSearch) {
                return;
            }

            $scope.selectedOffice = $scope.selectedOffice || office;
            $scope.isNavigating = true;
            $scope.model.MOFilter = [];
            filterOfficesByMO();
            $scope.selectedOffice.hide = false;

            var request = {
                origin: $scope.model.locationSearch,
                destination: $scope.selectedOffice.geocodeAddress.formattedAddress,
                travelMode: google.maps.TravelMode.DRIVING
            };

            $scope.directionRenderer.setMap($scope.map);
            $scope.directionsService.route(request, function(response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    $scope.directionRenderer.setDirections(response);
                }
            });

        }

        function fitBounds() {
            var officeInfo = getInfoWindowByID('officeInfo');
            var userInfo = $scope.userInfoWindow;
            var officePos = officeInfo ? officeInfo.getPosition() : null;
            var userPos = userInfo ? userInfo.getPosition() : null;

            if (officePos && userPos) {
                var bounds = new google.maps.LatLngBounds(officePos, userPos);
                $scope.map.fitBounds(bounds);
            }
        }

        function filterOfficesByMO() {
            _.forEach($scope.offices, function(office) {
                if (_.includes($scope.model.MOFilter, office.Distrikt.trim()))  {
                    office.hide = false;
                } else if (office !== $scope.selectedOffice) {
                    office.hide = true;
                }
            });
        }
    }
})();