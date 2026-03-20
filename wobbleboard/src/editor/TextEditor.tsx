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
  );
};

export default TextEditor;
