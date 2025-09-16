# GeoServer SLD 预览器

一个基于 Vue 3 + Element Plus + OpenLayers 的 GeoServer SLD 样式预览工具，支持实时预览和配置管理。

[在线使用](https://www.xazrhh.com:1443/geoserver-sld-previewer/)

## ✨ 特性

- **实时 SLD 预览**: 在 GeoServer WMS 图层上实时预览 SLD 样式效果
- **XML 预览与格式化**: 支持 SLD XML 的格式化显示和原始视图切换
- **配置持久化**: 使用 Pinia 持久化插件保存配置，刷新页面不丢失
- **一键复制**: 快速复制 XML 内容到剪贴板
- **响应式界面**: 基于 Element Plus 的现代化 UI 设计
- **错误处理**: 完善的错误提示和降级方案

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **状态管理**: Pinia + pinia-plugin-persistedstate
- **UI 组件**: Element Plus
- **地图引擎**: OpenLayers
- **构建工具**: Vite
- **XML 格式化**: xml-formatter

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 📖 使用指南

### 基本配置

1. 点击"配置 GeoServer"按钮
2. 输入 GeoServer 的 WMS 服务地址
3. 输入要预览的图层名称
4. 点击"确认"保存配置

### SLD 配置

1. 在 SLD 配置界面设置样式规则
2. 支持多边形填充、描边、文本标注等符号化配置
3. 配置会自动保存并应用到地图预览

### XML 预览

- **格式化视图**: 显示美观的缩进格式 XML
- **原始视图**: 显示压缩的单行 XML
- **复制功能**: 一键复制当前显示的 XML 内容

## 🗂️ 项目结构

```
src/
├── components/
│   ├── MapPreview.vue      # 地图预览和 XML 显示组件
│   ├── SymbolizerConfig.vue # SLD 符号化配置组件
│   ├── RuleConfig.vue      # 规则配置组件
│   └── GeoserverConfigDialog.vue # GeoServer 配置对话框
├── stores/
│   ├── sldStore.js        # SLD 配置状态管理
│   └── index.js          # Pinia 配置
└── utils/
    └── sldGenerator.js    # SLD XML 生成工具
```

## 🔧 核心功能

### 状态管理

使用 Pinia 进行状态管理，配合持久化插件确保配置数据在页面刷新后不丢失。

```javascript
// stores/sldStore.js
persist: {
  key: 'geoserver-sld-store',
  paths: ['sldConfig', 'geoserverConfig', 'layerFields']
}
```

### 地图集成

基于 OpenLayers 集成 GeoServer WMS 服务，支持 SLD_BODY 参数实时预览。

```javascript
// 添加带 SLD 的 WMS 图层
const wmsParams = {
  'LAYERS': layerName,
  'FORMAT': 'image/png',
  'TRANSPARENT': true,
  'VERSION': '1.1.1',
  'SLD_BODY': sldXmlContent // 实时 SLD 内容
}
```

### XML 处理

使用专业的 xml-formatter 库进行 XML 格式化，确保缩进正确。

```javascript
// 格式化 XML
const formatted = xmlFormatter(props.sldXml, {
  indentation: '  ', // 2空格缩进
  collapseContent: true,
  lineSeparator: '\n'
})
```

## 🐛 常见问题

### Q: 地图无法加载？
A: 检查 GeoServer WMS 服务地址是否正确，确保网络可达。

### Q: SLD 预览不生效？
A: 确认 SLD XML 格式正确，GeoServer 支持 SLD_BODY 参数。

### Q: 配置丢失？
A: 项目使用 localStorage 持久化，清除浏览器数据会导致配置丢失。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题请提交 Issue 或联系开发团队。