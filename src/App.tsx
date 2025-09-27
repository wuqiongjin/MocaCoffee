import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BangDreamChartEditor from './Bangdream-chart-editor'
import SongUploader from "./components/SongUploader";
import Editor from "./pages/Editor";


function App() {
  return (
    <div className="w-screen h-screen">
      <BangDreamChartEditor />
    </div>
  )

  // const [song, setSong] = useState<File | null | undefined>(undefined);
  // console.log("song", song);

  // if (song === undefined) {
  //   console.log("song is undefined");
  //   return <SongUploader onUpload={setSong} />;
  // }

  // return <Editor song={song} />;
}

export default App
