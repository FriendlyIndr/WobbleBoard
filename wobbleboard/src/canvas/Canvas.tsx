import { useEffect, useRef, useState } from "react";
import type { Element } from "../scene/elements";
import { TOOLS, type Tool } from "../tools/toolTypes";
import Toolbar from "../ui/Toolbar";
import { Menu } from "lucide-react";
import { useCanvasInteraction } from "./useCanvasInteraction";
import { type InteractionState } from "../editor/interaction";
import TextEditor from "../editor/TextEditor";
import { useCanvasRenderer } from "./useCanvasRenderer";

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [elements, setElements] = useState<Element[]>(() => {
    const saved = localStorage.getItem("scene");
    return saved ? JSON.parse(saved) : [];
  });

  const elementsRef = useRef(elements);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const [tool, setTool] = useState<Tool>(TOOLS.selection);

  const toolRef = useRef(tool);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  const [interaction, setInteraction] = useState<InteractionState>({
    type: "idle",
  });

  const interactionRef = useRef(interaction);

  useEffect(() => {
    interactionRef.current = interaction;
  }, [interaction]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedIdsRef = useRef(selectedIds);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  const cursorPosRef = useRef<{ x: number; y: number } | null>(null);

  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const editingTextElement = elements.find((e) => e.id === editingTextId);

  useCanvasRenderer({
    canvasRef,
    cursorPosRef,
    elementsRef,
    interactionRef,
    selectedIdsRef,
    toolRef,
  });

  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem("scene", JSON.stringify(elements));
    }, 300);

    return () => clearTimeout(id);
  }, [elements]);

  const { handleMouseDown, handleMouseMove, handleMouseUp, handleDouleClick } =
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
      elementsRef,
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
        onDoubleClick={handleDouleClick}
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
