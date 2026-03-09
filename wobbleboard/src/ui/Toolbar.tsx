import {
  MousePointer,
  RectangleVertical,
  Diamond,
  Ellipse,
} from "lucide-react";
import type React from "react";
import { TOOLS, type Tool } from "../tools/toolTypes";

type ToolbarProps = {
  tool: Tool;
  setTool: React.Dispatch<React.SetStateAction<Tool>>;
};

function Toolbar({ tool, setTool }: ToolbarProps) {
  const getStyle = (btnTool: Tool) => ({
    backgroundColor: tool.type === btnTool.type ? "#dcdcff" : "",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        marginLeft: "-100px",
        padding: "2px",
        boxShadow: "3px 3px 9px 2px #aaaaaa",
        marginTop: "16px",
      }}
      className="toolbar"
    >
      <button
        onClick={() => setTool(TOOLS.selection)}
        style={getStyle(TOOLS.selection)}
      >
        <MousePointer size={20} />
      </button>

      <button
        onClick={() => setTool(TOOLS.rectangle)}
        style={getStyle(TOOLS.rectangle)}
      >
        <RectangleVertical size={20} />
      </button>

      <button
        onClick={() => setTool(TOOLS.diamond)}
        style={getStyle(TOOLS.diamond)}
      >
        <Diamond size={20} />
      </button>

      <button
        onClick={() => setTool(TOOLS.ellipse)}
        style={getStyle(TOOLS.ellipse)}
      >
        <Ellipse size={20} />
      </button>
    </div>
  );
}

export default Toolbar;
