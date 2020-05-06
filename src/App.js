import React from 'react';
import './App.css';
import Stars from './components/Stars';
import Konva from 'konva';
import { Stage, Layer, Star, Text } from 'react-konva';

const App = () => {
  const handleDragStart = e => {
    e.target.setAttrs({
      shadowColor: "black",
      shadowOpacity: 0.6,
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
        <Text text="Try to drag a star" />
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            x={Math.random() * window.innerWidth}
            y={Math.random() * window.innerHeight}
            numPoints={5}
            innerRadius={20}
            outerRadius={40}
            fill="#89b717"
            opacity={0.8}
            draggable
            rotation={Math.random() * 180}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </Layer>
    </Stage>
  );
}

export default App;
