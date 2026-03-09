import React, { useEffect, useRef, useState } from "react";
import { renderScene } from "./renderer";
import type { Element } from "../scene/elements";
import { TOOLS, type Tool } from "../tools/toolTypes";
import Toolbar from "../ui/Toolbar";
import { hitTest, isPointInsideRectangle } from "../scene/hitTest";

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

  const [isDragging, setIsDragging] = useState(false);

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
      const hit = hitTest(x, y, elements);

      if (hit.element) {
        if (hit.type == "border") {
          setSelectedElementId(hit.element.id);
        }

        if (hit.type === "border" || hit.element.id === selectedElementId) {
          setIsDragging(true);

          setDragOffset({
            x: x - hit.element.x,
            y: y - hit.element.y,
          });
        }
      } else {
        setSelectedElementId(null);
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && selectedElementId) {
      setElements((prev) => {
        return prev.map((el) => {
          if (el.id !== selectedElementId) return el;

          return {
            ...el,
            x: x - dragOffset.x,
            y: y - dragOffset.y,
          };
        });
      });

      return;
    }

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
        const hit = hitTest(x, y, elements);

        switch (hit.type) {
          case "border":
            canvasRef.current!.style.cursor = "move";
            break;

          case "inside":
            if (hit.element?.id === selectedElementId) {
              canvasRef.current!.style.cursor = "move";
            } else {
              canvasRef.current!.style.cursor = "default";
            }
            break;

          default:
            canvasRef.current!.style.cursor = tool.cursor;
        }
      }
    }
  }

  function handleMouseUp() {
    setIsDrawing(false);
    setIsDragging(false);
  }

  useEffect(() => {
    setSelectedElementId(null);
  }, [tool]);

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
