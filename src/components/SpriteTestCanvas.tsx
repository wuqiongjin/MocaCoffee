import React from 'react';
import SVGSpriteIcon, { SVGNoteIcons } from './SVGSpriteIcon';

export default function SpriteTestCanvas() {
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">SVG Sprite测试</h1>

            <div className="space-y-8">
                {/* 测试SVG中的sprite图标 */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">SVG中的Sprite图标测试</h2>
                    <svg width="400" height="200" className="border border-gray-300 bg-white">
                        {/* 先测试显示完整图片 */}
                        <image
                            href="/assets/skins/RhythmGameSprites.png"
                            x={10}
                            y={10}
                            width="100"
                            height="50"
                            preserveAspectRatio="none"
                        />

                        {/* 测试单键音符 */}
                        <SVGSpriteIcon
                            {...SVGNoteIcons.tap}
                            svgX={50}
                            svgY={100}
                            svgSize={40}
                        />

                        {/* 测试滑键音符 */}
                        <SVGSpriteIcon
                            {...SVGNoteIcons.flick}
                            svgX={100}
                            svgY={100}
                            svgSize={40}
                        />

                        {/* 测试技能音符 */}
                        <SVGSpriteIcon
                            {...SVGNoteIcons.skill}
                            svgX={150}
                            svgY={100}
                            svgSize={40}
                        />

                        {/* 测试左方向滑键 */}
                        <SVGSpriteIcon
                            {...SVGNoteIcons.leftFlick}
                            svgX={200}
                            svgY={100}
                            svgSize={40}
                        />

                        {/* 测试右方向滑键 */}
                        <SVGSpriteIcon
                            {...SVGNoteIcons.rightFlick}
                            svgX={250}
                            svgY={100}
                            svgSize={40}
                        />

                        {/* 添加标签 */}
                        <text x={50} y={150} fontSize="12" textAnchor="middle">Tap</text>
                        <text x={100} y={150} fontSize="12" textAnchor="middle">Flick</text>
                        <text x={150} y={150} fontSize="12" textAnchor="middle">Skill</text>
                        <text x={200} y={150} fontSize="12" textAnchor="middle">Left</text>
                        <text x={250} y={150} fontSize="12" textAnchor="middle">Right</text>
                    </svg>
                </div>

                {/* 原始图片预览 */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">原始图片预览</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">RhythmGameSprites.png</h3>
                            <img
                                src="/assets/skins/RhythmGameSprites.png"
                                alt="RhythmGameSprites"
                                className="max-w-full h-auto border border-gray-300"
                                style={{ maxWidth: '300px' }}
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">DirectionalFlickSprites.png</h3>
                            <img
                                src="/assets/skins/DirectionalFlickSprites.png"
                                alt="DirectionalFlickSprites"
                                className="max-w-full h-auto border border-gray-300"
                                style={{ maxWidth: '300px' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
