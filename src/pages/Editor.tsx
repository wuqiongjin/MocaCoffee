import { useState } from "react";
import Toolbar from "../components/Toolbar";
import ChartCanvas from "../components/ChartCanvas";
import NoteInfoPanel from "../components/NoteInfoPanel";
import StatusBar from "../components/StatusBar";
import type { ChartNote } from "../notes/Charts";

interface EditorProps {
  song: File | null;
}

export default function Editor({ }: EditorProps) {
  const [selectedTool, setSelectedTool] = useState("mouse");
  const [notes, setNotes] = useState<ChartNote[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [beatDisplay, setBeatDisplay] = useState(4); // 默认1/4拍显示
  const [mousePosition, setMousePosition] = useState<{ lane: number; beat: number } | null>(null);
  const [history, setHistory] = useState<ChartNote[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState<ChartNote[]>([]);
  const [scale, setScale] = useState(1);

  const addToHistory = (newNotes: ChartNote[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newNotes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setNotes(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setNotes(history[historyIndex + 1]);
    }
  };

  const handleNotesChange = (newNotes: ChartNote[]) => {
    setNotes(newNotes);
    addToHistory(newNotes);
  };

  // 编辑功能
  const copySelected = () => {
    if (selectedNotes.length > 0) {
      const copiedNotes = selectedNotes.map(index => notes[index]).filter(Boolean);
      setClipboard(copiedNotes);
    }
  };

  const cutSelected = () => {
    if (selectedNotes.length > 0) {
      copySelected();
      const newNotes = notes.filter((_, index) => !selectedNotes.includes(index));
      handleNotesChange(newNotes);
      setSelectedNotes([]);
    }
  };

  const pasteAtPosition = (beat: number, lane: number) => {
    if (clipboard.length > 0) {
      const newNotes = [...notes];
      clipboard.forEach(note => {
        if (note.type === "Single") {
          newNotes.push({
            ...note,
            beat: beat + (note.beat - Math.min(...clipboard.map(n => n.type === "Single" ? n.beat : 0))),
            lane: lane + (note.lane - Math.min(...clipboard.map(n => n.type === "Single" ? n.lane : 0)))
          });
        } else if (note.type === "Slide") {
          newNotes.push({
            ...note,
            connections: note.connections.map(conn => ({
              ...conn,
              beat: beat + (conn.beat - Math.min(...clipboard.map(n => n.type === "Single" ? n.beat : 0))),
              lane: lane + (conn.lane - Math.min(...clipboard.map(n => n.type === "Single" ? n.lane : 0)))
            }))
          });
        }
      });
      handleNotesChange(newNotes);
    }
  };

  const deleteSelected = () => {
    if (selectedNotes.length > 0) {
      const newNotes = notes.filter((_, index) => !selectedNotes.includes(index));
      handleNotesChange(newNotes);
      setSelectedNotes([]);
    }
  };

  const mirrorSelected = () => {
    if (selectedNotes.length > 0) {
      const newNotes = [...notes];
      selectedNotes.forEach(index => {
        const note = newNotes[index];
        if (note && 'lane' in note) {
          note.lane = 4 - note.lane; // 镜像到对面轨道
        }
        if (note && note.type === "Slide") {
          note.connections.forEach(conn => {
            conn.lane = 4 - conn.lane;
          });
        }
      });
      handleNotesChange(newNotes);
    }
  };

  return (
    <div className="flex h-screen">
      {/* 左侧工具栏 */}
      <div className="w-64 bg-gray-100 border-r">
        <Toolbar 
          selectedTool={selectedTool} 
          setSelectedTool={setSelectedTool}
          beatDisplay={beatDisplay}
          setBeatDisplay={setBeatDisplay}
          onUndo={undo}
          onRedo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onCopy={copySelected}
          onCut={cutSelected}
          onPaste={() => {
            if (mousePosition) {
              pasteAtPosition(mousePosition.beat, mousePosition.lane);
            }
          }}
          onDelete={deleteSelected}
          onMirror={mirrorSelected}
          canCopy={selectedNotes.length > 0}
          canPaste={clipboard.length > 0}
          scale={scale}
          onZoomIn={() => setScale(scale * 1.2)}
          onZoomOut={() => setScale(scale / 1.2)}
        />
      </div>
      
      {/* 中间谱面画布区域 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <ChartCanvas 
            notes={notes} 
            setNotes={handleNotesChange} 
            selectedTool={selectedTool}
            selectedNotes={selectedNotes}
            setSelectedNotes={setSelectedNotes}
            beatDisplay={beatDisplay}
            onMousePositionChange={setMousePosition}
            scale={scale}
          />
        </div>
        {/* 状态栏 */}
        <StatusBar mousePosition={mousePosition} />
      </div>
      
      {/* 右侧音符信息面板 */}
      <div className="w-80 bg-gray-50 border-l">
        <NoteInfoPanel 
          selectedNotes={selectedNotes}
          notes={notes}
          onNotesChange={handleNotesChange}
        />
      </div>
    </div>
  );
}
