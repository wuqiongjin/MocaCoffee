import { useState, useRef, useEffect } from "react";
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

const LANES = 7;   // 七条轨道
const BEATS = 64;  // 显示 64 小节，(后续根据音频长度自动计算)
const BEAT_HEIGHT = 120; // 每个节拍的高度（基准，当 bpm=120 时为 BEAT_HEIGHT）
const LANE_WIDTH = 40; // 每个轨道的宽度

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

  // ---------------------------
  // Helper: 获取按时间升序的 BPM 事件数组
  // 每个元素: { beat: number, bpm: number }
  // 保证至少包含 beat=0 的默认事件（如果用户没有设置）
  // ---------------------------
  const getSortedBpmEvents = () => {
    const bpmEvents: { beat: number; bpm: number }[] = [];
    for (const note of notes) {
      if (note.type === "BPM") {
        // Type assertion: note has BPM and beat fields
        bpmEvents.push({ beat: note.beat, bpm: (note as any).bpm });
      }
    }
    // sort ascending by beat
    bpmEvents.sort((a, b) => a.beat - b.beat);

    // 如果第一个事件不是在 beat 0，则插入默认初始 BPM（120）
    if (bpmEvents.length === 0 || bpmEvents[0].beat > 0) {
      bpmEvents.unshift({ beat: 0, bpm: 120 });
    } else {
      // 如果存在 beat 0 的事件，确保它是第一个（sort 已确保），否则也保留
    }

    return bpmEvents;
  };

  // ---------------------------
  // 将任意 beat（可以是小数）转换为从 beat 0 到该 beat 的累计像素高度（向上累加）
  // 依据每个 BPM 段：每一段的每个 beat 的像素高度 = BEAT_HEIGHT * (120 / bpm)
  // 最后乘以 scale。
  // ---------------------------
  const beatToOffset = (beat: number) => {
    const bpmEvents = getSortedBpmEvents();
    let offset = 0;
    for (let i = 0; i < bpmEvents.length; i++) {
      const cur = bpmEvents[i];
      const next = bpmEvents[i + 1];
      const segmentStart = cur.beat;
      const segmentEnd = next ? next.beat : Infinity;

      if (beat <= segmentStart) {
        // 目标beat位于此事件之前，结束
        break;
      }

      const segFrom = segmentStart;
      const segTo = Math.min(segmentEnd, beat);
      if (segTo > segFrom) {
        const lengthInBeats = segTo - segFrom;
        const perBeatHeight = (BEAT_HEIGHT * 120) / cur.bpm;
        offset += lengthInBeats * perBeatHeight * scale;
      }

      if (segmentEnd >= beat) {
        // 已覆盖到目标 beat，结束
        break;
      }
    }
    return offset;
  };

  // ---------------------------
  // 将从0开始的累计偏移（像素）反解为精确 beat（用于鼠标拾取）
  // 这里 totalHeight 是 beatToOffset(BEATS)
  // offset 为从 0 到目标 beat 的像素长度
  // ---------------------------
  const offsetToBeat = (offset: number) => {
    const bpmEvents = getSortedBpmEvents();
    let remaining = offset;
    for (let i = 0; i < bpmEvents.length; i++) {
      const cur = bpmEvents[i];
      const next = bpmEvents[i + 1];
      const segStart = cur.beat;
      const segEnd = next ? next.beat : Infinity;
      const segLenBeats = segEnd - segStart;
      const perBeatHeight = (BEAT_HEIGHT * 120) / cur.bpm * scale;

      // if segEnd is Infinity, treat large number but we will hit remaining earlier
      if (!isFinite(segEnd)) {
        // remaining is within this infinite last segment
        const beatOffset = remaining / perBeatHeight;
        return segStart + beatOffset;
      }

      const segHeight = segLenBeats * perBeatHeight;
      if (remaining <= segHeight) {
        // inside this segment
        const beatOffset = remaining / perBeatHeight;
        return segStart + beatOffset;
      } else {
        remaining -= segHeight;
      }
    }

    // 如果超出所有段，返回 BEATS（或更大），但限制为 BEATS
    return BEATS;
  };

  // ---------------------------
  // 兼容旧函数：获取某个beat处的BPM及该BPM开始的beat
  // ---------------------------
  const getBpmAtBeat = (beat: number) => {
    const bpmEvents = getSortedBpmEvents();
    // 找到最后一个 beat <= 参数 beat
    let chosen = bpmEvents[0];
    for (const ev of bpmEvents) {
      if (ev.beat <= beat) {
        chosen = ev;
      } else {
        break;
      }
    }
    return { bpm: chosen.bpm, startBeat: chosen.beat };
  };

  // ---------------------------
  // 旧的 getBeatHeight(beat) 被替换为：返回该 beat（精确）处的 **单位 beat 的像素高度**
  // 即该 beat 所在段的 per-beat-height（不包括 scale 因为已经乘过）
  // 但是我们在大部分地方不再单独调用它计算累计高度，而是使用 beatToOffset
  // ---------------------------
  const getBeatHeight = (beat: number) => {
    const { bpm } = getBpmAtBeat(beat);
    return (BEAT_HEIGHT * 120) / bpm;
  };

  // ---------------------------
  // 计算音符的Y位置 - 自下往上布局
  // 使用 beatToOffset 获得从 0 到该 beat 的累计高度，再反转到 SVG 坐标
  // ---------------------------
  const getNoteY = (beat: number, subBeat: number = 0) => {
    // 如果有 subBeat（0..beatDisplay-1），我们精确计算 offset 到 beat + subBeat/beatDisplay
    const preciseBeat = beat + (subBeat > 0 ? subBeat / beatDisplay : 0);
    const offsetFromZero = beatToOffset(preciseBeat);

    const totalOffset = beatToOffset(BEATS); // 总高度
    const finalY = totalOffset - offsetFromZero;
    return finalY;
  };

  // ---------------------------
  // 初始滚动位置（显示 4.5 个 beat）
  // 这里 totalHeight 需要用 beatToOffset(BEATS)
  // ---------------------------
  useEffect(() => {
    const scrollToInitialPosition = () => {
      let scrollContainer = canvasRef.current?.parentElement;

      while (scrollContainer && scrollContainer !== document.body) {
        const computedStyle = window.getComputedStyle(scrollContainer);
        if (computedStyle.overflow === 'auto' || computedStyle.overflowY === 'auto') {
          break;
        }
        scrollContainer = scrollContainer.parentElement;
      }
      if (scrollContainer) {
        const beatsToShow = 4.5; // 显示4.5个beat
        // 计算 0..beatsToShow 的累计高度
        const totalBeatHeight = beatToOffset(beatsToShow);

        // 总高度使用 BEATS
        const totalHeight = beatToOffset(BEATS);
        const scrollPosition = totalHeight - totalBeatHeight;
        scrollContainer.scrollTop = Math.max(0, scrollPosition);
      }
    };

    // 2次延迟尝试，确保DOM完全渲染
    const rafId = requestAnimationFrame(() => { scrollToInitialPosition(); });
    const timeoutId = setTimeout(scrollToInitialPosition, 100);
    const timeoutId2 = setTimeout(scrollToInitialPosition, 500);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
    // 监听 notes 的变化（比如 BPM 改变）和 scale
  }, [scale, notes]);

  const handleClick = (beat: number, lane: number, subBeat: number = 0) => {
    if (selectedTool === "mouse") {
      // 鼠标状态下点击音符进行选择
      const noteIndex = notes.findIndex(note =>
        note.type === "Single" && note.beat === beat && note.lane === lane && note.subBeat === subBeat
      );
      if (noteIndex !== -1) {
        if (isCombinationMode) {
          // 组合模式下，如果音符已选中，则取消选中；否则选中
          if (selectedNotes.includes(noteIndex)) {
            setSelectedNotes(selectedNotes.filter(i => i !== noteIndex));
          } else {
            // 否则选中该音符
            setSelectedNotes([...selectedNotes, noteIndex]);
          }
        } else {
          // 非组合模式下，直接选中该音符
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

        // 查找几乎相等的 BPM（考虑浮点） -> 检查是否已存在相同beat的BPM，如果存在则覆盖
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

      // 反向计算：从鼠标位置计算 beat
      const relativeY = y - offsetY;
      const totalHeight = beatToOffset(BEATS);
      const reversedYFromTop = totalHeight - relativeY; // 这是 offsetFromZero（像素）
      let beat = 0;

      if (reversedYFromTop <= 0) {
        beat = 0;
      } else if (reversedYFromTop >= totalHeight) {
        beat = BEATS;
      } else {
        beat = offsetToBeat(reversedYFromTop);
      }

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
          const noteY = getNoteY(note.beat, note.subBeat || 0); // 音符中心Y位置

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

  // ---------------------------
  // 渲染网格和音符逻辑（renderGrid 改为使用 beatToOffset）
  // ---------------------------
  const renderGrid = () => {
    const lines = [];
    const totalHeight = beatToOffset(BEATS);
    // 绘制水平线（节拍线）- 自下往上绘制
    for (let beat = 0; beat < BEATS; beat++) {
      const y = totalHeight - beatToOffset(beat); // beat 的顶部
      lines.push(
        <line
          key={`beat-${beat}`}
          x1={0}
          y1={y}
          x2={LANES * LANE_WIDTH * scale}
          y2={y}
          stroke="#ccc"
          strokeWidth={1}
        />
      );

      // 绘制子节拍线：对于每个 subBeat 位置直接计算对应的 absolute offset
      for (let subBeat = 1; subBeat < beatDisplay; subBeat++) {
        const preciseBeat = beat + subBeat / beatDisplay;
        const subY = totalHeight - beatToOffset(preciseBeat);
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
          y2={totalHeight}
          stroke="#aaa"
        />
      );
    }

    return lines;
  };

  // 重要：共享的总高度与宽度（用于左侧定位与SVG高度一致）
  const totalHeight = beatToOffset(BEATS);
  const svgWidth = LANES * LANE_WIDTH * scale;

  // 收集所有BPM标记用于在画布外部显示
  const bpmMarks = notes.filter(note => note.type === "BPM");

  return (
    <div className="w-full h-full overflow-auto">
      {/* 用一个统一的内边距容器（可保留或去掉 padding，根据你的UI需求）
          关键：下面的 innerWrapper 会应用 translateY(offsetY)，使 BPM 列和 SVG 同步移动 */}
      <div className="p-4">
        <div
          // 这个 wrapper 包含左侧 BPM 列和 SVG 画布，translateY 只应用到这里
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            transform: `translateY(${offsetY}px)`,
            minHeight: totalHeight
          }}
        >
          {/* 左侧 BPM 数字列（在画布外部） */}
          <div
            style={{
              width: 80,
              flexShrink: 0,
              position: 'relative',
              // pointerEvents: 'none' 确保不会拦截鼠标事件（比如放置音符）
              pointerEvents: 'none',
              height: totalHeight
            }}
          >
            {/* 内层 relative 容器用于让每个 BPM 数字用 absolute top: ypx 定位 */}
            <div style={{ position: 'relative', height: totalHeight }}>
              {bpmMarks.map((note, idx) => {
                const rawY = getNoteY(note.beat);
                // 保证在容器范围内（防止越界）
                const y = Math.max(0, Math.min(totalHeight, rawY));
                return (
                  <div
                    key={`bpm-left-${idx}`}
                    style={{
                      position: 'absolute',
                      left: 10,                 // 保证在画布外（横坐标不在画布内）
                      top: `${y}px`,
                      transform: 'translateY(-50%)',
                      fontWeight: 700,
                      fontSize: 12,
                      color: '#c00',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    BPM {(note as any).bpm}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 画布区域 */}
          <div style={{ position: 'relative' }}>
            <svg
              ref={canvasRef}
              className="border bg-white"
              width={svgWidth}
              height={totalHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{
                cursor: dragging ? "grabbing" : (isSelecting ? "crosshair" : "default"),
                display: 'block' // 避免 inline svg 造成 baseline 问题
              }}
            >
              {/* 网格 */}
              {renderGrid()}

              {/* 音符 & BPM 线（注意：BPM 线保留，但不在 SVG 内画数字） */}
              {notes.map((note, idx) => {
                const isSelected = selectedNotes.includes(idx);

                if (note.type === "Single") {
                  const subBeat = note.subBeat || 0;
                  const y = getNoteY(note.beat, subBeat);
                  const x = note.lane * LANE_WIDTH * scale + LANE_WIDTH * scale / 2;

                  return (
                    <g key={idx}>
                      <line
                        x1={x - 15 * scale}
                        y1={y}
                        x2={x + 15 * scale}
                        y2={y}
                        stroke={note.flick ? "red" : "blue"}
                        strokeWidth={8 * scale}
                        strokeLinecap="round"
                        onClick={() => handleClick(note.beat, note.lane, subBeat)}
                      />
                      {isSelected && (
                        <line
                          x1={x - 18 * scale}
                          y1={y}
                          x2={x + 18 * scale}
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
                          y={y - 20 * scale}
                          fontSize={`${12 * scale}`}
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
                        x2={svgWidth}
                        y2={y}
                        stroke="red"
                        strokeWidth={3}
                        strokeDasharray="5,5"
                      />
                      {/* 注意：不在 SVG 内绘制 BPM 数字 */}
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
                      <circle cx={x1} cy={y1} r={6 * scale} fill="purple" />
                      <circle cx={x2} cy={y2} r={6 * scale} fill="purple" />
                    </g>
                  );
                }
                return null;
              })}

              {/* 滑条缓冲区显示: slideBuffer、selectionBox、点击放置层 */}
              {slideBuffer.map((point, idx) => {
                const subBeat = point.subBeat || 0;
                const y = getNoteY(point.beat, subBeat);
                const x = point.lane * LANE_WIDTH * scale + LANE_WIDTH * scale / 2;

                return (
                  <circle
                    key={`buffer-${idx}`}
                    cx={x}
                    cy={y}
                    r={8 * scale}
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
                    height={totalHeight}
                    fill="transparent"
                    onClick={(e) => {
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (rect) {
                        const y = e.clientY - rect.top;
                        const relativeY = y - offsetY;
                        const totalHeightInner = totalHeight;
                        const reversedY = totalHeightInner - relativeY;

                        // 使用 offsetToBeat 直接反向计算
                        let beat = 0;
                        if (reversedY <= 0) {
                          beat = 0;
                        } else if (reversedY >= totalHeightInner) {
                          beat = BEATS;
                        } else {
                          beat = offsetToBeat(reversedY);
                        }

                        // 保持行为兼容：向 nearest subBeat 对齐
                        const subBeatPosition = beat * beatDisplay;
                        const nearestSubBeat = Math.round(subBeatPosition);
                        const preciseBeat = nearestSubBeat / beatDisplay;
                        handleClick(preciseBeat, lane);
                      }
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}