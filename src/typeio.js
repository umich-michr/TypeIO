(function() {
    'use strict';

    if (typeof exports === 'object') {
        require('typeahead.js');
    }

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

        $queryInput.typeahead(options, datasets);

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
                if($(element).hasClass('hide')) {
                    $(element).removeClass('hide');
                } else {
                    $(element).addClass('hide');
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
                $resultsContainer.find('#selectTypeaheadFormResults').append('<option selected value="'+suggestion.value+'"></option>');
                $resultsContainer.find('#ulTypeaheadResults').append('<li id="liTypeaheadSelected-'+suggestion.value+'"><span class="display-text">'+suggestion.text+'</span><a id="aTypeaheadSelected-'+suggestion.value+'"href="javascript: void(0);" class="typeahead-remove-selected-term"><span class="fa fa-close" aria-hidden="true"></span><span class="remove-label">'+removeText+'</span></a></li>');
                if (options.mode === 'single-select') {
                    $queryInput.addClass('hide');
                }
                $queryInput.typeahead('val', '');
            } else {
               $queryInput.typeahead('val', '');
               $queryInput.typeahead('val', suggestion.text);
                $resultsContainer.find('#selectTypeaheadFormResults').html('<option selected value="'+suggestion.value+'"></option>');
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
            $resultsContainer.append('<select aria-hidden="true" class="hide" multiple data-tt-'+ $queryInput.attr('id')+' id="selectTypeaheadFormResults" name="'+options.name+'"></select>');
        }

        $resultsContainer.on('click','a.typeahead-remove-selected-term', function (event) {
            var anchorId = event.currentTarget.id;
            var termToBeDeletedValue = anchorId.substring(anchorId.indexOf('-')+1);
            $resultsContainer.find('li[id=liTypeaheadSelected-' + termToBeDeletedValue + ']').remove();
            $resultsContainer.find('#selectTypeaheadFormResults option[value="'+termToBeDeletedValue+'"]').remove();
            if($resultsContainer.find('#selectTypeaheadFormResults option').length === 0) {
                $queryInput.removeClass('hide');
            }
        });

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
            return function findMatches(query, callback) {
                var matches, substringRegex;
                query = escape(query);
                // an array that will be populated with substring matches
                matches = [];
                var typeaheadSelectedTermValues = [];

                $.each($resultsContainer.find('#selectTypeaheadFormResults option'), function(index, result){
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
    };

    if (typeof exports === 'object') {
        module.exports = $.fn;
    }
})();

