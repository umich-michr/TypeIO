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
        expect(function(){ $('#textTypeahead').newTypeAhead(options);}).toThrow(new Error('Please provide a data set'));

    });

    it('Test with dataset, but no result container and throwing exception', function() {
        expect(function(){ $('#textTypeahead').newTypeAhead(options, {});}).toThrow(new Error('Please provide results container'));
    });

    it('Test useDefaultMatcher but no source', function() {
        var dataset = {
            resultsContainer: '#divResultContainer',
            useDefaultMatcher: true
        };
        expect(function(){ $('#textTypeahead').newTypeAhead(options, dataset);}).toThrow(new Error('Please provide data source'));
    });

    it('Test useDefaultMatcher with invalid source', function() {
        var dataset = {
            resultsContainer: '#divResultContainer',
            useDefaultMatcher: true,
            source: [{value: 'value', wrong: 'wrong'}]
        };
        expect(function(){ $('#textTypeahead').newTypeAhead(options, dataset);}).toThrow(new Error('Invalid data provided: ' + dataset.source[0]));
    });

    it('Test useDefaultMatcher with valid source - match contains', function() {
        var dataset = {
            resultsContainer: '#divResultContainer',
            useDefaultMatcher: true,
            source: [{value: 'value', text: 'text'}]
        };
        $('#textTypeahead').newTypeAhead(options, dataset);
        dataset.source('ex', function(matches) {
            expect(matches).toEqual([{value: 'value', text: 'text'}]);
        });
    });

    it('Test useDefaultMatcher with valid source - match startsWith', function() {
        var dataset = {
            resultsContainer: '#divResultContainer',
            useDefaultMatcher: true,
            source: [{value: 'value', text: 'text'}],
            matchType: 'startsWith'
        };
        $('#textTypeahead').newTypeAhead(options, dataset);
        dataset.source('te', function(matches) {
            expect(matches).toEqual([{value: 'value', text: 'text'}]);
        });
    });

    it('Test useDefaultMatcher with valid source - match endsWith', function() {
        var dataset = {
            resultsContainer: '#divResultContainer',
            useDefaultMatcher: true,
            source: [{value: 'value', text: 'text'}],
            matchType: 'endsWith'
        };
        $('#textTypeahead').newTypeAhead(options, dataset);
        dataset.source('xt', function(matches) {
            expect(matches).toEqual([{value: 'value', text: 'text'}]);
        });
    });

    it('Test useDefaultMatcher with invalid initial result', function() {
        var dataset = {
            resultsContainer: '#divResultContainer',
            useDefaultMatcher: true,
            source: [{value: 'value', text: 'text'}],
            initialResults: [{wrong: 'wrong'}]
        };
        expect(function(){ $('#textTypeahead').newTypeAhead(options, dataset);}).toThrow(new Error('Invalid data provided: ' + dataset.source[0]));
    });

    it('Test useDefaultMatcher with valid initial result - not single value', function() {
        var dataset = {
            resultsContainer: '#divResultContainer',
            useDefaultMatcher: true,
            source: [{value: 'value', text: 'text'}],
            initialResults: [{value: 'initValue', text: 'initText'}],
            name: 'name'
        };
        $('#textTypeahead').newTypeAhead(options, dataset);

        expect($(dataset.resultsContainer).hasClass('tt-added-results')).toBe(true);
        expect($(dataset.resultsContainer).html()).toContain('<ul data-tt-texttypeahead="" id="ulTypeaheadResults">');
        expect($(dataset.resultsContainer).html()).toContain('<select aria-hidden="true" class="hide" multiple="" data-tt-texttypeahead="" id="selectTypeaheadFormResults" name="name">');
        expect($(dataset.resultsContainer).html()).toContain('Remove');
        expect($(dataset.resultsContainer).html()).toContain('<li id="liTypeaheadSelected-initValue"><span class="display-text">initText</span>');
        expect($(dataset.resultsContainer).html()).toContain('<option selected="" value="initValue"></option>');
    });

    it('Test useDefaultMatcher with valid initial result - single value', function() {
        var dataset = {
            resultsContainer: '#divResultContainer',
            useDefaultMatcher: true,
            source: [{value: 'value', text: 'text'}],
            initialResults: [{value: 'initValue', text: 'initText'}],
            name: 'name',
            singleValue: true
        };
        $('#textTypeahead').newTypeAhead(options, dataset);

        expect($(dataset.resultsContainer).hasClass('tt-added-results')).toBe(true);
        expect($('#textTypeahead').hasClass('hide')).toBe(true);
        console.log($(dataset.resultsContainer));
        expect($(dataset.resultsContainer).html()).toContain('<ul data-tt-texttypeahead="" id="ulTypeaheadResults">');
        expect($(dataset.resultsContainer).html()).toContain('<select aria-hidden="true" class="hide" multiple="" data-tt-texttypeahead="" id="selectTypeaheadFormResults" name="name">');
        expect($(dataset.resultsContainer).html()).toContain('Change');
        expect($(dataset.resultsContainer).html()).toContain('<li id="liTypeaheadSelected-initValue"><span class="display-text">initText</span>');
        expect($(dataset.resultsContainer).html()).toContain('<option selected="" value="initValue"></option>');
    });
});
