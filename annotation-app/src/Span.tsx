import Chip from "@material-ui/core/Chip";
import * as React from "react";

interface SpanProps {
  text: string;
  title: string | null;
  in_span: boolean;
  token_idx: number;
  tagged: boolean
  edit_entity: (arg0: number) => void ;
  delete_entity: (arg0: number) => void;
  add_to_tag: (arg0: number) => void;
}

export default class Span extends React.Component<SpanProps, {}> {
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
    if (!this.props.in_span || mention_text == null) {
      mention_text = "";
    }
    else if(mention_text.length>this.props.text.length) {
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
          label={mention_text}
          className="chip"
          onClick={this.run_local(this.props.token_idx, this.props.edit_entity)}
          onDelete={this.run_local(this.props.token_idx, this.props.delete_entity)}
          color={"primary"}
          title={this.props.title?this.props.title:""}
        />);
    return (
      <div key={this.props.token_idx} className="word">
        <div
        style={style}
          className="word-text"
          onMouseEnter={this.changeBold}
          onMouseLeave={this.changeUnbold}
          onClick={this.run_local(this.props.token_idx, this.props.add_to_tag)}
          onFocus={function(){alert("Hello!")}}
        >
          {this.props.text}
        </div>
        <div className="word-mention">{mention}</div>
      </div>
    );
  }
}
