import * as React from "react";
import * as t from "./Question.css";
import { Button } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';


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

  sub = () => {
    this.props.callbackFunction(this.state.value);
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

  updateAutocorrect = (event: object, value: any) => {
    this.setState({
      value: value,
    });

    this.setState({ autocorrect: [] });
    
    let tagged_word = this.getTags(); 
    
    let current_target = value.toLowerCase();
                
    fetch("/api/qanta/v1/api/qanta/autocorrect/"+tagged_word.toLowerCase()).then(
      (res) => res.json()).then(
      (res) => {
        let first = res; 
        if(first.length > 0) {
          first = [first[0]];
        }
        
        
        if (current_target !== "" && this.props.tags.length>0) {
          fetch(
            "/api/qanta/v1/api/qanta/autocorrect/" +
              current_target
          )
            .then((res) => res.json())
            .then((res) => {
              let suggestions = first.concat(res);
              if(suggestions) {
                suggestions = suggestions.concat(["Unknown"]);
              }
              else {
                suggestions = ["Unknown"];
              }
              suggestions = Array.from(new Set(suggestions));
              this.setState({ autocorrect: suggestions });
            });
        }
      });

  };

  setValue = (i: string) => {
    this.setState({
      value: i,
      autocorrect: [],
    });
  };

  run_local = (i: any, f: any) => {
    return function () {
      f(i);
    };
  };

  getAutocorrect = () => {
    let ret = [];
    let arr = this.state.autocorrect;
    for (var i = 0; i < arr.length; i++) {
      ret.push(
        <div onClick={this.run_local(arr[i], this.setValue)}>
          <strong> {arr[i].substr(0, this.state.value.length)}</strong>
          {arr[i].substr(this.state.value.length+10)}
          <input type="hidden" value={arr[i]}  />
        </div>
      );
    }

    while (ret.length < 5) {
      ret.push(<div> </div>);
    }

    return ret;
  };

  clearAutocorrect = () => {
    this.setState({ autocorrect: [] });
  };
  
  checkKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if(e.keyCode === 13) { 
      setTimeout(this.sub,100);
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
          disabled={is_hidden}/>}

        />
        <Button hidden ={is_hidden} style={{ fontSize: 24 }} color="primary" onClick={this.sub}>
          Save
        </Button>
        <Button hidden={is_hidden} style={{ fontSize: 24 }} color="primary" onClick={this.undo}>
          Undo
        </Button>
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
    else if(prevProps !== this.props && this.props.entity === "" ) {
      let indices = this.props.tags;
      let words = [];
      for (var i = indices[0]; i <= indices[1]; i++) {
        words.push(this.props.tokens[i]);
      }
      this.setState({value: words.join(" ")});
    }
  
  }

  render() {
    console.log("TaggedInfo Style "+t);
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
