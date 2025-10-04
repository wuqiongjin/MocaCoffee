import React, { useState, useEffect, useRef } from 'react';
import type { ChartNote } from '../notes/Charts';
import { convertNotesToChartCode, chartCodeToJSON, parseChartCodeFromJSON, validateChartCode, convertChartCodeToNotes } from '../utils/chartConverter';

interface ChartCodeEditorProps {
    notes: ChartNote[];
    onNotesChange: (notes: ChartNote[]) => void;
    isVisible: boolean;
    onClose: () => void;
}

export default function ChartCodeEditor({
    notes,
    onNotesChange,
    isVisible,
    onClose
}: ChartCodeEditorProps) {
    const [chartCode, setChartCode] = useState<string>('');
    const [isValid, setIsValid] = useState(true);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 当音符变化时更新谱面代码
    useEffect(() => {
        if (!isDirty) {
            const code = convertNotesToChartCode(notes);
            const jsonString = chartCodeToJSON(code);
            setChartCode(jsonString);
        }
    }, [notes, isDirty]);

    // 验证谱面代码
    const validateCode = (code: string) => {
        try {
            const parsed = parseChartCodeFromJSON(code);
            const validation = validateChartCode(parsed);
            setIsValid(validation.valid);
            setValidationErrors(validation.errors);
            return validation.valid;
        } catch (error) {
            setIsValid(false);
            setValidationErrors(['JSON格式错误: ' + (error as Error).message]);
            return false;
        }
    };

    // 处理代码变化
    const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newCode = event.target.value;
        setChartCode(newCode);
        setIsDirty(true);
        validateCode(newCode);
    };

    // 应用谱面代码到编辑器
    const handleApply = () => {
        if (!isValid) {
            alert('谱面代码格式错误，请检查后重试');
            return;
        }

        try {
            const parsedCode = parseChartCodeFromJSON(chartCode);
            const newNotes = convertChartCodeToNotes(parsedCode);
            onNotesChange(newNotes);
            setIsDirty(false);
            alert('谱面代码已成功应用到编辑器');
        } catch (error) {
            alert('应用谱面代码失败: ' + (error as Error).message);
        }
    };

    // 重置为当前音符
    const handleReset = () => {
        const code = convertNotesToChartCode(notes);
        const jsonString = chartCodeToJSON(code);
        setChartCode(jsonString);
        setIsDirty(false);
        setIsValid(true);
        setValidationErrors([]);
    };

    // 格式化代码
    const handleFormat = () => {
        try {
            const parsed = JSON.parse(chartCode);
            const formatted = JSON.stringify(parsed, null, 4);
            setChartCode(formatted);
        } catch (error) {
            alert('格式化失败: ' + (error as Error).message);
        }
    };

    // 复制到剪贴板
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(chartCode);
            alert('谱面代码已复制到剪贴板');
        } catch (error) {
            alert('复制失败: ' + (error as Error).message);
        }
    };

    // 从剪贴板粘贴
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setChartCode(text);
            setIsDirty(true);
            validateCode(text);
        } catch (error) {
            alert('粘贴失败: ' + (error as Error).message);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-6xl flex flex-col">
                {/* 标题栏 */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">谱面代码编辑器</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* 工具栏 */}
                <div className="flex items-center gap-2 p-4 border-b bg-gray-50">
                    <button
                        onClick={handleApply}
                        disabled={!isValid}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        应用
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        重置
                    </button>
                    <button
                        onClick={handleFormat}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        格式化
                    </button>
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                        复制
                    </button>
                    <button
                        onClick={handlePaste}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                        粘贴
                    </button>
                    <div className="flex-1"></div>
                    <div className={`px-3 py-1 rounded text-sm ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isValid ? '格式正确' : '格式错误'}
                    </div>
                </div>

                {/* 错误信息 */}
                {!isValid && validationErrors.length > 0 && (
                    <div className="p-4 bg-red-50 border-b">
                        <h3 className="font-semibold text-red-800 mb-2">错误信息:</h3>
                        <ul className="text-sm text-red-700 space-y-1">
                            {validationErrors.map((error, index) => (
                                <li key={index}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 代码编辑器 */}
                <div className="flex-1 p-4">
                    <textarea
                        ref={textareaRef}
                        value={chartCode}
                        onChange={handleCodeChange}
                        className="w-full h-full font-mono text-sm border rounded p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="谱面代码将在这里显示..."
                        spellCheck={false}
                    />
                </div>

                {/* 底部信息 */}
                <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                        <div>
                            音符数量: {notes.length} |
                            代码行数: {chartCode.split('\n').length} |
                            {isDirty && <span className="text-orange-600 ml-2">未保存的更改</span>}
                        </div>
                        <div>
                            支持格式: JSON
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
