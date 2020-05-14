import * as React from "react";
import * as t from "./Question.css";
import { Button, Input } from "@material-ui/core";
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
    console.log(value);
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
        
        if (current_target !== "") {
          fetch(
            "/api/qanta/v1/api/qanta/autocorrect/" +
              current_target
          )
            .then((res) => res.json())
            .then((res) => {
              this.setState({ autocorrect: first.concat(res) });
            });
        }
        else {
          this.setState({autocorrect: first});
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
          {arr[i].substr(this.state.value.length)}
          <input type="hidden" value={arr[i]} />
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

  getInput = () => {   
    if (this.props.tags.length > 0) {
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
            renderInput={(params) => <TextField {...params} label="Entity" variant="outlined" />}

          />
          <Button style={{ fontSize: 24 }} color="primary" onClick={this.sub}>
            Save
          </Button>
          <Button style={{ fontSize: 24 }} color="primary" onClick={this.undo}>
            Undo
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          {" "}
          <br /> <br /> <br /> <br />{" "}
        </div>
      );
    }
  };

  onChange(id: any, newValue: string) {}

  getStatus = () => {
    if (this.props.tags.length > 0) {
      return "Current Tags:";
    } else {
      return "Nothing currently tagged";
    }
  };
  
  componentDidUpdate(prevProps: Props) {
    if(prevProps !== this.props && this.props.entity!=="" && prevProps.entity === "") {
      this.setState({value:this.props.entity});
    }
  }

  render() {
    console.log(t);
    return (
      <div>
        <Typography color="textSecondary" style={{ fontSize: 24 }}>
          {this.getStatus()} {this.getTags()}
        </Typography>
        {this.getInput()}


      </div>
    );
  }
}
