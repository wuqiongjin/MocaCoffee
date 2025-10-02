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
    scale = 1.0
}: SVGSpriteIconProps) {
    // 使用传入的宽度和高度，如果没有传入则使用svgSize
    const displayWidth = svgWidth || svgSize;
    const displayHeight = svgHeight || svgSize;

    return (
        <g className={`svg-sprite-icon ${className}`} onClick={onClick}>
            {/* 主图标 */}
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
                            imageRendering: 'pixelated'
                        }}
                    />
                </div>
            </foreignObject>

            {/* 装饰器图标 */}
            {decorators.map((decorator, index) => {
                const scaleX = decorator.scaleX || decorator.scale || 1.0;
                const scaleY = decorator.scaleY || decorator.scale || 1.0;
                const decoratorWidth = displayWidth * scaleX;
                const decoratorHeight = displayHeight * scaleY;
                // 偏移量需要根据传入的缩放比例进行调整
                const offsetX = (decorator.offsetX || 0) * scale;
                const offsetY = (decorator.offsetY || 0) * scale;

                return (
                    <foreignObject
                        key={index}
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
                                    imageRendering: 'pixelated'
                                }}
                            />
                        </div>
                    </foreignObject>
                );
            })}
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
        offsetX: 8,  // 相对于主图标的X偏移 (向右偏移8px)
        offsetY: -11, // 相对于主图标的Y偏移（向上偏移11px）
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
        decorators: [DecoratorIcons.flickDecorator]
    },
    // 左方向滑键 = 基础leftFlick + LDirectionalFlickDecorator
    leftFlick: {
        ...BaseSpriteIcons.leftFlick,
        decorators: [DecoratorIcons.LDirectionalFlickDecorator]
    },
    // 右方向滑键 = 基础rightFlick + RDirectionalFlickDecorator
    rightFlick: {
        ...BaseSpriteIcons.rightFlick,
        decorators: [DecoratorIcons.RDirectionalFlickDecorator]
    },

    // 其他音符直接使用基础配置
    tap: BaseSpriteIcons.tap,
    skill: BaseSpriteIcons.skill,
};

// 为了向后兼容，保留原来的SVGNoteIcons名称
export const SVGNoteIcons = CompositeNoteConfigs;

// 滑条连接线配置
export const SVGSlideLineIcons = {
    // 滑条连接线
    line: {
        src: '/assets/skins/longNoteLine.png',
        x: 0,
        y: 0,
        width: 100,
        height: 100
    },

    // 长音符连接线
    longLine: {
        src: '/assets/skins/longNoteLine2.png',
        x: 0,
        y: 0,
        width: 100,
        height: 100
    }
};