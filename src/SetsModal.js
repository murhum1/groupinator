import React, { Component } from 'react';
import { Row, Col, Modal, Form, Nav, Button } from 'react-bootstrap';
import storage from './utils'

class SetsModal extends Component {

	constructor(props) {
		super(props);
		let setIdx = this.props.setIdx, selectedSet = {...this.props.sets[this.props.setIdx]};
		if (this.props.creatingNewSet) {
			setIdx = undefined;
			selectedSet = {name: "", description: ""}
		}
		this.state = {
			sets: this.props.sets,
			setIdx: setIdx,
			selectedSet: selectedSet
		}
	}

	onSetNameChange = (ev) => {
		const set = this.state.selectedSet;
		set.name = ev.target.value;
		this.setState({
			selectedSet: set
		})
	}

	onSetDescriptionChange = (ev) => {
		const set = this.state.selectedSet;
		set.description = ev.target.value;
		this.setState({
			selectedSet: set
		})
	}

	onConfirm = () => {
		if (typeof this.state.setIdx === "undefined") {
			this.onCreate();
		} else {
			this.onSaveChanges();
		}
	}

	onSaveChanges = () => {
		const sets = this.state.sets;
		sets[this.state.setIdx] = {...this.state.selectedSet};
		this.setState({
			sets: sets
		});
		storage.save("sets", sets);
	}

	onNavItemClicked = (idx) => {
		this.setState({
			selectedSet: {...this.state.sets[idx]},
			setIdx: idx
		})
	}

	onCreate = () => {
		const sets = this.state.sets;
		sets.push({
			...this.state.selectedSet,
			elems: []
		})
		this.setState({
			sets: sets,
			setIdx: sets.length - 1
		})
		storage.save("sets", sets);
		this.props.selectSet(sets.length - 1);
		this.props.onHide()
	}

	startNewSet = () => {
		this.setState({
			selectedSet: { name: "", description: "" },
			setIdx: undefined
		})
	}


	render() {
		const { selectedSet, setIdx, sets } = this.state;
		return (
			<Modal
				show={this.props.show}
				onHide={this.props.onHide}
				size="lg"
			>
				<Modal.Header closeButton>
					<Modal.Title>Manage sets</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Row>
						<Col xs={3} style={{borderRight: "1px solid rgba(0,0,0,.125)"}}>
							<Nav variant="pills" className="flex-column">
								{
									sets.map((s, idx) => (
										<Nav.Link onClick={() => this.onNavItemClicked(idx)} active={idx === setIdx} key={idx}>{s.name}</Nav.Link>
									))
								}
								<Nav.Item style={{marginTop: "10px"}}>
									<Button onClick={this.startNewSet} style={{width: "100%"}} variant="outline-primary">
										<span style={{fontWeight: "bold"}}>+</span> New set
									</Button>
								</Nav.Item>
							</Nav>
						</Col>
						<Col xs={1}/>
						<Col>
							<Form>
								<Form.Group>
									<Form.Label>Name of set</Form.Label>
									<Form.Control type="text" onChange={this.onSetNameChange} value={selectedSet.name}></Form.Control>
									<Form.Label>Description</Form.Label>
									<Form.Control type="text" onChange={this.onSetDescriptionChange} value={selectedSet.description}></Form.Control>
								</Form.Group>
								<div style={{textAlign: "center"}}>
									<Button onClick={this.onConfirm}>
										{ typeof setIdx !== "undefined" ? "Save changes" : "Create" }
									</Button>
								</div>
							</Form>
						</Col>
					</Row>
				</Modal.Body>
			</Modal>
	  )
	}

}

export default SetsModal;