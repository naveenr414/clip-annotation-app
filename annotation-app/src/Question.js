import * as React from 'react';
import { Button } from '@material-ui/core';
import './Question.css';  
import TaggedInfo from './TaggedInfo';
import Chip from '@material-ui/core/Chip';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';


export default class Question extends React.Component {  
  state = {
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
  
  get_data = () => {
    fetch("http://localhost:8000/api/qanta/v1/api/qanta/v1/"+this.state.question_id)
      .then(res=>res.json())
      .then((result) => {
        this.setState({
          question_text: result["text"],
          answer: result["answer"],
          tournament: result["tournament"],
          entities: result["entities"],
          entity_locations: result["entity_locations"],
          tokens: result["tokens"],
        });
      }
    );
  }
  
  constructor(props) {
    super(props);
    this.state.question_id = props.question_id;
    this.get_data();
  }
  
  editEntity = (entity_number) => {
    this.setState({
      currently_tagged: this.state.entity_locations[entity_number], 
      current_entity:  this.state.entities[entity_number],
    });
  }
  
  deleteEntity = (entity_number) => {
    this.state.entities.splice(entity_number,1);
    this.state.entity_locations.splice(entity_number,1);
    this.write_entities();
    this.setState({
      preview: this.state.preview,
    });    
  }
  
  /* Add another word to the current entity */ 
  addToTag = (i) => { 
    let new_tag = this.state.current_entity!="";
    new_tag |=this.state.currently_tagged.length == 0;
    console.log(new_tag);
    if(new_tag) {
      this.setState({
        currently_tagged: [i,i],
        current_entity: "",
      });
    }
    else {
      let lower_bound = Math.min(i,this.state.currently_tagged[0]);
      let upper_bound = Math.max(i,this.state.currently_tagged[1]);
      this.setState({
        currently_tagged: [lower_bound,upper_bound],
      });      
    }
  }
  
  changeBold = (e) => {
    e.target.style.fontWeight = 'bold';
  }
  
  changeUnbold = (e) => {
    e.target.style.fontWeight = 'normal';
  }
  
  titleCase = (string) => {
    var sentence = string.toLowerCase().split(" ");
    for(var i = 0; i< sentence.length; i++){
       sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
       sentence[i] = sentence[i][0]=="("?"("+sentence[i][1].toUpperCase()+sentence[i].slice(2):sentence[i];
    }
   return sentence.join(" ");
  }
  
  add_tokens_between = (l,spaces,a,b) => {
    let s = "";
    for(var i = a;i<=b;i++) {
      s+=l[i];
      if(i!==b && spaces[i]) {
        s+=" ";
      }
    }
    return s;
  }
  
  run_local = (i,f) => {
    return (function() {f(i)});
  }
    
  get_question = () => {
    
    let entity_color = "primary";
    let tagged_color = "secondary";
    
    let tokens = [];
    let has_space = [];
        
    for(let i = 0;i<this.state.tokens.length;i++) {
      tokens.push(this.state.tokens[i]["text"]);
      if(i == this.state.tokens.length-1 || this.state.tokens[i]["end"]!=this.state.tokens[i+1]["start"]) {
        has_space.push(true);
      }
      else {
        has_space.push(false);
      } 
    }
        
    var entity_pointer = 0;
    let entity_list = this.state.entity_locations;
    var entity_length = entity_list.length;
            
    let all_tags = [];
    
    if(this.state.preview) {
      tokens = tokens.splice(0,20);
    }
            
    // Loop through each of the words
    // Write it out as an HTML tag 
    let i = 0;
    
    console.log(tokens);
    console.log(entity_list);
    
    while(i<tokens.length) {
      let current_token = tokens[i];
      
      console.log(i);
      
      let is_entity = entity_length>entity_pointer; 
      is_entity=is_entity && entity_list[entity_pointer][0] == i;
      
      let currently_tagged = this.state.currently_tagged.length>0 
      currently_tagged = currently_tagged && i == this.state.currently_tagged[0]
      
      if(is_entity) {
        // Create a list of words with the entity itself 
        let word = this.add_tokens_between(tokens,has_space,entity_list[entity_pointer][0],
        entity_list[entity_pointer][1]);        
        word+=" (" + this.titleCase(this.state.entities[entity_pointer])+ ")";
        i = entity_list[entity_pointer][1]+1;
                
        let ret = <Chip label={word} 
          className="chip"
          onClick={this.run_local(entity_pointer,this.editEntity)}  
          key={i-1} 
          onDelete={this.run_local(entity_pointer,this.deleteEntity)} 
          color={entity_color}/>
        entity_pointer+=1;
        all_tags.push(ret);
      }
      else if(currently_tagged) {        
        let word = this.add_tokens_between(tokens, has_space,this.state.currently_tagged[0],this.state.currently_tagged[1]);
        i = this.state.currently_tagged[1]+1;
        let ret = <Chip label={word} 
          className="chip"
          key={i-1}
          color={tagged_color} /> 
        all_tags.push(ret);
      }
      else {
        let space = "";
        if(has_space[i]) {
            space = " ";
        }

        let ret=<span key={i} 
        onMouseEnter={this.changeBold} 
        onMouseLeave={this.changeUnbold} 
        style={{backgroundColor: "white"}} 
        onClick={this.run_local(i,this.addToTag)}> 
          {tokens[i]+space} 
        </span> ;
        i+=1;
        all_tags.push(ret);
      }
    }
    return all_tags;
  }
  
  write_entities = () => {
    var xhr = new XMLHttpRequest();
    let question_id = this.state.question_id 
    let word_locations = this.state.entity_locations;
    let entity_list = this.state.entities;
    xhr.open('POST', 'http://localhost:8000/api/entity/v1/new_entity');
    xhr.send(JSON.stringify({ question_id: question_id,
      word_numbers:word_locations,
      entities: entity_list,
    }));  
  }

  
  switch_preview = () => {
    this.setState({
      preview: !this.state.preview
    });
  }
  
  // We've subimtted some new entity 
  callbackFunction = (new_entity) => {
    function titleCase(str) {
      str = str.toLowerCase().split(' ');
      for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
      }
      return str.join(' ');
    }

    if(new_entity != "") {
      new_entity = titleCase(new_entity);
      let new_array = this.state.currently_tagged;
      // Write the new entity 
      // Find out where in the list to write it
      let found = false;
      for(var i = 0;i<this.state.entity_locations.length;i++) {
        if(this.state.entity_locations[i][0] == this.state.currently_tagged[0]) {
         this.state.entities[i] = new_entity;
         found = true;
         break;
        }
        else if(this.state.entity_locations[i][0]>this.state.currently_tagged[0]) {
          this.state.entity_locations.splice(i,0,new_array);
          this.state.entities.splice(i,0,new_entity);
          found = true;
          break;
        }
      }
      if(!found) {
        this.state.entity_locations.push(new_array);
        this.state.entities.push(new_entity);
      }
          
      this.write_entities();          
    }
    
    this.setState({
        currently_tagged: [],
        current_entity: "",
    });
  }
  
  get_rotation = () => {
    if(this.state.preview) {
      return '';
    }
    else {
      return 'rotate(180deg)';
    }
  }
  
  get_entities = () => {
    let ret = []
    for(var i = 0;i<this.state.entities.length;i++) {
      ret.push(<Chip label={this.state.entities[i]} 
          style={{fontSize: 24, marginRight: 20, paddingBottom: 10, paddingTop: 10}} 
          color="primary" />);
    }
    
    return ret; 
  }
  
  render () {
    return (
      <div className="Question">
      <Card variant="outlined"> 
        <CardContent> 
          <Typography style={{fontSize: 24,}}> <span style={{fontWeight:"bold"}}> Tournament: </span> {this.state.tournament} </Typography> 
          <Typography style={{fontSize: 24,}}> <span style={{fontWeight:"bold"}}> Answer: </span> {this.state.answer} </Typography> 
        <Typography style={{fontSize: 24}}> Entities: {this.get_entities()} </Typography>
        
        <TaggedInfo callbackFunction={this.callbackFunction} question_text={this.state.question_text} tags={this.state.currently_tagged} entity={this.state.current_entity} /> 
        
        <div className="QuestionText">
          {this.get_question()} 

          <br /> 
           <IconButton
            style={{transform: this.get_rotation()}}
            aria-expanded={this.state.preview}
            onClick={this.switch_preview} 
            aria-label="show more"
            >
            <ExpandMoreIcon />
          </IconButton>
          <br /> 
        </div>
        <br /> 
        </CardContent> 
      </Card> 
      </div>

    );
  }
}

