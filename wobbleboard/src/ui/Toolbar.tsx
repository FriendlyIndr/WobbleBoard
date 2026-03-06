import { MousePointer, RectangleVertical } from "lucide-react";
import type React from "react";
import { rectangleTool, selectionTool, type Tool } from "../tools/toolTypes";

type ToolbarProps = {
  setTool: React.Dispatch<React.SetStateAction<Tool>>;
};

function Toolbar({ setTool }: ToolbarProps) {
  return (
    <div>
      <button onClick={() => setTool(selectionTool)}>
        <MousePointer />
      </button>
      <button onClick={() => setTool(rectangleTool)}>
        <RectangleVertical />
      </button>
    </div>
  );
}

export default Toolbar;
