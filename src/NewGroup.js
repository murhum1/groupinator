import React, { Component } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Droppable } from 'react-beautiful-dnd';

class NewGroup extends Component {

	getListStyle(isDraggingOver) {
		const style = {}
		if (isDraggingOver) {
			style.backgroundColor = "rgba(0, 0, 0, 0.0625)";
		}
		return style;
	}

	render() {
		const { idx, dragging } = {...this.props};
		return <Droppable direction="horizontal" droppableId={idx.toString()}>
			{(provided, snapshot) => (
				dragging ? <ListGroup.Item
					style={this.getListStyle(snapshot.isDraggingOver)}
					className="new-group-area"
			    ref={provided.innerRef}
				>
					<div style={{position:"absolute", pointerEvents: "none"}}>Add to a new group</div>
		    		{provided.placeholder}
				</ListGroup.Item> : <div style={{height: "50px", padding: "12px"}} ref={provided.innerRef}/>
			)}
		</Droppable>
	}

}

export default NewGroup;