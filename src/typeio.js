(function() {
    'use strict';

    if (typeof exports === 'object') {
        require('typeahead.js');
    }

    $.fn.typeIO = function(options, dataset) {
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

        if (!dataset) {
            throw new Error('Please provide a data set');
        }

        if (dataset.resultsContainer) {
            $resultsContainer= $(dataset.resultsContainer);
        } else {
            throw new Error('Please provide results container');
        }

        if (dataset.useDefaultMatcher) {
            if (dataset.source) {
                validateData(dataset.source);
                dataset.source = substringMatcher(dataset.source);
            } else {
                throw new Error('Please provide data source');
            }
        }

        if (dataset.initialResults) {
            validateData(dataset.initialResults);
            initializeTypeahead(dataset.initialResults);
        } else {
            initializeTypeahead([]);

        }

        $queryInput.typeahead(options, dataset);

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

            if (!dataset.inlineSingleSelect) {
                var removeText = 'Remove';
                if (dataset.singleValue) {
                    removeText = 'Change';
                }
                $resultsContainer.find('#selectTypeaheadFormResults').append('<option selected value="'+suggestion.value+'"></option>');
                $resultsContainer.find('#ulTypeaheadResults').append('<li id="liTypeaheadSelected-'+suggestion.value+'"><span class="display-text">'+suggestion.text+'</span><a id="aTypeaheadSelected-'+suggestion.value+'"href="javascript: void(0);" class="typeahead-remove-selected-term"><span class="fa fa-close" aria-hidden="true"></span><span class="remove-label">'+removeText+'</span></a></li>');
                if (dataset.singleValue) {
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
            if (!dataset.inlineSingleSelect) {
                $resultsContainer.append('<ul data-tt-'+$queryInput.attr('id')+' id="ulTypeaheadResults"></ul>');
            }
            $resultsContainer.append('<select aria-hidden="true" class="hide" multiple data-tt-'+ $queryInput.attr('id')+' id="selectTypeaheadFormResults" name="'+dataset.name+'"></select>');
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
                event.preventDefault();
                if (selectables.length > 0){
                    $(selectables[0]).trigger('click');
                }
            } else if (event.which === 8) {
                if (dataset.inlineSingleSelect) {
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
                if (dataset.matcherType === 'startsWith') {
                    query = '^' + query;
                } else if (dataset.matcherType === 'endsWith') {
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

