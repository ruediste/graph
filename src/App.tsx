import React, { CSSProperties, Fragment, ReactElement } from 'react';
import './App.scss';
import createEngine, {
  DefaultLinkModel,
  DefaultNodeModel,
  DiagramModel
} from '@projectstorm/react-diagrams';

import {
  CanvasWidget
} from '@projectstorm/react-canvas-core';

interface Point {
  x: number;
  y: number;
}


// create an instance of the engine with all the defaults
const engine = createEngine();

// node 1
const node1 = new DefaultNodeModel({
  name: 'Node 1',
  color: 'rgb(0,192,255)',
});
node1.setPosition(100, 100);
let port1 = node1.addOutPort('Out');

// node 2
const node2 = new DefaultNodeModel({
  name: 'Node 1',
  color: 'rgb(0,192,255)',
});
node2.setPosition(100, 100);
let port2 = node2.addOutPort('Out');

// link them and add a label to the link
const link = port1.link<DefaultLinkModel>(port2);
link.addLabel('Hello World!');

const model = new DiagramModel();
model.addAll(node1, node2, link);
engine.setModel(model);

interface ActorGraph {
  translate: Point,
  scale: number
  nextId: number
  actors: { [key: string]: Actor; }
  connections: { [key: string]: Connection; }
}
interface Actor {
  name: string
  pos: Point
}

interface Connection {
  src: string;
  dst: string;
}

export default class App extends React.Component<{}, {
  graph: ActorGraph
}> {

  constructor(props: any) {
    super(props)
    this.state = {
      graph: {
        translate: { x: 0, y: 0 },
        scale: 1,
        nextId: 10,
        actors: {
          '1': { name: 'Hello', pos: { x: 10, y: 10 } },
          '2': { name: 'World', pos: { x: 10, y: 40 } },
        },
        connections: {
          '3': { src: '1', dst: '2' }
        }
      }
    };
  }

  render() {
    return <CanvasWidget engine={engine} />
  }
}