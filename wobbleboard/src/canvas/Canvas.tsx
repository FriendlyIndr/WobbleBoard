import React, { useEffect, useRef, useState } from "react";
import { renderScene } from "./renderer";
import type { Element } from "../scene/elements";
import { TOOLS, type Tool } from "../tools/toolTypes";
import Toolbar from "../ui/Toolbar";
import { hitTest } from "../scene/hitTest";

type InteractionState =
  | { type: "idle" }
  | { type: "drawing"; start: { x: number; y: number } }
  | { type: "dragging"; start: { x: number; y: number } }
  | {
      type: "marquee";
      start: { x: number; y: number };
      current: { x: number; y: number };
    };

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
      seed: 3,
    },
    {
      id: "2",
      type: "rectangle",
      x: 350,
      y: 200,
      width: 150,
      height: 90,
      seed: 44,
    },
  ]);

  const [tool, setTool] = useState<Tool>(TOOLS.selection);

  const [interaction, setInteraction] = useState<InteractionState>({
    type: "idle",
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

    const selectionBox =
      interaction.type === "marquee"
        ? {
            x: interaction.start.x,
            y: interaction.start.y,
            width: interaction.current.x - interaction.start.x,
            height: interaction.current.y - interaction.start.y,
          }
        : null;

    renderScene(ctx, elements, canvas, selectedIds, selectionBox);
  }, [elements, selectedIds, interaction]);

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === TOOLS.rectangle) {
      setInteraction({
        type: "drawing",
        start: { x, y },
      });

      const newRect: Element = {
        id: crypto.randomUUID(),
        type: "rectangle",
        x,
        y,
        width: 0,
        height: 0,
        seed: Math.floor(Math.random() * 100000),
      };

      setElements((prev) => [...prev, newRect]);
    }

    if (tool === TOOLS.diamond) {
      setInteraction({
        type: "drawing",
        start: { x, y },
      });

      const newDiamond: Element = {
        id: crypto.randomUUID(),
        type: "diamond",
        x,
        y,
        width: 0,
        height: 0,
        seed: Math.floor(Math.random() * 100000),
      };

      setElements((prev) => [...prev, newDiamond]);
    }

    if (tool === TOOLS.ellipse) {
      setInteraction({
        type: "drawing",
        start: { x, y },
      });

      const newEllipse: Element = {
        id: crypto.randomUUID(),
        type: "ellipse",
        x,
        y,
        width: 0,
        height: 0,
        seed: Math.floor(Math.random() * 100000),
      };

      setElements((prev) => [...prev, newEllipse]);
    }

    if (tool === TOOLS.selection) {
      const hit = hitTest(x, y, elements, selectedIds);

      if (hit.element) {
        const id = hit.element.id;

        if (!selectedIds.has(id)) {
          setSelectedIds(new Set([id]));
        }

        setInteraction({
          type: "dragging",
          start: { x, y },
        });
      } else {
        setSelectedIds(new Set());

        setInteraction({
          type: "marquee",
          start: { x, y },
          current: { x, y },
        });

        return;
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    switch (interaction.type) {
      case "idle":
        break;

      case "drawing":
        const { start } = interaction;

        setElements((prev) => {
          const updated = [...prev];
          const current = updated[updated.length - 1];

          updated[updated.length - 1] = {
            ...current,
            width: x - start.x,
            height: y - start.y,
          };

          return updated;
        });

        break;

      case "dragging":
        const dx = x - interaction.start.x;
        const dy = y - interaction.start.y;

        setElements((prev) => {
          return prev.map((el) => {
            if (!selectedIds.has(el.id)) return el;

            return {
              ...el,
              x: el.x + dx,
              y: el.y + dy,
            };
          });
        });

        setInteraction({
          type: "dragging",
          start: { x, y },
        });

        break;

      case "marquee":
        const next = {
          ...interaction,
          current: { x, y },
        };

        setInteraction(next);

        const box = normalizeBox({
          x: next.start.x,
          y: next.start.y,
          width: next.current.x - next.start.x,
          height: next.current.y - next.start.y,
        });

        const newSelected = new Set<string>();

        elements.forEach((el) => {
          if (boxContainsElement(box, el)) {
            newSelected.add(el.id);
          }
        });

        setSelectedIds(newSelected);

        break;
    }

    if (tool === TOOLS.selection) {
      const hit = hitTest(x, y, elements, selectedIds);

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
    setInteraction({ type: "idle" });
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

  function boxContainsElement(
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
    element: Element,
  ) {
    return (
      element.x >= box.x &&
      element.x + element.width <= box.x + box.width &&
      element.y >= box.y &&
      element.y + element.height <= box.y + box.height
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
