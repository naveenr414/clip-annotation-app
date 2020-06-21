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
          The full guide is available <a href="https://ter.ps/annotation"> here </a> </Typography>
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


