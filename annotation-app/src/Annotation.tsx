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

interface State {
  entity: string;
}

interface Props {}

export default class Annotation extends React.Component<Props, State> {
  componentDidMount() {
    this.setState({
      entity: "Cajal Bodies",
    });
  }

  logout = () => {
    window.sessionStorage.removeItem("token");
    this.setState({});
  };

  render() {
    console.log(t);
    console.log(question_css);
    if (window.sessionStorage.getItem("token") == null) {
      return <Redirect to="/login" />;
    }

    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Router>
              <Typography style={{ fontSize: 24, marginLeft: 50 }}>
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
              <Typography style={{ fontSize: 24, marginLeft: 50 }}>
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
              <Typography style={{ fontSize: 24, marginLeft: 50 }}>
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
            <Question question_id="2" />
            <Question question_id="3" />
            <Question question_id="4" />
          </Grid>
        </Container>
      </div>
    );
  }
}
