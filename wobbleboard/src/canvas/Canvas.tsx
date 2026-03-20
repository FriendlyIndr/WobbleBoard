import { useEffect, useRef, useState } from "react";
import { renderScene } from "./renderer";
import type { Element } from "../scene/elements";
import { TOOLS, type Tool } from "../tools/toolTypes";
import Toolbar from "../ui/Toolbar";
import { Menu } from "lucide-react";
import { useCanvasInteraction } from "./useCanvasInteraction";
import { type InteractionState } from "../editor/interaction";
import TextEditor from "../editor/TextEditor";

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

  const { handleMouseDown, handleMouseMove, handleMouseUp } =
    useCanvasInteraction({
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
    });

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
      <div className="app_menu_top">
        <div className="app_menu_top__left">
          <button>
            <Menu size={16} />
          </button>
        </div>
        <Toolbar tool={tool} setTool={setTool} />
      </div>

      <canvas
        ref={canvasRef}
        style={{ cursor: tool.cursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {editingTextElement && (
        <TextEditor
          textareaRef={textareaRef}
          editingTextElement={editingTextElement}
          setElements={setElements}
          editingTextId={editingTextId}
        />
      )}
    </div>
  );
}

export default Canvas;
