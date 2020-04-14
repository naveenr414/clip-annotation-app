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
    autocorrect: [],
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
  
  updateAutocorrect = (e) => {
    this.setState({
      value: e.currentTarget.value,
    });
    
    this.setState({autocorrect: []});
    
    if(e.currentTarget.value!=="") {
      fetch("http://localhost:8000/api/qanta/v1/api/qanta/autocorrect/"+e.currentTarget.value.toLowerCase())
        .then(res => res.json()).then 
        ((res) => {
          this.setState({autocorrect: res});
      });
    }
    

        

  }
  
  setValue = (i) => {
    this.setState({
      value: i, 
      autocorrect: [],
    });
  }
  
  run_local = (i,f) => {
    return (function() {f(i)});
  } 
  
  getAutocorrect = () => {
    let ret = [];
    let arr = this.state.autocorrect;
    for(var i = 0;i<arr.length;i++) {
      ret.push(<div onClick={this.run_local(arr[i],this.setValue)}> 
        <strong> {arr[i].substr(0,this.state.value.length)}</strong>{arr[i].substr(this.state.value.length)} 
        <input type='hidden' value={arr[i]} />
        </div>);
    }
    
    while(ret.length<5) {
      ret.push(<div> </div>);
    }
    
    return ret; 
  }

  clearAutocorrect = () => {
    this.setState({autocorrect: []});
  }
  
  getInput = () => {
    if(this.props.tags.length>0){ 
      return <div > 
      <Typography style={{fontSize:30}}>  What entity is this: </Typography> 
      <Input style={{fontSize: 30}} value={this.state.value} onChange ={this.updateAutocorrect} />
               <Button style={{ fontSize: '30px' }} color="primary" onClick={this.sub}> 
        Submit 
       </Button>
       <Button style={{ fontSize: '30px' }} color="primary" onClick={this.undo}> 
         Undo 
       </Button>     

        {this.getAutocorrect()}
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

