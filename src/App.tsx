import { useState } from 'react'
import './App.css'
import SongUploader from "./components/SongUploader";
import Editor from "./pages/Editor";

function App() {
  const [song, setSong] = useState<File | null | undefined>(undefined);

  if (song === undefined) {
    return <SongUploader onUpload={setSong} />;
  }

  return <Editor song={song} />;
}

export default App
