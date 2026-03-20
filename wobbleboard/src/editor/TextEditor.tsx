import React from "react";
import type { Element } from "../scene/elements";

const TextEditor = ({
  textareaRef,
  editingTextElement,
  setElements,
  editingTextId,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  editingTextElement: Element;
  setElements: React.Dispatch<React.SetStateAction<Element[]>>;
  editingTextId: string | null;
}) => {
  return (
    <textarea
      ref={textareaRef}
      autoFocus
      style={{
        position: "absolute",
        left: editingTextElement.x,
        top: editingTextElement.y,
        font: "20px Arial",
        lineHeight: "24px",
        background: "transparent",
        border: "none",
        outline: "none",
        resize: "none",
        padding: "0px",
        pointerEvents: "auto",

        width: Math.max(editingTextElement.width || 0, 50),
        height: Math.max(editingTextElement.height || 0, 24),
      }}
      wrap="off"
      value={editingTextElement?.text || ""}
      onChange={(e) => {
        const value = e.target.value;

        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== editingTextId) return el;

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;

            const FONT = "20px Arial";
            const LINE_HEIGHT = 24; // ~1.2 * font size
            const PADDING = 4;

            const MIN_WIDTH = 20;
            const MIN_HEIGHT = 24;

            ctx.font = FONT;

            const lines = value.split("\n");

            let maxWidth = 0;

            lines.forEach((line) => {
              const metrics = ctx!.measureText(line);
              maxWidth = Math.max(metrics.width, maxWidth);
            });

            const totalHeight = lines.length * LINE_HEIGHT;

            return {
              ...el,
              text: value,
              width: Math.max(maxWidth + PADDING, MIN_WIDTH),
              height: Math.max(totalHeight + PADDING, MIN_HEIGHT),
            };
          }),
        );
      }}
    />
  );
};

export default TextEditor;
