import { useState } from "react";
import type { ChartNote } from "../notes/Charts";

interface NoteInfoPanelProps {
    selectedNotes: number[];
    notes: ChartNote[];
    onNotesChange: (notes: ChartNote[]) => void;
}

export default function NoteInfoPanel({ selectedNotes, notes, onNotesChange }: NoteInfoPanelProps) {
    const [isCombinationMode, setIsCombinationMode] = useState(false);

    const selectedNoteObjects = selectedNotes.map(index => notes[index]).filter(Boolean);

    const handleDeleteSelected = () => {
        if (selectedNotes.length === 0) return;

        const newNotes = notes.filter((_, index) => !selectedNotes.includes(index));
        onNotesChange(newNotes);
    };

    const handleMirrorSelected = () => {
        if (selectedNotes.length === 0) return;

        const newNotes = [...notes];
        selectedNotes.forEach(index => {
            const note = newNotes[index];
            if (note && 'lane' in note) {
                note.lane = 4 - note.lane; // 镜像到对面轨道
            }
        });
        onNotesChange(newNotes);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold mb-2">音符信息</h3>

                {/* 组合状态切换 */}
                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isCombinationMode}
                            onChange={(e) => setIsCombinationMode(e.target.checked)}
                            className="mr-2"
                        />
                        组合状态
                    </label>
                </div>

                {/* 选中音符数量 */}
                <div className="mb-4">
                    <span className="text-sm text-gray-600">
                        已选中 {selectedNotes.length} 个音符
                    </span>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2">
                    <button
                        onClick={handleDeleteSelected}
                        disabled={selectedNotes.length === 0}
                        className="w-full px-3 py-2 bg-red-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        删除选中
                    </button>
                    <button
                        onClick={handleMirrorSelected}
                        disabled={selectedNotes.length === 0}
                        className="w-full px-3 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        镜像选中
                    </button>
                </div>
            </div>

            {/* 选中音符详情 */}
            <div className="flex-1 overflow-auto p-4">
                {selectedNoteObjects.length > 0 ? (
                    <div className="space-y-3">
                        {selectedNoteObjects.map((note, index) => (
                            <div key={index} className="p-3 bg-white rounded border">
                                <div className="font-medium">
                                    {note.type === "Single" && "单键音符"}
                                    {note.type === "Slide" && "滑条音符"}
                                    {note.type === "BPM" && "BPM标记"}
                                </div>
                                {note.type === "Single" && (
                                    <div className="text-sm text-gray-600 mt-1">
                                        <div>轨道: {note.lane}</div>
                                        <div>节拍: {note.beat}</div>
                                        {note.flick && <div className="text-red-500">滑键</div>}
                                    </div>
                                )}
                                {note.type === "Slide" && (
                                    <div className="text-sm text-gray-600 mt-1">
                                        <div>连接点: {note.connections.length}</div>
                                        {note.connections.map((conn, i) => (
                                            <div key={i}>
                                                点{i + 1}: 轨道{conn.lane}, 节拍{conn.beat}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {note.type === "BPM" && (
                                    <div className="text-sm text-gray-600 mt-1">
                                        <div>节拍: {note.beat}</div>
                                        <div>BPM: {note.bpm}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 text-center py-8">
                        选择音符查看详细信息
                    </div>
                )}
            </div>
        </div>
    );
}
