(function() {
    'use strict';

    angular.module('your-position')
        .service('userLocationService', userLocation);

    /*@ngInject*/
    function userLocation(geolocation) {
        var USER = {};
        var service = {
            getGeoLocation: getLocation,
            createUserMarker: addMarker
        };


        return service;

        // Return user location promise
        function getLocation(sucessCallback) {
            return geolocation.getLocation().then(function(data) {
                USER.position = {
                    lat: data.coords.latitude,
                    lng: data.coords.longitude
                };
                sucessCallback && sucessCallback(USER.position);
            });
        }

        // Create a marker to the user object
        function addMarker(markerOptions) {
            if(USER || USER.position) {
                return;
            }

            USER.marker = new google.maps.Marker(markerOptions || {
                position: new google.maps.LatLng(USER.position.lat, USER.position.lng),
                title: 'Din position'
            });
        }
    }
})();