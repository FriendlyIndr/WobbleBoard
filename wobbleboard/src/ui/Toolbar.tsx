import {
  MousePointer,
  RectangleVertical,
  Diamond,
  Ellipse,
} from "lucide-react";
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

      <button onClick={() => setTool(TOOLS.diamond)}>
        <Diamond />
      </button>

      <button onClick={() => setTool(TOOLS.ellipse)}>
        <Ellipse />
      </button>
    </div>
  );
}

export default Toolbar;
