# **TypeIO.js**

# # **THIS PAGE IS IN PROGRESS - COMING SOONG**
typeIO
TypeIO.js is an extension to Twitter's typeahead.js, which provides a multiselect functionality on top of a flexible typeahead widget.

 # Features
 * All of Twitter typeahead.js' functionality
 * Ability to have both single and multipliple selection
 * Built-in suggestion matcher
 * Mobile-responsiveness
 * Accesibility
 * Example CSS included in bundle

# Getting Started

**Install Using NPM**
```
npm install typeio
```
**Direct Download**
  [TypeIO-1.0.0.js](linkurl)

# Documentation

### API

**typeIO('toggleResultsContainerVisibility')**
**typeIO('toggleDisabledResultsContainer')**
**typeIO(options, [\*datasets])**

### Initialization

In order to initialize TypeIO, provide `input[type="text"]` and a `results container` block element (e.g. div.) In the example below, the typeIO plugin is initialized uzing an input field with an id=exampleInput and a results container with id=divResults

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
},
{
    name: 'helloWorldIO',
    source: [{text:'Michigan', value:'MI'}, {text:'New York', value:'NY'}],
});
```

Just like Twitter's typeahead.js, the first argument to the plugin are the `options`, followed by `data sources`. TypeIO supports adds additional options, like `resultsContainer`, among others, which makes it possible to support multiple selections.

### Demo

Click [here]() to see a live demo of TypeIO.js in action.

###  Options

TypeIO supports the same configuration as its underlying Twitter typeahead.js, plus some added options. Info on typeahead.js' documentetaion can be found [here](https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md).

Please see below the additional options that TypeIO supports:


| Option        | Use           | Default Value  |
| :-------------: |:-------------:| :-----:|
| resultsContainer      | specifies the location of the selected value |  |
| singleValue      | if set to *true*, it makes the input box a single-select typeahead      | false |
| initialResults| accepts list of pre-loaded selected results into the resultsContainer| |
|useDefaultMatcher|default suggestion matcher is provided, but if this options is set to *false*, the user must provide a custom one using the `matcher` option|true|

### Under The Hood

TypeIO uses a resultsContainer that the user provides to store results. The container can be any block element with an id attribute. Inside of the container, TypeIO creates two elements, a visible *<ul>*, and an invisible *<select>*. The *<ul>* is used to hold the visible results that the user sees. The *<select>* holds the same selected data, but is invisible and is added to support form submissions. The example below shows how TypeIO renders two results selected - Arizona and Massachusetts:

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






