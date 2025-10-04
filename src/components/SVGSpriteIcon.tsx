interface SVGSpriteIconProps {
    src: string;
    x: number; // 在sprite图片中的x位置百分比（负值）
    y: number; // 在sprite图片中的y位置百分比（负值）
    width: number; // 在sprite图片中的宽度百分比
    height: number; // 在sprite图片中的高度百分比
    svgX: number; // 在SVG中的x坐标
    svgY: number; // 在SVG中的y坐标
    svgSize: number; // 在SVG中的显示尺寸
    svgWidth?: number; // 在SVG中的显示宽度（可选，默认等于svgSize）
    svgHeight?: number; // 在SVG中的显示高度（可选，默认等于svgSize）
    className?: string;
    onClick?: () => void;
    // 组合图标相关
    decorators?: SpriteIconConfig[]; // 装饰器图标配置数组
    scale?: number; // 缩放比例，用于调整装饰器偏移量
    renderLayer?: 'main' | 'decorators' | 'all'; // 渲染层级控制
}

interface SpriteIconConfig {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    offsetX?: number; // 相对于主图标的X偏移（像素）
    offsetY?: number; // 相对于主图标的Y偏移（像素）
    scale?: number; // 装饰器的缩放比例（默认1.0）
    scaleX?: number; // 装饰器的X轴缩放比例（默认使用scale）
    scaleY?: number; // 装饰器的Y轴缩放比例（默认使用scale）
    zIndex?: number; // 图层优先级，数值越大越在上层（默认0）
}

export default function SVGSpriteIcon({
    src,
    x,
    y,
    width,
    height,
    svgX,
    svgY,
    svgSize,
    svgWidth,
    svgHeight,
    className = "",
    onClick,
    decorators = [],
    scale = 1.0,
    renderLayer = 'all'
}: SVGSpriteIconProps) {
    // 使用传入的宽度和高度，如果没有传入则使用svgSize
    const displayWidth = svgWidth || svgSize;
    const displayHeight = svgHeight || svgSize;

    // 分离装饰器：低zIndex（主体层）和高zIndex（装饰器层）
    const lowZIndexDecorators = decorators.filter(d => (d.zIndex || 0) < 10);
    const highZIndexDecorators = decorators.filter(d => (d.zIndex || 0) >= 10);

    // 渲染装饰器的通用函数
    const renderDecorators = (decoratorList: typeof decorators) => {
        return decoratorList
            .map((decorator, originalIndex) => ({ decorator, originalIndex }))
            .sort((a, b) => (a.decorator.zIndex || 0) - (b.decorator.zIndex || 0))
            .map(({ decorator, originalIndex }) => {
                const scaleX = decorator.scaleX || decorator.scale || 1.0;
                const scaleY = decorator.scaleY || decorator.scale || 1.0;
                const decoratorWidth = displayWidth * scaleX;
                const decoratorHeight = displayHeight * scaleY;
                // 偏移量需要根据传入的缩放比例进行调整
                const offsetX = (decorator.offsetX || 0) * scale;
                const offsetY = (decorator.offsetY || 0) * scale;

                return (
                    <foreignObject
                        key={`${renderLayer}-${originalIndex}`}
                        x={svgX - decoratorWidth / 2 + offsetX}
                        y={svgY - decoratorHeight / 2 + offsetY}
                        width={decoratorWidth}
                        height={decoratorHeight}
                        style={{ overflow: 'hidden' }}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={decorator.src}
                                alt="decorator"
                                style={{
                                    position: 'absolute',
                                    left: `${decorator.x}%`,
                                    top: `${decorator.y}%`,
                                    width: `${decorator.width}%`,
                                    height: `${decorator.height}%`,
                                    maxWidth: `${decorator.width}%`,
                                    maxHeight: `${decorator.height}%`,
                                    imageRendering: 'auto'
                                }}
                            />
                        </div>
                    </foreignObject>
                );
            });
    };

    return (
        <g className={`svg-sprite-icon ${className}`} onClick={onClick}>
            {/* 主图标 - 只在main或all层渲染 */}
            {(renderLayer === 'main' || renderLayer === 'all') && (
                <foreignObject
                    x={svgX - displayWidth / 2}
                    y={svgY - displayHeight / 2}
                    width={displayWidth}
                    height={displayHeight}
                    style={{ overflow: 'hidden' }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <img
                            src={src}
                            alt="sprite"
                            style={{
                                position: 'absolute',
                                left: `${x}%`,
                                top: `${y}%`,
                                width: `${width}%`,
                                height: `${height}%`,
                                maxWidth: `${width}%`,
                                maxHeight: `${height}%`,
                                imageRendering: 'auto'
                            }}
                        />
                    </div>
                </foreignObject>
            )}

            {/* 低zIndex装饰器 - 只在main或all层渲染 */}
            {(renderLayer === 'main' || renderLayer === 'all') && renderDecorators(lowZIndexDecorators)}

            {/* 高zIndex装饰器 - 只在decorators或all层渲染 */}
            {(renderLayer === 'decorators' || renderLayer === 'all') && renderDecorators(highZIndexDecorators)}
        </g>
    );
}

// 基础sprite图标配置
export const BaseSpriteIcons = {
    // 单键音符 (Tap Note) - 使用竞品的确切坐标
    tap: {
        src: '/assets/skins/RhythmGameSprites.png',
        x: -503.247,
        y: -753.333,
        width: 664.935,
        height: 853.333
    },

    // 滑键音符 (Flick Note) - 使用竞品的确切坐标
    flick: {
        src: '/assets/skins/RhythmGameSprites.png',
        x: 0,
        y: -753.333,
        width: 664.935,
        height: 853.333
    },

    // 技能音符 (Skill Note) - 使用竞品的确切坐标
    skill: {
        src: '/assets/skins/RhythmGameSprites.png',
        x: -301.948,
        y: -651.667,
        width: 664.935,
        height: 853.333
    },

    // 左方向滑键 - 使用竞品的确切坐标
    leftFlick: {
        src: '/assets/skins/DirectionalFlickSprites.png',
        x: 2,
        y: -651.667,
        width: 320.468,
        height: 853.333
    },

    // 右方向滑键 - 使用竞品的确切坐标
    rightFlick: {
        src: '/assets/skins/DirectionalFlickSprites.png',
        x: 2,
        y: -143.333,
        width: 320.468,
        height: 853.333
    }
};

// 装饰器图标配置
export const DecoratorIcons = {
    // 滑键装饰器，用于组合到滑键上方
    flickDecorator: {
        src: '/assets/skins/RhythmGameSprites.png',
        x: -400.123,
        y: -53.333,
        width: 664.935,
        height: 995.333,
        offsetX: 7,  // 相对于主图标的X偏移 (向右偏移9px)
        offsetY: -12, // 相对于主图标的Y偏移（向上偏移12px）
        scale: 1.0, // 装饰器整体缩放比例
        scaleX: 1.0, // X轴缩放比例（宽度保持不变）
        scaleY: 0.6  // Y轴缩放比例（高度压缩到60%，变窄）
    },

    // 左方向滑键装饰器，用于组合到滑键上方
    LDirectionalFlickDecorator: {
        src: '/assets/skins/DirectionalFlickSprites.png',
        x: -199.247,
        y: -429.333,
        width: 664.935,
        height: 853.333,
        offsetX: -28,  // 相对于主图标的X偏移 (向左偏移28px)
        offsetY: 0, // 相对于主图标的Y偏移
        scale: 1.0, // 装饰器整体缩放比例
        scaleX: 0.5, // X轴缩放比例（宽度压缩到50%）
        scaleY: 0.8  // Y轴缩放比例（高度压缩到80%，变窄）
    },

    // 右方向滑键装饰器，用于组合到滑键上方
    RDirectionalFlickDecorator: {
        src: '/assets/skins/DirectionalFlickSprites.png',
        x: -190.247,
        y: -283.333,
        width: 664.935,
        height: 853.333,
        offsetX: 28,  // 相对于主图标的X偏移 (向右偏移8px)
        offsetY: 0, // 相对于主图标的Y偏移
        scale: 1.0, // 装饰器整体缩放比例
        scaleX: 0.5, // X轴缩放比例（宽度压缩到50%）
        scaleY: 0.8  // Y轴缩放比例（高度压缩到80%，变窄）
    }
};

// 组合图标配置 - 定义哪些音符需要组合显示
export const CompositeNoteConfigs = {
    // 滑键音符 = 基础flick + flickDecorator
    flick: {
        ...BaseSpriteIcons.flick,
        decorators: [
            {
                ...DecoratorIcons.flickDecorator,
                zIndex: 10 // 设置与方向键装饰器相同的高优先级
            }
        ]
    },
    // 左方向滑键组合 - 根据length属性选择不同的组合
    // L1: 1个LDirectionalFlickDecorator + 1个leftFlick
    leftFlickL1: {
        ...BaseSpriteIcons.leftFlick,
        decorators: [
            {
                ...DecoratorIcons.LDirectionalFlickDecorator,
                offsetX: -18,
                zIndex: 10 // 设置更高的图层优先级
            }
        ]
    },
    // L2: 1个LDirectionalFlickDecorator + 2个leftFlick
    leftFlickL2: {
        ...BaseSpriteIcons.leftFlick,
        decorators: [
            {
                ...BaseSpriteIcons.leftFlick,
                offsetX: -30, // 第二个leftFlick向左偏移 (偏移数值 = 轨道宽度)
                offsetY: 0,
                scale: 0.9
            },
            {
                ...DecoratorIcons.LDirectionalFlickDecorator,
                offsetX: -48,
                offsetY: 0,
                scale: 1.0,
                zIndex: 10 // 设置更高的图层优先级
            }
        ]
    },
    // L3: 1个LDirectionalFlickDecorator + 3个leftFlick
    leftFlickL3: {
        ...BaseSpriteIcons.leftFlick,
        decorators: [
            {
                ...BaseSpriteIcons.leftFlick,
                offsetX: -30, // 第二个leftFlick向左偏移 (偏移数值 = 轨道宽度)
                offsetY: 0,
                scale: 0.9
            },
            {
                ...BaseSpriteIcons.leftFlick,
                offsetX: -60, // 第三个leftFlick更向左偏移
                offsetY: 0,
                scale: 0.9
            },
            {
                ...DecoratorIcons.LDirectionalFlickDecorator,
                offsetX: -78,
                offsetY: 0,
                scale: 1.0,
                zIndex: 10 // 设置更高的图层优先级
            }
        ]
    },

    // 右方向滑键组合 - 根据length属性选择不同的组合
    // R1: 1个RDirectionalFlickDecorator + 1个rightFlick
    rightFlickR1: {
        ...BaseSpriteIcons.rightFlick,
        decorators: [
            {
                ...DecoratorIcons.RDirectionalFlickDecorator,
                offsetX: 18,
                zIndex: 10 // 设置更高的图层优先级
            }
        ]
    },
    // R2: 1个RDirectionalFlickDecorator + 2个rightFlick
    rightFlickR2: {
        ...BaseSpriteIcons.rightFlick,
        decorators: [
            {
                ...BaseSpriteIcons.rightFlick,
                offsetX: 30, // 第二个rightFlick向右偏移 (偏移数值 = 轨道宽度)
                offsetY: 0,
                scale: 0.9
            },
            {
                ...DecoratorIcons.RDirectionalFlickDecorator,
                offsetX: 48,
                offsetY: 0,
                scale: 1.0,
                zIndex: 10 // 设置更高的图层优先级
            }
        ]
    },
    // R3: 1个RDirectionalFlickDecorator + 3个rightFlick
    rightFlickR3: {
        ...BaseSpriteIcons.rightFlick,
        decorators: [
            {
                ...BaseSpriteIcons.rightFlick,
                offsetX: 30, // 第二个rightFlick向右偏移 (偏移数值 = 轨道宽度)
                offsetY: 0,
                scale: 0.9
            },
            {
                ...BaseSpriteIcons.rightFlick,
                offsetX: 60, // 第三个rightFlick更向右偏移
                offsetY: 0,
                scale: 0.9
            },
            {
                ...DecoratorIcons.RDirectionalFlickDecorator,
                offsetX: 78,
                offsetY: 0,
                scale: 1.0,
                zIndex: 10 // 设置更高的图层优先级
            }
        ]
    },

    // 保留旧的配置用于向后兼容
    leftFlick: {
        ...BaseSpriteIcons.leftFlick,
        decorators: [
            {
                ...DecoratorIcons.LDirectionalFlickDecorator,
                zIndex: 10 // 设置更高的图层优先级
            }
        ]
    },
    rightFlick: {
        ...BaseSpriteIcons.rightFlick,
        decorators: [
            {
                ...DecoratorIcons.RDirectionalFlickDecorator,
                zIndex: 10 // 设置更高的图层优先级
            }
        ]
    },

    // 其他音符直接使用基础配置
    tap: BaseSpriteIcons.tap,
    skill: BaseSpriteIcons.skill,
};

// 为了向后兼容，保留原来的SVGNoteIcons名称
export const SVGNoteIcons = CompositeNoteConfigs;

// 滑条连接线配置
export const SVGSlideLineIcons = {
    // 普通连接线
    slideLine: {
        src: '/assets/skins/longNoteLine.png',
        x: 0,
        y: 0,
        width: 100,
        height: 100
    },

    // SP滑条连接线 (Special滑条连接线)
    SPSlideLine: {
        src: '/assets/skins/longNoteLine2.png',
        x: 0,
        y: 0,
        width: 100,
        height: 100
    },

    // pathway音符 (滑条途径结点音符样式)
    pathway: {
        src: '/assets/skins/RhythmGameSprites.png',
        x: -100.247,
        y: -242.333,
        width: 664.935,
        height: 853.333
    },

    // endpoint音符 (滑条起始点音符样式)
    endpoint: {
        src: '/assets/skins/RhythmGameSprites.png',
        x: -402.247,
        y: -652.333,
        width: 664.935,
        height: 853.333
    }
};