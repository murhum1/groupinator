import React, { Component } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Draggable, Droppable } from 'react-beautiful-dnd';

class Group extends Component {

	getListStyle(isDraggingOver) {
		const style = {}
		if (isDraggingOver) {
			style.backgroundColor = "rgba(0, 0, 0, 0.0625)";
		}
		return style;
	}

	render() {
		const { idx, group } = {...this.props};
		return <Droppable direction="horizontal" droppableId={idx.toString()}>
			{(provided, snapshot) => (
				<ListGroup.Item
					style={this.getListStyle(snapshot.isDraggingOver)}
					className="group"
			    ref={provided.innerRef}
				>
		    	{group.map((member, idx) => (
		    		<Draggable key={member.id} draggableId={member.id} index={idx}>
		    			{(provided, snapshot) => (
		    				<div className="group-element"
		    					ref={provided.innerRef}
		    					{...provided.draggableProps}
		    					{...provided.dragHandleProps}
		    				>
		    					{member.label}
		    				</div>
		    			)}
		    		</Draggable>
		    	))}
		    	{provided.placeholder}
				</ListGroup.Item>
			)}
		</Droppable>
	}

}

export default Group;