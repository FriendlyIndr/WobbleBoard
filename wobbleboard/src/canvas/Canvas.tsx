import React, { useEffect, useRef, useState } from "react";
import { renderScene } from "./renderer";
import type { Element } from "../scene/elements";
import { TOOLS, type Tool } from "../tools/toolTypes";
import Toolbar from "../ui/Toolbar";
import { hitTest } from "../scene/hitTest";

type InteractionState =
  | { type: "idle" }
  | { type: "drawing"; start: { x: number; y: number } }
  | {
      type: "dragging";
      cursorStart: { x: number; y: number };
      intitialPositions: Map<string, { x: number; y: number }>;
    }
  | { type: "erasing" }
  | {
      type: "marquee";
      start: { x: number; y: number };
      current: { x: number; y: number };
    };

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [elements, setElements] = useState<Element[]>(() => {
    const saved = localStorage.getItem("scene");
    return saved ? JSON.parse(saved) : [];
  });

  const [tool, setTool] = useState<Tool>(TOOLS.selection);

  const [interaction, setInteraction] = useState<InteractionState>({
    type: "idle",
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const cursorPosRef = useRef<{ x: number; y: number } | null>(null);

  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const editingTextElement = elements.find((e) => e.id === editingTextId);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    // Get 2d drawing context
    const ctx = canvas.getContext("2d")!;
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

    function render() {
      renderScene(ctx, elements, canvas, selectedIds, selectionBox);

      const cursor = cursorPosRef.current;

      if (tool.type === "eraser" && cursor) {
        const radius = 5.5;

        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      requestAnimationFrame(render);
    }

    render();
  }, [elements, selectedIds, interaction]);

  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem("scene", JSON.stringify(elements));
    }, 300);

    return () => clearTimeout(id);
  }, [elements]);

  function isShapeType(
    type: Tool["type"],
  ): type is "rectangle" | "diamond" | "ellipse" | "arrow" {
    return ["rectangle", "diamond", "ellipse", "arrow"].includes(type);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (editingTextId) {
      setEditingTextId(null);
    }

    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isShapeType(tool.type)) {
      setInteraction({
        type: "drawing",
        start: { x, y },
      });

      const newShape: Element = {
        id: crypto.randomUUID(),
        type: tool.type,
        x,
        y,
        width: 0,
        height: 0,
        seed: Math.floor(Math.random() * 100000),
      };

      setElements((prev) => [...prev, newShape]);
    }

    if (tool === TOOLS.text) {
      const newText: Element = {
        id: crypto.randomUUID(),
        type: "text",
        x,
        y,
        width: 0,
        height: 0,
        seed: 0,
        text: "",
      };

      setElements((prev) => [...prev, newText]);

      setEditingTextId(newText.id);

      setTool(TOOLS.selection); // switch back to select
    }

    if (tool === TOOLS.eraser) {
      setInteraction({ type: "erasing" });

      const hit = hitTest(x, y, elements, selectedIds);

      if (hit.element) {
        setElements((prev) => prev.filter((el) => el.id !== hit.element?.id));
      }
    }

    if (tool === TOOLS.selection) {
      const hit = hitTest(x, y, elements, selectedIds);

      if (hit.element) {
        const id = hit.element.id;

        // Compute next selection synchronously
        let nextSelected = selectedIds;

        if (!selectedIds.has(id)) {
          nextSelected = new Set([id]);
          setSelectedIds(nextSelected);
        }

        const intitialPositions = new Map<string, { x: number; y: number }>();

        elements.forEach((el) => {
          if (nextSelected.has(el.id) || el.id === id) {
            intitialPositions.set(el.id, { x: el.x, y: el.y });
          }
        });

        setInteraction({
          type: "dragging",
          cursorStart: { x, y },
          intitialPositions,
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

    cursorPosRef.current = { x, y };

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
        // Calculate deltas
        const dx = x - interaction.cursorStart.x;
        const dy = y - interaction.cursorStart.y;

        setElements((prev) => {
          return prev.map((el) => {
            const startPos = interaction.intitialPositions.get(el.id);
            if (!startPos) return el;

            return {
              ...el,
              x: startPos.x + dx,
              y: startPos.y + dy,
            };
          });
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

      case "erasing":
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [editingTextId]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
      }}
    >
      <Toolbar tool={tool} setTool={setTool} />
      <canvas
        ref={canvasRef}
        style={{ cursor: tool.cursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {editingTextElement && (
        <textarea
          ref={textareaRef}
          autoFocus
          style={{
            position: "absolute",
            left: editingTextElement.x,
            top: editingTextElement.y,
            font: "20px sans-serif",
            border: "1px solid #aaa",
            padding: "2px",
            pointerEvents: "auto",
          }}
          value={editingTextElement?.text || ""}
          onChange={(e) => {
            const value = e.target.value;

            setElements((prev) =>
              prev.map((el) => {
                if (el.id !== editingTextId) return el;

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d")!;

                ctx.font = "20px sans-serif";

                const metrics = ctx.measureText(value);

                const width = metrics?.width;
                const height =
                  metrics?.actualBoundingBoxAscent +
                  metrics?.actualBoundingBoxDescent;

                return {
                  ...el,
                  text: value,
                  width,
                  height,
                };
              }),
            );
          }}
        />
      )}
    </div>
  );
}

export default Canvas;
