import { useState } from "react";
import type { ChartNote } from "../notes/Charts";

interface ChartCanvasProps {
  notes: ChartNote[];
  setNotes: (notes: ChartNote[]) => void;
  selectedTool: string;
}

const LANES = 5;   // 五条轨道
const BEATS = 64;  // 显示 64 小节，可以改

export default function ChartCanvas({ notes, setNotes, selectedTool }: ChartCanvasProps) {
  const [scale, setScale] = useState(1);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [slideBuffer, setSlideBuffer] = useState<{ beat: number; lane: number }[]>([]);

  const handleClick = (beat: number, lane: number) => {
    if (selectedTool === "single") {
      setNotes([...notes, { beat, lane, type: "Single" }]);
    } else if (selectedTool === "flick") {
      setNotes([...notes, { beat, lane, type: "Single", flick: true }]);
    } else if (selectedTool === "bpm") {
      const bpm = parseInt(prompt("请输入 BPM 数值") || "0", 10);
      if (!isNaN(bpm) && bpm > 0) {
        setNotes([...notes, { beat, lane: 0, type: "BPM", bpm }]);
      }
    } else if (selectedTool === "slide") {
      const newBuffer = [...slideBuffer, { beat, lane }];
      if (newBuffer.length === 2) {
        setNotes([...notes, { type: "Slide", connections: newBuffer }]);
        setSlideBuffer([]);
      } else {
        setSlideBuffer(newBuffer);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && dragStart) {
      setOffsetY(offsetY + (e.clientY - dragStart.y));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div className="flex flex-col items-center">
      {/* 控制按钮 */}
      <div className="mb-2 flex gap-2">
        <button onClick={() => setScale(scale * 1.2)}>放大</button>
        <button onClick={() => setScale(scale / 1.2)}>缩小</button>
        <button onClick={() => setOffsetY(0)}>复位</button>
      </div>

      {/* 网格画布 */}
      <svg
        className="border bg-white"
        width={LANES * 100 * scale}
        height={BEATS * 40 * scale}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: dragging ? "grabbing" : "default", transform: `translateY(${offsetY}px)` }}
      >
        {/* 绘制网格 */}
        {Array.from({ length: BEATS }).map((_, beat) => (
          <g key={beat}>
            <line
              x1={0}
              y1={beat * 40 * scale}
              x2={LANES * 100 * scale}
              y2={beat * 40 * scale}
              stroke={beat % 4 === 0 ? "#888" : "#ccc"}
              strokeWidth={beat % 4 === 0 ? 2 : 1}
            />
          </g>
        ))}
        {Array.from({ length: LANES + 1 }).map((_, lane) => (
          <line
            key={lane}
            x1={lane * 100 * scale}
            y1={0}
            x2={lane * 100 * scale}
            y2={BEATS * 40 * scale}
            stroke="#aaa"
          />
        ))}

        {/* 音符 */}
        {notes.map((note, idx) => {
          if (note.type === "Single") {
            return (
              <rect
                key={idx}
                x={note.lane * 100 * scale + 20}
                y={note.beat * 40 * scale + 5}
                width={60 * scale}
                height={30 * scale}
                fill={note.flick ? "red" : "blue"}
                onClick={() => handleClick(note.beat, note.lane)}
              />
            );
          } else if (note.type === "BPM") {
            return (
              <g key={idx}>
                <line
                  x1={0}
                  y1={note.beat * 40 * scale + 20}
                  x2={LANES * 100 * scale}
                  y2={note.beat * 40 * scale + 20}
                  stroke="green"
                  strokeWidth={2}
                />
                <text
                  x={10}
                  y={note.beat * 40 * scale + 15}
                  fontSize={14 * scale}
                  fill="green"
                >
                  BPM {note.bpm}
                </text>
              </g>
            );
          } else if (note.type === "Slide") {
            const [p1, p2] = note.connections;
            return (
              <line
                key={idx}
                x1={p1.lane * 100 * scale + 50}
                y1={p1.beat * 40 * scale + 20}
                x2={p2.lane * 100 * scale + 50}
                y2={p2.beat * 40 * scale + 20}
                stroke="purple"
                strokeWidth={4}
              />
            );
          }
          return null;
        })}

        {/* 点击放置层 */}
        {Array.from({ length: BEATS }).map((_, beat) =>
          Array.from({ length: LANES }).map((_, lane) => (
            <rect
              key={`${beat}-${lane}`}
              x={lane * 100 * scale}
              y={beat * 40 * scale}
              width={100 * scale}
              height={40 * scale}
              fill="transparent"
              onClick={() => handleClick(beat, lane)}
            />
          ))
        )}
      </svg>
    </div>
  );
}
