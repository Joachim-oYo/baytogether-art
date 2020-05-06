import React from 'react';
import { Star } from 'react-konva';


const Stars = props => {
    return (
        <div>
            <Star
                // key={i}
                x={Math.random() * window.innerWidth}
                y={Math.random() * window.innerHeight}
                numPoints={5}
                innerRadius={20}
                outerRadius={40}
                fill="#89b717"
                opacity={0.8}
                draggable
                rotation={Math.random() * 180}
                shadowColor="black"
                shadowBlur={10}
                shadowOpacity={0.6}
                onDragStart={props.dragStart}
                onDragEnd={props.dragEnd}
            />
        </div>
    );
}

export default Stars;
