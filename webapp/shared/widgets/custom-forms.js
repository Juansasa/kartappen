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
            link: function(scope, el) {
                scope.placeChanged = function() {
                    scope.model[scope.options.key] = el.find('input').val();
                    if (scope.to.placeChanged) {
                        scope.to.placeChanged(el.find('input').val());
                    }
                };

                scope.searchUserLocation = function() {
                    scope.isSearching = true;
                    geolocation.getLocation()
                        .then(function(data) {
                            scope.to.userLocationChanged(data.coords);
                            scope.isSearching = false;
                        });
                };
            }
        }, {
            name: 'office-search',
            templateUrl: 'shared/widgets/office-search.html',
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
                    massGeoCoder.geocodeAddress(adress)
                        .then(function(result) {
                            $scope.model[$scope.options.key] = result.formattedAddress;
                        }, function(err) {
                            $scope.model[$scope.options.key] = 'Adress could not be found';
                            logger.error(err.type, err.message);
                        });
                    $scope.status.isopen = false;

                    if($scope.to.selected) {
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

                    var fuzzySearch = new Fuse($scope.to.options, {
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
            wrapper: ['bootstrapHasError']
        }]);
    }
})();
