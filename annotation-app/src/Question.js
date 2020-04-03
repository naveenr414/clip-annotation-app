import * as React from 'react';
import { Button, Input } from '@material-ui/core';
import './Question.css';  
import TaggedInfo from './TaggedInfo';

export default class Question extends React.Component {  
  state = {
    question_text: "",
    question_id: 0,
    tournament: "",
    entities: [],
    entity_locations: [],
    currently_tagged: [],
    preview: true,
    edit: true, 
    current_entity: "",
  };
  
  constructor(props) {
    super(props);
    let question_id = props.question_id;
    this.state.question_id = question_id; 
    fetch("http://localhost:8000/api/qanta/v1/api/qanta/v1/"+question_id)
      .then(res=>res.json())
      .then((result) => {
        this.setState({
          question_text: result["text"].toString() +" Answer: "+result["answer"].toString(),
          tournament: result["tournament"].toString(),
          entities: result["entities"],
          entity_locations: result["entity_locations"],
        });
      }
      );
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
    this.setState({
        preview: this.state.preview,
    });
    this.write_entities(this.state.question_id,this.state.entity_locations,this.state.entities);          

    
  }
  
  /* Add another word to the current entity */ 
  addToTag = (i) => { 
  
    if(this.state.current_entity!="" || this.state.currently_tagged.length == 0) {
      this.setState({
        currently_tagged: [i,i],
        current_entity: "",
      });
    }
    else {
      if(i<this.state.currently_tagged[0]) {
        this.setState({
          currently_tagged: [i,this.state.currently_tagged[0]],
        });
      }
      if(i>this.state.currently_tagged[1]) {
        this.setState({
          currently_tagged: [this.state.currently_tagged[0],i],
        });
      }
    }
  }
  
  changeBold = (e) => {
    e.target.style.fontWeight = 'bold';
  }
  
    changeUnbold = (e) => {
    e.target.style.fontWeight = 'normal';
  }
  
  get_question = () => {
    
    let words = this.state.question_text.split(" ");
    var entity_pointer = 0;
    var entity_length = this.state.entity_locations.length;
        
    let all_tags = [];
    
    // Loop through each of the words
    // Write it out as an HTML tag 
    let i = 0;
    while(i<words.length) {
      let fontWeight = "normal";

      if(words[i] == "Answer:") {
        all_tags.push(<br />);
        fontWeight = "bold";
      }
      // If it's part of an entity, then combine the tags 
      if(entity_length>entity_pointer && 
          this.state.entity_locations[entity_pointer][0] == i) {
        // We let the ID for the tag be comma seperated version of each word #
        let all_locations = this.state.entity_locations[entity_pointer];
        let comma_seperated = all_locations.map(String);
        comma_seperated = comma_seperated.join(",");
        
        let word = "";
        // Add the words in 
        for(var j = this.state.entity_locations[entity_pointer][0];j<=this.state.entity_locations[entity_pointer][1];j++) {
          word+=words[j]+" ";
          i+=1;
        }
        
        
        // At the end, when we close, add in the actual entity 
        word+="(" + this.state.entities[entity_pointer]+ ")";
        entity_pointer+=1;
                
        let ret = <mark   id={comma_seperated} style={{backgroundColor: "#a6e22d"}}key={i} onClick={(function(i,f) {return function() {f(i)}})(entity_pointer-1,this.editEntity)} > {word}</mark>
        
        all_tags.push(<mark key={i+0.5} style={{backgroundColor: "white"}}> &nbsp;</mark>);        
        all_tags.push(ret);
        all_tags.push(<mark key={i+0.215} style={{backgroundColor: "white"}}> &nbsp;</mark>);        
        all_tags.push(<mark key={i+0.75} style={{backgroundColor: "#ff00ff" }} onClick={(function(i,f) {return function() {f(i)}})(entity_pointer-1,this.deleteEntity)}>  X </mark>);
        all_tags.push(<mark key={i+0.55} style={{backgroundColor: "white"}}> &nbsp;</mark>);        
      }
      else if(this.state.currently_tagged.length>0 && i == this.state.currently_tagged[0]) {
        let all_locations = this.state.currently_tagged;
        let comma_seperated = all_locations.map(String);
        comma_seperated = comma_seperated.join(",");
        
        let word = "";
        
        // Add the words in 
        for(var j = this.state.currently_tagged[0];j<=this.state.currently_tagged[1];j++) {
          word+=words[j]+" ";
          i+=1;
        }
                        
        let ret = <mark   id={comma_seperated} style={{backgroundColor: "#ff0000",fontWeight: "normal" }}key={i+0.125}> {word}</mark>
        all_tags.push(ret);
      }
      else {
        let ret=<mark id={i} key={i+2/3} onMouseEnter={this.changeBold} onMouseLeave={this.changeUnbold} style={{backgroundColor: "white", fontWeight:fontWeight}} onClick={(function(i,f) {return function() {f(i)}})(i,this.addToTag)}> {words[i]} </mark> ;
        i+=1;
        all_tags.push(ret);
      }
    }
    
    if(this.state.preview) {
      return all_tags.slice(0,20);
    }
    
    return all_tags;
  }
  
  write_entities = (question_id, word_locations,entity_list) => {
      var xhr = new XMLHttpRequest();
     xhr.open('POST', 'http://localhost:8000/api/paste/v1/new_entity');
        xhr.send(JSON.stringify({ question_id: this.state.question_id,
        word_numbers:word_locations,
         entities: entity_list }));
      
  }

  
  switch_preview = () => {
    this.setState({
      preview: !this.state.preview
    });
  }
  
  callbackFunction = (new_entity) => {
    function removeDuplicates(array) {
      return array.filter((a, b) => array.indexOf(a) === b)
    };
    function titleCase(str) {
      str = str.toLowerCase().split(' ');
      for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
      }
      return str.join(' ');
    }

    if(new_entity != "") {
        new_entity = titleCase(new_entity);
          let new_array = this.state.currently_tagged.slice(0);
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
              
          this.write_entities(this.state.question_id,this.state.entity_locations,this.state.entities);          
    }
    this.setState({
        currently_tagged: [],
        current_entity: "",
    });
  }
  
  render () {
const trigger = <Button>Open Modal</Button>;

    return (
      <div className="Question">
        <h3> {this.state.tournament} </h3> 
        <br /> 
        <b> Entities: </b> {this.state.entities.join(",")}
        <br /> 
        <TaggedInfo callbackFunction={this.callbackFunction} question_text={this.state.question_text} tags={this.state.currently_tagged} entity={this.state.current_entity} /> 
        <br />
        
        <div className="QuestionText">
        {this.get_question()} <Button className="ellipse" onClick={this.switch_preview}> {"..."} </Button> 

        <br /> 
        </div>
        <br /> 


      </div>
            
    );
  }
}

