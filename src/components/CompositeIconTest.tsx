import React from 'react';
import SVGSpriteIcon, { SVGNoteIcons } from './SVGSpriteIcon';

export default function CompositeIconTest() {
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">组合图标测试</h1>

            <div className="space-y-8">
                {/* 测试组合图标 */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">组合图标对比</h2>
                    <svg width="600" height="200" className="border border-gray-300 bg-white">
                        {/* 基础flick图标（无装饰器） */}
                        <g>
                            <SVGSpriteIcon
                                {...SVGNoteIcons.tap}
                                svgX={100}
                                svgY={100}
                                svgSize={60}
                                svgWidth={60}
                                svgHeight={30}
                            />
                            <text x={100} y={150} fontSize="12" textAnchor="middle">基础Tap</text>
                        </g>

                        {/* 组合flick图标（带装饰器） */}
                        <g>
                            <SVGSpriteIcon
                                {...SVGNoteIcons.flick}
                                svgX={200}
                                svgY={100}
                                svgSize={60}
                                svgWidth={60}
                                svgHeight={30}
                            />
                            <text x={200} y={150} fontSize="12" textAnchor="middle">组合Flick</text>
                        </g>

                        {/* 技能音符 */}
                        <g>
                            <SVGSpriteIcon
                                {...SVGNoteIcons.skill}
                                svgX={300}
                                svgY={100}
                                svgSize={60}
                                svgWidth={60}
                                svgHeight={30}
                            />
                            <text x={300} y={150} fontSize="12" textAnchor="middle">技能音符</text>
                        </g>

                        {/* 左方向滑键 */}
                        <g>
                            <SVGSpriteIcon
                                {...SVGNoteIcons.leftFlick}
                                svgX={400}
                                svgY={100}
                                svgSize={60}
                                svgWidth={60}
                                svgHeight={30}
                            />
                            <text x={400} y={150} fontSize="12" textAnchor="middle">左方向滑键</text>
                        </g>

                        {/* 右方向滑键 */}
                        <g>
                            <SVGSpriteIcon
                                {...SVGNoteIcons.rightFlick}
                                svgX={500}
                                svgY={100}
                                svgSize={60}
                                svgWidth={60}
                                svgHeight={30}
                            />
                            <text x={500} y={150} fontSize="12" textAnchor="middle">右方向滑键</text>
                        </g>
                    </svg>
                </div>

                {/* 配置说明 */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">组合逻辑说明</h2>
                    <div className="bg-white p-4 rounded border">
                        <h3 className="font-semibold mb-2">1. 基础图标 (BaseSpriteIcons)</h3>
                        <p className="text-sm text-gray-600 mb-2">定义所有基础音符图标的sprite配置</p>

                        <h3 className="font-semibold mb-2">2. 装饰器图标 (DecoratorIcons)</h3>
                        <p className="text-sm text-gray-600 mb-2">定义装饰器图标的sprite配置，包括偏移和缩放</p>

                        <h3 className="font-semibold mb-2">3. 组合配置 (CompositeNoteConfigs)</h3>
                        <p className="text-sm text-gray-600 mb-2">定义哪些音符需要组合显示，以及使用哪些装饰器</p>

                        <h3 className="font-semibold mb-2">4. 扩展性</h3>
                        <p className="text-sm text-gray-600">
                            - 添加新的装饰器：在 DecoratorIcons 中添加配置<br />
                            - 创建新的组合：在 CompositeNoteConfigs 中组合基础图标和装饰器<br />
                            - 支持多个装饰器：decorators 数组可以包含多个装饰器
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
