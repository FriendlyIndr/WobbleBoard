import type { Element } from "../scene/elements";
import type { Tool } from "../tools/toolTypes";
import { TOOLS } from "../tools/toolTypes";
import { hitTest } from "../scene/hitTest";
import { type InteractionState } from "../editor/interaction";
import type React from "react";

type UseCanvasInteractionParams = {
    elements: Element[];
    setElements: React.Dispatch<React.SetStateAction<Element[]>>;

    tool: Tool;
    setTool: React.Dispatch<React.SetStateAction<Tool>>;

    selectedIds: Set<string>;
    setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;

    interaction: InteractionState;
    setInteraction: React.Dispatch<React.SetStateAction<InteractionState>>;

    editingTextId: string | null;
    setEditingTextId: React.Dispatch<React.SetStateAction<string | null>>;

    cursorPosRef: React.RefObject<{ x: number; y: number } | null>;

    canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export function useCanvasInteraction({
    elements,
    setElements,
    tool,
    setTool,
    selectedIds,
    setSelectedIds,
    interaction,
    setInteraction,
    editingTextId,
    setEditingTextId,
    cursorPosRef,
    canvasRef,
}: UseCanvasInteractionParams) {
    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
      if (editingTextId) {
        finishTextEditing({
          editingTextId,
          setEditingTextId,
          setElements
        });
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
          if (hit.type.type === "resize") {
            const handle = hit.type.handle; // "tl", "tr", etc

            if (handle) {
              setInteraction({
                type: "resizing",
                handle,
                cursorStart: {x, y},
                startBounds: {
                  x: hit.element.x,
                  y: hit.element.y,
                  width: hit.element.width,
                  height: hit.element.height,
                }
              });

              return;
            }
          }

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
        case "idle": {
          break;
        }
  
        case "drawing": {
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
        }
  
        case "dragging": {
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
        }
  
        case "marquee": {
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
  
        case "erasing": {
          break;
        }

        case "resizing": {
          const dx = x - interaction.cursorStart.x;
          const dy = y - interaction.cursorStart.y;

          setElements((prev) =>
            prev.map((el) => {
              if (!selectedIds.has(el.id)) return el;

              let { x: ex, y: ey, width, height } = interaction.startBounds;

              switch (interaction.handle) {
                case "br":
                  width = width + dx;
                  height = height + dy;
                  break;

                case "tr":
                  width = width + dx;
                  height = height - dy;
                  ey = ey + dy;
                  break;
                
                case "tl":
                  width = width - dx;
                  height = height - dy;
                  ex = ex + dx;
                  ey = ey + dy;
                  break;

                case "bl":
                  width = width - dx;
                  height = height + dy;
                  ex = ex + dx;
                  break;
              }

              // Normalize 
              if (width < 0) {
                ex = ex + width;
                width = Math.abs(width);
              }

              if (height < 0) {
                ey = ey + height;
                height = Math.abs(height);
              }

              return {
                ...el,
                x: ex,
                y: ey,
                width,
                height
              };
            })
          )

          break;
        }
      }
  
      if (tool === TOOLS.selection) {
        const hit = hitTest(x, y, elements, selectedIds);
  
        if (hit.element) {
          switch (hit.type.type) {
            case "border":
              canvasRef.current!.style.cursor = "move";
              break;
  
            case "inside":
              const isText = hit.element.type === "text";
              const isSelected = selectedIds.has(hit.element.id);

              if (isText || isSelected) {
                canvasRef.current!.style.cursor = "move";
              } else {
                canvasRef.current!.style.cursor = "default";
              }
              break;

            case "resize":
              switch (hit.type.handle) {
                case "br":
                case "tl":
                  canvasRef.current!.style.cursor = "nwse-resize";
                  break;
                case "bl":
                case "tr":
                  canvasRef.current!.style.cursor = "nesw-resize";
                  break;
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

    function handleDouleClick(e: React.MouseEvent<HTMLCanvasElement>) {
      const rect = e.currentTarget.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const hit = hitTest(x, y, elements, selectedIds);

      if (hit.element && hit.element.type === "text") {
        setEditingTextId(hit.element.id);

        setSelectedIds(new Set());
      }
    }

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleDouleClick,
    };
}

function isShapeType(
  type: Tool["type"],
): type is "rectangle" | "diamond" | "ellipse" | "arrow" {
  return ["rectangle", "diamond", "ellipse", "arrow"].includes(type);
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

function finishTextEditing({
  editingTextId,
  setEditingTextId,
  setElements,
}: {
  editingTextId: string | null;
  setEditingTextId: React.Dispatch<React.SetStateAction<string | null>>;
  setElements: React.Dispatch<React.SetStateAction<Element[]>>;
}) {
  if (!editingTextId) return;

  setElements((prev) =>
    prev.filter((el) => {
      if (el.id !== editingTextId) return true;

      return el.text && el.text.trim().length > 0;
    })
  );

  setEditingTextId(null);
}