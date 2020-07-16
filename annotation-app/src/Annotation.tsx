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
import {setCookie,getCookie,toNormalString,toNiceString} from "./Util";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';



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
  full_summary: boolean;
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
      newPageNumber: '1',
      packetID: "",
      newPacketID: "",
      all_packets: [],
      question_id: "",
      newQuestionID: "",
      currentEntity: "",
      currentSummary: "",
      full_summary: false,
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
    let new_page_number =(this.state.pageNumber+1)%(this.state.question_list.length);
    this.setState({pageNumber:new_page_number,newPageNumber: (new_page_number+1).toString()});
  }

  decrementNumber = () => {
    let new_page_number = (this.state.pageNumber-1+this.state.question_list.length)%(this.state.question_list.length)
    this.setState({pageNumber:new_page_number,newPageNumber: (new_page_number+1).toString()});
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
      borderTop: "2px solid red",
      textAlign: "center",
      padding: "20px",
      position: 'fixed',
      left: "0",
      bottom: "0",
      height: "60px",
      width: "94%",
      overflow: this.state.full_summary?"scroll":"hidden",
    } as React.CSSProperties;
        
    const phantomStyle = {
      display: "block",
      padding: "20px",
      height: "60px",
      width: "94%",
    };
    
    if(this.state.helpOpen) {
      return <div> </div>
    }
    
    let footer_text = "";
    if(this.state.currentEntity !== "" && this.state.currentSummary !== "" && this.state.currentEntity !== undefined) {
      footer_text = " - "+this.state.currentSummary;
    }
    
    if(!this.state.full_summary) {
      footer_text = footer_text.substring(0,75);
      if(footer_text.length>0) {
        footer_text+="...";
      }
    }

    let label = <FormControlLabel
        control={<Switch checked={this.state.full_summary} onChange={() => {this.setState({full_summary: !this.state.full_summary})}} />}
        label="Full Summary"
    />
    
    if(this.state.currentEntity === "" || this.state.currentEntity === undefined) {
      label = <div> </div>
    }
        
    return (
    <div>
      <div style={phantomStyle} /> 
      <div style={footerStyle}>   {label} <Typography style={{fontSize: 16}}> <b> {toNiceString(this.state.currentEntity)} </b> {footer_text}   </Typography> </div>
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
      if(newEntity !== undefined && newEntity !== "") {
     fetch("api/qanta/v1/api/qanta/summary/" +
          toNormalString(newEntity.trim()))
        .then((res) => res.json())
        .then((result) => {
          this.setState({
              currentSummary: result[0],
          });
        }); 
      }
      else {
        this.setState({currentSummary: ""});
      }
   }
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

                {!this.state.helpOpen && <div style={{fontSize: 24, marginTop: 30, float: "left", display: "inline-flex"}} hidden={this.state.helpOpen}> 
              <Typography  style={{ fontSize: 24, marginTop: 30}}> Question No: </Typography>                 <TextField inputProps={{
  style: {fontSize: 24 } 
}} style={{ fontSize: 24, marginTop: 30, width: 25, marginLeft: 20, marginRight: 20}} color="primary" value={this.state.newPageNumber} onChange={this._handleTextFieldChange} hidden={this.state.helpOpen} />
                <Typography style={{ fontSize: 24, marginTop: 30}}>  out of {this.state.question_list.length} </Typography>  <Button style={{ fontSize: 24, padding:"0px 0px", marginTop: 23 }} hidden={this.state.helpOpen} color="primary" onClick={this.changePage}>
                  Go
                </Button> 
                </div> }
              <Grid item xs={6} hidden={this.state.helpOpen}>
                
                <Button style={{ fontSize: 24, margin: 40 }} color="primary" onClick={this.decrementNumber}>
                  Previous
                </Button>
                <Button style={{ fontSize: 24, margin: 40 }} color="primary" onClick={this.incrementNumber}>
                  Next
                </Button>
              </Grid>
              
              
              {this.render_questions()}


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
