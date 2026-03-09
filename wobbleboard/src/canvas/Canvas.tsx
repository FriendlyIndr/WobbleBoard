import React, { useEffect, useRef, useState } from "react";
import { renderScene } from "./renderer";
import type { Element } from "../scene/elements";
import { TOOLS, type Tool } from "../tools/toolTypes";
import Toolbar from "../ui/Toolbar";
import { hitTest } from "../scene/hitTest";

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

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null); // marquee selection state

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

    renderScene(ctx, elements, canvas, selectedIds, selectionBox);
  }, [elements, selectedIds, selectionBox]);

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

    if (tool === TOOLS.diamond) {
      setStartPos({ x, y });
      setIsDrawing(true);

      const newDiamond: Element = {
        id: crypto.randomUUID(),
        type: "diamond",
        x,
        y,
        width: 0,
        height: 0,
      };

      setElements((prev) => [...prev, newDiamond]);
    }

    if (tool === TOOLS.selection) {
      const hit = hitTest(x, y, elements);

      if (hit.element) {
        const id = hit.element.id;

        if (hit.type == "border") {
          setSelectedIds(new Set([id]));
        }

        if (hit.type === "border" || selectedIds.has(id)) {
          setIsDragging(true);

          setDragOffset({
            x: x - hit.element.x,
            y: y - hit.element.y,
          });
        }
      } else {
        setSelectionBox({
          x,
          y,
          width: 0,
          height: 0,
        });

        setSelectedIds(new Set());
        return;
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && selectedIds.size) {
      setElements((prev) => {
        return prev.map((el) => {
          if (!selectedIds.has(el.id)) return el;

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

        updated[updated.length - 1] = {
          ...current,
          width: x - startPos.x,
          height: y - startPos.y,
        };

        return updated;
      });

      return;
    }

    if (tool === TOOLS.selection) {
      if (selectionBox) {
        setSelectionBox({
          ...selectionBox,
          width: x - selectionBox.x,
          height: y - selectionBox.y,
        });

        const box = normalizeBox({
          x: selectionBox.x,
          y: selectionBox.y,
          width: selectionBox.width,
          height: selectionBox.height,
        });

        const newSelected = new Set<string>();

        elements.forEach((el) => {
          if (intersects(box, el)) {
            newSelected.add(el.id);
          }
        });

        setSelectedIds(newSelected);
      }

      const hit = hitTest(x, y, elements);

      if (hit.element) {
        switch (hit.type) {
          case "border":
            canvasRef.current!.style.cursor = "move";
            break;

          case "inside":
            if (selectedIds.has(hit.element.id)) {
              canvasRef.current!.style.cursor = "move";
            } else {
              canvasRef.current!.style.cursor = "default";
            }
            break;

          default:
            canvasRef.current!.style.cursor = tool.cursor;
        }
      } else {
        canvasRef.current!.style.cursor = tool.cursor;
      }
    }
  }

  function handleMouseUp() {
    setIsDrawing(false);
    setIsDragging(false);
    setSelectionBox(null);
  }

  function normalizeBox(box: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    const x = box.width < 0 ? box.x + box.width : box.x;
    const y = box.height < 0 ? box.y + box.height : box.y;

    return {
      x,
      y,
      width: Math.abs(box.width),
      height: Math.abs(box.height),
    };
  }

  function intersects(
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
    element: Element,
  ) {
    return !(
      element.x > box.x + box.width ||
      element.x + element.width < box.x ||
      element.y > box.y + box.height ||
      element.y + element.height < box.y
    );
  }

  useEffect(() => {
    setSelectedIds(new Set());
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
