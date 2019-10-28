import React from 'react';
import './App.css';
import { cloneDeep, mapValues } from 'lodash';
import { IChart, actions, FlowChart, INodeInnerDefaultProps, INodeDefaultProps } from '@mrblenny/react-flow-chart'
import styled from 'styled-components'

const chartSimple: IChart = {
  offset: {
    x: 0,
    y: 0,
  },
  nodes: {
    node1: {
      id: 'node1',
      type: 'output-only',
      position: {
        x: 300,
        y: 100,
      },
      ports: {
        port1: {
          id: 'port1',
          type: 'output',
          properties: {
            value: 'yes',
          },
        },
        port2: {
          id: 'port2',
          type: 'output',
          properties: {
            value: 'no',
          },
        },
      },
    },
    node2: {
      id: 'node2',
      type: 'input-output',
      position: {
        x: 300,
        y: 300,
      },
      ports: {
        port1: {
          id: 'port1',
          type: 'input',
        },
        port2: {
          id: 'port2',
          type: 'output',
        },
      },
    },
    node3: {
      id: 'node3',
      type: 'input-output',
      position: {
        x: 100,
        y: 600,
      },
      ports: {
        port1: {
          id: 'port1',
          type: 'input',
        },
        port2: {
          id: 'port2',
          type: 'output',
        },
      },
    },
    node4: {
      id: 'node4',
      type: 'input-output',
      position: {
        x: 500,
        y: 600,
      },
      ports: {
        port1: {
          id: 'port1',
          type: 'input',
        },
        port2: {
          id: 'port2',
          type: 'output',
        },
      },
    },
  },
  links: {
    link1: {
      id: 'link1',
      from: {
        nodeId: 'node1',
        portId: 'port2',
      },
      to: {
        nodeId: 'node2',
        portId: 'port1',
      },
      properties: {
        label: 'example link label',
      },
    },
    link2: {
      id: 'link2',
      from: {
        nodeId: 'node2',
        portId: 'port2',
      },
      to: {
        nodeId: 'node3',
        portId: 'port1',
      },
      properties: {
        label: 'another example link label',
      },
    },
    link3: {
      id: 'link3',
      from: {
        nodeId: 'node2',
        portId: 'port2',
      },
      to: {
        nodeId: 'node4',
        portId: 'port1',
      },
    },
  },
  selected: {},
  hovered: {},
}

const NodeInnerCustom = ({ node, config }: INodeInnerDefaultProps) => {
  return <div onClick={(e) => e.stopPropagation()}
    onMouseUp={(e) => e.stopPropagation()}
    onMouseDown={(e) => e.stopPropagation()}>Hello World
    <textarea rows={4} cols={10}>Foo Bar</textarea>
  </div>
}

const DarkBox = styled.div`
  position: absolute;
  padding: 30px;
  background: #3e3e3e;
  color: white;
  border-radius: 10px;
`
const SimpleBox = styled.div`
  position: absolute;
`

const Circle = styled.div`
  position: absolute;
  width: 150px;
  height: 150px;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #d30000;
  color: white;
  border-radius: 50%;
`

const NodeCustom = React.forwardRef(({ node, children, ...otherProps }: INodeDefaultProps, ref: React.Ref<HTMLDivElement>) => {
  if (node.type === 'output-only') {
    return (
      <SimpleBox ref={ref} {...otherProps}>
        <div className="diamond">
          <svg viewBox='0 0 100 100' preserveAspectRatio='none'>
            <filter id="dropshadow" height="125%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
              <feOffset dx="0" dy="0" result="offsetblur" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <path d='M2,50 50,2 98,50 50,98z' className='outer' />
            <path d='M8,50 50,8 92,50 50,92z' className='inner' />
          </svg>
          <div>
            {children}
          </div>
        </div>
      </SimpleBox>
    )
  } else {
    return (
      <Circle ref={ref} {...otherProps}>
        {children}
      </Circle>
    )
  }
})

/**
 * State is external to the <FlowChart> Element
 *
 * You could easily move this state to Redux or similar by creating your own callback actions.
 */
export default class App extends React.Component<{}, IChart> {
  public state = cloneDeep(chartSimple)
  public render() {
    const chart = this.state
    const stateActions = mapValues(actions, (func: any) =>
      (...args: any) => this.setState(func(...args))) as typeof actions

    return (
      <div>
        <button onClick={() => this.setState(state => { (state as any).nodes.node1.position = { x: 300, y: 100 }; return state })}>Test</button>
        <FlowChart
          chart={chart}
          callbacks={stateActions}
          Components={{
            NodeInner: NodeInnerCustom,
            Node: NodeCustom
          }}
        />
      </div>
    )
  }
}