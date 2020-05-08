import Chip from "@material-ui/core/Chip";
import * as React from "react";

interface WordWithMentionProps {
  text: string;
  title: string | null;
  token_idx: number;
  in_span: boolean;
  starting_span: boolean;
  tagged: boolean
  edit_entity: (arg0: number) => void ;
  delete_entity: (arg0: number) => void;
  add_to_tag: (arg0: number) => void;
}

export default class WordWithMention extends React.Component<WordWithMentionProps, {}> {
  state = {};
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
    let style = {};
    if(this.props.tagged) {
      style = {fontWeight:"bold"};
    }
    
    let mention =
      this.props.title === undefined ? (
        <Chip className="hidden" />
      ) : (mention_text === "" ? (
        <Chip
          label={mention_text}
          className="chip"
          //onClick={this.run_local(entity_pointer, this.editEntity)}
          //onDelete={this.run_local(this.props.token_idx, this.props.delete_entity)}
          color={"primary"}
        />) : (<Chip
          label={mention_text}
          className="chip"
          onClick={this.run_local(this.props.token_idx, this.props.edit_entity)}
          onDelete={this.run_local(this.props.token_idx, this.props.delete_entity)}
          color={"primary"}
        />));
    return (
      <div key={this.props.token_idx} className="word">
        <div
        style={style}
          className="word-text"
          onMouseEnter={this.changeBold}
          onMouseLeave={this.changeUnbold}
          onClick={this.run_local(this.props.token_idx, this.props.add_to_tag)}
        >
          {this.props.text}
        </div>
        <div className="word-mention">{mention}</div>
      </div>
    );
  }
}
