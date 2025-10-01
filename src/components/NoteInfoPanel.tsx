import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ChartNote } from "../notes/Charts";

interface NoteInfoPanelProps {
    selectedNotes: number[];
    notes: ChartNote[];
    onNotesChange: (notes: ChartNote[]) => void;
}

export default function NoteInfoPanel({ selectedNotes, notes, onNotesChange }: NoteInfoPanelProps) {
    const [isCombinationMode, setIsCombinationMode] = useState(false);
    const [chartCode, setChartCode] = useState("");
    const [isCodeEditorCollapsed, setIsCodeEditorCollapsed] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const selectedNoteObjects = selectedNotes.map(index => notes[index]).filter(Boolean);

    // 将音符数据转换为代码格式
    const generateChartCode = (notes: ChartNote[]): string => {
        const codeLines: string[] = [];
        codeLines.push("// BanGDream 谱面代码");
        codeLines.push("// 格式: [类型] [节拍] [轨道] [其他参数]");
        codeLines.push("");

        // 按节拍排序
        const sortedNotes = [...notes].sort((a, b) => {
            if (a.type === "BPM" && b.type !== "BPM") return -1;
            if (a.type !== "BPM" && b.type === "BPM") return 1;

            // 获取节拍值进行比较
            const getBeat = (note: ChartNote): number => {
                if (note.type === "BPM" || note.type === "Single") {
                    return note.beat;
                } else if (note.type === "Slide") {
                    // 使用第一个连接点的节拍
                    return note.connections[0]?.beat || 0;
                }
                return 0;
            };

            return getBeat(a) - getBeat(b);
        });

        sortedNotes.forEach((note) => {
            if (note.type === "BPM") {
                codeLines.push(`BPM ${note.beat} ${note.bpm}`);
            } else if (note.type === "Single") {
                const flickText = note.flick ? " FLICK" : "";
                codeLines.push(`SINGLE ${note.beat} ${note.lane}${flickText}`);
            } else if (note.type === "Slide") {
                const connections = note.connections.map(conn => `${conn.beat},${conn.lane}`).join(" ");
                codeLines.push(`SLIDE ${connections}`);
            }
        });

        return codeLines.join("\n");
    };

    // 当音符数据变化时更新代码
    useEffect(() => {
        setChartCode(generateChartCode(notes));
    }, [notes]);

    // 当代码更新时，滚动到底部
    useEffect(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.scrollTop = textarea.scrollHeight;
        }
    }, [chartCode]);

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
            {/* 音符信息区块 */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">音符信息</h3>
                </div>

                <div className="p-4">
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
                            className="w-full px-3 py-2 bg-red-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
                        >
                            删除选中
                        </button>
                        <button
                            onClick={handleMirrorSelected}
                            disabled={selectedNotes.length === 0}
                            className="w-full px-3 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                        >
                            镜像选中
                        </button>
                    </div>
                </div>

                {/* 选中音符详情 */}
                <div className="max-h-64 overflow-y-auto p-4 bg-gray-50">
                    {selectedNoteObjects.length > 0 ? (
                        <div className="space-y-3">
                            {selectedNoteObjects.map((note, index) => (
                                <div key={index} className="p-3 bg-white rounded border shadow-sm">
                                    <div className="font-medium text-gray-800">
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
                        </div>
                    )}
                </div>
            </div>

            {/* 分割线 */}
            <div className="border-t border-gray-200"></div>

            {/* 谱面代码编辑器区块 */}
            <div className={`bg-white transition-all duration-300 ${isCodeEditorCollapsed ? 'flex-shrink-0' : 'flex-1'}`}>
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-800">谱面代码编辑器
                            <button
                                onClick={() => setIsCodeEditorCollapsed(!isCodeEditorCollapsed)}
                                className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                                title={isCodeEditorCollapsed ? "展开" : "折叠"}
                            >
                                {isCodeEditorCollapsed ? (
                                    <ChevronDown size={20} className="text-gray-500" />
                                ) : (
                                    <ChevronUp size={20} className="text-gray-500" />
                                )}
                            </button>
                        </h3>
                    </div>
                </div>

                {!isCodeEditorCollapsed && (
                    <div className="p-4 h-full">
                        <textarea
                            ref={textareaRef}
                            value={chartCode}
                            onChange={(e) => setChartCode(e.target.value)}
                            className="w-full h-full p-3 border border-gray-300 rounded font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="谱面代码将在这里显示..."
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#9ca3af #e5e7eb',
                                minHeight: '400px',
                                maxHeight: '600px',
                                width: '90%',
                            }}
                        />
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => {
                                    // 这里可以添加从代码解析回音符的功能
                                    console.log("应用代码更改");
                                }}
                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                            >
                                应用更改
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(chartCode);
                                }}
                                className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                                复制代码
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
