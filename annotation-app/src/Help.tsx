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
          The full guide is available <a href="https://ter.ps/annotation"> here </a> 
          <br /> 
          The main points of the guide are: 
          <ol>
            <li> Tag For things that refer to specific entities </li> 
            <li> Ignore descriptors </li> 
            <li> Tag for names and nominals (things that refer to entities) </li> 
            <li> Don't tag the answer to the question </li> 
          </ol>
          
          As an example, we've tagged the following question: 
          <br /> <br />
          While running for <u> President</u> (President of the United States), <u> Ross Perot</u> (Ross Perot) warned that this deal would cause a <u> “giant sucking sound.”</u> (Giant sucking sound) 
          The <u> Zapatistas</u> (Zapatista Army of National Liberation) opposed this agreement, which was criticized for leading to the rise of maquiladoras, factories that import parts and export finished goods. 
          In September 2018, the three countries involved in this deal agreed to replace it with the <u> USMCA</u> (USMCA). 
          For ten points, name this 1994 economic agreement between <u> Mexico</u> (Mexico), <u> Canada</u> (Canada), and the <u> US</u> (United States).
          </Typography>
          <Button style={{ fontSize: 24 }} color="primary" onClick={this.props.onClose}>
            Close
          </Button>
          </div>
        </div>
      </div>
    );
  }
}


