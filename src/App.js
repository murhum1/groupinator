import React, { Component } from 'react';
import './App.css';
import storage from './utils'
import 'bootstrap/dist/css/bootstrap.min.css';
import { InputGroup, Form, Container, Row, Col, ListGroup, Button, Dropdown } from 'react-bootstrap';
import { DragDropContext } from 'react-beautiful-dnd';
import Group from './Group'
import NewGroup from './NewGroup'
import CopyToClipboardButton from './CopyToClipboardButton'
import SetsModal from './SetsModal'

class App extends Component {

  constructor(props) {
    super(props);

    let elems = storage.load("elems"); // Legacy
    let sets = storage.load("sets");

    // Patch so versions without elem ids work
    if (elems && elems.length && !elems[0].id) {
      elems = elems.map(e => {
        e.id = Math.floor(Math.random() * 100000000).toString();
        return e;
      })
      storage.save("elems", elems);
    }

    // Patch so versions without multiple sets work
    if (elems) {
      storage.save("elemsBackup", storage.load("elems"));
      storage.delete("elems");
    }
    // Initialize sets if none found from localstorage, e.g. this is first load
    if (!sets) {
      storage.save("sets", [
        {
          "name": "Default set",
          "description": "Default set description",
          "elems": elems.sort(this.compareElems) || []
        }
      ]);
      storage.save("setIdx", 0);
    }


    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragStart = this.onDragStart.bind(this);

    // Sort elements in case they're jumbled for some reason
    sets = storage.load("sets");
    let setIdx = storage.load("setIdx");
    sets[setIdx].elems = sets[setIdx].elems.sort(this.compareElems);

    this.state = {
      sets: sets,
      setIdx: setIdx,
      input: "",
      groupSize: 3,
      groups: [],
      dragging: false
    }
  }

  getSet = () => {
    return this.state.sets[this.state.setIdx]
  }

  handleChange = e => {
    this.setState({
      input: e.target.value
    })
  }

  compareElems = (a, b) => {
    if (a.label < b.label) { return -1 }
    else if (a.label > b.label) { return 1 }
    else { return 0 }
  }

  addElem = () => {
    let elems = this.getSet().elems;
    elems.push({ id: new Date().getTime().toString(), label: this.state.input, selected: true });
    elems.sort(this.compareElems);
    this.setState({
      sets: this.state.sets,
      input: ""
    });
    storage.save("sets", this.state.sets);
  }

  removeElem = (ev, idx) => {
    ev.stopPropagation();
    let elems = this.getSet().elems;
    elems.splice(idx, 1);
    this.setState({
      sets: this.state.sets
    })
    storage.save("sets", this.state.sets);
  }

  toggleElem = idx => {
    let elems = this.getSet().elems;
    elems[idx].selected = !elems[idx].selected
    this.setState({
      sets: this.state.sets
    })
    storage.save("sets", this.state.sets);
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
    let elems = [...this.getSet().elems].filter(e => {
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

  showSetsModal = () => {
    this.setState({
      setsModalShown: true
    })
  }

  hideSetsModal = () => {
    this.setState({
      setsModalShown: false,
      creatingNewSet: false
    })
  }

  selectSet = idx => {
    this.setState({
      setIdx: idx,
      groups: []
    });
    storage.save("setIdx", idx);
  }

  onCreateNewSet = () => {
    this.setState({
      creatingNewSet: true,
      setsModalShown: true
    })
  }

  render() {
    const { sets, setIdx, setsModalShown, creatingNewSet } = {...this.state}
    const numElems = sets[setIdx].elems.length;
    return (<Container fluid>
      <Row style={{padding: "10px 15px", flexAlign: "end"}}>
        <Dropdown>
          <Dropdown.Toggle style={{minWidth: "150px"}}>{this.getSet().name}</Dropdown.Toggle>
          <Dropdown.Menu>
            {
              sets.map((s, idx) => (
                <Dropdown.Item active={idx === setIdx} onSelect={() => this.selectSet(idx)} key={idx}>{s.name}</Dropdown.Item>
              ))
            }
            <Dropdown.Divider />
            <Dropdown.Item onSelect={this.onCreateNewSet} style={{fontWeight: "bold"}} variant="outline-primary">+ New set</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <div style={{marginLeft: "15px"}}>
          <Button size="sm" variant="outline-primary" onClick={this.showSetsModal}>Manage sets</Button>
        </div>
      </Row>
      <Row>
        <Col>
          <Form>
            <Form.Row>
              <Form.Group as={Col}>
                <InputGroup>
                  <Form.Control value={this.state.input} onChange={this.handleChange} onKeyPress={this.onInputKeypress} />
                  <InputGroup.Append>
                    <Button variant="primary" onClick={this.addElem}>Add</Button>
                  </InputGroup.Append>
                </InputGroup>
              </Form.Group>
            </Form.Row>
          </Form>
          <div>
            {numElems} {numElems !== 1 ? "entries" : "entry"} listed
          </div>
          <ListGroup>
            {
              sets[setIdx].elems.map((e, idx) => {
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
      {(
        setsModalShown ?
        <SetsModal
          selectSet={this.selectSet}
          sets={sets}
          creatingNewSet={creatingNewSet}
          setIdx={setIdx}
          show={setsModalShown}
          onHide={this.hideSetsModal}
        /> :
        null
      )}
    </Container>);
  }
}

export default App;
