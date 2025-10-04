import { useState } from 'react';

export default function SpriteDebugger() {
    const [x, setX] = useState(-503.247);
    const [y, setY] = useState(-753.333);
    const [width, setWidth] = useState(664.935);
    const [height, setHeight] = useState(853.333);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <label>X: <input type="number" value={x} onChange={e => setX(parseFloat(e.target.value))} /></label>
                <label>Y: <input type="number" value={y} onChange={e => setY(parseFloat(e.target.value))} /></label>
                <label>Width: <input type="number" value={width} onChange={e => setWidth(parseFloat(e.target.value))} /></label>
                <label>Height: <input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value))} /></label>
            </div>
            <div style={{ width: 100, height: 100, position: 'relative', overflow: 'hidden', border: '2px solid red' }}>
                <img
                    src="/assets/skins/RhythmGameSprites.png"
                    alt="debug"
                    style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        maxWidth: `${width}%`,
                        maxHeight: `${height}%`,
                        imageRendering: 'pixelated'
                    }}
                />
            </div>
        </div>
    );
}