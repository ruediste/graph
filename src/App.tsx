import React from 'react';
import './App.css';
import createEngine, { DefaultLinkModel, DiagramModel, DefaultNodeModel, DefaultNodeFactory } from '@projectstorm/react-diagrams';
import { CanvasWidget, BaseEvent } from '@projectstorm/react-canvas-core';

const App: React.FC = () => {

  //1) setup the diagram engine
  var engine = createEngine();
  engine.getNodeFactories().registerFactory(new DefaultNodeFactory());

  //2) setup the diagram model
  var model = new DiagramModel();

  //3-A) create a default node
  var node1 = new DefaultNodeModel("Node 1", "rgb(0,192,255)");
  let port1 = node1.addOutPort("Out");
  node1.addInPort("In");
  node1.setPosition(100, 100);

  //3-B) create another default node
  var node2 = new DefaultNodeModel("Node 2", "rgb(192,255,0)");
  let port2 = node2.addInPort("In");
  node2.addOutPort("Out1");
  node2.addOutPort("Out2");
  node2.setPosition(400, 100);

  // link the ports
  let link1 = port1.link(port2);
  (link1 as DefaultLinkModel).addLabel("Hello World!");

  //4) add the models to the root graph
  model.addAll(node1, node2, link1);

  //5) load model into engine
  engine.setModel(model);

  model.registerListener({
    eventWillFire: (event: any) => console.log(event)
  });

  //6) render the diagram!
  return <CanvasWidget className="diagram-container" engine={engine} />;

}

export default App;
