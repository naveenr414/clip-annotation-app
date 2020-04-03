import * as React from 'react';
import Question from './Question';
import './Question.css';

export default class Annotation extends React.Component {  
  state = {
    entity:''
  };
  
  constructor(props) {
    super(props);

  }
  
  componentDidMount() {
    this.setState({
       entity: 'Cajal Bodies'
    });
  }


  render () {
    return (
      <div> 
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <div className="Entity"> Entity: {this.state.entity} </div> <br /> 
        <Question question_id="1" /> 
        <Question question_id="2" /> 
        <Question question_id="3" /> 
      </div> 
    );
  }
}

