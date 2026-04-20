# mybill-app 项目记忆

## Feedback

### 滚动条 transparent track 白边陷阱

`--scrollbar-track: transparent` 在卡片内滚动条正常（透出深色卡片背景），但复用到页面级（html/body）滚动条时，transparent 透出 OS 窗口背景（Windows 默认白色），暗色模式下产生白边。

**Why:** 两次（Claude + GPT）都从"代码差异"角度排查细节（border-radius、transition），而没有从"transparent 在不同渲染上下文里透出什么"角度思考，导致接连踩坑。

**How to apply:** Windows Webkit 页面级滚动条的 gutter 使用 `html` 元素的背景色。若 `html` 无背景（默认白），transparent track 就透出白色。根本修法是给 `html.dark { background-color: #12062b; }` 而不是改 track 颜色（track 改为实色会在渐变页面背景上留条纹）。卡片内滚动条因容器已有深色背景，transparent 正常，无需处理。
