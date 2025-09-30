import { useState, useEffect } from "react";
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
  const [notes, setNotes] = useState<ChartNote[]>([
    { beat: 0, type: "BPM", bpm: 120 } // 默认BPM 120
  ]);
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [beatDisplay, setBeatDisplay] = useState(4); // 默认1/4拍显示
  const [mousePosition, setMousePosition] = useState<{ lane: number; beat: number } | null>(null);
  const [history, setHistory] = useState<ChartNote[][]>([
    [{ beat: 0, type: "BPM", bpm: 120 }] // 初始历史记录
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState<ChartNote[]>([]);
  const [scale, setScale] = useState(1);
  const [isCombinationMode, setIsCombinationMode] = useState(false);

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

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            e.preventDefault();
            copySelected();
            break;
          case 'x':
            e.preventDefault();
            cutSelected();
            break;
          case 'v':
            e.preventDefault();
            if (mousePosition) {
              pasteAtPosition(mousePosition.beat, mousePosition.lane);
            }
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      } else if (e.key === 'Delete') {
        e.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotes, mousePosition, clipboard, historyIndex, history.length]);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex' }}>
      {/* 左侧独立工具栏子窗口 - 固定定位 */}
      <div style={{ 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        height: '100%', 
        width: '256px', 
        backgroundColor: 'white', 
        borderRight: '2px solid #d1d5db', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
        zIndex: 10 
      }}>
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
          isCombinationMode={isCombinationMode}
          setCombinationMode={setIsCombinationMode}
        />
      </div>
      
      {/* 主内容区域 - 为工具栏留出空间 */}
      <div style={{ flex: 1, marginLeft: '256px', display: 'flex' }}>
        {/* 中间谱面画布区域 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ChartCanvas 
            notes={notes} 
            setNotes={handleNotesChange} 
            selectedTool={selectedTool}
            selectedNotes={selectedNotes}
            setSelectedNotes={setSelectedNotes}
            beatDisplay={beatDisplay}
            onMousePositionChange={setMousePosition}
            scale={scale}
            isCombinationMode={isCombinationMode}
          />
        </div>
        
        {/* 右侧音符信息面板 */}
        <div style={{ width: '320px', backgroundColor: '#f9fafb', borderLeft: '1px solid #e5e7eb', flexShrink: 0 }}>
          <NoteInfoPanel 
            selectedNotes={selectedNotes}
            notes={notes}
            onNotesChange={handleNotesChange}
          />
        </div>
      </div>

      {/* 状态栏 - 使用fixed定位，完全独立于主布局 */}
      <StatusBar mousePosition={mousePosition} selectedNotes={selectedNotes} notes={notes} />
    </div>
  );
}