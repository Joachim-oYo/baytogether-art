import React from 'react';
import './App.css';
import Konva from 'konva';
import { Stage, Layer, Text, Path, Transformer, Rect, Image } from 'react-konva';
import svgPaths from './data/svgPaths.js'
import { colors, colorImages } from './data/colors.js'
import initialPositions from './data/initialPositions.js'
import useImage from 'use-image';

let dragAnimationEnded = true;
let shouldMinimize = false;
let timeout;
const randomNum = Math.random();
const randomIndex = Math.floor(randomNum * colors.length);
const backgroundColor = colors[randomIndex];
const initialShapeColors = [...colors];
initialShapeColors.splice(randomIndex, 1);

const ColorSelector = props => {
  const { src, position, scale } = props;
  const [image] = useImage(src);

  return <Image
    image={image}
    x={position.x}
    y={position.y}
    draggable
    scaleX={scale.x}
    scaleY={scale.y}
  />;
}

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
        // scaleX={props.scaleX}
        // scaleY={props.scaleY}
        // key={props.name}
        name={props.name}
        index={props.index}
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

  const generateShapes = () => {
    const shapes = [];
    for (let i = 0; i < svgPaths.length; i++) {
      shapes.push({
        id: 'node-' + i
      });
    }
    return shapes;
  }

  const [renderShapes, setRenderShapes] = React.useState(generateShapes());

  const checkDeselect = e => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const handleDragStart = e => {
    // Adjust layer order of item
    const id = e.target.name();
    const items = renderShapes.slice();
    const item = items.find(i => i.id === id);
    const index = items.indexOf(item);
    console.log(e.target)
    // console.log(index)

    if (index !== -1) {
      // remove from the list:
      items.splice(index, 1);
      // add to the top
      items.push(item);
      setRenderShapes(items);
    }

    console.log(renderShapes)

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

  const handleDragEnd = e => {
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
    // Drawing Stage
    <Stage
      // style={{ backgroundColor: backgroundColor, border: '1px solid grey'}}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}>
      <Layer>
        <Rect
          width={1200}
          height={700}
          fill={backgroundColor}
        />
        {renderShapes.map((shape, i) => (
          <Shape
            key={i}
            index={i}
            name={shape.id}
            path={svgPaths[i].data.toString()}
            shapeStyle={{
              x: 1200 * (i / svgPaths.length),
              y: 700 + 34,
              fill: initialShapeColors[i % initialShapeColors.length]
              // fill: "green"
            }}
            isSelected={svgPaths[i].id === selectedId}
            scaleX={1}
            scaleY={1}
            onSelect={() => {
              selectShape(svgPaths[i].id);
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

        {colorImages.map((imageSrc, i) => (
          <ColorSelector
            key={i}
            src={imageSrc}
            position={{
              x: 1200 + 34 + 150 * (i % 3),
              y: 34 + 130 * (Math.floor(i / 3))
            }}
            scale={{
              x: 0.7,
              y: 0.7
            }}
          />
        ))}
      </Layer>
    </Stage>
  );
}

export default App;
