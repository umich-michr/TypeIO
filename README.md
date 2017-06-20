# **TypeIO.js**

TypeIO.js is an extension to Twitter's typeahead.js, which provides a multiselect functionality on top of a flexible typeahead widget.

# Features
 * Ability to have both single and multiple selection
 * Built-in suggestion matcher
 * Mobile-responsiveness
 * Accessibility
 * CSS included in bundle
 * All of Twitter typeahead.js' functionality

# Getting Started

For examples see https://michr-cri.github.io/typeio

**Install Using NPM**
```
npm install typeio
```

**Using good old js tags**
```
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/corejs-typeahead/1.1.1/typeahead.jquery.min.js"></script>
<script src="dist/typeio.js"></script>
<link rel="stylesheet" href="dist/assets/styles/typeio-styles.css" media="screen"/>
```

# Documentation

### API

#### typeIO(options, [\*datasets])
**Usage:**
toggle hides/shows results container
```
$('#inputUsedForTypeIO').typeIO({
    minLength: 10,
    highlight: true,
    resultsContainer:'#divResults',
    name: 'states',
},
{
    display:'text',
    source: [{text:'Michigan', value:'MI'}, {text:'New York', value:'NY'}],
});
```

#### typeIO('clearResultsContainer')
**Usage:**
Removes all selected results.
```
$('#inputUsedForTypeIO').typeIO('clearResultsContainer');
```

#### typeIO('toggleResultsContainerVisibility')
**Usage:**
toggle hides/shows results container
```
$('#inputUsedForTypeIO').typeIO('toggleResultsContainerVisibility');
```
#### typeIO('toggleDisabledResultsContainer')
**Usage:**
toggle disable/enable results container
```
$('#inputUsedForTypeIO').typeIO('toggleDisabledResultsContainer');
```


#### Initialization

In order to initialize TypeIO, provide `input[type="text"]` and an optional `results container` block element (e.g. div.) In the example below, the typeIO plugin is initialized using an input field with an id=exampleInput and a results container with id=divResults


Markup
```
<!DOCTYPE html>
<html>
    ...
    <body>
        ...
        <div id="divResults"></div>
        <input type="text" id="exampleInput" />
        ...
    <body>
<html>

```

JS Code
```
$('#exampleInput').typeIO({
    minLength: 10,
    highlight: true,
    resultsContainer:'#divResults',
    name: 'States'
},
{
    display: 'text',
    source: [{text:'Michigan', value:'MI'}, {text:'New York', value:'NY'}],
});
```

The first argument to the plugin are the `options`, followed by `data sources`. TypeIO supports additional options, such as `resultsContainer`, among others, which makes it possible to support multiple selections.

#### makeSelection(event, suggestion)
**Usage:**
Programmatically select items. **suggestion** parameter is the item you want to select. It must be in the same format as the data you pass in source.

Markup
```
<!DOCTYPE html>
<html>
    ...
    <body>
        ...
        <div id="divResults"></div>
        <input type="text" id="exampleInput" />
        ...
    <body>
<html>

```

JS Code
```
var exampleTypeIO = $('#exampleInput').typeIO({
    minLength: 10,
    highlight: true,
    resultsContainer:'#divResults',
    name: 'States'
},
{
    display: 'text',
    source: [{text:'Michigan', value:'MI'}, {text:'New York', value:'NY'}]
});
exampleTypeIO.makeSelection(null, {text: 'Michigan', value: 'MI'});
```
This will programmatically select **Michigan**

### Demo

Click [here](https://michr-cri.github.io/) to see a live demo of TypeIO.js in action.

###  Options

TypeIO supports the same configuration as its underlying Twitter typeahead.js, plus some added options. Info on typeahead.js' documentation can be found [here](https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md).

Please see below the additional options that TypeIO supports:


| Option        | Use           | Default Value  |
| :-------------: |:-------------:| :-----:|
| resultsContainer      | specifies the location of the selected value | The form containing the input used for TypeIO initialization  |
| mode      | TypeIO can be initialized in one of tree working modes: `multi-select`, `single-select`, or `inline-single-select`. The multi-select mode allows the user to select multiple options to be added to the resultsContainer; single-select makes the input field hide when an option is selected and shows it again if the option is removed; inline-single-select is used to keep the selected option in the input field itself, rather than in a separate resultsContainer| multi-select |
| initialResults| accepts list of pre-loaded selected results into the resultsContainer| |
|customMatcher|if this option is set to *false*, a default suggestion matcher is provided, but if this options is set to *true*, the user must provide a custom one using the `matcher` option|false|
| matcher| if the customMatcher option is set to *true*, the user can use the matcher option to provide a custom matcher function.|The default matcher function is shown in the *Suggestion Matching* section below|
| matcherType| if the default suggestion matcher function is used for autocomplete functionality, the user can specify one of three modes: `contains`,`startsWith`, or `endsWith`| contains|
| source| an array of objects with `text` and `value` attributes| |
| selectedTermRemovedCallback| a call back function when a selected term is removed from the result. It takes the removed term as the parameter||
### Datasets

The plugin takes one or more data set parameters. These are working exactly the way one would expect them to work in Twitter's typeahead (more info [here](https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md#datasets).) *display* and *source* attributes are required as part of a data-source object.

### Data Format
The source option for each data source of the plugin requires that an array of objects be passed to the initializer. The objects should have `text` and `value` attributes. The *text* is used for display purposes, while the *value* is used if a form submission should occur. For example, a valid source array might like like the one shown below:

```
$('#inputUsedForTypeIO').typeIO({
    minLength: 10,
    highlight: true,
    resultsContainer:'#divResults',
    name: 'States'
},
{
    display: 'text',
    source: [{text:'Michigan', value:'MI'}, {text:'New York', value:'NY'}],
});
```

Note that the data array: **[{text:'Michigan', value:'MI'}, {text:'New York', value:'NY'}]**. This format is required by the plugin.

### Suggestion Matching Function
By default, TypeIO has a built-in options selection matching function. The user can choose to provide their own instead, if needed. The default function is shown below:

```
function substringMatcher(terms) {
            return function findMatches(query, callback) {
                var matches, substringRegex;
                query = escape(query);
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

                substringRegex = new RegExp(query, 'i');

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
```
If the user wants to provide their own function instead, the `customMatcher` option should be set to true and the function should be passed to the `matcher` option. The new custom function should be following the same format as the default one. The built-in matcher was heavily influenced by the examples provided in Twitter Typeahead.js` documentation, since that plugin is the backbone of TypeIO.

### Under The Hood

TypeIO uses a resultsContainer that the user provides to store results. The container can be any block element with an id attribute. Inside of the container, TypeIO creates two elements, a visible *&lt;ul&gt;*, and an invisible *&lt;select&gt;*. The *&lt;ul&gt;* is used to hold the visible results that the user sees. The *&lt;select&gt;* holds the same selected data, but is invisible and is added to support form submissions. The example below shows how TypeIO renders in the background (markup) two results selected - Arizona and Massachusetts:

```
<div id="resultsContainer">
    <ul>
        <li>Arizona</li>
        <li>Massachusetts</li>
    </ul>
    <select class="hide">
        <option>Arizona</option>
        <option>Massachusetts</option>
    </select>
</div>
```





