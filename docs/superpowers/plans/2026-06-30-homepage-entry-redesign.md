# 首页入口重新设计 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 将营销首页改为 JSON 查看器入口，用户直接看到三栏 SPA，通过右侧面板输入 JSON。

**架构：** index.tsx 复用 j/$id.tsx 的三栏布局（Header + SideBar + 中间内容 + InfoPanel），但初始无文档时不加载 JsonDocProvider。点击顶栏 "New" 按钮打开右侧滑入面板，提交后通过 Remix `useSubmit` 提交到现有 `/actions/createFromUrl` 接口，自动导航到 `/j/$id`。

**技术栈：** Remix 1.2 + React 17 + TypeScript + Tailwind CSS

---

### Task 1: 创建 EmptyState 组件

**文件：**
- 新建：`app/components/EmptyState.tsx`

- [ ] **Step 1: 创建文件**

```tsx
// app/components/EmptyState.tsx
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-5xl mb-4 opacity-60">🔍</div>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
        No document open
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Open a JSON file to get started
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Ctrl+N</kbd> to create a new document
      </p>
    </div>
  );
}
```

---

### Task 2: 创建 NewDocumentPanel 组件（右侧滑入面板）

**文件：**
- 新建：`app/components/NewDocumentPanel.tsx`
- 修改：`app/styles/tailwind.css` — 添加滑入动画

- [ ] **Step 1: 创建组件**

```tsx
// app/components/NewDocumentPanel.tsx
import { useCallback, useEffect } from "react";
import { useSubmit } from "remix";
import { DragAndDropForm } from "./DragAndDropForm";
import { SampleUrls } from "./SampleUrls";
import { useState } from "react";

type NewDocumentPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function NewDocumentPanel({ isOpen, onClose }: NewDocumentPanelProps) {
  const submit = useSubmit();
  const [inputValue, setInputValue] = useState("");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset input when panel opens
  useEffect(() => {
    if (isOpen) setInputValue("");
  }, [isOpen]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    const formData = new FormData();
    formData.append("jsonUrl", inputValue.trim());
    formData.append("title", inputValue.trim());
    onClose(); // Close panel first
    // Small delay to let panel close animation play, then navigate
    setTimeout(() => submit(formData, { method: "post", action: "/actions/createFromUrl" }), 300);
  }, [inputValue, onClose, submit]);

  // Ctrl+Enter to submit from textarea
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleSubmit();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleSubmit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="relative w-[480px] h-full bg-white dark:bg-slate-900 shadow-xl
                   border-l border-slate-200 dark:border-slate-700
                   animate-slide-in-right overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              New Document
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste JSON or enter a URL
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Textarea - unified input for JSON or URL */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Paste JSON or URL
            </label>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Paste your JSON here, or type a URL...'
              rows={6}
              className="w-full min-h-[140px] p-3 text-sm font-mono
                         bg-white dark:bg-slate-800
                         border border-slate-300 dark:border-slate-600
                         rounded-lg resize-y
                         text-slate-800 dark:text-slate-200
                         placeholder-slate-400 dark:placeholder-slate-500
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         transition outline-none"
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="w-full py-2.5 px-4 bg-lime-500 text-slate-900
                       font-bold text-sm rounded-lg uppercase
                       hover:bg-lime-600 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Open JSON →
          </button>

          {/* Drag & Drop - reuse existing component */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            </div>
            <DragAndDropForm />
          </div>

          {/* Samples */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Try a sample
            </p>
            <SampleUrls />
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded font-mono text-xs">Ctrl+Enter</kbd> to submit
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 添加滑入动画 CSS**

在 `app/tailwind.css` 末尾（或 `styles/tailwind.css` 中）添加：

```css
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 320ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

### Task 3: 修改 Header 组件 — "New" 按钮改为回调触发

**文件：**
- 修改：`app/components/Header.tsx`

- [ ] **Step 1: 添加 `onNewDocument` 可选 prop 并修改 New 按钮**

```tsx
// 在文件顶部添加类型
type HeaderProps = {
  onNewDocument?: () => void;
};

// 修改函数签名
export function Header({ onNewDocument }: HeaderProps) {
  const { doc } = useJsonDoc();
  // ... 其他代码不变
```

- [ ] **Step 2: 替换 New 按钮逻辑（第 51-65 行）**

将这段 Popover 包裹的 New 按钮：

```tsx
        <Popover>
          <PopoverTrigger>
            <button className="flex items-center justify-center bg-lime-500 text-slate-800 bg-opacity-90 text-base font-bold px-2 py-1 rounded uppercase hover:cursor-pointer hover:bg-opacity-100 transition">
              <PlusIcon className="w-4 h-4 mr-0.5"></PlusIcon>
              New
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" sideOffset={8}>
            <NewDocument />
            <PopoverArrow
              className="fill-current text-indigo-700"
              offset={20}
            />
          </PopoverContent>
        </Popover>
```

替换为：

```tsx
        {onNewDocument ? (
          <button
            onClick={onNewDocument}
            className="flex items-center justify-center bg-lime-500 text-slate-800 bg-opacity-90 text-base font-bold px-2 py-1 rounded uppercase hover:cursor-pointer hover:bg-opacity-100 transition"
          >
            <PlusIcon className="w-4 h-4 mr-0.5" />
            New
          </button>
        ) : (
          <Popover>
            <PopoverTrigger>
              <button className="flex items-center justify-center bg-lime-500 text-slate-800 bg-opacity-90 text-base font-bold px-2 py-1 rounded uppercase hover:cursor-pointer hover:bg-opacity-100 transition">
                <PlusIcon className="w-4 h-4 mr-0.5" />
                New
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" sideOffset={8}>
              <NewDocument />
              <PopoverArrow
                className="fill-current text-indigo-700"
                offset={20}
              />
            </PopoverContent>
          </Popover>
        )}
```

---

### Task 4: 修改 Footer 组件 — 兼容无 JsonDocProvider 的情况

**文件：**
- 修改：`app/components/Footer.tsx`

- [ ] **Step 1: 让 useJsonDoc 在无 Provider 时不抛错**

`useJsonDoc()` 使用 `invariant` 确保 context 存在，没有 Provider 时会抛错。首页不提供 JsonDocProvider，所以 Footer 需要兼容。

将：

```tsx
const { minimal } = useJsonDoc();
```

替换为：

```tsx
let minimal = false;
try {
  const jsonDoc = useJsonDoc();
  minimal = jsonDoc.minimal ?? false;
} catch {
  // No JsonDocProvider available (e.g., index page)
}
```

---

### Task 5: 重写 index.tsx — 三栏查看器入口

**文件：**
- 修改：`app/routes/index.tsx`

- [ ] **Step 1: 用三栏布局替换营销内容**

```tsx
import { useState } from "react";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { EmptyState } from "~/components/EmptyState";
import { NewDocumentPanel } from "~/components/NewDocumentPanel";

import {
  TemplateIcon,
  CodeIcon,
  DownloadIcon,
} from "@heroicons/react/outline";
import { TreeIcon } from "~/components/Icons/TreeIcon";

export default function Index() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col sm:overflow-hidden">
      <Header onNewDocument={() => setIsPanelOpen(true)} />

      <div className="bg-slate-50 flex-grow transition dark:bg-slate-900 overflow-y-auto">
        <div className="main-container flex justify-items-stretch h-full">
          {/* Sidebar — disabled icons for empty state */}
          <div className="side-bar flex flex-col align-center justify-between h-full p-1 bg-slate-200 transition dark:bg-slate-800">
            <ol className="relative">
              <li className="relative w-10 h-10 mb-1 text-slate-400 dark:text-slate-600 rounded-sm flex items-center justify-center">
                <TemplateIcon className="p-2 w-full h-full" />
              </li>
              <li className="relative w-10 h-10 mb-1 text-slate-400 dark:text-slate-600 rounded-sm flex items-center justify-center">
                <CodeIcon className="p-2 w-full h-full" />
              </li>
              <li className="relative w-10 h-10 mb-1 text-slate-400 dark:text-slate-600 rounded-sm flex items-center justify-center">
                <TreeIcon className="p-2 w-full h-full" />
              </li>
            </ol>
            <ol>
              <li className="relative w-10 h-10 mb-1 text-slate-400 dark:text-slate-600 rounded-sm flex items-center justify-center">
                <DownloadIcon className="p-2 w-full h-full" />
              </li>
            </ol>
          </div>

          {/* Center: Empty State */}
          <div className="path-bar-and-column-wrapper flex flex-col flex-grow overflow-x-hidden border-l border-slate-300 dark:border-slate-600">
            <EmptyState />
          </div>

          {/* InfoPanel placeholder */}
          <div
            className="w-[280px] p-4 bg-white border-l border-slate-300
                       transition dark:bg-slate-800 dark:border-slate-600
                       flex items-start justify-center"
          >
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-16 leading-relaxed">
              Open a document<br />
              to see previews,<br />
              schema,<br />
              and related values
            </p>
          </div>
        </div>
      </div>

      <Footer />

      <NewDocumentPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
```

注意：保留了必要的 import（toast 等功能），但去掉了所有营销相关组件。

---

### Task 6: 运行验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 验证首页空状态**

访问 `http://localhost:8787/` — 应看到：
- 顶栏：Logo + "by Trigger.dev" + "New" 按钮 + Delete/Share/GitHub/Discord（注意：Delete 和 Share 按钮会尝试使用 useJsonDoc，但没有 Provider 的情况下会抛错）

等等，这里有个问题。`Header.tsx` 还包含 Delete 和 Share 按钮，它们使用 `useJsonDoc()`：
- Delete 按钮：`{!doc.readOnly && ...}`
- Share 按钮：在 Popover 内，也需要 doc

没有 JsonDocProvider 时，`useJsonDoc()` 会抛错。所以 Header 也需要能处理无 doc 的情况。

- [ ] **修复：Header 需要兼容无 JsonDocProvider**

在 `app/components/Header.tsx` 中，将所有使用 `useJsonDoc()` 的地方包裹 try-catch：

```tsx
export function Header({ onNewDocument }: HeaderProps) {
  let doc: JSONDocument | undefined;
  try {
    doc = useJsonDoc().doc;
  } catch {
    // No JsonDocProvider — empty state
  }

  // Delete 按钮条件改为: {doc && !doc.readOnly && (...)}
  // Share 按钮条件改为: {doc && (...)}
  // DocumentTitle 条件改为: {doc && <DocumentTitle />}
```

需要修改的位置：
1. `const { doc } = useJsonDoc();` → try-catch
2. `{!doc.readOnly && (` → `{doc && !doc.readOnly && (`
3. `DocumentTitle` → `{doc && <DocumentTitle />}`
4. Share 按钮 — 只在有 doc 时显示

同时也需要引入 `JSONDocument` 类型：

```tsx
import type { JSONDocument } from "~/jsonDoc.server";
```

- [ ] **Step 3: 验证首页空状态（修正后）**

访问 `http://localhost:8787/` — 应看到：
- 顶栏：Logo + "by Trigger.dev" + "New" 按钮（触发面板）+ GitHub 星标 + Discord
- 左侧灰色图标栏（禁用样式）
- 中间空状态 "No document open"
- 右侧 "Open a document to see previews"
- 底部 Footer

- [ ] **Step 4: 验证面板**

点击 "New" 按钮 → 右侧面板滑入：
- 文本域可输入，等多个输入
- 拖拽区可见
- 示例链接可见
- "Open JSON →" 按钮在输入后可用
- Esc / ✕ 可关闭面板
- Ctrl+Enter 可提交

- [ ] **Step 5: 验证创建文档（粘贴 JSON）**

粘贴 `{"test": "hello"}` → 点击 "Open JSON →"：
- 面板关闭
- 页面导航到 `/j/[id]`
- 查看器正常渲染 JSON

- [ ] **Step 6: 验证创建文档（输入 URL）**

输入 `https://jsonplaceholder.typicode.com/todos/1` → 点击 "Open JSON →"：
- 面板关闭
- 页面导航到 `/j/[id]`
- 查看器正常渲染 JSON

- [ ] **Step 7: 验证拖拽上传**

拖入一个 `.json` 文件到面板的拖拽区：
- 页面导航到 `/j/[id]`
- 查看器正常渲染

- [ ] **Step 8: 验证示例链接**

点击 "Tweet JSON" 等示例链接：
- 导航到对应的 `/j/[id]`
- 查看器正常渲染

- [ ] **Step 9: 验证原 /j/$id 页面不受影响**

直接访问 `http://localhost:8787/j/some-existing-id`（如 `j/PjHo1o5MVeH4`）：
- 完整三栏查看器正常渲染
- "New" 按钮保持 Popover 行为（未传入 onNewDocument prop，走 else 分支）
- Delete/Share 按钮正常工作

---

### 回退计划

如果出现严重问题，回滚所有文件修改：

```bash
git checkout -- app/routes/index.tsx app/components/Header.tsx app/components/Footer.tsx
rm -f app/components/EmptyState.tsx app/components/NewDocumentPanel.tsx
```
