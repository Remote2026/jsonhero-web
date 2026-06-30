# 首页入口重新设计

**日期**：2026-06-30
**状态**：已确认的设计

## 问题

当前首页入口不清晰，用户不知道从哪里开始。多个互相竞争的 CTA（URL 输入框、拖拽上传、示例链接、"Try now" 弹出按钮）造成认知负担过重。首页是一个营销页面，用户必须先经过它才能到达真正的工具。

## 解决方案

**让首页直接成为 JSON 查看器本身。** 用户打开网站直接看到三栏 SPA。一个 "+ New" 按钮打开右侧滑入面板用于输入 JSON。没有页面跳转，没有营销干扰。

## 架构

```
之前：index.tsx（营销页）→ 点击 "Go" → 跳转 → /j/$id（查看器）
之后：index.tsx = /j/$id 布局（查看器带空状态）→ 内联加载 → /j/$id
```

### 关键设计决策

1. **首页 = 查看器** — `index.tsx` 复用 `/j/$id.tsx` 的三栏布局
2. **没有弹窗** — 输入表单使用右侧滑入面板（480px），符合设计规范
3. **没有跳转** — JSON 在首页内联加载，URL 通过 `replaceState` 更新

## 用户流程

```
进入页面
  │
  ├── 看到三栏布局：
  │   ├── 顶栏：Logo + "New" 按钮（复用现有 Header）+ GitHub 星标
  │   ├── 侧边栏："未加载文档" + 禁用的视图选项
  │   ├── 中间：空状态 "没有打开的文档" + 图标
  │   └── 信息面板："打开文档后可查看预览"
  │
  ├── 点击顶栏 "New" 按钮（复用现有按钮，替换 Popover → 触发面板）
  │   └── 右侧面板滑入（480px，320ms 动画，CSS 与当前页面主题一致）
  │       ├── 文本域（主入口，统一输入）— 粘贴 JSON 或输入 URL，自动识别
  │       ├── 拖拽上传区 — 文件上传
  │       ├── 示例链接 — 试试 Tweet JSON / Github API / Airtable API
  │       └── "Open JSON →" 按钮
  │
  ├── 提交 → 面板关闭
  │   ├── 中间面板显示 JSON 查看器（列视图/树视图/编辑器）
  │   ├── URL 更新为 /j/$id（replaceState）
  │   ├── 侧边栏显示文档信息
  │   └── 信息面板显示预览 + Schema + 统计
  │
  └── 关闭面板（✕ / Esc）→ 回到空状态
```

## 组件变更

### 修改：`app/routes/index.tsx`

将营销首页（`HomeHeader + HomeHeroSection + HomeInfoBoxSection + ... + HomeFooter`）替换为三栏查看器布局（复用 `/j/$id.tsx` 的结构）：

- 使用 `Header` 组件（查看器页面的顶栏，而不是 `HomeHeader`）
- 导入并复用 `SideBar`、`JsonView`、`InfoPanel` 组件
- 在中间面板添加**空状态**（未加载文档时显示）
- 移除所有营销区块（Hero、InfoBox、EdgeCases、Search、Collaborate、FeatureGrid、Footer）
- 添加右侧面板状态管理（打开/关闭）

### 修改：`app/components/Header.tsx`（查看器顶栏）

- **不改动按钮样式和布局**，仅将 "New" 按钮从 `Popover` 触发改为触发右侧面板
- 右面板关闭逻辑通过父组件传入的 props 或共享状态控制
- 面板的 CSS 主题与当前页面保持一致（`bg-indigo-700` / `dark:bg-slate-800` 色系）

### 新建：输入面板组件（`NewDocumentPanel.tsx`）

右侧滑入面板，CSS 与当前页面主题一致：

- 480px 宽度，右侧固定
- 320ms 滑入动画，ease 缓动，Esc 关闭，✕ 按钮关闭
- 面板内可独立滚动
- 背景色使用当前页面色系（`bg-white dark:bg-slate-900`）
- 包含：
  - **文本域**（主入口，统一输入）— 多行，JetBrains Mono 等宽字体，默认 ~140px 高度，可拖拽调整大小。接受 JSON 文本和 URL，自动识别
  - **拖拽上传区** — 复用现有 `DragAndDropForm` 逻辑
  - **示例链接** — 复用现有 `SampleUrls` 逻辑
  - **提交按钮** — "Open JSON →"（保持现有 `bg-lime-500` 按钮样式）

### 空状态（中间面板）

未加载文档时，中间 `JsonView` 区域显示：

- 大号搜索/文档图标
- "没有打开的文档" 标题
- "打开一个 JSON 文件开始使用" 副标题
- "+ New Document" 按钮
- （可选）键盘快捷键提示："按 `Ctrl+N` 创建新文档"

## 数据流

```
用户在面板中提交 JSON
  → 使用 useFetcher 提交到 /api/create[.json]（返回 JSON 包含 doc ID）
  → 或者提交到 /actions/createFromUrl 或 /actions/createFromFile
  → 成功后从响应获取 doc ID
  → 获取文档数据（复用 /j/$id 的 loader 逻辑或内联调用）
  → 更新本地状态：设置 JSON 数据、文档信息
  → replaceState 到 /j/$id 使 URL 可分享
  → 面板关闭
  → 中间面板从空状态切换到 JSON 查看器
```

现有服务端接口（`createFromFile`、`createFromUrl`、`api/create[.json]`）全部复用。客户端内联处理响应，使用 `useFetcher` 避免整页跳转。

**关键点**：`index.tsx` 需要状态管理来跟踪已加载的 JSON 文档。最简洁的做法是复用现有 provider 组件（`JsonDocProvider`、`JsonProvider` 等），根据是否加载了文档来条件渲染空状态或查看器。

## 需修改的文件

| 文件 | 变更 |
|------|------|
| `app/routes/index.tsx` | 将营销内容替换为三栏查看器 + 空状态 + 右侧面板状态 |
| `app/components/Header.tsx` | "New" 按钮从 Popover 改为触发右侧面板 |
| `app/components/Home/HomeHeader.tsx` | 不再被首页使用（保留组件） |
| 新建：`app/components/EmptyState.tsx` | 中间面板空状态内容 |
| 新建：`app/components/NewDocumentPanel.tsx` | 右侧滑入面板 + 输入表单 |

## 保留不变的部分

- 所有现有的 `Home/` 营销区块组件（可删除或保留供未来营销页使用）
- 所有现有接口路由（`actions/createFromFile`、`actions/createFromUrl` 等）
- 所有现有查看器组件（`JsonColumnView`、`JsonTreeView`、`SideBar`、`InfoPanel` 等）
- 主题系统、偏好设置、Toast 通知系统

## 不在此次范围

- 移动端适配（查看器目前仅支持桌面）
- 新首页的 SEO/meta 标签（可使用现有 meta 设置）
- 营销内容删除 — 组件保留，只是不在首页渲染

## 验证步骤

1. 访问 `http://localhost:8787/` — 应看到三栏布局，中间为空状态
2. 点击 "+ New" — 右侧面板滑入
3. 在文本域粘贴 JSON → 点击 "Open JSON →" — 面板关闭，JSON 加载到查看器
4. 输入 URL → 结果同上
5. 拖拽 .json 文件 → 结果同上
6. 点击示例链接 → 结果同上
7. 未提交关闭面板（✕ / Esc）→ 回到空状态
8. 浏览器前进/后退 — URL 状态应保持一致
