(function() {
    'use strict';

    angular.module('mapJ').service('mapJService', mapService);

    /*@ngInject*/
    function mapService(geolocation) {
        var defaultZoomLevel = 15;

        var service = {
            setZoomLevel: setZoom,
            getZoomLevel: getZoom,
            getCurrentUserPosition: getUserPosition,
            getAreas: getAreas,
            isInArea: isInArea
        };


        return service;

        // Replace with server calls
        function getAreas() {
        	return [{
                id: 1,
                path: [

                    [
                        59.346085355508926,
                        18.03336043593754
                    ], [
                        59.348842178671525,
                        18.040913536523476
                    ],

                    [
                        59.348557754890805,
                        18.041128113244667
                    ],

                    [
                        59.347091840699626,
                        18.040269806359902
                    ],

                    [
                        59.34531953157472,
                        18.039711906884804
                    ],


                    [
                        59.344682318044896,
                        18.03960587619622
                    ], [
                        59.342581644325726,
                        18.038661738622977
                    ],

                    [
                        59.34131242431869,
                        18.037717601049735
                    ],
                ],
                stroke: {
                    color: '#ffff',
                    opacity: 0.5,
                    weight: 1
                },
                geodesic: false,
                visible: true,
                fill: {
                    color: 'green',
                    opacity: 0.2
                }
            }];
        }

        function isInArea(positionCoord, areaPath) {
            var polygonPath = [];
            _.each(areaPath, function(value) {
                polygonPath.push(new google.maps.LatLng(value.latitude, value.longitude));
            });

            var markedArea = new google.maps.Polygon({
                paths: polygonPath
            });
            return google.maps.geometry.poly.containsLocation(
                new google.maps.LatLng(positionCoord.latitude, positionCoord.longitude), markedArea);
        }

        function getUserPosition() {
            return geolocation.getLocation();
        }

        function getZoom() {
            return defaultZoomLevel;
        }

        function setZoom(zoomLevel) {
            defaultZoomLevel = zoomLevel;
        }
    }
})();