import * as React from 'react';
import Question from './Question';
import './Question.css';
import TextField from '@material-ui/core/TextField';
import MyAutoSuggest from './AutoSuggest';
import { Button, Input } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

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
      return <div > 
      <Typography style={{fontSize:30}}>  What entity is this: </Typography> 
      <MyAutoSuggest
          id="type-c"
          placeholder=""
          onChange={this.handleChange}
          value={this.props.entity}
       />
       <Button style={{ fontSize: '30px' }} color="primary" onClick={this.sub}> 
        Submit 
       </Button>
       <Button style={{ fontSize: '30px' }} color="primary" onClick={this.undo}> 
         Undo 
       </Button>     
       </div> 
     }
     else {
       return <div> <br /> <br /> <br /> <br />  </div> 
     }
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
        <Typography color="textSecondary" style={{fontSize: 30}}>
          {this.getStatus()} {this.getTags()} 
        </Typography> 
         {this.getInput()}
      </div> 
    );
  }
}

