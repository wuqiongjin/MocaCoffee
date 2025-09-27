import { 
  Music, 
  Square, 
  Activity, 
  MousePointerClick, 
  MousePointer, 
  ZoomIn, 
  ZoomOut, 
  Copy, 
  Scissors, 
  Clipboard, 
  Trash2, 
  RotateCcw,
  Undo, 
  Redo,
  Play,
  Pause
} from "lucide-react";

interface ToolbarProps {
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  beatDisplay: number;
  setBeatDisplay: (beat: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onMirror: () => void;
  canCopy: boolean;
  canPaste: boolean;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function Toolbar({ 
  selectedTool, 
  setSelectedTool, 
  beatDisplay, 
  setBeatDisplay,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onMirror,
  canCopy,
  canPaste,
  scale,
  onZoomIn,
  onZoomOut
}: ToolbarProps) {
  const tools = [
    { id: "mouse", icon: <MousePointer size={20} />, label: "鼠标状态" },
    { id: "bpm", icon: <Music size={20} />, label: "BPM键型" },
    { id: "single", icon: <Square size={20} />, label: "单键音符" },
    { id: "flick", icon: <MousePointerClick size={20} />, label: "滑键音符" },
    { id: "slide", icon: <Activity size={20} />, label: "滑条音符" },
  ];

  const beatOptions = [
    { value: 1, label: "1/1" },
    { value: 2, label: "1/2" },
    { value: 3, label: "1/3" },
    { value: 4, label: "1/4" },
    { value: 6, label: "1/6" },
    { value: 8, label: "1/8" },
    { value: 12, label: "1/12" },
    { value: 16, label: "1/16" },
  ];

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* 工具选择 */}
      <div>
        <h3 className="text-sm font-semibold mb-2">工具</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`p-2 rounded text-xs flex flex-col items-center ${
                selectedTool === tool.id ? "bg-blue-200" : "bg-white hover:bg-gray-100"
              }`}
              onClick={() => setSelectedTool(tool.id)}
              title={tool.label}
            >
              {tool.icon}
              <span className="mt-1">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 节拍显示工具 */}
      <div>
        <h3 className="text-sm font-semibold mb-2">节拍显示</h3>
        <select
          value={beatDisplay}
          onChange={(e) => setBeatDisplay(Number(e.target.value))}
          className="w-full p-2 border rounded text-sm"
        >
          {beatOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 缩放控制 */}
      <div>
        <h3 className="text-sm font-semibold mb-2">缩放</h3>
        <div className="flex gap-1">
          <button 
            className="p-2 bg-white rounded hover:bg-gray-100" 
            onClick={onZoomIn}
            title="放大"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            className="p-2 bg-white rounded hover:bg-gray-100" 
            onClick={onZoomOut}
            title="缩小"
          >
            <ZoomOut size={16} />
          </button>
        </div>
        <div className="text-xs text-gray-600 mt-1 text-center">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* 编辑功能 */}
      <div>
        <h3 className="text-sm font-semibold mb-2">编辑</h3>
        <div className="grid grid-cols-2 gap-1">
          <button 
            className={`p-2 rounded text-xs ${canCopy ? "bg-white hover:bg-gray-100" : "bg-gray-200 cursor-not-allowed"}`}
            onClick={onCopy}
            disabled={!canCopy}
            title="复制 (Ctrl+C)"
          >
            <Copy size={16} />
          </button>
          <button 
            className={`p-2 rounded text-xs ${canCopy ? "bg-white hover:bg-gray-100" : "bg-gray-200 cursor-not-allowed"}`}
            onClick={onCut}
            disabled={!canCopy}
            title="剪切 (Ctrl+X)"
          >
            <Scissors size={16} />
          </button>
          <button 
            className={`p-2 rounded text-xs ${canPaste ? "bg-white hover:bg-gray-100" : "bg-gray-200 cursor-not-allowed"}`}
            onClick={onPaste}
            disabled={!canPaste}
            title="粘贴 (Ctrl+V)"
          >
            <Clipboard size={16} />
          </button>
          <button 
            className={`p-2 rounded text-xs ${canCopy ? "bg-white hover:bg-gray-100" : "bg-gray-200 cursor-not-allowed"}`}
            onClick={onDelete}
            disabled={!canCopy}
            title="删除 (Delete)"
          >
            <Trash2 size={16} />
          </button>
          <button 
            className={`p-2 rounded text-xs ${canCopy ? "bg-white hover:bg-gray-100" : "bg-gray-200 cursor-not-allowed"}`}
            onClick={onMirror}
            disabled={!canCopy}
            title="镜像"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            className={`p-2 rounded text-xs ${canUndo ? "bg-white hover:bg-gray-100" : "bg-gray-200 cursor-not-allowed"}`}
            onClick={onUndo}
            disabled={!canUndo}
            title="撤销 (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
          <button 
            className={`p-2 rounded text-xs ${canRedo ? "bg-white hover:bg-gray-100" : "bg-gray-200 cursor-not-allowed"}`}
            onClick={onRedo}
            disabled={!canRedo}
            title="还原 (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
        </div>
      </div>

      {/* 播放控制 */}
      <div>
        <h3 className="text-sm font-semibold mb-2">播放</h3>
        <div className="flex gap-1">
          <button className="p-2 bg-white rounded hover:bg-gray-100" title="播放 (空格)">
            <Play size={16} />
          </button>
          <button className="p-2 bg-white rounded hover:bg-gray-100" title="暂停">
            <Pause size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
