import {
  MousePointer,
  RectangleVertical,
  Diamond,
  Ellipse,
  ArrowRight,
  Type,
  Eraser,
} from "lucide-react";
import type React from "react";
import { TOOLS, type Tool } from "../tools/toolTypes";

type ToolbarProps = {
  tool: Tool;
  setTool: React.Dispatch<React.SetStateAction<Tool>>;
};

const TOOLBAR_ITEMS = [
  { tool: TOOLS.selection, icon: MousePointer },
  { tool: TOOLS.rectangle, icon: RectangleVertical },
  { tool: TOOLS.diamond, icon: Diamond },
  { tool: TOOLS.ellipse, icon: Ellipse },
  { tool: TOOLS.arrow, icon: ArrowRight },
  { tool: TOOLS.text, icon: Type },
  { tool: TOOLS.eraser, icon: Eraser },
];

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
      {TOOLBAR_ITEMS.map(({ tool: itemTool, icon: Icon }) => (
        <button
          key={itemTool.type}
          onClick={() => setTool(itemTool)}
          style={getStyle(itemTool)}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
}

export default Toolbar;
