interface StatusBarProps {
    mousePosition: { lane: number; beat: number } | null;
}

export default function StatusBar({ mousePosition }: StatusBarProps) {
    return (
        <div className="h-8 bg-gray-200 border-t flex items-center px-4 text-sm">
            {mousePosition ? (
                <span>坐标: (lane: {mousePosition.lane}, beat: {mousePosition.beat})</span>
            ) : (
                <span>将鼠标移动到谱面上查看坐标</span>
            )}
        </div>
    );
}
