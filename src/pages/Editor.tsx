import { useState } from "react";
import Toolbar from "../components/Toolbar";
import ChartCanvas from "../components/ChartCanvas";
import type { ChartNote } from "../notes/Charts";

interface EditorProps {
  song: File | null;
}

export default function Editor({ song }: EditorProps) {
  const [selectedTool, setSelectedTool] = useState("single");
  const [notes, setNotes] = useState<ChartNote[]>([]);

  return (
    <div className="flex flex-col h-screen">
      <Toolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
      <div className="flex-1 overflow-auto">
        <ChartCanvas notes={notes} setNotes={setNotes} selectedTool={selectedTool} />
      </div>
      <pre className="p-2 bg-gray-100 h-40 overflow-auto text-xs">
        {JSON.stringify(notes, null, 2)}
      </pre>
    </div>
  );
}
