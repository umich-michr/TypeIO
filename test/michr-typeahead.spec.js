describe('MICHR Typeahead Tests', function() {
    global.jQuery = global.$ = require('jquery');
    require('../src/typeio.js');

    var options = {
        hint: true,
        highlight: true,
        minLength: 1
    };

    beforeEach(function() {
        var fixture = '<main id="fixture"><div id="divResultContainer"></div><input type="text" id="textTypeahead"/></main>';

        document.body.insertAdjacentHTML(
            'afterbegin',
            fixture);
    });

    afterEach(function() {
        document.body.removeChild(document.getElementById('fixture'));
    });

    it('Test no dataset and throwing exception', function() {
         expect(function(){ $('#textTypeahead').typeIO(options);}).toThrow(new Error('Please provide a data set'));
    });

    it('Test with dataset, but no result container and throwing exception', function() {
        expect(function(){ $('#textTypeahead').typeIO(options, {});}).toThrow(new Error('Please provide results container'));
    });

    it('Test useDefaultMatcher but no source', function() {
        var options = {
            resultsContainer: '#divResultContainer'
        };
        expect(function(){ $('#textTypeahead').typeIO(options, {});}).toThrow(new Error('Please provide data source'));
    });

    it('Test useDefaultMatcher with invalid source', function() {
        var options = {
            resultsContainer: '#divResultContainer'
        };
        var dataset = {
            display: 'value',
            source: [{value: 'value', wrong: 'wrong'}]
        };
        expect(function(){ $('#textTypeahead').typeIO(options, dataset)}).toThrow(new Error('Invalid data provided: ' + dataset.source[0]));
    });

    it('Test useDefaultMatcher with valid source - match contains', function() {
        var options = {
            resultsContainer: '#divResultContainer'
        };
        var dataset = {
            display: 'text',
            source: [{value: 'value', text: 'text'}]
        };
        $('#textTypeahead').typeIO(options, dataset);
        dataset.source('ex', function(matches) {
            expect(matches).toEqual([{value: 'value', text: 'text'}]);
        });
    });

    it('Test useDefaultMatcher with valid source - match startsWith', function() {
        var options = {
            resultsContainer: '#divResultContainer',
            matchType: 'startsWith'
        };
        var dataset = {
            display: 'text',
            source: [{value: 'value', text: 'text'}]
        };
        $('#textTypeahead').typeIO(options, dataset);
        dataset.source('te', function(matches) {
            expect(matches).toEqual([{value: 'value', text: 'text'}]);
        });
    });

    it('Test useDefaultMatcher with valid source - match endsWith', function() {
        var options = {
            resultsContainer: '#divResultContainer',
            matchType: 'endsWith'
        };
        var dataset = {
            display: 'text',
            source: [{value: 'value', text: 'text'}]
        };
        $('#textTypeahead').typeIO(options, dataset);
        dataset.source('xt', function(matches) {
            expect(matches).toEqual([{value: 'value', text: 'text'}]);
        });
    });

    it('Test useDefaultMatcher with invalid initial result', function() {
        var options = {
            resultsContainer: '#divResultContainer',
            initialResults: [{wrong: 'wrong'}]
        };

        var dataset = {
            source: [{value: 'value', text: 'text'}]
        };
        expect(function(){ $('#textTypeahead').typeIO(options, dataset);}).toThrow(new Error('Invalid data provided: ' + dataset.source[0]));
    });

    it('Test useDefaultMatcher with valid initial result - not single value', function() {
        var options = {
            resultsContainer: '#divResultContainer',
            initialResults: [{value: 'initValue', text: 'initText'}],
            name: 'name'
        };
        var dataset = {
            display: 'text',
            source: [{value: 'value', text: 'text'}]
        };
        $('#textTypeahead').typeIO(options, dataset);

        expect($(options.resultsContainer).hasClass('tt-added-results')).toBe(true);
        expect($(options.resultsContainer).html()).toContain('<ul data-tt-texttypeahead="" id="ulTypeaheadResults">');
        expect($(options.resultsContainer).html()).toContain('<select aria-hidden="true" style="display:none;" multiple="" data-tt-texttypeahead="" id="select_name_Selected" name="name">');
        expect($(options.resultsContainer).html()).toContain('Remove');
        expect($(options.resultsContainer).html()).toContain('<li id="liTypeaheadSelected-initValue"><span class="display-text">initText</span>');
        expect($(options.resultsContainer).html()).toContain('<option selected="" value="initValue"></option>');
    });

    it('Test useDefaultMatcher with valid initial result - single value', function() {
        var options = {
            resultsContainer: '#divResultContainer',
            name: 'name',
            mode: 'single-select',
            initialResults: [{value: 'initValue', text: 'initText'}]
        };
        var dataset = {
            display: 'text',
            source: [{value: 'value', text: 'text'}]
        };
        $('#textTypeahead').typeIO(options, dataset);

        expect($(options.resultsContainer).hasClass('tt-added-results')).toBe(true);
        expect($('#textTypeahead').is(':visible')).toBe(false);
        expect($(options.resultsContainer).html()).toContain('<ul data-tt-texttypeahead="" id="ulTypeaheadResults">');
        expect($(options.resultsContainer).html()).toContain('<select aria-hidden="true" style="display:none;" multiple="" data-tt-texttypeahead="" id="select_name_Selected" name="name">');
        expect($(options.resultsContainer).html()).toContain('Change');
        expect($(options.resultsContainer).html()).toContain('<li id="liTypeaheadSelected-initValue"><span class="display-text">initText</span>');
        expect($(options.resultsContainer).html()).toContain('<option selected="" value="initValue"></option>');
    });
});
