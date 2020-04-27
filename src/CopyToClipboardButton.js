import React, { Component } from 'react';
import { Button, Tooltip, Overlay } from 'react-bootstrap';

class CopyToClipboardButton extends Component {

	constructor(props) {
		super(props);
		this.copyToClipboard = this.copyToClipboard.bind(this);
		this.hideTooltip = this.hideTooltip.bind(this);
		this.myRef = React.createRef();
		this.state = {
			tooltipText: ""
		}
	}

  copyToClipboard() {
    this.setState({
      showTooltip: true
    })
    const lines = this.props.groups.map(members => {
      return members.map(m => m.label).join(', ');
    });
    const textToCopy = lines.join('\n');
    const textField = document.createElement('textarea')
    textField.innerHTML = textToCopy;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove()
  }

  hideTooltip() {
  	this.setState({
  		showTooltip: false
  	})
  }

	render() {
		return (
			this.props.groups.length ? <>
				<Button
					ref={this.myRef}
					style={{marginBottom: "8px"}}
					variant="outline-secondary"
					onClick={this.copyToClipboard}
					onMouseLeave={this.hideTooltip}
				>
	      	Copy to clipboard
	    	</Button>
				<Overlay target={this.myRef.current} show={this.state.showTooltip}>
					<Tooltip>
						Copied! Paste with Ctrl+V.
					</Tooltip>
				</Overlay>
	    </> : null
	  )
	}

}

export default CopyToClipboardButton;