import { useState, useEffect } from "react";
import Toolbar from "../components/Toolbar";
import ChartCanvas from "../components/ChartCanvas";
import NoteInfoPanel from "../components/NoteInfoPanel";
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
  
  // 区域宽度状态 - 按照1:1.3:0.75的比例分配
  const [leftPanelWidth, setLeftPanelWidth] = useState(470);  // 左侧面板：1/3.05 ≈ 32.8%
  const [rightPanelWidth, setRightPanelWidth] = useState(300); // 右侧面板：0.75/3.05 ≈ 24.6%
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null);

  // 拖拽处理函数
  const handleMouseDown = (e: React.MouseEvent, type: 'left' | 'right') => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const containerWidth = window.innerWidth;
    const newLeftWidth = isDragging === 'left' ? e.clientX : leftPanelWidth;
    const newRightWidth = isDragging === 'right' ? containerWidth - e.clientX : rightPanelWidth;
    
    // 设置最小和最大宽度限制 - 适应新的比例
    const minWidth = 200;
    const maxWidth = containerWidth * 0.5; // 减少最大宽度，确保中间画布有足够空间
    
    if (isDragging === 'left') {
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newLeftWidth));
      setLeftPanelWidth(clampedWidth);
    } else if (isDragging === 'right') {
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newRightWidth));
      setRightPanelWidth(clampedWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, leftPanelWidth, rightPanelWidth]);

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
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f3f4f6',
      margin: 0,
      padding: 0
    }}>
      {/* 主工作区域 */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        height: 'calc(100vh - 32px)'
      }}>
        {/* 左侧工具栏区域 */}
        <div style={{
          width: `${leftPanelWidth}px`,
          backgroundColor: 'white',
          borderRight: '1px solid #d1d5db',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          minWidth: `${leftPanelWidth}px` // 确保最小宽度
        }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
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
        </div>

        {/* 左侧分隔条 */}
        <div
          style={{
            width: '4px',
            backgroundColor: isDragging === 'left' ? '#3b82f6' : '#e5e7eb',
            cursor: 'col-resize',
            flexShrink: 0,
            transition: 'background-color 0.2s'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'left')}
        />

        {/* 中间谱面画布区域 */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f9fafb',
          minWidth: 0,
          marginRight: '4px' // 为右侧面板留出空间，避免遮挡
        }}>
          <div style={{
            height: '32px',
            backgroundColor: '#e5e7eb',
            color: '#374151',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            borderBottom: '1px solid #d1d5db',
            flexShrink: 0,
            width: 'calc(100% - 4px)', // 减少宽度，避免延伸到右侧面板
            position: 'relative',
            overflow: 'visible'
          }}>
            <span style={{ 
              flexShrink: 0,
              minWidth: '60px'
            }}>谱面画布</span>
            <div style={{ 
              position: 'absolute',
              right: '20px', // 只移动一点点距离
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              whiteSpace: 'nowrap',
              backgroundColor: '#e5e7eb',
              padding: '0 4px'
            }}>
              <span style={{ fontSize: '12px' }}>节拍: 1/{beatDisplay}</span>
              <div style={{ width: '1px', height: '16px', backgroundColor: '#9ca3af' }}></div>
              <span style={{ 
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}>
                工具: {selectedTool === 'mouse' ? '选择' : selectedTool === 'single' ? '单键' : selectedTool === 'flick' ? '滑键' : selectedTool === 'slide' ? '滑条' : 'BPM'}
              </span>
            </div>
          </div>
          <div style={{ 
            flex: 1, 
            overflow: 'auto', 
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '20px'
          }}>
            <div style={{ 
              width: '100%', 
              maxWidth: '1200px',
              display: 'flex',
              justifyContent: 'center'
            }}>
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
          </div>
        </div>

        {/* 右侧分隔条 */}
        <div
          style={{
            width: '4px',
            backgroundColor: isDragging === 'right' ? '#3b82f6' : '#e5e7eb',
            cursor: 'col-resize',
            flexShrink: 0,
            transition: 'background-color 0.2s'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'right')}
        />

        {/* 右侧信息面板区域 */}
        <div style={{
          width: `${rightPanelWidth}px`,
          backgroundColor: 'white',
          borderLeft: '1px solid #d1d5db',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          minWidth: `${rightPanelWidth}px` // 确保最小宽度
        }}>
          <div style={{
            height: '32px',
            backgroundColor: '#e5e7eb',
            color: '#374151',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            borderBottom: '1px solid #d1d5db',
            flexShrink: 0
          }}>
            <span>音符信息</span>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: '12px' }}>选中: {selectedNotes.length}</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <NoteInfoPanel 
              selectedNotes={selectedNotes}
              notes={notes}
              onNotesChange={handleNotesChange}
            />
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div style={{
        height: '32px',
        backgroundColor: '#1f2937',
        color: 'white',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderTop: '1px solid #4b5563',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: mousePosition ? '#22c55e' : '#6b7280'
            }}></div>
            <span>
              {mousePosition ? `坐标: (轨道${mousePosition.lane}, 节拍${Math.floor(mousePosition.beat)})` : '鼠标悬停查看坐标'}
            </span>
          </div>
          <div style={{ width: '1px', height: '16px', backgroundColor: '#4b5563' }}></div>
          <div>
            历史记录: {historyIndex + 1}/{history.length}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ color: '#9ca3af' }}>音符数: {notes.filter(n => n.type !== "BPM").length}</div>
        </div>
      </div>
    </div>
  );
}