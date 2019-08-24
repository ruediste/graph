import React from 'react';

interface Point {
    x: number,
    y: number
}
interface PanZoomProps {
    translate: Point
    scale: number,
    style?: React.CSSProperties
    onChange: (translate: Point, scale: number) => void
}
interface PanZoomState { }

/**
 * view=canvas*scale+translate
 * canvas=(view-translate)/scale
 */
export default class PanZoom extends React.Component<PanZoomProps, PanZoomState>{
    dom: React.RefObject<HTMLDivElement>
    lastPan?: Point
    onMouseMoveHandler: any
    onMouseUpHandler: any
    onWheelHandler: any
    constructor(props: any) {
        super(props)
        this.dom = React.createRef();
        this.onMouseMoveHandler = this.onMouseMove.bind(this);
        this.onMouseUpHandler = this.onMouseUp.bind(this);
        this.onWheelHandler = this.onWheel.bind(this);
    }

    onWheel(e: WheelEvent) {
        const { translate, scale } = this.props;
        let newScale;
        if (e.deltaY < 0)
            newScale = scale * 1.1;
        else
            newScale = scale / 1.1;

        const bound = this.dom.current!.getBoundingClientRect();
        const mousePosView: Point = { x: e.pageX - bound.left, y: e.pageY - bound.top };
        const mousePosCanvas: Point = {
            x: (mousePosView.x - translate.x) / scale,
            y: (mousePosView.y - translate.y) / scale,
        };
        const newTranslate = {
            x: mousePosCanvas.x * (scale - newScale) + translate.x,
            y: mousePosCanvas.y * (scale - newScale) + translate.y,
        }
        this.props.onChange(newTranslate, newScale);
        e.preventDefault();
    }
    onMouseMove(e: MouseEvent) {
        if (this.lastPan != null) {
            const { translate, scale } = this.props;
            this.props.onChange({ x: translate.x + e.screenX - this.lastPan.x, y: translate.y + e.screenY - this.lastPan.y }, scale)
            this.lastPan = { x: e.screenX, y: e.screenY }
        }
    }
    onMouseUp(e: MouseEvent) {
        if (e.button === 0) {
            this.lastPan = undefined;
        }
    }
    componentDidMount() {
        document.addEventListener("mousemove", this.onMouseMoveHandler)
        document.addEventListener("mouseup", this.onMouseUpHandler)
        this.dom.current!.addEventListener('wheel', this.onWheelHandler);
    }
    componentWillUnmount() {
        this.dom.current!.removeEventListener('wheel', this.onWheelHandler);
        document.removeEventListener("mousemove", this.onMouseMoveHandler)
        document.removeEventListener("mouseup", this.onMouseUpHandler)
    }
    render() {
        const { translate, scale } = this.props;
        var style: React.CSSProperties = {};
        if (this.props.style !== undefined)
            style = this.props.style;
        style = Object.assign({}, style, {
            overflow: 'hidden',
            border: '1px solid black',
        });
        return <div
            ref={this.dom}
            style={style}
            onMouseDown={e => {
                if (e.button === 0) {
                    this.lastPan = { x: e.screenX, y: e.screenY };
                }
            }}
        >
            <div style={{
                transform: `translate(${translate.x}px,${translate.y}px) scale(${scale})`,
                transformOrigin: 'top left',
            }}>
                {this.props.children}
            </div>
        </div>
    }
}