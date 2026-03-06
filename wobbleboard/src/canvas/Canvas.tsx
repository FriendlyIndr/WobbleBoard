import React, { useEffect, useRef, useState } from "react";
import { renderScene } from "./renderer";
import type { Element } from "../scene/elements";

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [elements, setElements] = useState<Element[]>([
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

  const [isDrawing, setIsDrawing] = useState(false);

  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

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

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPos({ x, y });
    setIsDrawing(true);

    const newRect: Element = {
      id: "v",
      type: "rectangle",
      x,
      y,
      width: 0,
      height: 0,
    };

    setElements((prev) => [...prev, newRect]);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setElements((prev) => {
      const updated = [...prev];
      const current = updated[updated.length - 1];

      current.width = x - startPos.x;
      current.height = y - startPos.y;

      return updated;
    });
  }

  function handleMouseUp() {
    setIsDrawing(false);
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

export default Canvas;
