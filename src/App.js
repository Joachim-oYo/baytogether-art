import React from 'react';
import { render } from 'react-dom';
import './App.css';
import Konva from 'konva';
import { Stage, Layer, Text, Path, Transformer, Rect } from 'react-konva';
import svgPaths from '../src/assets/svgPaths.js'

const Shape = props => {
  const { shapeProps, isSelected, onSelect, onChange } = props;
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    console.log(trRef)
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.setNode(shapeRef.current);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Path
        key={props.key}
        // x={300}
        // y={50}
        fill="green"
        data={props.path}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        onDragEnd={e => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y()
          });
        }}
        onDragStart={props.onDragStart}
        onDragEnd={props.onDragEnd}
        onTransformEnd={e => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY)
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  )
}

const App = () => {
  const [shapes, setShapes] = React.useState([{}]);
  const [selectedId, selectShape] = React.useState(null);

  const checkDeselect = e => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

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
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}>
      <Layer>
        <Text text="Have fun with #baytogether!" />
        {svgPaths.map((path, i) => (
          <Shape
            key={i}
            path={path.data.toString()}
            isSelected={path.id === selectedId}
            onSelect={() => {
              selectShape(path.id);
            }}
            onChange={newAttrs => {
              const shapes = svgPaths.slice();
              shapes[i] = newAttrs;
              setShapes(shapes);
            }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd} 
          />
        ))}
      </Layer>
    </Stage>
  );
}

export default App;
