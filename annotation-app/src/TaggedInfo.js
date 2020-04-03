import * as React from 'react';
import Question from './Question';
import './Question.css';
import TextField from '@material-ui/core/TextField';
import MyAutoSuggest from './AutoSuggest';
import { Button, Input } from '@material-ui/core';

export default class Annotation extends React.Component {  
  state = {
    value: '',
    current_tags: [],
  };
  
  
  
  constructor(props) {
    super(props);
  }
  
  getTags = () => {
    let indices = this.props.tags;
    let words = [];
    for(var i = indices[0];i<=indices[1];i++) {
      words.push(this.props.question_text.split(" ")[i]);
    }
    
    return words.join(" ");
  }
  
  sub = () => {
    this.props.callbackFunction(this.state.value);
  }
  
  handleChange = (id, newValue) => {
    this.setState({value: newValue});
  }
  
  undo = () => {
    this.setState({
      value: "",
    });
    this.props.callbackFunction("");
  }

  
  getInput = () => {
    if(this.props.tags.length>0){ 
      return <div > What entity is this:
       <MyAutoSuggest
          id="type-c"
          placeholder=""
          onChange={this.handleChange}
          value={this.props.entity}
        />
         <Button style={{ fontSize: '30px' }} onClick={this.sub}> Submit </Button>
    <Button  style={{ fontSize: '30px' }}  onClick={this.undo}> Undo </Button>      </div> 
     }
  }
  
  getList = () => {
    let l = [];
    for(var i = 1;i<=10000;i++) {
      l.push(i.toString());
    }
    return l;
  }
  
  onChange(id, newValue) {
  }

  getStatus = () => {
    if(this.props.tags.length>0) {
      return "Current Tags:";
    }
    else {
      return "Nothing currently tagged";
    }
  }
  
  render () {
    return (
      <div> 
        <h3> {this.getStatus()} {this.getTags()} </h3> 
          {this.getInput()}

      </div> 
    );
  }
}

