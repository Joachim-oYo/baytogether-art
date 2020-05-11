import React from 'react';
import './App.css';
import Konva from 'konva';
import { Stage, Layer, Text, Path, Transformer } from 'react-konva';
import svgPaths from '../src/assets/svgPaths.js'

let dragAnimationEnded = true;
let timeout;

const Shape = props => {
  const { shapeStyle, isSelected, onSelect, onChange } = props;
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Path
        // x={300}
        // y={50}
        // fill="green"
        {...shapeStyle}
        data={props.path}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onDragStart={props.onDragStart}
        onDragEnd={e => {
          onChange({
            ...shapeStyle,
            x: e.target.x(),
            y: e.target.y()
          });
          props.onDragEnd(e);
        }}
        onTransformEnd={e => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          // node.scaleX(1);
          // node.scaleY(1);
          onChange({
            ...shapeStyle,
            x: node.x(),
            y: node.y(),
            // set minimal value
            // width: Math.max(5, node.width() * scaleX),
            // height: Math.max(node.height() * scaleY)
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            // if (newBox.width < 5 || newBox.height < 5) {
            //   return oldBox;
            // }
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
  let shouldMinimize = false;

  const checkDeselect = e => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const handleDragStart = e => {
    const newScale = { x: e.target.attrs.scaleX, y: e.target.attrs.scaleY }
    shouldMinimize = dragAnimationEnded;
    if (dragAnimationEnded) {
      if (e.target.attrs.scaleX) {
        newScale.x = newScale.x * 1.05
      }
      else {
        newScale.x = 1;
      }
      if (e.target.attrs.scaleY) {
        newScale.y = newScale.x * 1.05
      }
      else {
        newScale.y = 1;
      }
    }

    e.target.setAttrs({
      shadowColor: "black",
      shadowOpacity: 0.3,
      shadowBlur: 10,
      shadowOffset: {
        x: 8,
        y: 8
      },
      scaleX: newScale.x,
      scaleY: newScale.y
    });

  };
  const handleDragEnd = async e => {
    clearTimeout(timeout);
    const newScale = {};
    if (shouldMinimize) {
      if (e.target.attrs.scaleX) {
        newScale.x = e.target.attrs.scaleX / 1.05
      }
      if (e.target.attrs.scaleY) {
        newScale.y = e.target.attrs.scaleY / 1.05
      }
    }
    else {
      newScale.x = e.target.attrs.scaleX;
      newScale.y = e.target.attrs.scaleY;
    }

    e.target.setAttrs({
      shadowOpacity: 0
    });
    e.target.to({
      duration: 0.5,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: newScale.x,
      scaleY: newScale.y,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 0
    });

    // setTimeout
    dragAnimationEnded = false;
    timeout = setTimeout(() => dragAnimationEnded = true, 500);
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
            shapeStyle={{ fill: "green" }}
            isSelected={path.id === selectedId}
            scaleX={1}
            scaleY={1}
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
