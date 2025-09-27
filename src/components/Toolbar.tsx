import { Music, Square, Activity, MousePointerClick } from "lucide-react";

interface ToolbarProps {
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
}

export default function Toolbar({ selectedTool, setSelectedTool }: ToolbarProps) {
  const tools = [
    { id: "bpm", icon: <Music size={20} />, label: "BPM" },
    { id: "single", icon: <Square size={20} />, label: "Single" },
    { id: "slide", icon: <Activity size={20} />, label: "Slide" },
    { id: "flick", icon: <MousePointerClick size={20} />, label: "Flick" },
  ];

  return (
    <div className="flex gap-2 p-2 border-b bg-gray-50">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`p-2 rounded ${selectedTool === tool.id ? "bg-blue-200" : "bg-white"}`}
          onClick={() => setSelectedTool(tool.id)}
          title={tool.label} // 悬浮提示
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
