# 测试文件目录

本目录包含项目的测试和调试相关文件。

## 目录结构

```
tests/
├── debug/           # 调试相关文件
│   └── SpriteDebug.tsx    # Sprite调试工具
├── unit/            # 单元测试文件
│   ├── CompositeIconTest.tsx    # 组合图标测试
│   ├── SpriteTest.tsx          # Sprite图标测试
│   └── SpriteTestCanvas.tsx    # SVG Sprite测试
└── integration/     # 集成测试文件（待添加）
```

## 文件说明

### Debug 文件
- **SpriteDebug.tsx**: 用于调试sprite图标的显示位置和尺寸的工具

### Unit 测试文件
- **CompositeIconTest.tsx**: 测试组合图标的显示效果和配置
- **SpriteTest.tsx**: 测试基础sprite图标的显示
- **SpriteTestCanvas.tsx**: 测试SVG中的sprite图标渲染

## 使用方法

这些测试文件可以通过以下方式使用：

1. 在开发环境中直接导入并渲染
2. 作为独立的测试页面运行
3. 用于验证sprite图标的正确显示

## 注意事项

- 所有测试文件都已正确配置import路径，指向src/components中的组件
- 测试文件使用相对路径引用资源文件（如sprite图片）
- 确保在运行测试前，相关的组件文件存在于src/components目录中
