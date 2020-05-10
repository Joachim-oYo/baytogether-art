import React, { useEffect, useRef } from 'react';
import { render } from 'react-dom';
import './App.css';
import Konva from 'konva';
import { Stage, Layer, Text, Path, Transformer } from 'react-konva';
import svgPaths from '../src/assets/svgPaths.js'

const Shape = props => {
  // const shapeRef = useRef();
  // const trRef = useRef();

  // React.useEffect(() => {
  //   if (isSelected) {
  //     // we need to attach transformer manually
  //     trRef.current.setNode(shapeRef.current);
  //     trRef.current.getLayer().batchDraw();
  //   }
  // }, [isSelected]);

  return <Path
    key={props.key}
    x={300}
    y={50}
    fill="green"
    data={svgPaths[props.index].toString()}
    draggable={true}
    onDragStart={props.onDragStart}
    onDragEnd={props.onDragEnd}
  />
}

const App = () => {
  const handleDragStart = e => {
    e.target.setAttrs({
      shadowColor: "black",
      shadowOpacity: 0.3,
      shadowBlur: 10,
      shadowOffset: {
        x: 15,
        y: 15
      },
      scaleX: 1.1,
      scaleY: 1.1
    });
  };
  const handleDragEnd = e => {
    e.target.setAttrs({
      shadowOpacity: 0
    });
    e.target.to({
      duration: 0.5,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: 1,
      scaleY: 1,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 0
    });
  };
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="Have fun with #baytogether!" />
        {svgPaths.map((_, i) => (
          <Shape 
          key={i}
          index={i}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd} />
        ))}
      </Layer>
    </Stage>
  );
}

export default App;
