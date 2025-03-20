function exportDependencies(jQuery, typeahead){
    if(window){
        window.$=jQuery;
        window.jQuery=jQuery;
        window.Bloodhound=typeahead;
    }
}
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('typeio', [ 'jquery', 'typeahead.js' ], function(jQuery, typeahead) {
            exportDependencies(jQuery,typeahead);
            return factory(jQuery);
        });
    } else if (typeof exports === 'object') {
        var jQuery = require('jquery');
        exportDependencies(jQuery,require('typeahead.js'));
        module.exports = factory(jQuery);
    } else {
        factory(root.jQuery);
    }
})(this, function($) {
    $.fn.typeIO = function() {

        var options = arguments[0];
        var $resultsContainer;
        var $queryInput = $(this);

        switch (options) {
            case 'clearResultsContainer':
                clearResultsContainer();
                return;
            case 'toggleDisabledResultsContainer':
                toggleDisabledResultsContainer();
                return;
            case 'toggleResultsContainerVisibility':
                toggleResultsContainerVisibility();
                return;
            default:
                break;
        }
        var datasets = null;
        if (arguments.length > 1) {
            datasets = [].slice.call(arguments, 1);
        }

        if (!datasets) {
            throw new Error('Please provide a data set');
        }

        if (!options.mode) {
            options.mode = 'multi-select';
        }

        if (options.resultsContainer) {
            $resultsContainer = $(options.resultsContainer);
        } else {
            var formParents  = $queryInput.closest('form');
            if (formParents.length === 0) {
                throw new Error('Please provide results container');
            } else {
                $resultsContainer = $(formParents[0]);
            }
        }

        if (!options.customMatcher) {
            for (var datasetIndex=0; datasetIndex<datasets.length; datasetIndex++) {
                var dataset = datasets[datasetIndex];
                if (dataset.source) {
                    validateData(dataset.source);
                    dataset.source = substringMatcher(dataset.source);
                } else {
                    throw new Error('Please provide data source');
                }
            }
        }

        if (options.initialResults) {
            validateData(options.initialResults);
            initializeTypeahead(options.initialResults);
        } else {
            initializeTypeahead([]);

        }

        var typeio = $queryInput.typeahead(options, datasets);

        $queryInput.bind('typeahead:select', makeSelection);

        function clearResultsContainer() {
            var id = $queryInput.attr('id');
            $.each($('[data-tt-'+id+']'), function(index, element) {
                $(element).empty();
            });
        }

        function toggleDisabledResultsContainer() {
            var id = $queryInput.attr('id');
            $.each($('[data-tt-'+id+']'), function() {
                if (typeof $(this).attr('disabled') !== 'undefined') {
                    $(this).removeAttr('disabled');
                } else {
                    $(this).attr('disabled','');
                }
            });
        }

        function toggleResultsContainerVisibility() {
            var id = $queryInput.attr('id');
            $.each($('ul[data-tt-'+id+']'), function(index, element) {
                if($(element).is(':visible')) {
                    $(element).hide();
                } else {
                    $(element).show();
                }
            });
        }

        function validateData(data) {
            $.each(data, function(index, dataItem) {
                if (!dataItem.value || !dataItem.text) {
                    throw new Error('Invalid data provided: ' + dataItem);
                }
            });
        }

        function makeSelection(event, suggestion) {
            if (options.mode !== 'inline-single-select') {
                var removeText = 'Remove';
                if (options.mode === 'single-select') {
                    removeText = 'Change';
                }
                removeText = options.removeText ? options.removeText:removeText;
                $resultsContainer.find('select[id$="_Selected"]').append('<option selected value="'+suggestion.value+'"></option>');
                $resultsContainer.find('#ulTypeaheadResults').append('<li id="liTypeaheadSelected-'+suggestion.value+'"><span class="display-text">'+suggestion.text+'</span><a id="aTypeaheadSelected-'+suggestion.value+'" href="javascript: void(0);" class="typeahead-remove-selected-term"><span class="fa fa-close" aria-hidden="true"></span><span class="remove-label">'+removeText+'</span></a></li>');
                if (options.mode === 'single-select') {
                    $queryInput.hide();
                }
                $queryInput.typeahead('val', '');
            } else {
                $queryInput.typeahead('val', '');
                $queryInput.typeahead('val', suggestion.text);
                $resultsContainer.find('select[id$="_Selected"]').html('<option selected value="'+suggestion.value+'"></option>');
            }
        }

        function initializeTypeahead(initialResults) {
            createListInsideContainer();
            $.each(initialResults, function(index,result) {
                makeSelection(null,result);
            });
        }

        function createListInsideContainer() {
            $resultsContainer.addClass('tt-added-results');
            if (options.mode !== 'inline-single-select') {
                $resultsContainer.append('<ul data-tt-'+$queryInput.attr('id')+' id="ulTypeaheadResults"></ul>');
            }
            $resultsContainer.append('<select aria-hidden="true" style="display:none;" multiple data-tt-'+ $queryInput.attr('id')+' id="select_' + options.name + '_Selected" name="'+options.name+'"></select>');
        }

        $resultsContainer.on('click','a.typeahead-remove-selected-term', function (event) {
            var anchorId = event.currentTarget.id;
            var termToBeDeletedValue = anchorId.substring(anchorId.indexOf('-')+1);
            $resultsContainer.find('li[id=liTypeaheadSelected-' + termToBeDeletedValue + ']').remove();
            $resultsContainer.find('select[id$="_Selected"] option[value="'+termToBeDeletedValue+'"]').remove();
            if($resultsContainer.find('select[id$="_Selected"] option').length === 0) {
                $queryInput.show();
            }

            var selectedTermRemovedCallback = options.selectedTermRemovedCallback;
            if(isFunction(selectedTermRemovedCallback)) {
                selectedTermRemovedCallback(termToBeDeletedValue);
            }
        });

        function isFunction(functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        }

        $queryInput.bind('keyup', function(event) {
            var selectables = $(this).siblings('.tt-menu').find('.tt-selectable');
            if (selectables.length > 0) {
                //if key is not up or down arrow, select first result
                if (event.which !== 38 && event.which !== 40) {
                    $(selectables[0]).addClass('tt-cursor');
                }
            }
        });

        $queryInput.bind('keydown', function(event) {
            var selectables = $(this).siblings('.tt-menu').find('.tt-selectable');
            if(event.which === 13) {
                if (selectables.length > 0){
                    event.preventDefault();
                    $(selectables[0]).trigger('click');
                }
            } else if (event.which === 8) {
                if (options.mode === 'inline-single-select') {
                    clearResultsContainer();
                    $queryInput.typeahead('val', '');
                }
            }
        });

        function escape(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        }

        $queryInput.parent().on('mouseover', '.tt-suggestion', function () {
            $('.tt-suggestion').removeClass('tt-cursor');
            $(this).addClass('tt-cursor');
        });

        function substringMatcher(terms) {
            function removeDiacritics(str) {
                var normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                normalized = normalized.replace(/æ/g, 'ae').replace(/Æ/g, 'AE');
                normalized = normalized.replace(/œ/g, 'oe').replace(/Œ/g, 'OE');
                return normalized;
            }

            return function findMatches(query, callback) {
                var matches, substringRegex;
                query = removeDiacritics(escape(query));
                // an array that will be populated with substring matches
                matches = [];
                var typeaheadSelectedTermValues = [];

                $.each($resultsContainer.find('select[id$="_Selected"] option'), function(index, result){
                    typeaheadSelectedTermValues.push(result.value);
                });
                if (options.matcherType === 'startsWith') {
                    query = '^' + query;
                } else if (options.matcherType === 'endsWith') {
                    query = query + '$';
                }

                // regex used to determine if a string contains the substring `q`
                substringRegex = new RegExp(query, 'i');

                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                $.each(terms, function(i, term) {
                    if (substringRegex.test(term.text)) {
                        if ($.inArray(String(term.value), typeaheadSelectedTermValues) === -1) {
                            matches.push(term);
                        }
                    }
                });
                callback(matches);
            };
        }

        return typeio;
    };

    $.fn.selectItem = function(item) {
        if($(this).hasClass('tt-input')) {
            $(this).typeahead('val', item);
            var e = $.Event('keydown');
            e.which = 13;
            $(this).trigger(e);
        } else {
            throw 'You must initialize your input first. Please refer to the API document on how to initialize typeio';
        }
    };
});

