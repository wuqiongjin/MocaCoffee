interface StatusBarProps {
    mousePosition: { lane: number; beat: number } | null;
    selectedNotes: number[];
    notes: any[];
}

export default function StatusBar({ mousePosition, selectedNotes, notes }: StatusBarProps) {
    return (
        <div
            className="fixed bottom-1 right-1 z-50"
            style={{
                position: 'fixed',
                bottom: '4px',
                right: '4px',
                zIndex: 9999
            }}
        >
            <div className="bg-gray-800 text-white px-2 py-1 text-xs border border-gray-600 rounded shadow-lg">
                <div className="flex items-center space-x-1">
                    {mousePosition ? (
                        <span className="text-green-400 text-xs">●</span>
                    ) : (
                        <span className="text-gray-500 text-xs">○</span>
                    )}
                    <span className="text-xs">
                        {selectedNotes.length > 0 ? (
                            (() => {
                                const selectedNote = notes[selectedNotes[0]];
                                if (selectedNote && selectedNote.type === "Single") {
                                    return `选中音符: (lane: ${selectedNote.lane}, beat: ${selectedNote.beat})`;
                                } else if (selectedNote && selectedNote.type === "Slide") {
                                    const [p1, p2] = selectedNote.connections;
                                    return `选中滑条: (${p1.lane},${p1.beat}) → (${p2.lane},${p2.beat})`;
                                }
                                return `选中 ${selectedNotes.length} 个音符`;
                            })()
                        ) : mousePosition ? (
                            `坐标: (lane: ${mousePosition.lane}, beat: ${Math.floor(mousePosition.beat)})`
                        ) : (
                            '将鼠标移动到谱面上查看坐标'
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
