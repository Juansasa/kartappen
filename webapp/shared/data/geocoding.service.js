(function() {
    'use strict';

    angular.module('data').factory('massGeoCoder', function($localStorage, $q, $timeout, $rootScope) {
        var locations = $localStorage.locations ? JSON.parse($localStorage.locations) : {};
        var queue = [];

        var TIME_OUT = 250;
        var executeNext = function() {
            var task = queue[0],
                geocoder = new google.maps.Geocoder();

            geocoder.geocode({
                address: task.address
            }, function(result, status) {

                if (status === google.maps.GeocoderStatus.OK) {

                    var parsedResult = {
                        lat: result[0].geometry.location.lat(),
                        lng: result[0].geometry.location.lng(),
                        formattedAddress: result[0].formatted_address
                    };
                    locations[task.address] = parsedResult;

                    $localStorage.locations = JSON.stringify(locations);

                    queue.shift();
                    task.deferObj.resolve(parsedResult);

                } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                    queue.shift();
                    task.deferObj.reject({
                        type: 'zero',
                        message: 'Zero results for geocoding address ' + task.address
                    });
                } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    if (task.executedAfterPause) {
                        queue.shift();
                        task.deferObj.reject({
                            type: 'busy',
                            message: 'Geocoding server is busy can not process address ' + task.address
                        });
                    }
                } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
                    queue.shift();
                    task.deferObj.reject({
                        type: 'denied',
                        message: 'Request denied for geocoding address ' + task.address
                    });
                } else {
                    queue.shift();
                    task.deferObj.reject({
                        type: 'invalid',
                        message: 'Invalid request for geocoding: status=' + status + ', address=' + task.address
                    });
                }

                if (queue.length) {
                    if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                        var nextTask = queue[0];
                        nextTask.executedAfterPause = true;
                        $timeout(executeNext, TIME_OUT);
                    } else {
                        $timeout(executeNext, 0);
                    }
                }

                if (!$rootScope.$$phase) {
                    $rootScope.$apply();
                }
            });
        };

        return {
            geocodeAddress: function(address) {
                var d = $q.defer();

                if (_.has(locations, address)) {
                    d.resolve(locations[address]);
                } else {
                    queue.push({
                        address: address,
                        deferObj: d
                    });

                    if (queue.length === 1) {
                        executeNext();
                    }
                }

                return d.promise;
            }
        };
    });
})();