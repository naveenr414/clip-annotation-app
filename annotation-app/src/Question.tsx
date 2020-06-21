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
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';


interface QuestionState {
  tournament: string;
  entities: string[];
  entity_locations: number[][];
  question_text: string;
  question_id: number;
  answer: string;
  category: string;
  // It's a list of dictionaries
  tokens: any;
  currently_tagged: number[];
  current_entity: string;
  preview: boolean;
  mouseDown: boolean;
  confirmation: boolean;
  to_delete: number;
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
    category: "",
    entity_locations: [],
    question_text: "",
    question_id: parseInt(this.props.question_id),
    answer: "",
    tokens: [],
    currently_tagged: [],
    current_entity: "",
    preview: false,
    mouseDown: false,
    confirmation: false,
    to_delete: -1,
  };
  
  componentDidUpdate  = (previous_props: QuestionProps) => {
    if(previous_props.question_id !== this.props.question_id) {
      this.setState({tournament: "",
        entities: [],
        category: "",
        entity_locations: [],
        question_text: "",
        question_id: parseInt(this.props.question_id),
        answer: "",
        tokens: [],
        currently_tagged: [],
        current_entity: "",
        preview: true,
        mouseDown: false,});
       this.get_data();
    }
  }

  // TODO: Should pull this out into the caller of Question
  get_data = () => {
    fetch(
      "/api/qanta/v1/api/qanta/v1/" +
        this.props.question_id
    )
      .then((res) => res.json())
      .then((result) => {
        this.setState({
          question_text: result["text"],
          answer: result["answer"],
          tournament: result["tournament"],
          entities: result["entities"],
          entity_locations: result["entity_locations"],
          tokens: result["tokens"],
          category: result["category"],
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

  handleClose = () => {
   this.setState({'confirmation': false,'to_delete':-1}); 
  }
  
  delete_entity = () => {
    let entity_number = this.state.to_delete

    this.state.entity_locations.splice(entity_number, 1);
    this.state.entities.splice(entity_number, 1);
    write_entities(
      parseInt(this.props.question_id),
      this.state.entity_locations,
      this.state.entities
    );
    this.setState({'confirmation': false,'to_delete':-1});
  };

  add_to_tag = (i: number) => {
    for(var j = 0;j<this.state.entity_locations.length;j++) {
      if(this.state.entity_locations[j][0]<=i && this.state.entity_locations[j][1]>=i) {
        return;
      }
    }
    
    
    if (this.state.currently_tagged.length === 0) {
      this.setState({ currently_tagged: [i, i], current_entity: "" });
    } else {
      if(i>=this.state.currently_tagged[0] && i<=this.state.currently_tagged[1]) {
        let start = this.state.currently_tagged[0];
        let end = this.state.currently_tagged[1];
        if(i-this.state.currently_tagged[0]<this.state.currently_tagged[1]-i) {
          start = i+1;
        }
        else {
          end = i-1;
        }
        
        if(end<start) {
          this.setState({currently_tagged: []});
        }
        else {
          this.setState({currently_tagged: [start,end]});
        }
        
        return;
      }   
      
      let lower_bound = Math.min(i, this.state.currently_tagged[0]);
      let upper_bound = Math.max(i, this.state.currently_tagged[1]);
      this.setState({
        currently_tagged: [lower_bound, upper_bound],
      });
    }
  };
  
  are_you_sure = (token_number: number) => {
    let entity_number = -1;
    for (var i = 0; i < this.state.entity_locations.length; i++) {
      if (
        token_number >= this.state.entity_locations[i][0] &&
        token_number <= this.state.entity_locations[i][1]
      ) {
        entity_number = i;
      }
    }
    this.setState({to_delete: entity_number,
    confirmation: true,});
  }

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
          mouseDown={this.state.mouseDown}
          in_span={in_span}
          title={current_title}
          edit_entity={this.edit_entity}
          delete_entity={this.are_you_sure}
          add_to_tag={this.add_to_tag}
          tagged={tagged}
          key={token_idx}
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
        parseInt(this.props.question_id),
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
        <a 
    href={"/api/entity/v1/all_questions/"+this.state.entities[i]} key={i}> 
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
        
        </a> 
      );
    }

    return ret;
  };
  
  render() {
    if(this.state.tokens.length == 0) {
      return <CircularProgress />;
    }
    
    let token_list = [];
    // Load in the style
    console.log("Question Style "+p);

    for (var i = 0; i < this.state.tokens.length; i++) {
      token_list.push(this.state.tokens[i]["text"]);
    }
    let tokens_with_mention = this.get_tokens_with_mention();
    return (
      <div className="Question">
        <Card variant="outlined">
          <CardHeader
            title={"Category: " + this.state.category +", Answer: "+this.state.answer}
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
            <CardContent onMouseDown={() => {
              this.setState({mouseDown:true});
              console.log(this.state.mouseDown);}} onMouseUp={() => {this.setState({mouseDown: false})}}>
              {tokens_with_mention}
              <Dialog
              open={this.state.confirmation}
              onClose={this.handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{"Sure you want to delete?"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                   Are you sure you want to delete the entity {this.state.entities[this.state.to_delete]}? 
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleClose} color="primary">
                    Don't Delete
                  </Button>
                  <Button onClick={this.delete_entity} color="primary" autoFocus>
                    Delete
                  </Button>
                </DialogActions>
            </Dialog>

            </CardContent>
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
