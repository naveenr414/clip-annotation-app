import * as React from "react";
import { titleCase, write_entities } from "./Util";
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
import Span from "./Span";

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
      "/api/qanta/v1/api/qanta/v1/" +
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

  // The three ways to update currently tagged
  edit_entity = (token_number: number) => {
    let entity_number = -1;
    for (var i = 0; i < this.state.entity_locations.length; i++) {
      if (
        token_number >= this.state.entity_locations[i][0] &&
        token_number <= this.state.entity_locations[i][1]
      ) {
        entity_number = i;
      }
    }

    this.setState({
      currently_tagged: this.state.entity_locations[entity_number],
      current_entity: this.state.entities[entity_number],
    });
  };

  delete_entity = (token_number: number) => {
    let entity_number = -1;
    for (var i = 0; i < this.state.entity_locations.length; i++) {
      if (
        token_number >= this.state.entity_locations[i][0] &&
        token_number <= this.state.entity_locations[i][1]
      ) {
        entity_number = i;
      }
    }

    this.state.entity_locations.splice(entity_number, 1);
    this.state.entities.splice(entity_number, 1);
    write_entities(
      this.state.question_id,
      this.state.entity_locations,
      this.state.entities
    );
    this.setState({});
  };

  add_to_tag = (i: number) => {
    if (this.state.currently_tagged.length === 0) {
      this.setState({ currently_tagged: [i, i], current_entity: "" });
    } else {
      let lower_bound = Math.min(i, this.state.currently_tagged[0]);
      let upper_bound = Math.max(i, this.state.currently_tagged[1]);
      this.setState({
        currently_tagged: [lower_bound, upper_bound],
      });
    }
  };

  // Render each token
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
    var current_title = undefined;
    let tokens_w_title = [];
    var token_idx = 0;
    let entity_pointer = 0;
    
    while(token_idx < this.state.tokens.length) {
      let text: string = this.state.tokens[token_idx]["text"];
      let token_title = position_to_mention.get(token_idx);
      let next_token = token_idx+1;
      
      // Is it a labeled entity 
      if (token_title === undefined) {
        in_span = false;
         current_title = "";
      } else {
        text = "";
        in_span = true; 
        for(var i = this.state.entity_locations[entity_pointer][0];
          i<=this.state.entity_locations[entity_pointer][1];i++) {
            text+=this.state.tokens[i]["text"] + " ";
        }
          
        next_token = i;
        current_title = titleCase(this.state.entities[entity_pointer]);
        entity_pointer += 1;
      }

      
      let tagged = false;
      if (
        this.state.currently_tagged.length === 2 &&
        token_idx >= this.state.currently_tagged[0] &&
        this.state.currently_tagged[1] >= token_idx
      ) {
        tagged = true;
      }

      tokens_w_title.push(
        <Span
          token_idx={token_idx}
          text={text}
          in_span={in_span}
          title={current_title}
          edit_entity={this.edit_entity}
          delete_entity={this.delete_entity}
          add_to_tag={this.add_to_tag}
          tagged={tagged}
        />
      );
      
      token_idx = next_token;
    }
    return tokens_w_title;
  };

  // We've subimtted some new entity
  callbackFunction = (new_entity: string) => {
    if (new_entity !== "") {
      new_entity = titleCase(new_entity);
      let new_array = this.state.currently_tagged;
      // Remove all intersecting entities, entity locations
      let to_splice = [];
      for (let i = 0; i < this.state.entity_locations.length; i++) {
        if (
          !(
            this.state.entity_locations[i][0] > new_array[1] ||
            this.state.entity_locations[i][1] < new_array[0]
          )
        ) {
          to_splice.push(i);
        }
      }
      for (let i = to_splice.length - 1; i >= 0; i--) {
        this.state.entity_locations.splice(i, 1);
        this.state.entities.splice(i, 1);
      }

      // Write the new entity
      // Find out where in the list to write it
      let found = false;
      for (var i = 0; i < this.state.entity_locations.length; i++) {
        if (
          this.state.entity_locations[i][0] === this.state.currently_tagged[0]
        ) {
          let new_entity_list = this.state.entities;
          new_entity_list[i] = new_entity;
          this.setState({ entities: new_entity_list });
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

      write_entities(
        this.state.question_id,
        this.state.entity_locations,
        this.state.entities
      );
    }

    this.setState({
      currently_tagged: [],
      current_entity: "",
    });
  };

  switch_preview = () => {
    this.setState({
      preview: !this.state.preview,
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

  render() {
    let token_list = [];
    // Load in the style
    console.log("Style "+p);

    for (var i = 0; i < this.state.tokens.length; i++) {
      token_list.push(this.state.tokens[i]["text"]);
    }
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
              tokens={token_list}
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
              style={{ transform: this.get_rotation() }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </CardActions>
        </Card>
      </div>
    );
  }
}
