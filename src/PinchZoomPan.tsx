import React from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SETTLE_RANGE = 0.001;
const ADDITIONAL_LIMIT = 0.2;
const DOUBLE_TAP_THRESHOLD = 300;
const ANIMATION_SPEED = 0.04;
const RESET_ANIMATION_SPEED = 0.08;
const INITIAL_X = 0;
const INITIAL_Y = 0;
const INITIAL_SCALE = 1;

interface Point {
    x: number,
    y: number
}
const settle = (val: number, target: number, range: number) => {
    const lowerRange = val > target - range && val < target;
    const upperRange = val < target + range && val > target;
    return lowerRange || upperRange ? target : val;
};

const inverse = (x: number) => x * -1;

const getPointFromTouch = (touch: React.Touch, element: React.RefObject<any>) => {
    const rect = element.current.getBoundingClientRect();
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
    };
};

const getMidpoint = (pointA: Point, pointB: Point) => ({
    x: (pointA.x + pointB.x) / 2,
    y: (pointA.y + pointB.y) / 2,
});

const getDistanceBetweenPoints = (pointA: Point, pointB: Point) => (
    Math.sqrt(Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2))
);

const between = (min: number, max: number, value: number) => Math.min(max, Math.max(min, value));

interface PinchZoomPanState {
    x: number
    y: number
    scale: number
    width: number
    height: number
}
interface PinchZoomPanProps {
    width: number
    height: number
    children: (x: number, y: number, scale: number) => React.ReactElement
}
export default class PinchZoomPan extends React.Component<PinchZoomPanProps, PinchZoomPanState> {
    animation?: number
    container: React.RefObject<any>
    lastMidpoint?: Point
    lastPanPoint?: Point
    lastDistance?: number
    lastTouchEnd?: number

    constructor(props: PinchZoomPanProps) {
        super(props);
        this.state = this.getInititalState();
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.container = React.createRef();
    }

    zoomTo(scale: number, midpoint: Point) {
        const frame = () => {
            if (this.state.scale === scale) return null;

            const distance = scale - this.state.scale;
            const targetScale = this.state.scale + (ANIMATION_SPEED * distance);

            this.zoom(settle(targetScale, scale, SETTLE_RANGE), midpoint);
            this.animation = requestAnimationFrame(frame);
        };

        this.animation = requestAnimationFrame(frame);
    }

    reset() {
        const frame = () => {
            if (this.state.scale === INITIAL_SCALE && this.state.x === INITIAL_X && this.state.y === INITIAL_Y) return null;
            const distance = INITIAL_SCALE - this.state.scale;
            const distanceX = INITIAL_X - this.state.x;
            const distanceY = INITIAL_Y - this.state.y;

            const targetScale = settle(this.state.scale + (RESET_ANIMATION_SPEED * distance), INITIAL_SCALE, SETTLE_RANGE);
            const targetX = settle(this.state.x + (RESET_ANIMATION_SPEED * distanceX), INITIAL_X, SETTLE_RANGE);
            const targetY = settle(this.state.y + (RESET_ANIMATION_SPEED * distanceY), INITIAL_Y, SETTLE_RANGE);

            const nextWidth = this.props.width * targetScale;
            const nextHeight = this.props.height * targetScale;

            this.setState({
                x: targetX,
                y: targetY,
                scale: targetScale,
                width: nextWidth,
                height: nextHeight,
            }, () => {
                this.animation = requestAnimationFrame(frame);
            });
        };

        this.animation = requestAnimationFrame(frame);
    }

    getInititalState() {
        return {
            x: INITIAL_X,
            y: INITIAL_Y,
            scale: INITIAL_SCALE,
            width: this.props.width,
            height: this.props.height,
        };
    }

    handleTouchStart(event: React.TouchEvent) {
        this.animation && cancelAnimationFrame(this.animation);
        if (event.touches.length === 2) this.handlePinchStart(event);
        if (event.touches.length === 1) this.handleTapStart(event);
    }

    handleTouchMove(event: React.TouchEvent) {
        if (event.touches.length === 2) this.handlePinchMove(event);
        if (event.touches.length === 1) this.handlePanMove(event);
    }

    handleTouchEnd(event: React.TouchEvent) {
        if (event.touches.length > 0) return null;

        if (this.state.scale > MAX_SCALE) return this.zoomTo(MAX_SCALE, this.lastMidpoint!);
        if (this.state.scale < MIN_SCALE) return this.zoomTo(MIN_SCALE, this.lastMidpoint!);

        if (this.lastTouchEnd && this.lastTouchEnd + DOUBLE_TAP_THRESHOLD > event.timeStamp) {
            this.reset();
        }

        this.lastTouchEnd = event.timeStamp;
    }

    handleTapStart(event: React.TouchEvent) {
        this.lastPanPoint = getPointFromTouch(event.touches[0], this.container);
    }

    handlePanMove(event: React.TouchEvent) {
        if (this.state.scale === 1) return null;

        event.preventDefault();

        const point = getPointFromTouch(event.touches[0], this.container);
        const nextX = this.state.x + point.x - this.lastPanPoint!.x;
        const nextY = this.state.y + point.y - this.lastPanPoint!.y;

        this.setState({
            x: between(this.props.width - this.state.width, 0, nextX),
            y: between(this.props.height - this.state.height, 0, nextY),
        });

        this.lastPanPoint = point;
    }

    handlePinchStart(event: React.TouchEvent) {
        const pointA = getPointFromTouch(event.touches[0], this.container);
        const pointB = getPointFromTouch(event.touches[1], this.container);
        this.lastDistance = getDistanceBetweenPoints(pointA, pointB);
    }

    handlePinchMove(event: React.TouchEvent) {
        event.preventDefault();
        const pointA = getPointFromTouch(event.touches[0], this.container);
        const pointB = getPointFromTouch(event.touches[1], this.container);
        const distance = getDistanceBetweenPoints(pointA, pointB);
        const midpoint = getMidpoint(pointA, pointB);
        const scale = between(MIN_SCALE - ADDITIONAL_LIMIT, MAX_SCALE + ADDITIONAL_LIMIT, this.state.scale * (distance / this.lastDistance!));

        this.zoom(scale, midpoint);

        this.lastMidpoint = midpoint;
        this.lastDistance = distance;
    }

    zoom(scale: number, midpoint: Point) {
        const nextWidth = this.props.width * scale;
        const nextHeight = this.props.height * scale;
        const nextX = this.state.x + (inverse(midpoint.x * scale) * (nextWidth - this.state.width) / nextWidth);
        const nextY = this.state.y + (inverse(midpoint.y * scale) * (nextHeight - this.state.height) / nextHeight);

        this.setState({
            width: nextWidth,
            height: nextHeight,
            x: nextX,
            y: nextY,
            scale,
        });
    }

    render() {
        return (
            <div
                ref={this.container}
                onTouchStart={this.handleTouchStart}
                onTouchMove={this.handleTouchMove}
                onTouchEnd={this.handleTouchEnd}
                style={{
                    overflow: 'hidden',
                    width: this.props.width,
                    height: this.props.height,
                }}
            >
                {this.props.children(this.state.x, this.state.y, this.state.scale)}
            </div>
        );
    }
}
