import React, { Component } from 'react';
import './App.css';
import storage from './utils'
import 'bootstrap/dist/css/bootstrap.min.css';
import { InputGroup, Form, Container, Row, Col, ListGroup, Button } from 'react-bootstrap';
import { DragDropContext } from 'react-beautiful-dnd';
import Group from './Group'
import NewGroup from './NewGroup'
import CopyToClipboardButton from './CopyToClipboardButton'

class App extends Component {

  constructor(props) {
    super(props);

    if (!storage.load("elems")) {
      storage.save("elems", [])
    }

    // Patch so versions without elem ids work
    let elems = storage.load("elems");
    if (elems.length && !elems[0].id) {
      elems = elems.map(e => {
        e.id = Math.floor(Math.random() * 100000000).toString();
        return e;
      })
      storage.save("elems", elems);
    }

    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragStart = this.onDragStart.bind(this);

    this.state = {
      elems: storage.load("elems"),
      input: "",
      groupSize: 3,
      groups: [],
      dragging: false
    }
  }

  handleChange = e => {
    this.setState({
      input: e.target.value
    })
  }

  addElem = () => {
    const elems = this.state.elems;
    elems.push({ id: new Date().getTime().toString(), label: this.state.input, selected: true })
    this.setState({
      elems: elems,
      input: ""
    })
    storage.save("elems", elems);
  }

  removeElem = (ev, idx) => {
    ev.stopPropagation();
    let elems = this.state.elems;
    elems.splice(idx, 1);
    this.setState({
      elems: elems
    })
    storage.save("elems", elems);
  }

  toggleElem = idx => {
    let elems = this.state.elems;
    elems[idx].selected = !elems[idx].selected
    this.setState({
      elems: elems
    })
    storage.save("elems", elems);
  }

  shuffle = array => {
    for(let i = array.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * i)
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
  }

  makeGroups = () => {
    if (isNaN(this.state.groupSize) || this.state.groupSize <= 0) {
      return;
    }
    let elems = [...this.state.elems].filter(e => {
      return e.selected
    });
    let groups = []
    this.shuffle(elems);
    while (elems.length > 0) {
      groups.push(elems.splice(0, this.state.groupSize))
    }
    this.setState({
      groups: groups
    })
  }

  onInputKeypress = (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      this.addElem()
    }
  }

  onGroupSizeChange = (ev) => {
    const num = ev.target.value.length ? parseInt(ev.target.value) : "";
    this.setState({
      groupSize: num
    })
  }

  onDragStart() {
    this.setState({
      dragging: true
    })
  }

  onDragEnd(result) {
    if (!result.destination) {
      this.setState({ dragging: false })
      return;
    }
    const src = result.source, dst = result.destination;
    const groups = this.state.groups;
    const srcGroupIdx = parseInt(src.droppableId);
    const srcGroup = this.state.groups[srcGroupIdx];
    const [removed] = srcGroup.splice(src.index, 1);
    if (src.droppableId === dst.droppableId) {
      srcGroup.splice(dst.index, 0, removed);
    } else {
      const dstGroupIdx = parseInt(dst.droppableId);
      if (dstGroupIdx === this.state.groups.length) {
        this.state.groups.push([
          removed
        ])
      } else {
        const dstGroup = this.state.groups[dstGroupIdx];
        dstGroup.splice(dst.index, 0, removed);
      }
    }
    if (!srcGroup.length) {
      groups.splice(srcGroupIdx, 1);
    }
    this.setState({ groups: groups, dragging: false })
  }

  render() {
    return (<Container fluid>
      <Row>
        <Col>
          <Form>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Add items</Form.Label>
                <InputGroup>
                  <Form.Control value={this.state.input} onChange={this.handleChange} onKeyPress={this.onInputKeypress} />
                  <InputGroup.Append>
                    <Button variant="primary" onClick={this.addElem}>Add</Button>
                  </InputGroup.Append>
                </InputGroup>
              </Form.Group>
            </Form.Row>
          </Form>
          <ListGroup>
            {
              this.state.elems.map((e, idx) => {
                return <ListGroup.Item style={{
                  opacity: e.selected ? 1 : 0.5, cursor: "pointer", "paddingTop": "4px", "paddingBottom": "4px"
                }} key={idx} onClick={() => { this.toggleElem(idx) }}>
                  { e.label }
                  <Button onClick={(ev) => {this.removeElem(ev, idx)}} size="sm" variant="warning" style={{float: "right"}}>-</Button>
                </ListGroup.Item>
              })
            }
          </ListGroup>
        </Col>
        <div style={{width: "10%"}}>
        </div>
        <Col>
          <Form.Group as={Col}>
            <Form.Label>Group size</Form.Label>
            <InputGroup>
              <Form.Control type="number" value={this.state.groupSize} onChange={this.onGroupSizeChange} />
              <InputGroup.Append>
                <Button onClick={this.makeGroups} style={{float: "right"}}>Make groups</Button>
              </InputGroup.Append>
            </InputGroup>
          </Form.Group>
          <CopyToClipboardButton groups={this.state.groups} />
          <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
            <ListGroup id="groups">
              {
                this.state.groups.map((group, idx) => {
                  return <Group key={idx} idx={idx} group={group} />
                })
              }
              <NewGroup idx={this.state.groups.length} dragging={this.state.dragging} />
            </ListGroup>
          </DragDropContext>
        </Col>
      </Row>
    </Container>);
  }
}

export default App;
