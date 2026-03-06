import React, { useEffect, useRef } from "react";

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Draw a rectangle
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.strokeRect(100, 100, 200, 200);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} />
    </>
  );
}

export default Canvas;
