import * as React from "react";
import {Link} from "react-router-dom";
import {Button} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from "@material-ui/core/Typography";


interface Props {}

interface State {
  question_id: string;
}


export default class PacketDeletion extends React.Component<Props, State> {
  submit = () => {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/qanta/v1/api/qanta/v1/delete_packet");
  xhr.send(
    JSON.stringify({
      question_id: this.state.question_id,
      question_nums: "",
      description: "",
      machine_tagger: "",
    })
  );

  this.setState({question_id: ''});
  }
  
  constructor(props: Props) {
    super(props);
    this.handleQuestionID = this.handleQuestionID.bind(this);
  }
  
  state: State = {
    question_id: "",
  }
  

  handleQuestionID(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({question_id: event.target.value});
  }


  render() {
    return (
      <div>             
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