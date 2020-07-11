import * as React from "react";
import * as t from "./Question.css";
import { Button } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

const he = require('he');

interface State {
  value: string;
  autocorrect: string[];
}

interface Props {
  tags: number[];
  question_text: string;
  entity: string;
  callbackFunction: any;
  tokens: string[];
  setCurrentEntity: any;
}

export default class TaggedInfo extends React.Component<Props, State> {
  
  constructor(props: Props){
    super(props);
    this.state = {value: "",autocorrect: []};
  }

  getTags = () => {
    let indices = this.props.tags;
    let words = [];
    for (var i = indices[0]; i <= indices[1]; i++) {
      words.push(this.props.tokens[i]);
    }

    return words.join(" ");
  };
  
  escapeHtml = (unsafe: string): string => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
    }

  
  sub = () => {
    this.props.callbackFunction(this.escapeHtml(this.state.value.trim()).replace(/ /g,"_"));
    this.setState({
      value: "",
    });
  };

  

  
  handleChange = (id: any, newValue: string) => {
    this.setState({ value: newValue });
  };

  undo = () => {
    this.setState({
      value: "",
      autocorrect: [],
    });
    this.props.callbackFunction("");
  };

  updateAutocorrect = (event: React.ChangeEvent<{}>, value: any) => {
    this.setState({
      value: value,
    });

    
    let tagged_word = this.getTags(); 
    
    let current_target = value.toLowerCase();
    if (current_target !== "" && this.props.tags.length>0) {
      fetch(
        "/api/qanta/v1/api/qanta/autocorrect/" +
          current_target
      )
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          let suggestions = res;
          for(var i = 0;i<suggestions.length;i++) {
            suggestions[i] = suggestions[i]+" ";
          }
          if(suggestions.length>0) {
            if(this.props.setCurrentEntity) {
              this.props.setCurrentEntity(suggestions[0]);
            }
            
            suggestions = suggestions.concat(["No Entity Found"]);
          }
          else {
            suggestions = ["No Entity Found"];
          }
          suggestions = Array.from(new Set(suggestions));
          this.setState({ autocorrect: suggestions },function() {
            return 0;
          });  
          console.log(suggestions);
        });
    }
    else {
      
       this.setState({ autocorrect: [] });
    }
    

  };

  run_local = (i: any, f: any) => {
    return function () {
      f(i);
    };
  };

  clearAutocorrect = () => {
    this.setState({ autocorrect: [] });
  };
  
  checkKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if(e.keyCode === 13) { 
      setTimeout(this.sub,100);
    }
  }
  
  save = () => {
    if(this.state.autocorrect.length>0){
      this.setState({value: this.state.autocorrect[0]},()=>{this.sub()});
    }
    else {
      this.setState({value: "No Entity Found"},()=>{this.sub()}); 
    }
  }

  getInput = () => {   
    let is_hidden = this.props.tags.length === 0;
    return (
      <div>
        <Typography style={{ fontSize: 24 }}>
          {" "}
          What entity is this:{" "}
        </Typography>
        
        
        <Autocomplete
          style={{ fontSize: 24 }}
          value={this.state.value}
          onInputChange={this.updateAutocorrect}  
          getOptionLabel={(option) => option}
          options={this.state.autocorrect}
          renderInput={(params) => <TextField {...params} label="Entity" onKeyDown={this.checkKeyPress} 
          disabled={is_hidden}

          />}
          onChange={(event: any,value: any,reason: any) =>{if(reason === "select-option") {
          this.setState({value: value},() => {this.sub()});}}}
          openOnFocus={true}
          onHighlightChange={(event: any, value: any, reason: any) => {if(value!=="") {this.props.setCurrentEntity(value);}}}
        />
        <div style={{display: 'flex'}}> 
        <Button hidden ={is_hidden} style={{ fontSize: 24 }} color="primary" onClick={this.save}>
          Save
        </Button>
        <Button hidden={is_hidden} style={{ fontSize: 24 }} color="primary" onClick={this.undo}>
          Clear
        </Button>
        {this.state.autocorrect.length>0 &&
        <Typography style={{ fontSize: 24, marginTop: 9}}> 
          Current Top Entity: <b> {this.state.autocorrect[0]} </b>
        </Typography> 
          }
          </div>
      </div>
    );
    
  };

  onChange(id: any, newValue: string) {}

  getStatus = () => {
    if (this.props.tags.length > 0) {
      return "Current Tags:";
    } else {
      return "";
    }
  };
  
  componentDidUpdate(prevProps: Props) {

    if(prevProps !== this.props && this.props.entity!=="" && prevProps.entity === "") {
      this.setState({value:this.props.entity});
    }
    else if(prevProps !== this.props && prevProps.tags !== this.props.tags) {
      let indices = this.props.tags;
      let words = [];
      for (var i = indices[0]; i <= indices[1]; i++) {
        words.push(this.props.tokens[i]);
      }
      this.setState({value: words.join(" ")});
    }
    
  
  }

  render() {
    console.log(this.state.value);
    return (
      <div>
        <Typography color="textSecondary" style={{ fontSize: 24 }}>
          {this.getStatus() === ""?'\u00A0':this.getStatus()} {this.getTags()}
        </Typography>
        {this.getInput()}


      </div>
    );
  }
}
