import React, { useEffect, useRef, useState } from "react";
import { renderScene } from "./renderer";
import type { Element } from "../scene/elements";
import { TOOLS, type Tool } from "../tools/toolTypes";
import Toolbar from "../ui/Toolbar";
import { getElementAtPosition } from "../scene/hitTest";

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

  const [tool, setTool] = useState<Tool>(TOOLS.selection);

  const [isDrawing, setIsDrawing] = useState(false);

  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );

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

    renderScene(ctx, elements, canvas, selectedElementId);
  }, [elements, selectedElementId]);

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === TOOLS.rectangle) {
      setStartPos({ x, y });
      setIsDrawing(true);

      const newRect: Element = {
        id: crypto.randomUUID(),
        type: "rectangle",
        x,
        y,
        width: 0,
        height: 0,
      };

      setElements((prev) => [...prev, newRect]);
    }

    if (tool === TOOLS.selection) {
      const element = getElementAtPosition(x, y, elements);

      if (element) {
        setSelectedElementId(element.id);
      } else {
        setSelectedElementId(null);
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing) {
      setElements((prev) => {
        const updated = [...prev];
        const current = updated[updated.length - 1];

        current.width = x - startPos.x;
        current.height = y - startPos.y;

        return updated;
      });
    } else {
      if (tool === TOOLS.selection) {
        const element = getElementAtPosition(x, y, elements);

        if (element) {
          canvasRef.current!.style.cursor = "move";
        } else {
          canvasRef.current!.style.cursor = tool.cursor;
        }
      }
    }
  }

  function handleMouseUp() {
    setIsDrawing(false);
  }

  return (
    <>
      <Toolbar setTool={setTool} />
      <canvas
        ref={canvasRef}
        style={{ cursor: tool.cursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

export default Canvas;
