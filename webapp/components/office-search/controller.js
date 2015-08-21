(function() {
    'use strict';
    angular.module('office-search')
        .controller('OfficeSearchController', mapJ);

    /*@ngInject*/
    function mapJ($scope, geolocation, massGeoCoder, offices, $filter, logger) {

        $scope.toogleOptions = function() {
            $scope.showOptions = !$scope.showOptions;
        };

        $scope.mapOptions = {
            zoom: 5,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.BOTTOM_CENTER
            },
            panControl: false,
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            scaleControl: false,
            streetViewControl: true,
            overviewMapControl: false
        };
        $scope.setScope = setScope;
        $scope.travelMode = 'DRIVING';
        $scope.showOfficeInfo = showOfficeInfo;
        $scope.fitBounds = fitBounds;
        $scope.navigate = navigate;
        $scope.toogleNavigationArea = toogleNavigationArea;
        $scope.closeInfoWindow = closeInfoWindow;

        init();

        function init() {
            offices.all().then(initOfficeData).then(initControls).then(populateOfficesOnMap);
            $scope.$on('mapInitialized', function(event, map) {
                var defaultlat = 62.5,
                    defaultLng = 15;
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
        }

        function toogleNavigationArea() {
            $scope.isNavigating = !$scope.isNavigating;

            if ($scope.isNavigating) {
                showUserMarker(true);
                google.maps.event.trigger($scope.map, 'resize');
            } else {
                $scope.model.MOFilter = $filter('MO')($scope.offices);
                filterOfficesByMO();
                showUserMarker(false);

                if ($scope.selectedOffice) {
                    var marker = getMarkerByID($scope.selectedOffice.geocodeAddress.formattedAddress);
                    getInfoWindowByID('officeInfo').__open($scope.map, $scope.selectedOffice.scope, marker);
                    $scope.map.panTo(marker.getPosition());
                }
            }
        }

        function showUserMarker(show) {
            if (!$scope.userMarker || !$scope.userInfoWindow) {
                return;
            }

            if (show) {
                $scope.directionRenderer.setMap($scope.map);
                $scope.userInfoWindow.open($scope.map, $scope.userMarker);
                $scope.userMarker.setMap($scope.map);
            } else {
                $scope.directionRenderer.setMap(null);
                $scope.userInfoWindow.close();
                $scope.userMarker.setMap(null);
            }
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
                    placeholder: 'Fyll i din position',
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
                    placeholder: 'Fyll i enhet/filial, adress, postnummer, etc',
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
            if (!office || !office.geocodeAddress) {
                throw {
                    message: 'Something is wrong with the office data',
                    office: office
                };
            }

            $scope.model.officeSearch = office.geocodeAddress.formattedAddress;
            var marker = getMarkerByID(office.geocodeAddress.formattedAddress);
            getInfoWindowByID('officeInfo').__open($scope.map, office.scope, marker);
            $scope.map.panTo(marker.getPosition());
            $scope.selectedOffice = office;
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
                    logger.warning(err.message, '[Error type: ' + err.type + ']');
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
            $scope.userPosition = new google.maps.LatLng(newPosition.lat, newPosition.lng);
            var contentString = '<div>' +
                '<b>Din position</b>' +
                '<pre>' + newPosition.formattedAddress + '</pre>' +
                '</div>';

            if ($scope.userMarker) {
                $scope.userMarker.setPosition($scope.userPosition);
                $scope.userInfoWindow.close();
                $scope.userInfoWindow = new google.maps.InfoWindow({
                    content: contentString
                });
            } else {
                $scope.userMarker = new google.maps.Marker({
                    map: $scope.map,
                    draggable: true,
                    position: $scope.userPosition,
                    icon: 'https://www.google.com/mapfiles/marker_green.png'
                });

                google.maps.event.addListener($scope.userMarker, 'click', function() {
                    $scope.userInfoWindow.open($scope.map, $scope.userMarker);
                });

                $scope.userInfoWindow = new google.maps.InfoWindow({
                    content: contentString
                });
            }

            $scope.map.panTo($scope.userPosition);
            $scope.userInfoWindow.open($scope.map, $scope.userMarker);
            navigate();
        }


        function navigate() {
            $scope.showUserLocationInput = true;

            if (!$scope.userPosition || !$scope.selectedOffice) {
                return;
            }

            $scope.model.MOFilter = [];
            filterOfficesByMO();
            $scope.selectedOffice.hide = false;

            var request = {
                origin: $scope.userPosition,
                destination: $scope.selectedOffice.geocodeAddress.formattedAddress,
                travelMode: google.maps.TravelMode.DRIVING
            };

            $scope.directionRenderer.setMap($scope.map);
            $scope.directionsService.route(request, function(response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    $scope.directionRenderer.setDirections(response);
                    $scope.isNavigating = true;
                    $scope.$apply();
                }
            });

            showUserMarker(true);
        }

        function closeInfoWindow() {
            $scope.showUserLocationInput = false;
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