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
      <div style={{marginTop: 50}}> 
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <Question question_id="1" /> 
      </div> 
    );
  }
}

