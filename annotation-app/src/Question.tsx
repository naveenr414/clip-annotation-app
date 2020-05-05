import * as React from "react";
import { Button } from "@material-ui/core";
import * as p from "./Question.css";
import TaggedInfo from "./TaggedInfo";
import Chip from "@material-ui/core/Chip";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import CardHeader from "@material-ui/core/CardHeader";
import Collapse from "@material-ui/core/Collapse";
import CardActions from "@material-ui/core/CardActions";
import * as PropTypes from "prop-types";

interface QuestionState {
  tournament: string;
  entities: string[];
  entity_locations: number[][];
  question_text: string;
  question_id: number;
  answer: string;

  // It's a list of dictionaries
  tokens: any;
  currently_tagged: number[];
  current_entity: string;
  preview: boolean;
}

interface QuestionProps {
  question_id: string;
}

interface WordWithMentionProps {
  text: string;
  title: string | null;
  token_idx: number;
  in_span: boolean;
  starting_span: boolean;
  // TODO: Fix the types on this
  edit_entity: any;
  delete_entity: any;
  add_to_tag: any;
}

class WordWithMention extends React.Component<WordWithMentionProps, {}> {
  state = {};
  constructor(props: WordWithMentionProps) {
    super(props);
  }
  changeBold = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    let ele = e.target as HTMLSpanElement;
    ele.style.backgroundColor = "yellow";
  };

  changeUnbold = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    let ele = e.target as HTMLSpanElement;
    ele.style.backgroundColor = "white";
  };
  run_local = (i: any, f: any) => {
    return function () {
      f(i);
    };
  };
  render() {
    var mention_text = this.props.title;
    if (this.props.in_span && !this.props.starting_span) {
      mention_text = "";
    }
    let mention =
      this.props.title == undefined ? (
        <Chip className="hidden" />
      ) : (
        <Chip
          label={mention_text}
          className="chip"
          //onClick={this.run_local(entity_pointer, this.editEntity)}
          //onDelete={this.run_local(entity_pointer, this.deleteEntity)}
          color={"primary"}
        />
      );
    return (
      <div key={this.props.token_idx} className="word">
        <div
          className="word-text"
          onMouseEnter={this.changeBold}
          onMouseLeave={this.changeUnbold}
          // onClick={this.run_local(this.props.token_idx, this.addToTag)}
        >
          {this.props.text}
        </div>
        <div className="word-mention">{mention}</div>
      </div>
    );
  }
}

export default class Question extends React.Component<
  QuestionProps,
  QuestionState
> {
  state: QuestionState = {
    tournament: "",
    entities: [],
    entity_locations: [],
    question_text: "",
    question_id: 0,
    answer: "",
    tokens: [],
    currently_tagged: [],
    current_entity: "",
    preview: true,
  };

  // TODO: Should pull this out into the caller of Question
  get_data = () => {
    fetch(
      "http://localhost:8000/api/qanta/v1/api/qanta/v1/" +
        this.state.question_id
    )
      .then((res) => res.json())
      .then((result) => {
        console.debug(result);
        this.setState({
          question_text: result["text"],
          answer: result["answer"],
          tournament: result["tournament"],
          entities: result["entities"],
          entity_locations: result["entity_locations"],
          tokens: result["tokens"],
        });
      });
  };

  constructor(props: QuestionProps) {
    super(props);
    this.state.question_id = parseInt(props.question_id);
    this.get_data();
  }

  editEntity = (entity_number: number) => {
    this.setState({
      currently_tagged: this.state.entity_locations[entity_number],
      current_entity: this.state.entities[entity_number],
    });
  };

  deleteEntity = (entity_number: number) => {
    this.state.entities.splice(entity_number, 1);
    this.state.entity_locations.splice(entity_number, 1);
    this.write_entities();
    this.setState({
      preview: this.state.preview,
    });
  };

  /* Add another word to the current entity */

  addToTag = (i: number) => {
    let new_tag = this.state.current_entity != "";
    new_tag = new_tag || this.state.currently_tagged.length == 0;
    console.log(new_tag);
    if (new_tag) {
      this.setState({
        currently_tagged: [i, i],
        current_entity: "",
      });
    } else {
      let lower_bound = Math.min(i, this.state.currently_tagged[0]);
      let upper_bound = Math.max(i, this.state.currently_tagged[1]);
      this.setState({
        currently_tagged: [lower_bound, upper_bound],
      });
    }
  };

  titleCase = (string: string) => {
    var sentence = string.toLowerCase().split(" ");
    for (var i = 0; i < sentence.length; i++) {
      sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
      sentence[i] =
        sentence[i][0] == "("
          ? "(" + sentence[i][1].toUpperCase() + sentence[i].slice(2)
          : sentence[i];
    }
    return sentence.join(" ");
  };

  run_local = (i: any, f: any) => {
    return function () {
      f(i);
    };
  };

  get_tokens_with_mention = () => {
    let position_to_mention = new Map();
    for (let i = 0; i < this.state.entity_locations.length; i++) {
      let span = this.state.entity_locations[i];
      let title = this.state.entities[i];
      for (let ment_idx = span[0]; ment_idx <= span[1]; ment_idx++) {
        position_to_mention.set(ment_idx, title);
      }
    }
    var in_span = false;
    var starting_span = false;
    var current_title = undefined;
    let tokens_w_title = [];
    var token_idx = 0;
    for (token_idx = 0; token_idx < this.state.tokens.length; token_idx++) {
      let text: string = this.state.tokens[token_idx]["text"];
      let token_title = position_to_mention.get(token_idx);
      if (token_title == undefined) {
        if (current_title == undefined) {
          in_span = false;
          starting_span = false;
        } else {
          current_title = token_title;
          in_span = true;
          starting_span = true;
        }
        // TODO: This does not handle the case where there are two separate mentions
        // of the same title, right after one another. Need mention instead of title for
        // this
      } else {
        if (token_title == current_title) {
          in_span = true;
          starting_span = false;
        } else {
          in_span = true;
          current_title = token_title;
          starting_span = true;
        }
      }
      tokens_w_title.push(
        // TODO: How to pass edit events? I know you can do it, but dont remember
        <WordWithMention
          token_idx={token_idx}
          text={text}
          in_span={in_span}
          starting_span={starting_span}
          title={current_title}
          edit_entity={undefined}
          delete_entity={undefined}
          add_to_tag={undefined}
        />
      );
    }
    return tokens_w_title;
  };

  write_entities = () => {
    var xhr = new XMLHttpRequest();
    let question_id = this.state.question_id;
    let word_locations = this.state.entity_locations;
    let entity_list = this.state.entities;
    xhr.open("POST", "http://localhost:8000/api/entity/v1/new_entity");
    xhr.send(
      JSON.stringify({
        question_id: question_id,
        word_numbers: word_locations,
        entities: entity_list,
        user_id: window.sessionStorage.getItem("token"),
      })
    );
  };

  switch_preview = () => {
    this.setState({
      preview: !this.state.preview,
    });
  };

  // We've subimtted some new entity
  callbackFunction = (new_entity: string) => {
    function titleCase(str: string) {
      let split_str = str.toLowerCase().split(" ");
      for (var i = 0; i < split_str.length; i++) {
        split_str[i] =
          split_str[i].charAt(0).toUpperCase() + split_str[i].slice(1);
      }
      return split_str.join(" ");
    }

    if (new_entity != "") {
      new_entity = titleCase(new_entity);
      let new_array = this.state.currently_tagged;
      // Write the new entity
      // Find out where in the list to write it
      let found = false;
      for (var i = 0; i < this.state.entity_locations.length; i++) {
        if (
          this.state.entity_locations[i][0] == this.state.currently_tagged[0]
        ) {
          this.state.entities[i] = new_entity;
          found = true;
          break;
        } else if (
          this.state.entity_locations[i][0] > this.state.currently_tagged[0]
        ) {
          this.state.entity_locations.splice(i, 0, new_array);
          this.state.entities.splice(i, 0, new_entity);
          found = true;
          break;
        }
      }
      if (!found) {
        this.state.entity_locations.push(new_array);
        this.state.entities.push(new_entity);
      }

      this.write_entities();
    }

    this.setState({
      currently_tagged: [],
      current_entity: "",
    });
  };

  get_rotation = () => {
    if (this.state.preview) {
      return "";
    } else {
      return "rotate(180deg)";
    }
  };

  get_entities = () => {
    let ret = [];
    for (var i = 0; i < this.state.entities.length; i++) {
      ret.push(
        <Chip
          label={this.state.entities[i]}
          style={{
            fontSize: 24,
            marginRight: 20,
            paddingBottom: 10,
            paddingTop: 10,
          }}
          color="primary"
        />
      );
    }

    return ret;
  };

  getUsername = () => {
    return fetch("http://localhost:8000/token/users/me", {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: "Bearer " + window.sessionStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        return result;
      });
  };

  render() {
    let tokens_with_mention = this.get_tokens_with_mention();
    return (
      <div className="Question">
        <Card variant="outlined">
          <CardHeader
            title={"Qanta Question: " + this.props.question_id}
            className="question-header"
          />
          <Divider />
          <CardContent>
            <Typography style={{ fontSize: 24 }}>
              <span style={{ fontWeight: "bold" }}> Tournament: </span>
              {this.state.tournament}
            </Typography>
            <Typography style={{ fontSize: 24 }}>
              <span style={{ fontWeight: "bold" }}> Answer: </span>
              {this.state.answer}
            </Typography>
            <Typography style={{ fontSize: 24 }}>
              <span style={{ fontWeight: "bold" }}> Qanta ID: </span>
              {this.props.question_id}
            </Typography>
            <Divider />
            <Typography style={{ fontSize: 24 }}>
              Entities: {this.get_entities()}
            </Typography>
            <TaggedInfo
              callbackFunction={this.callbackFunction}
              question_text={this.state.question_text}
              tags={this.state.currently_tagged}
              entity={this.state.current_entity}
            />
            <Divider />
          </CardContent>

          <Collapse
            className="QuestionText"
            collapsedHeight="200px"
            in={!this.state.preview}
          >
            <CardContent>{tokens_with_mention}</CardContent>
          </Collapse>
          <CardActions disableSpacing>
            <IconButton
              onClick={this.switch_preview}
              aria-expanded={!this.state.preview}
              aria-label="show more"
              className="center"
            >
              <ExpandMoreIcon />
            </IconButton>
          </CardActions>
        </Card>
      </div>
    );
  }
}
