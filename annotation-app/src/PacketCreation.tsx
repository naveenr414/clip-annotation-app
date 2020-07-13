import * as React from "react";
import {Link} from "react-router-dom";
import {Button} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from "@material-ui/core/Typography";


interface Props {}

interface State {
  question_nums: string;
  question_id: string;
  description: string;
  machine_tagger: string;
}


export default class PacketCreation extends React.Component<Props, State> {
  submit = () => {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/qanta/v1/api/qanta/v1/new_packet");
  xhr.send(
    JSON.stringify({
      question_nums: this.state.question_nums,
      question_id: this.state.question_id,
      description: this.state.description,
      machine_tagger: this.state.machine_tagger,
    })
  );

  this.setState({question_nums: '',question_id: '',description: '',machine_tagger: ''});
  }
  
  constructor(props: Props) {
    super(props);
    this.handlePacket = this.handlePacket.bind(this);
    this.handleQuestionID = this.handleQuestionID.bind(this);
    this.handleDescription = this.handleDescription.bind(this);
    this.handleMachine = this.handleMachine.bind(this);
  }
  
  state: State = {
    question_nums: "",
    question_id: "",
    description: "",
    machine_tagger: "",
  }
  
  handlePacket(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ question_nums: event.target.value });
  }
  
  handleQuestionID(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({question_id: event.target.value});
  }
  
  handleDescription(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({description: event.target.value});
  }
  
  handleMachine (event: any)  {
    this.setState({machine_tagger: event.target.value});
  }
  
  render() {
    return (
      <div> 
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="question_nums"
              label="Questions (seperated by comma)"
              name="question_nums"
              value={this.state.question_nums}
              onChange={this.handlePacket}
              autoFocus
            />
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="question_id"
              label="Packet ID"
              name="question_id"
              value={this.state.question_id}
              onChange={this.handleQuestionID}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
              value={this.state.description}
              onChange={this.handleDescription}
            />

        <Typography style={{fontSize: 24}}> Tagger: </Typography> <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={this.state.machine_tagger}
          onChange={this.handleMachine}
        >
          <MenuItem value={"tagme"}>Tagme</MenuItem>
          <MenuItem value={"nel"}>Neural EL</MenuItem>
          <MenuItem value={"blink"}>BLINK</MenuItem>
          <MenuItem value={"none"}>None</MenuItem>
        </Select>

            
          <Button onClick={this.submit} type="submit"> 
            Submit
          </Button> 
          <br />
      
          <Button> 
              <Link
                to="/"
                href="/"
                style={{
                  color: "black",
                  textDecoration: "none",
                  textAlign: "right",
                }}
              >
                    Go Home 
                </Link>
            </Button> 
      </div> 
      
    );
  }
}