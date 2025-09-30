import { useState, useRef } from "react";
import type { ChartNote } from "../notes/Charts";

interface ChartCanvasProps {
  notes: ChartNote[];
  setNotes: (notes: ChartNote[]) => void;
  selectedTool: string;
  selectedNotes: number[];
  setSelectedNotes: (notes: number[]) => void;
  beatDisplay: number;
  onMousePositionChange: (position: { lane: number; beat: number } | null) => void;
  scale: number;
  isCombinationMode: boolean;
}

const LANES = 5;   // 五条轨道
const BEATS = 64;  // 显示 64 小节，可以改
const BEAT_HEIGHT = 40; // 每个节拍的高度
const LANE_WIDTH = 100; // 每个轨道的宽度

export default function ChartCanvas({
  notes,
  setNotes,
  selectedTool,
  selectedNotes,
  setSelectedNotes,
  beatDisplay,
  onMousePositionChange,
  scale,
  isCombinationMode
}: ChartCanvasProps) {
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [slideBuffer, setSlideBuffer] = useState<{ beat: number; lane: number; subBeat?: number }[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const canvasRef = useRef<SVGSVGElement>(null);

  // 计算当前BPM和缩放比例
  const getBpmAtBeat = (beat: number) => {
    let currentBpm = 120; // 默认BPM
    let lastBpmBeat = 0;

    // 找到当前节拍之前最近的BPM标记
    for (const note of notes) {
      if (note.type === "BPM" && note.beat <= beat) {
        if (note.beat > lastBpmBeat) {
          currentBpm = note.bpm;
          lastBpmBeat = note.beat;
        }
      }
    }

    return { bpm: currentBpm, startBeat: lastBpmBeat };
  };

  const getBeatHeight = (beat: number) => {
    const { bpm } = getBpmAtBeat(beat);
    // BPM越高，节拍高度越小（时间压缩）
    return (BEAT_HEIGHT * 120) / bpm;
  };

  // 计算音符的Y位置
  const getNoteY = (beat: number, subBeat: number = 0) => {
    let y = 0;
    const integerBeat = Math.floor(beat);
    const fractionalBeat = beat - integerBeat;

    // 计算整数beat的Y位置
    for (let b = 0; b < integerBeat; b++) {
      y += getBeatHeight(b) * scale;
    }

    // 加上小数beat的Y位置
    if (fractionalBeat > 0) {
      const currentBeatHeight = getBeatHeight(integerBeat) * scale;
      y += fractionalBeat * currentBeatHeight;
    }

    // 加上subBeat的Y位置
    if (subBeat > 0) {
      const currentBeatHeight = getBeatHeight(integerBeat) * scale;
      y += (subBeat * currentBeatHeight) / beatDisplay;
    }

    return y;
  };

  const handleClick = (beat: number, lane: number, subBeat: number = 0) => {
    if (selectedTool === "mouse") {
      // 鼠标状态下点击音符进行选择
      const noteIndex = notes.findIndex(note =>
        note.type === "Single" && note.beat === beat && note.lane === lane && note.subBeat === subBeat
      );
      if (noteIndex !== -1) {
        if (isCombinationMode) {
          // 组合状态下支持多选
          if (selectedNotes.includes(noteIndex)) {
            setSelectedNotes(selectedNotes.filter(i => i !== noteIndex));
          } else {
            setSelectedNotes([...selectedNotes, noteIndex]);
          }
        } else {
          // 普通状态下单选
          setSelectedNotes([noteIndex]);
        }
      } else if (!isCombinationMode) {
        // 点击空白区域时取消选择
        setSelectedNotes([]);
      }
      return;
    }

    // 直接使用传入的精确beat值，不再重复计算
    const preciseBeat = beat;
    // subBeat应该为0，因为beat已经包含了精确位置信息
    const preciseSubBeat = 0;

    if (selectedTool === "single") {
      setNotes([...notes, { beat: preciseBeat, lane, subBeat: preciseSubBeat, type: "Single" }]);
    } else if (selectedTool === "flick") {
      setNotes([...notes, { beat: preciseBeat, lane, subBeat: preciseSubBeat, type: "Single", flick: true }]);
    } else if (selectedTool === "bpm") {
      const bpm = parseInt(prompt("请输入 BPM 数值") || "0", 10);
      if (!isNaN(bpm) && bpm > 0) {
        // 限制beat精度为16位小数
        const finalBeat = Math.round(preciseBeat * 10000000000000000) / 10000000000000000;

        // 检查是否已存在相同beat的BPM，如果存在则覆盖
        const existingBpmIndex = notes.findIndex(note =>
          note.type === "BPM" && Math.abs(note.beat - finalBeat) < 0.0000000000000001
        );
        if (existingBpmIndex !== -1) {
          // 覆盖现有BPM
          const newNotes = [...notes];
          newNotes[existingBpmIndex] = { beat: finalBeat, type: "BPM", bpm };
          setNotes(newNotes);
        } else {
          // 添加新BPM
          setNotes([...notes, { beat: finalBeat, type: "BPM", bpm }]);
        }
      }
    } else if (selectedTool === "slide") {
      const newBuffer = [...slideBuffer, { beat: preciseBeat, lane, subBeat: preciseSubBeat }];
      if (newBuffer.length === 2) {
        // 检查滑条是否横向放置
        const [p1, p2] = newBuffer;
        if (p1.beat === p2.beat && p1.subBeat === p2.subBeat) {
          alert("滑条音符不允许横向放置！");
          setSlideBuffer([]);
          return;
        }
        setNotes([...notes, { type: "Slide", connections: newBuffer }]);
        setSlideBuffer([]);
      } else {
        setSlideBuffer(newBuffer);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool === "mouse" && e.ctrlKey) {
      // Ctrl+鼠标拖拽进行区域选择
      setIsSelecting(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setSelectionBox({
          x1: e.clientX - rect.left,
          y1: e.clientY - rect.top,
          x2: e.clientX - rect.left,
          y2: e.clientY - rect.top
        });
      }
    } else if (selectedTool === "mouse" && e.shiftKey) {
      // Shift+鼠标拖拽进行画布滚动
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    // 其他情况下不允许拖拽画布
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 计算鼠标位置对应的轨道和节拍
      const lane = Math.floor(x / (LANE_WIDTH * scale));

      // 计算精确的beat位置（支持小数）
      const relativeY = y - offsetY;
      const beatHeight = BEAT_HEIGHT * scale;
      const beat = relativeY / beatHeight;

      if (lane >= 0 && lane < LANES && beat >= 0) {
        // 限制小数位数为16位
        const preciseBeat = Math.round(beat * 10000000000000000) / 10000000000000000;
        onMousePositionChange({ lane, beat: preciseBeat });
      } else {
        onMousePositionChange(null);
      }
    }

    if (isSelecting && selectionBox) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setSelectionBox({
          ...selectionBox,
          x2: e.clientX - rect.left,
          y2: e.clientY - rect.top
        });
      }
    } else if (dragging && dragStart && selectedTool === "mouse" && e.shiftKey) {
      // 只有在Shift+鼠标拖拽时才移动画布
      setOffsetY(offsetY + (e.clientY - dragStart.y));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionBox) {
      // 完成区域选择
      const minX = Math.min(selectionBox.x1, selectionBox.x2);
      const maxX = Math.max(selectionBox.x1, selectionBox.x2);
      const minY = Math.min(selectionBox.y1, selectionBox.y2);
      const maxY = Math.max(selectionBox.y1, selectionBox.y2);

      const selectedIndices: number[] = [];
      notes.forEach((note, index) => {
        if (note.type === "Single") {
          const noteX = note.lane * LANE_WIDTH * scale + LANE_WIDTH * scale / 2; // 音符中心X位置
          const noteY = getNoteY(note.beat, note.subBeat || 0); // 使用正确的Y位置计算

          if (noteX >= minX && noteX <= maxX && noteY >= minY && noteY <= maxY) {
            selectedIndices.push(index);
          }
        } else if (note.type === "Slide") {
          // 检查滑条的两个端点是否在选择区域内
          const [p1, p2] = note.connections;
          const x1 = p1.lane * LANE_WIDTH * scale + LANE_WIDTH * scale / 2;
          const y1 = getNoteY(p1.beat, p1.subBeat || 0);
          const x2 = p2.lane * LANE_WIDTH * scale + LANE_WIDTH * scale / 2;
          const y2 = getNoteY(p2.beat, p2.subBeat || 0);

          // 如果滑条的任一端点在选择区域内，则选中整个滑条
          if ((x1 >= minX && x1 <= maxX && y1 >= minY && y1 <= maxY) ||
            (x2 >= minX && x2 <= maxX && y2 >= minY && y2 <= maxY)) {
            selectedIndices.push(index);
          }
        }
      });

      setSelectedNotes(selectedIndices);
      setIsSelecting(false);
      setSelectionBox(null);
    } else {
      setDragging(false);
    }
  };

  // 绘制网格线
  const renderGrid = () => {
    const lines = [];
    let currentY = 0;

    // 绘制水平线（节拍线）
    for (let beat = 0; beat < BEATS; beat++) {
      const beatHeight = getBeatHeight(beat) * scale;
      const isMainBeat = beat % 4 === 0;

      lines.push(
        <line
          key={`beat-${beat}`}
          x1={0}
          y1={currentY}
          x2={LANES * LANE_WIDTH * scale}
          y2={currentY}
          stroke={isMainBeat ? "#888" : "#ccc"}
          strokeWidth={isMainBeat ? 2 : 1}
        />
      );

      // 绘制子节拍线
      for (let subBeat = 1; subBeat < beatDisplay; subBeat++) {
        const subY = currentY + (subBeat * beatHeight) / beatDisplay;
        lines.push(
          <line
            key={`subbeat-${beat}-${subBeat}`}
            x1={0}
            y1={subY}
            x2={LANES * LANE_WIDTH * scale}
            y2={subY}
            stroke="#ddd"
            strokeWidth={0.5}
            strokeDasharray="2,2"
          />
        );
      }

      currentY += beatHeight;
    }

    // 绘制垂直线（轨道线）
    for (let lane = 0; lane <= LANES; lane++) {
      const x = lane * LANE_WIDTH * scale;
      lines.push(
        <line
          key={`lane-${lane}`}
          x1={x}
          y1={0}
          x2={x}
          y2={currentY}
          stroke="#aaa"
        />
      );
    }

    return lines;
  };

  return (
    <div className="w-full h-full overflow-auto">
      <div className="flex flex-col items-center p-4 min-h-full">
        {/* 网格画布 */}
        <svg
          ref={canvasRef}
          className="border bg-white"
          width={LANES * LANE_WIDTH * scale}
          height={BEATS * BEAT_HEIGHT * scale}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            cursor: dragging ? "grabbing" : (isSelecting ? "crosshair" : "default"),
            transform: `translateY(${offsetY}px)`
          }}
        >
          {/* 绘制网格 */}
          {renderGrid()}

          {/* 音符 */}
          {notes.map((note, idx) => {
            const isSelected = selectedNotes.includes(idx);

            if (note.type === "Single") {
              const subBeat = note.subBeat || 0;
              const y = getNoteY(note.beat, subBeat);
              const x = note.lane * LANE_WIDTH * scale + LANE_WIDTH * scale / 2;

              return (
                <g key={idx}>
                  {/* 加粗线段表示音符 */}
                  <line
                    x1={x - 20 * scale}
                    y1={y}
                    x2={x + 20 * scale}
                    y2={y}
                    stroke={note.flick ? "red" : "blue"}
                    strokeWidth={8 * scale}
                    strokeLinecap="round"
                    onClick={() => handleClick(note.beat, note.lane, subBeat)}
                  />
                  {/* 选中状态的高亮 */}
                  {isSelected && (
                    <line
                      x1={x - 25 * scale}
                      y1={y}
                      x2={x + 25 * scale}
                      y2={y}
                      stroke="yellow"
                      strokeWidth={12 * scale}
                      strokeLinecap="round"
                      opacity={0.7}
                    />
                  )}
                  {/* 滑键标记 */}
                  {note.flick && (
                    <text
                      x={x}
                      y={y - 15 * scale}
                      fontSize={10 * scale}
                      fill="red"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontWeight="bold"
                    >
                      F
                    </text>
                  )}
                </g>
              );
            } else if (note.type === "BPM") {
              const y = getNoteY(note.beat);
              return (
                <g key={idx}>
                  <line
                    x1={0}
                    y1={y}
                    x2={LANES * LANE_WIDTH * scale}
                    y2={y}
                    stroke="red"
                    strokeWidth={3}
                    strokeDasharray="5,5"
                  />
                  <text
                    x={10}
                    y={y + 15}
                    fontSize={14 * scale}
                    fill="red"
                    fontWeight="bold"
                  >
                    BPM {note.bpm}
                  </text>
                </g>
              );
            } else if (note.type === "Slide") {
              const [p1, p2] = note.connections;
              const subBeat1 = p1.subBeat || 0;
              const subBeat2 = p2.subBeat || 0;
              const y1 = getNoteY(p1.beat, subBeat1);
              const y2 = getNoteY(p2.beat, subBeat2);
              const x1 = p1.lane * LANE_WIDTH * scale + LANE_WIDTH * scale / 2;
              const x2 = p2.lane * LANE_WIDTH * scale + LANE_WIDTH * scale / 2;

              return (
                <g key={idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="purple"
                    strokeWidth={6 * scale}
                    strokeLinecap="round"
                  />
                  {/* 滑条端点 */}
                  <circle
                    cx={x1}
                    cy={y1}
                    r={8 * scale}
                    fill="purple"
                  />
                  <circle
                    cx={x2}
                    cy={y2}
                    r={8 * scale}
                    fill="purple"
                  />
                </g>
              );
            }
            return null;
          })}

          {/* 滑条缓冲区显示 */}
          {slideBuffer.map((point, idx) => {
            const subBeat = point.subBeat || 0;
            const y = getNoteY(point.beat, subBeat);
            const x = point.lane * LANE_WIDTH * scale + LANE_WIDTH * scale / 2;

            return (
              <circle
                key={`buffer-${idx}`}
                cx={x}
                cy={y}
                r={10 * scale}
                fill="orange"
                fillOpacity={0.7}
              />
            );
          })}

          {/* 选择框 */}
          {selectionBox && (
            <rect
              x={Math.min(selectionBox.x1, selectionBox.x2)}
              y={Math.min(selectionBox.y1, selectionBox.y2)}
              width={Math.abs(selectionBox.x2 - selectionBox.x1)}
              height={Math.abs(selectionBox.y2 - selectionBox.y1)}
              fill="rgba(0, 123, 255, 0.2)"
              stroke="rgba(0, 123, 255, 0.8)"
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          )}

          {/* 点击放置层 - 支持精确beat位置 */}
          {Array.from({ length: LANES }).map((_, lane) => {
            const laneX = lane * LANE_WIDTH * scale;
            return (
              <rect
                key={`lane-${lane}`}
                x={laneX}
                y={0}
                width={LANE_WIDTH * scale}
                height={BEATS * BEAT_HEIGHT * scale}
                fill="transparent"
                onClick={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    const y = e.clientY - rect.top;
                    const relativeY = y - offsetY;

                    // 使用与getNoteY完全对应的反向计算
                    let beat = 0;
                    let currentY = 0;

                    // 遍历所有beat，找到鼠标位置对应的精确beat
                    for (let b = 0; b < BEATS; b++) {
                      const beatHeight = getBeatHeight(b) * scale;
                      if (relativeY >= currentY && relativeY < currentY + beatHeight) {
                        // 在当前beat内，计算精确位置
                        const beatProgress = (relativeY - currentY) / beatHeight;
                        beat = b + beatProgress;
                        break;
                      }
                      currentY += beatHeight;
                    }

                    // 如果鼠标位置超出了所有beat范围，使用最后一个beat
                    if (beat === 0 && relativeY >= currentY) {
                      beat = BEATS - 1 + 0.999;
                    }

                    console.log('Mouse Y:', relativeY, 'Calculated beat:', beat);
                    console.log('BEAT_HEIGHT:', BEAT_HEIGHT, 'scale:', scale);
                    console.log('getBeatHeight(0):', getBeatHeight(0));

                    // 验证计算是否正确
                    const testY = getNoteY(beat);
                    console.log('Test Y for beat', beat, ':', testY);

                    // 计算精确的beat位置（基于当前节拍显示）
                    // 找到最近的子节拍位置
                    const subBeatPosition = beat * beatDisplay;
                    const nearestSubBeat = Math.round(subBeatPosition);
                    const preciseBeat = nearestSubBeat / beatDisplay;
                    console.log('SubBeat position:', subBeatPosition, 'Nearest subBeat:', nearestSubBeat, 'Precise beat:', preciseBeat);
                    handleClick(preciseBeat, lane);
                  }
                }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
