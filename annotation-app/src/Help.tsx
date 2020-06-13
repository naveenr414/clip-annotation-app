import * as React from "react";
import { Button } from "@material-ui/core";

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
      maxWidth: 500,
      minHeight: 300,
      margin: '0 auto',
      padding: 30
    }}>
          <div className="footer">
            <Button style={{ fontSize: 24 }} color="primary" onClick={this.props.onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }
}


