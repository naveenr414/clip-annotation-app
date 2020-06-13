import * as React from "react";
import Question from "./Question";
import * as question_css from "./Question.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Redirect, Link, BrowserRouter as Router } from "react-router-dom";
import * as t from "./Annotation.css";
import Help from "./Help";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { Button,TextField } from "@material-ui/core";


interface State {
  entity: string;
  helpOpen: boolean;
  question_list: number[];
  pageNumber: number;
  newPageNumber: string;
  packetID: string;
  newPacketID: string;
}

interface Props {
  
}

export default class Annotation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      entity: '',
      helpOpen: false,
      question_list: [],
      pageNumber: 0,
      newPageNumber: '',
      packetID: "",
      newPacketID: "",
    }
    this.get_questions()
  }
  
  get_questions = () => {
    fetch(
      "/api/qanta/v1/api/qanta/packet/" +
        this.state.packetID.toString()
    )
      .then((res) => res.json())
      .then((result) => {
        this.setState({
            question_list: result,
        });
      });
  };


  logout = () => {
    window.sessionStorage.removeItem("token");
    this.setState({});
  };
  
  toggleHelp = () => {
    this.setState({helpOpen:!this.state.helpOpen});
  }
  
  render_questions = () => {
    if(this.state.question_list.length>this.state.pageNumber) {
      return <Question question_id={this.state.question_list[this.state.pageNumber].toString()} />
    }
    else {
      return [];
    }    
  }
  
  incrementNumber = () => {
    this.setState({pageNumber:(this.state.pageNumber+1)%(this.state.question_list.length)});
  }

  decrementNumber = () => {
    this.setState({pageNumber:(this.state.pageNumber-1+this.state.question_list.length)%(this.state.question_list.length)});
  }
  
  changePage = () => {
    this.setState({pageNumber: parseInt(this.state.newPageNumber)-1});
  }
  
  _handleTextFieldChange = (e: any) => {
        this.setState({
            newPageNumber: e.target.value,
        });
    }
    
  changePacketID = () => {
    const p = this.state.newPacketID

    this.setState({packetID:p}, () => {
      this.get_questions();
    });
  }

  changePacket = (e: any) => {
        this.setState({
            newPacketID: e.target.value,
        });
  }
  
  render = () => {
    console.log("Annotation style "+t + " "+question_css);
    if (window.sessionStorage.getItem("token") == null) {
      return <Redirect to="/login" />;
    }
    
    if(this.state.packetID === "") {
      return (<div> <Typography style={{ fontSize: 24, marginRight: 20}}> Go to Packet: {" "}  </Typography> 
      <TextField style={{ fontSize: 24 }} color="primary" value={this.state.newPacketID} onChange={this.changePacket} />
      <Button style={{ fontSize: 24 }} color="primary" onClick={this.changePacketID}>
        Submit
      </Button> </div>);

    }
    else {
      return (
        <div>
          <AppBar position="static">
            <Toolbar>
              <Router>
                <Typography component={'span'} style={{ fontSize: 24, marginLeft: 50 }}>
                  {" "}
                  <Link
                    to="/"
                    href="/"
                    style={{
                      color: "white",
                      textDecoration: "none",
                      textAlign: "right",
                    }}
                  >
                    {" "}
                    Home{" "}
                  </Link>{" "}
                </Typography>
                <Typography component={'span'} style={{ fontSize: 24, marginLeft: 50 }}>
                  {" "}
                  <Link
                    to="/"
                    href="/login"
                    style={{
                      color: "white",
                      textDecoration: "none",
                      textAlign: "right",
                    }}
                  >
                    {" "}
                    Login{" "}
                  </Link>{" "}
                </Typography>
                <Typography component={'span'} style={{ fontSize: 24, marginLeft: 50 }}>
                  {" "}
                  <Link
                    to="/"
                    onClick={this.logout}
                    href="/login"
                    style={{
                      color: "white",
                      textDecoration: "none",
                      textAlign: "right",
                    }}
                  >
                    {" "}
                    Logout{" "}
                  </Link>{" "}
                </Typography>
                <HelpOutlineIcon style={{ fontSize: 24, width: 30, height: 30, marginLeft: 50 }}                   onClick={this.toggleHelp} />
              </Router>
            </Toolbar>
          </AppBar>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <Container maxWidth="lg">
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
            >
              <Help onClose={this.toggleHelp} show={this.state.helpOpen} />
              <Typography  style={{ fontSize: 24, marginTop: 30}}> Question No: {this.state.pageNumber+1} out of {this.state.question_list.length} </Typography> 
              {this.render_questions()}

              <Grid item xs={6}>
                <Button style={{ fontSize: 24, margin: 40 }} color="primary" onClick={this.incrementNumber}>
                  Next
                </Button>
                <Button style={{ fontSize: 24, margin: 40 }} color="primary" onClick={this.decrementNumber}>
                  Previous
                </Button>
              </Grid>
              <div style={{display: "flex"}}> 
                <Typography style={{ fontSize: 24, marginRight: 20}}> Go to Question: {" "}  </Typography> 
                <TextField style={{ fontSize: 24 }} color="primary" value={this.state.newPageNumber} onChange={this._handleTextFieldChange} />
                <Button style={{ fontSize: 24 }} color="primary" onClick={this.changePage}>
                  Submit
                </Button>
              </div> 
            </Grid>
          </Container>
        </div>
      );
    }
  }
}
