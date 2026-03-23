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

    elementsRef: React.RefObject<Element[]>;
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
    elementsRef,
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

      if (tool.type === "arrow") {
        const newArrow: Element = {
          id: crypto.randomUUID(),
          type: "arrow",
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          seed: Math.floor(Math.random() * 100000),
        };

        setElements((prev) => [...prev, newArrow]);

        setInteraction({
          type: "drawing",
          start: { x, y },
        });
        
        return;
      }
  
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
  
        if (hit.element && hit.type.type === "resize") {
          const handle = hit.type.handle; // "tl", "tr", etc

          if (handle) {
            if (hit.element.type === "arrow") {
              setInteraction({
                type: "resizing",
                handle,
                cursorStart: {x, y},
                startBounds: {
                  x1: hit.element.x1,
                  y1: hit.element.y1,
                  x2: hit.element.x2,
                  y2: hit.element.y2,
                }
              });
            } else {
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
            }

            return;
          }
        }

        if (hit.element) {
          // Drag code

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
              if (el.type === "arrow") {
                intitialPositions.set(el.id, { x: el.x1, y: el.y1 });
              } else {
                intitialPositions.set(el.id, { x: el.x, y: el.y });
              }
            }
          });
  
          setInteraction({
            type: "dragging",
            cursorStart: { x, y },
            intitialPositions,
          });
        } else {
          // Marquee selection
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

          const updated = [...elementsRef.current];
          const current = updated[updated.length - 1];

          if (current.type === "arrow") {
            updated[updated.length - 1] = {
              ...current,
              x2: x,
              y2: y,
            };
          } else {
            updated[updated.length - 1] = {
              ...current,
              width: x - start.x,
              height: y - start.y,
            };
          }
  
          elementsRef.current = updated;
  
          break;
        }
  
        case "dragging": {
          // Calculate deltas
          const dx = x - interaction.cursorStart.x;
          const dy = y - interaction.cursorStart.y;
  
          const updated = elementsRef.current.map((el) => {
            const startPos = interaction.intitialPositions.get(el.id);
            if (!startPos) return el;

            return {
              ...el,
              x: startPos.x + dx,
              y: startPos.y + dy,
            };
          });

          elementsRef.current = updated;

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

          const updated = elementsRef.current.map((el) => {
            if (!selectedIds.has(el.id)) return el;

            // Handle arrow first
            if (el.type === "arrow") {
              return resizeArrow(el, interaction, dx, dy);
            }

            if (!("x" in interaction.startBounds)) return el;
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
          });

          elementsRef.current = updated;

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
  
            case "inside": {
              const isText = hit.element.type === "text";
              const isSelected = selectedIds.has(hit.element.id);

              if (isText || isSelected) {
                canvasRef.current!.style.cursor = "move";
              } else {
                canvasRef.current!.style.cursor = "default";
              }
              break;
            }

            case "resize": {
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
            }
  
            default:
              canvasRef.current!.style.cursor = tool.cursor;
          }
        } else {
          canvasRef.current!.style.cursor = tool.cursor;
        }
      }
    }

    function handleMouseUp() {
      setElements(elementsRef.current); // sync to react
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
  if (element.type === "arrow") {
    const minX = Math.min(element.x1, element.x2);
    const maxX = Math.max(element.x1, element.x2);
    const minY = Math.min(element.y1, element.y2);
    const maxY = Math.max(element.y1, element.y2);

    return (
      minX >= box.x &&
      maxX <= box.x + box.width &&
      minY >= box.y &&
      maxY <= box.y + box.height
    );
  }
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

      if (el.type !== "text") return;
      return el.text && el.text.trim().length > 0;
    })
  );

  setEditingTextId(null);
}

function resizeArrow(
  el: Element,
  interaction: any,
  dx: number,
  dy: number
): Element {
  if (el.type !== "arrow") return el;

  const { x1, y1, x2, y2 } = interaction.startBounds;

  let newX1 = x1;
  let newY1 = y1;
  let newX2 = x2;
  let newY2 = y2;

  switch (interaction.handle) {
    case "start":
      newX1 = x1 + dx;
      newY1 = y1 + dy;
      break;

    case "end":
      newX2 = x2 + dx;
      newY2 = y2 + dy;
      break;

    case "middle":
      newX1 = x1 + dx;
      newY1 = y1 + dy;
      newX2 = x2 + dx;
      newY2 = y2 + dy;
      break;
  }

  return {
    ...el,
    x1: newX1,
    y1: newY1,
    x2: newX2,
    y2: newY2,
  };
}