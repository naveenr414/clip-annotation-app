import Chip from "@material-ui/core/Chip";
import * as React from "react";
import {titleCase} from "./Util";

interface SpanProps {
  text: string;
  title: string | null;
  in_span: boolean;
  token_idx: number;
  tagged: boolean;
  edit_entity: (arg0: number) => void ;
  delete_entity: (arg0: number) => void;
  add_to_tag: (arg0: number) => void;
  mouseDown: boolean;
  setCurrentEntity: any;
}

interface SpanState {
  full_mention: boolean,
  editing: boolean,
}

export default class Span extends React.Component<SpanProps, SpanState> {
  state = {
    full_mention: false, 
    editing: false,
  };
  
  changeBold = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if(this.state.editing) {
      return 
    }
    
    if(this.props.mouseDown){
        this.run_local(this.props.token_idx, this.props.add_to_tag)();
    }
    else {
      let ele = e.target as HTMLSpanElement;
      ele.style.backgroundColor = "yellow";
    }
  };

  changeUnbold = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if(!this.props.in_span) {
      let ele = e.target as HTMLSpanElement;
      ele.style.backgroundColor = "white";
    }
  };
  
  run_local(i: any, f: any,another_function?: any){
    return () => {
      f(i);
      if(another_function !== undefined) {
        another_function();
      }
    };
    
  }
 
  
  render() {
    var mention_text = this.props.title;
    if (!this.props.in_span || mention_text == null) {
      mention_text = "";
    }
    else if(mention_text.length>this.props.text.length && !this.state.full_mention) {
      mention_text = mention_text.substring(0,this.props.text.length)+"...";
    }
    
    let style = {};
    if(this.props.tagged) {
      style = {textDecorationLine:"underline"};
    }
    else if(this.props.in_span) {
      style = {backgroundColor: "yellow"};
    }
    
    let mention =
      !this.props.in_span ? (
        <Chip className="hidden" />
      ) : (<Chip
          label={titleCase(mention_text.replace("_"," "))}
          className="chip"
          onClick={() => {this.setState({full_mention: !this.state.full_mention});
          if(this.props.title){this.props.setCurrentEntity(this.props.title)}}}
          onDelete={this.run_local(this.props.token_idx, this.props.delete_entity)}
          color={"primary"}
          title={this.props.title?this.props.title:""}
        />);
    
    let clickFunction = this.props.in_span?this.run_local(this.props.token_idx, this.props.edit_entity,()=>{this.setState({editing:true})}):this.run_local(this.props.token_idx, this.props.add_to_tag);
        
    return (
      <div key={this.props.token_idx} className="word">
        <div
        style={style}
          className="word-text"
          onMouseEnter={this.changeBold}
          onMouseLeave={this.changeUnbold}
          onClick={clickFunction}
          onBlur={this.run_local(this.props.token_idx, this.props.add_to_tag)}
        >
          {this.props.text}
        </div>
        <div className="word-mention">{mention}</div>
      </div>
    );
  }
}
