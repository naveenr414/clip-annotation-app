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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Drawer from '@material-ui/core/Drawer';
import {setCookie,getCookie} from "./Util";


interface State {
  entity: string;
  helpOpen: boolean;
  question_list: number[];
  pageNumber: number;
  newPageNumber: string;
  packetID: string;
  newPacketID: string;
  all_packets: any;
  question_id: string,
  newQuestionID: string;
  currentEntity: string; 
  currentSummary: string;
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
      all_packets: [],
      question_id: "",
      newQuestionID: "",
      currentEntity: "",
      currentSummary: "",
    }
    
    this.get_all_packets();
  }
  
  get_all_packets = () => {
    fetch(
      "/api/qanta/v1/api/qanta/all_packets/").then((res)=>res.json()).then((result) => 
      {
      this.setState({all_packets: result});
      });
  };
  
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
    
    setCookie("token","",0);
    this.setState({});
  };
  
  toggleHelp = () => {
    this.setState({helpOpen:!this.state.helpOpen});
  }
  
  render_questions = () => {
    if(this.state.question_id !== "") {
      return <Question packet_id={"-1"} question_id={this.state.question_id} setCurrentEntity={this.setCurrentEntity} />
    }
    
    if(this.state.question_list.length>this.state.pageNumber && !this.state.helpOpen) {
      return <Question packet_id={this.state.packetID} question_id={this.state.question_list[this.state.pageNumber].toString()} setCurrentEntity={this.setCurrentEntity} />
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
    
  changeQuestion = (e:any) => {
    this.setState({newQuestionID: e.target.value});
  }
    
  changeQuestionID = () => {
    const p = this.state.newQuestionID
    this.setState({question_id:p});
  }

  changePacket = (e: any) => {
        this.setState({
            newPacketID: e.target.value,
        });
  }
  
  run_local(i: any, f: any){
    return () => {
      f(i);
    };
    
  }
  
  setPacket = (p: any) => {
    this.setState({packetID: this.state.all_packets[p]["packet_id"].toString()}, () => {
      this.get_questions();
    });
  }
  
  getFooter = () => {
    const footerStyle = {
      backgroundColor: "white",
      fontSize: "20px",
      borderTop: "1px solid #E7E7E7",
      textAlign: "center",
      padding: "20px",
      position: 'fixed',
      left: "0",
      bottom: "0",
      height: "60px",
      width: "96%",
    } as React.CSSProperties;
    
    const phantomStyle = {
      display: "block",
      padding: "20px",
      height: "60px",
      width: "96%",
    };
    
    let footer_text = "";
    if(this.state.currentEntity !== "" && this.state.currentSummary !== "") {
      footer_text = " - "+this.state.currentSummary
    }
        
    return (
    <div>
      <div style={phantomStyle} />
      <div style={footerStyle}> <Typography style={{fontSize: 24}}> <b> {this.state.currentEntity} </b> {footer_text} </Typography>  </div>
    </div>
  );
  }
  
  
  getNoPacket = () => {
    let packet_rows = [];
    for(var i = 0;i<this.state.all_packets.length;i++) {
      packet_rows.push(
      <TableRow> 
      <TableCell>
      <Link to="/" onClick={this.run_local(i,this.setPacket)}> {this.state.all_packets[i]['packet_id']} </Link> 
      </TableCell>
      <TableCell>
      {this.state.all_packets[i]['description']}
      </TableCell>
      </TableRow>
      );
    }
    
    return (<div style={{marginLeft: 10}}> 

      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow style={{fontWeight: "bold"}}>
              <TableCell>Packet ID</TableCell>
              <TableCell align="right">Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody> 
          {packet_rows}
          </TableBody> 
       </Table> 
     </TableContainer> 

     <Typography style={{ fontSize: 24, marginRight: 20}}> Or go to Question: {" "}  </Typography> 
      <TextField style={{ fontSize: 24 }} color="primary" value={this.state.newQuestionID} onChange={this.changeQuestion} />
      <Button style={{ fontSize: 24 }} color="primary" onClick={this.changeQuestionID}>
        Submit
      </Button>
     
      </div>)
  }
  
  setCurrentEntity = (newEntity: string) => {
    if(newEntity !== this.state.currentEntity) {
      this.setState({currentEntity: newEntity});
   fetch("api/qanta/v1/api/qanta/summary/" +
        newEntity)
      .then((res) => res.json())
      .then((result) => {
        this.setState({
            currentSummary: result[0],
        });
      });    }
  }
  
  render = () => {
    console.log("Annotation style "+t + " "+question_css);
    console.log(getCookie("token"));
    if (getCookie("token") === "") {
      return <Redirect to="/login" />;
    }
    
    

    if(this.state.packetID === "" && this.state.question_id === "") {
      return this.getNoPacket();

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
                    onClick={() => window.location.reload()}
                    href=""
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
              <Grid item xs={6} hidden={this.state.helpOpen}>
                
                <Button style={{ fontSize: 24, margin: 40 }} color="primary" onClick={this.decrementNumber}>
                  Previous
                </Button>
                <Button style={{ fontSize: 24, margin: 40 }} color="primary" onClick={this.incrementNumber}>
                  Next
                </Button>
              </Grid>
              
              
              {this.render_questions()}


              <div style={{display: this.state.helpOpen?"none":"flex"}}> 
                <Typography style={{ fontSize: 24, marginRight: 20}}> Go to Question: {" "}  </Typography> 
                <TextField style={{ fontSize: 24 }} color="primary" value={this.state.newPageNumber} onChange={this._handleTextFieldChange} />
                <Button style={{ fontSize: 24 }} color="primary" onClick={this.changePage}>
                  Submit
                </Button>
              </div> 
              <br /> 
              <br />
              <br />
            </Grid>
          </Container>
          {this.getFooter()}
        </div>
      );
    }
  }
}
