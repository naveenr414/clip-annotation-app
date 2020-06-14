import * as React from "react";
import { Button } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

interface State {
}

interface Props {
  show: boolean;
  onClose: any; 
}


export default class Help extends React.Component<Props,State> {
  render() {
    // Render nothing if the "show" prop is false
    if(!this.props.show) {
      return null;
    }

    return (
      <div className="backdrop" style={{ 
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: 50
    }}>
        <div className="modal" style={{
      backgroundColor: '#fff',
      borderRadius: 5,
      maxWidth: 700,
      maxHeight: 500,
      overflowY: 'scroll',
      minHeight: 300,
      margin: '0 auto',
      padding: 30
    }}>
          <div className="footer">
          <Typography style={{fontSize:20}}> 
          We tag largely based on the <a href="https://ter.ps/quelguide"> TAC KBP Guidelines </a> 
          The overview of the guidelines are as follows: 
          <ol>
            <li> Tag fo the meaning of the text 
              <ol>
                <li> <u> Houston </u> (Houston Astros) lost to <u> Washington </u> (Washington Nationals) in the <u> World Series </u> (World Series).  </li> 
              </ol> 
            </li> 
            <li> Tag things that refer to a specific named entity, ignoring modifiers 
              <ol>
                <li> Former president <u> Bill Clinton </u> </li> 
                <li> <u> The Hague </u> is a wonderful part of the <u> Netherlands </u> </li> 
              </ol> 
            </li> 
            <li> Tag both names and nominals (things that refer to the name)
              <ol> 
                <li>
                <u> Bill Clinton </u> was a <u> president </u> of the <u> United States </u>. He served for two <u> terms </u>. 

                </li>
              </ol>
            </li> 
            <li> Tag for single, individual entities 
              <ol>
                <li> The protesters today marched in <u> Washington </u> (Here the protesters arent a single individual entity).  </li>
                
                <li> The <u> Democrats </u> and <u> Republicans </u> are the two opposing parties in the US (here Democrats and Republicans are shorthand to refer to the Democratic and Repbulican parties).  </li>
              </ol>
            </li> 
            <li> Tag for full mentions 
              <ol>
                <li> <u> United States  of America </u> (instead of just United States of <u> America </u> ) </li> 
              </ol> 
            </li> 
            <li> In questions, dont tag the question answer 
              <ol>
                <li> If a question has the answer "John Steinbeck", do the following: For ten points, name this author who wrote <u> Grapes of Wrath </u> and <u> The Pearl </u> </li> 
              </ol>
            </li> 
          </ol> 
          
          We also differ from the guidelines in two areas: <ol> 
            <li> Tag for fictional entities (such as "Batman")
              <ol>
                <li> <u> Batman </u> and <u> Robin </u> fought the <u> Joker </u> in <u> The Dark Knight </u> .  </li> 
              </ol>
            </li> 
            
            <li> Don't tag nested mentions; select the larger tag
              <ol>
                <li> Don't do <u> <b> Kentucky </b> Fried Chicken </u>, instead just tag <u> Kentucky Fried Chicken </u> </li> 
              </ol>
            </li> 

          </ol>
          
          </Typography> 
          <br /> 
            <Button style={{ fontSize: 24 }} color="primary" onClick={this.props.onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }
}


