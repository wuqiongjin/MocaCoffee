import { useState } from 'react'
import './App.css'
import SongUploader from "./components/SongUploader";
import Editor from "./pages/Editor";
import SpriteTest from "./components/SpriteTest";
import SpriteDebug from "./components/SpriteDebug";
import SpriteTestCanvas from "./components/SpriteTestCanvas";
import CompositeIconTest from "./components/CompositeIconTest";

function App() {
  const [song, setSong] = useState<File | null | undefined>(undefined);
  const [showSpriteTest, setShowSpriteTest] = useState(false);
  const [showSpriteDebug, setShowSpriteDebug] = useState(false);
  const [showSpriteTestCanvas, setShowSpriteTestCanvas] = useState(false);
  const [showCompositeTest, setShowCompositeTest] = useState(false);

  // 添加测试按钮
  if (song === undefined) {
    return (
      <div>
        <SongUploader onUpload={setSong} />
        <div className="fixed bottom-4 right-4 space-x-2 flex flex-col">
          <button
            onClick={() => setShowSpriteTest(!showSpriteTest)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
          >
            {showSpriteTest ? '隐藏' : '显示'} Sprite测试
          </button>
          <button
            onClick={() => setShowSpriteDebug(!showSpriteDebug)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-2"
          >
            {showSpriteDebug ? '隐藏' : '显示'} Sprite调试
          </button>
          <button
            onClick={() => setShowSpriteTestCanvas(!showSpriteTestCanvas)}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mb-2"
          >
            {showSpriteTestCanvas ? '隐藏' : '显示'} SVG测试
          </button>
          <button
            onClick={() => setShowCompositeTest(!showCompositeTest)}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            {showCompositeTest ? '隐藏' : '显示'} 组合图标测试
          </button>
        </div>
        {showSpriteTest && <SpriteTest />}
        {showSpriteDebug && <SpriteDebug />}
        {showSpriteTestCanvas && <SpriteTestCanvas />}
        {showCompositeTest && <CompositeIconTest />}
      </div>
    );
  }

  return <Editor song={song} />;
}

export default App
