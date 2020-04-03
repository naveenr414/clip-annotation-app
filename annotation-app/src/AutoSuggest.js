import * as React from 'react';
import AutoSuggest from 'react-autosuggest';
import './AutoSuggest.css';
import text  from './allthings2.js';

export default class MyAutoSuggest extends React.Component {  
  languages = text.split("\n");

  escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getSuggestions = (value) => {
    const escapedValue = this.escapeRegexCharacters(value.trim());
    
    if (escapedValue === '') {
      return [];
    }

    const regex = new RegExp('^' + escapedValue, 'i');

    return this.languages.filter(language => regex.test(language)).splice(0,4);
  }

  getSuggestionValue = (suggestion) => {
    return suggestion;
  }

  renderSuggestion = (suggestion) => {
    return (
      <span>{suggestion}</span>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      value: "",
      suggestions: []
    };    
  }

  onChange = (_, { newValue }) => {
    const { id, onChange } = this.props;
    
    this.setState({
      value: newValue
    });
    
    onChange(id, newValue);
  };
  
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value).slice(0,5)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { id, placeholder } = this.props;
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder,
      value,
      onChange: this.onChange
    };
    
    return (
      <AutoSuggest 
        id={id}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={inputProps} 
      />
    );
  }
}