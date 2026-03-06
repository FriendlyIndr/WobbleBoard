import { useEffect, useRef, useState } from "react";
import { renderScene } from "./renderer";

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [elements, setElements] = useState([
    {
      id: "1",
      type: "rectangle",
      x: 100,
      y: 100,
      width: 200,
      height: 120,
    },
    {
      id: "2",
      type: "rectangle",
      x: 350,
      y: 200,
      width: 150,
      height: 90,
    },
  ]);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get 2d drawing context
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    renderScene(ctx, elements, canvas);

    // ctx.strokeStyle = "black";
    // ctx.lineWidth = 2;
  }, [elements]);

  return (
    <>
      <canvas ref={canvasRef} />
    </>
  );
}

export default Canvas;
