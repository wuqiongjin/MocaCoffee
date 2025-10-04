import SpriteIcon, { NoteIcons, SlideLineIcons } from '../../src/components/SpriteIcon';

export default function SpriteTest() {
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Sprite图标测试</h1>

            <div className="grid grid-cols-2 gap-8">
                {/* 音符图标测试 */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">音符图标</h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <SpriteIcon {...NoteIcons.tap} size={32} />
                            <span>单键音符 (Tap)</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <SpriteIcon {...NoteIcons.flick} size={32} />
                            <span>滑键音符 (Flick)</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <SpriteIcon {...NoteIcons.skill} size={32} />
                            <span>技能音符 (Skill)</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <SpriteIcon {...NoteIcons.leftFlick} size={32} />
                            <span>左方向滑键</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <SpriteIcon {...NoteIcons.rightFlick} size={32} />
                            <span>右方向滑键</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <SpriteIcon {...NoteIcons.slide} size={32} />
                            <span>滑条音符 (Slide)</span>
                        </div>
                    </div>
                </div>

                {/* 滑条连接线测试 */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">滑条连接线</h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <SpriteIcon {...SlideLineIcons.line} size={64} />
                            <span>滑条连接线 (longNoteLine)</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <SpriteIcon {...SlideLineIcons.longLine} size={64} />
                            <span>长音符连接线 (longNoteLine2)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 原始图片预览 */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">原始图片预览</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-lg font-medium mb-2">RhythmGameSprites.png</h3>
                        <img
                            src="./assets/skins/RhythmGameSprites.png"
                            alt="RhythmGameSprites"
                            className="max-w-full h-auto border border-gray-300"
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium mb-2">DirectionalFlickSprites.png</h3>
                        <img
                            src="./assets/skins/DirectionalFlickSprites.png"
                            alt="DirectionalFlickSprites"
                            className="max-w-full h-auto border border-gray-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
