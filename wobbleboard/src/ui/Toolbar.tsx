import { MousePointer, RectangleVertical } from "lucide-react";
import type React from "react";
import { TOOLS, type Tool } from "../tools/toolTypes";

type ToolbarProps = {
  setTool: React.Dispatch<React.SetStateAction<Tool>>;
};

function Toolbar({ setTool }: ToolbarProps) {
  return (
    <div>
      <button onClick={() => setTool(TOOLS.selection)}>
        <MousePointer />
      </button>
      <button onClick={() => setTool(TOOLS.rectangle)}>
        <RectangleVertical />
      </button>
    </div>
  );
}

export default Toolbar;
