(function() {
    'use strict';

    angular.module('widgets')
        .run(register);

    /*@ngInject*/
    function register(formlyConfig, geolocation, massGeoCoder, logger) {
        formlyConfig.setWrapper([{
            name: 'horizontalBootstrapCheckbox',
            template: [
                '<div class="col-sm-offset-2 col-sm-8">',
                '<formly-transclude></formly-transclude>',
                '</div>'
            ].join(' ')
        }, {
            name: 'horizontalBootstrapLabel',
            template: [
                '<label for="{{::id}}" class="col-sm-2 control-label">',
                '{{to.label}}',
                '</label>',
                '<div class="col-sm-8">',
                '<formly-transclude></formly-transclude>',
                '</div>'
            ].join(' ')
        }]);

        formlyConfig.setType([{
            name: 'location-search',
            templateUrl: 'shared/widgets/location-search.html',
            wrapper: ['bootstrapHasError'],
            defaultOptions: {
                templateOptions: {
                    required: true
                }
            },
            link: function(scope, el) {
                scope.placeChanged = function() {
                    if(!el.find('input').val()) {
                        return;
                    }
                    
                    scope.model[scope.options.key] = el.find('input').val();
                    if (scope.to.placeChanged) {
                        massGeoCoder.geocodeAddress({
                            address: scope.model[scope.options.key]
                        }).then(function(response) {
                            scope.to.placeChanged(response);
                        }, function(err) {
                            logger.error(err.type, err.message);
                        });
                    }
                };

                scope.searchUserLocation = function() {
                    scope.model[scope.options.key] = null;
                    scope.isSearching = true;
                    geolocation.getLocation()
                        .then(function(data) {
                            scope.isSearching = false;
                            massGeoCoder.geocodeAddress({
                                latLng: new google.maps.LatLng(data.coords.latitude, data.coords.longitude)
                            }).then(function(response) {
                                scope.to.userLocationChanged(response);
                                scope.model[scope.options.key] = response.formattedAddress;
                            }, function(err) {
                                logger.error(err.type, err.message);
                            });
                        });
                };
            }
        }, {
            name: 'office-search',
            templateUrl: 'shared/widgets/office-search.html',
            wrapper: ['bootstrapHasError'],
            defaultOptions: {
                templateOptions: {
                    required: true
                }
            },
            controller: /*@ngInject*/ function($scope, $sce) {
                $scope.status = {
                    isopen: false
                };

                $scope.to.onChange = function(v) {
                    $scope.searchResults = fuzzySuggest(v);
                    if ($scope.searchResults && $scope.searchResults.length > 0) {
                        $scope.status.isopen = true;
                    } else {
                        $scope.status.isopen = false;
                    }
                };

                $scope.selected = function(value) {
                    var adress = value.FilialAdress.trim() + ', ' + value.FilialPostnr + ', ' + value.FilialOrt.trim() + ', sweden';
                    massGeoCoder.geocodeAddress({
                        address: adress
                    })
                        .then(function(result) {
                            $scope.model[$scope.options.key] = result.formattedAddress;
                        }, function(err) {
                            $scope.model[$scope.options.key] = 'Adress could not be found';
                            logger.error(err.type, err.message);
                        });
                    $scope.status.isopen = false;

                    if ($scope.to.selected) {
                        $scope.to.selected(value);
                    }
                };

                function highlight(str, term) {
                    if (!str || !_.isString(str)) {
                        return;
                    }

                    var highlightRegex = new RegExp('(' + term + ')', 'gi');
                    return str.replace(highlightRegex,
                        '<b>$1</b>');
                }

                function fuzzySuggest(term) {
                    if (!term) {
                        return [];
                    }

                    var fuzzySearch = new Fuse(_.reject($scope.to.options, function(office) {
                        return office.hide;
                    }), {
                        keys: ['Filialnamn', 'FilialOrt', 'FilialPostnr', 'Distrikt'],
                        shouldSort: true,
                        includeScore: true,
                        caseSensitive: false,
                        id: false,
                        threshold: 0.4,
                    });

                    return fuzzySearch
                        .search(term)
                        .slice(0, 10)
                        .map(function(i) {
                            var val = i.item;
                            return {
                                value: val,
                                label: $sce.trustAsHtml(
                                    '<div class="container-fluid">' +
                                    '  <div class="pull-left">' + highlight(val.Filialnamn, term) +
                                    ', ' + highlight(val.FilialOrt, term) +
                                    ', ' + highlight(val.FilialPostnr, term) +
                                    ', ' + highlight(val.Distrikt, term) +
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

            }
        }, {
            name: 'horizontalCheckbox',
            extends: 'multiCheckbox',
            wrapper: ['bootstrapHasError'],
            controller: /* @ngInject */ function($scope) {
                var to = $scope.to;
                var opts = $scope.options;
                $scope.multiCheckbox = {
                    checked: [],
                    change: setModel
                };

                $scope.$watchCollection('model', function() {
                    // initialize the checkboxes check property
                    var modelValue = $scope.model[opts.key];
                    if (angular.isArray(modelValue)) {
                        var valueProp = to.valueProp || 'value';
                        angular.forEach(to.options, function(v, index) {
                            $scope.multiCheckbox.checked[index] = modelValue.indexOf(v[valueProp]) !== -1;
                        });
                    }
                });

                function checkValidity(expressionValue) {
                    var valid = angular.isArray($scope.model[opts.key]) &&
                        $scope.model[opts.key].length > 0 &&
                        expressionValue;

                    $scope.fc.$setValidity('required', valid);
                }

                function setModel() {
                    $scope.model[opts.key] = [];
                    angular.forEach($scope.multiCheckbox.checked, function(checkbox, index) {
                        if (checkbox) {
                            $scope.model[opts.key].push(to.options[index][to.valueProp || 'value']);
                        }
                    });

                    // Must make sure we mark as touched because only the last checkbox due to a bug in angular.
                    $scope.fc.$setTouched();
                    checkValidity(true);
                }

                if (opts.expressionProperties && opts.expressionProperties.required) {
                    $scope.$watch($scope.options.expressionProperties.required, function(newValue) {
                        checkValidity(newValue);
                    });
                }

                if ($scope.to.required) {
                    var unwatchFormControl = $scope.$watch('fc', function(newValue) {
                        if (!newValue) {
                            return;
                        }
                        checkValidity(true);
                        unwatchFormControl;
                    });
                }
            }
        }]);
    }
})();