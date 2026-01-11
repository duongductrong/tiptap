import type * as React from "react"
import type { Editor } from "@tiptap/react"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  ImageUp,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Redo,
  Strikethrough,
  TextQuote,
  Type,
  Underline,
  Undo,
} from "lucide-react"

// =============================================================================
// Types
// =============================================================================

export interface EditorActionConfig<TEditor = unknown> {
  key: string
  icon?: React.ElementType
  label: string
  description?: string
  execute: (editor: TEditor, options?: Record<string, unknown>) => void
  canExecute?: (editor: TEditor) => boolean
  isActive?: (editor: TEditor) => boolean
}

// =============================================================================
// EditorActionRegistry
// =============================================================================

export class EditorActionRegistry<TEditor = unknown> {
  private actions = new Map<string, EditorActionConfig<TEditor>>()

  register(config: EditorActionConfig<TEditor>): this {
    this.actions.set(config.key, config)
    return this
  }

  registerMany(configs: EditorActionConfig<TEditor>[]): this {
    for (const config of configs) {
      this.register(config)
    }
    return this
  }

  unregister(key: string): this {
    this.actions.delete(key)
    return this
  }

  extend(registry: EditorActionRegistry<TEditor>): this {
    for (const config of registry.values()) {
      this.register(config)
    }
    return this
  }

  get(key: string): EditorActionConfig<TEditor> | undefined {
    return this.actions.get(key)
  }

  has(key: string): boolean {
    return this.actions.has(key)
  }

  keys(): string[] {
    return Array.from(this.actions.keys())
  }

  values(): EditorActionConfig<TEditor>[] {
    return Array.from(this.actions.values())
  }

  size(): number {
    return this.actions.size
  }

  execute(
    editor: TEditor | null,
    key: string,
    options?: Record<string, unknown>
  ): void {
    if (!editor) return
    const action = this.get(key)
    action?.execute(editor, options)
  }

  canExecute(editor: TEditor | null, key: string): boolean {
    if (!editor) return false
    const action = this.get(key)
    return action?.canExecute?.(editor) ?? true
  }

  isActive(editor: TEditor | null, key: string): boolean {
    if (!editor) return false
    const action = this.get(key)
    return action?.isActive?.(editor) ?? false
  }

  getActiveKeys(editor: TEditor | null): string[] {
    if (!editor) return []
    return this.keys().filter((key) => this.isActive(editor, key))
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createEditorRegistry<
  TEditor = unknown,
>(): EditorActionRegistry<TEditor> {
  return new EditorActionRegistry<TEditor>()
}

// =============================================================================
// Default Registry with All Actions
// =============================================================================

export const defaultEditorRegistry = createEditorRegistry<Editor>()
  // History
  .register({
    key: "undo",
    icon: Undo,
    label: "Undo",
    description: "Undo the last action",
    execute: (editor) => editor.chain().focus().undo().run(),
    canExecute: (editor) => editor.can().chain().focus().undo().run(),
  })
  .register({
    key: "redo",
    icon: Redo,
    label: "Redo",
    description: "Redo the last action",
    execute: (editor) => editor.chain().focus().redo().run(),
    canExecute: (editor) => editor.can().chain().focus().redo().run(),
  })
  // Text formatting
  .register({
    key: "bold",
    icon: Bold,
    label: "Bold",
    description: "Make text bold",
    execute: (editor) => editor.chain().focus().toggleBold().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
  })
  .register({
    key: "italic",
    icon: Italic,
    label: "Italic",
    description: "Italicize text",
    execute: (editor) => editor.chain().focus().toggleItalic().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
  })
  .register({
    key: "underline",
    icon: Underline,
    label: "Underline",
    description: "Underline text",
    execute: (editor) => editor.chain().focus().toggleUnderline().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive("underline"),
  })
  .register({
    key: "strike",
    icon: Strikethrough,
    label: "Strikethrough",
    description: "Strike through text",
    execute: (editor) => editor.chain().focus().toggleStrike().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
  })
  .register({
    key: "code",
    icon: Code,
    label: "Code",
    description: "Format text as code",
    execute: (editor) => editor.chain().focus().toggleCode().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive("code"),
  })
  // Block types
  .register({
    key: "paragraph",
    icon: Type,
    label: "Text",
    description: "Start writing with plain text",
    execute: (editor) => editor.chain().focus().setParagraph().run(),
    canExecute: (editor) => editor.can().chain().focus().setParagraph().run(),
    isActive: (editor) => editor.isActive("paragraph"),
  })
  .register({
    key: "heading1",
    icon: Heading1,
    label: "Heading 1",
    description: "Use this for main titles",
    execute: (editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  })
  .register({
    key: "heading2",
    icon: Heading2,
    label: "Heading 2",
    description: "Ideal for subsections",
    execute: (editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  })
  .register({
    key: "heading3",
    icon: Heading3,
    label: "Heading 3",
    description: "Use for smaller subsections",
    execute: (editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  })
  .register({
    key: "heading4",
    icon: Heading4,
    label: "Heading 4",
    description: "Suitable for detailed sections",
    execute: (editor) => editor.chain().focus().setHeading({ level: 4 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 4 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 4 }),
  })
  .register({
    key: "heading5",
    icon: Heading5,
    label: "Heading 5",
    description: "For minor details",
    execute: (editor) => editor.chain().focus().setHeading({ level: 5 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 5 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 5 }),
  })
  .register({
    key: "heading6",
    icon: Heading6,
    label: "Heading 6",
    description: "Use for the smallest details",
    execute: (editor) => editor.chain().focus().setHeading({ level: 6 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 6 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 6 }),
  })
  .register({
    key: "blockquote",
    icon: TextQuote,
    label: "Quote",
    description: "Capture a quote",
    execute: (editor) => editor.chain().focus().toggleBlockquote().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
  })
  .register({
    key: "codeBlock",
    icon: Code,
    label: "Code Block",
    description: "Add a code block",
    execute: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
  })
  .register({
    key: "divider",
    icon: Minus,
    label: "Divider",
    description: "Visually divide blocks",
    execute: (editor) => editor.chain().focus().setHorizontalRule().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHorizontalRule().run(),
  })
  // Lists
  .register({
    key: "bulletList",
    icon: List,
    label: "Bullet List",
    description: "Create a bullet list",
    execute: (editor) => editor.chain().focus().toggleBulletList().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  })
  .register({
    key: "orderedList",
    icon: ListOrdered,
    label: "Ordered List",
    description: "Create an ordered list",
    execute: (editor) => editor.chain().focus().toggleOrderedList().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  })
  .register({
    key: "taskList",
    icon: CheckSquare,
    label: "Task List",
    description: "Create a task list with checkboxes",
    execute: (editor) => editor.chain().focus().toggleTaskList().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleTaskList().run(),
    isActive: (editor) => editor.isActive("taskList"),
  })
  // Text alignment
  .register({
    key: "left",
    icon: AlignLeft,
    label: "Left",
    description: "Align text to the left",
    execute: (editor) => editor.chain().focus().setTextAlign("left").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("left").run(),
    isActive: (editor) => editor.isActive({ textAlign: "left" }),
  })
  .register({
    key: "center",
    icon: AlignCenter,
    label: "Center",
    description: "Align text to the center",
    execute: (editor) => editor.chain().focus().setTextAlign("center").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("center").run(),
    isActive: (editor) => editor.isActive({ textAlign: "center" }),
  })
  .register({
    key: "right",
    icon: AlignRight,
    label: "Right",
    description: "Align text to the right",
    execute: (editor) => editor.chain().focus().setTextAlign("right").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("right").run(),
    isActive: (editor) => editor.isActive({ textAlign: "right" }),
  })
  .register({
    key: "justify",
    icon: AlignJustify,
    label: "Justify",
    description: "Align text to justify",
    execute: (editor) => editor.chain().focus().setTextAlign("justify").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("justify").run(),
    isActive: (editor) => editor.isActive({ textAlign: "justify" }),
  })
  // Image
  .register({
    key: "image",
    icon: ImageUp,
    label: "Image",
    description: "Upload or embed an image",
    execute: (editor, options) =>
      editor
        .chain()
        .focus()
        .setImage({
          src: options?.src as string,
          alt: options?.alt as string,
          title: options?.title as string,
        })
        .run(),
    canExecute: () => true,
  })
  // Highlight
  .register({
    key: "highlight",
    icon: Highlighter,
    label: "Highlight",
    description: "Highlight selected text",
    execute: (editor) => editor.chain().focus().toggleHighlight().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleHighlight().run(),
    isActive: (editor) => editor.isActive("highlight"),
  })
  // Link
  .register({
    key: "setLink",
    icon: Link2,
    label: "Add Link",
    description: "Insert a hyperlink",
    execute: (editor, options) =>
      editor
        .chain()
        .focus()
        .setLink({ href: options?.href as string })
        .run(),
    canExecute: () => true,
    isActive: (editor) => editor.isActive("link"),
  })
  .register({
    key: "unsetLink",
    icon: Link2Off,
    label: "Remove Link",
    description: "Remove the hyperlink",
    execute: (editor) => editor.chain().focus().unsetLink().run(),
    canExecute: (editor) => editor.isActive("link"),
    isActive: (editor) => editor.isActive("link"),
  })
  // Table actions
  .register({
    key: "insertTable",
    label: "Insert Table",
    description: "Insert a new table",
    execute: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
    canExecute: (editor) =>
      editor.can().chain().focus().insertTable({ rows: 3, cols: 3 }).run(),
  })
  .register({
    key: "addColumnBefore",
    label: "Add Column Before",
    execute: (editor) => editor.chain().focus().addColumnBefore().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().addColumnBefore().run(),
  })
  .register({
    key: "addColumnAfter",
    label: "Add Column After",
    execute: (editor) => editor.chain().focus().addColumnAfter().run(),
    canExecute: (editor) => editor.can().chain().focus().addColumnAfter().run(),
  })
  .register({
    key: "deleteColumn",
    label: "Delete Column",
    execute: (editor) => editor.chain().focus().deleteColumn().run(),
    canExecute: (editor) => editor.can().chain().focus().deleteColumn().run(),
  })
  .register({
    key: "addRowBefore",
    label: "Add Row Before",
    execute: (editor) => editor.chain().focus().addRowBefore().run(),
    canExecute: (editor) => editor.can().chain().focus().addRowBefore().run(),
  })
  .register({
    key: "addRowAfter",
    label: "Add Row After",
    execute: (editor) => editor.chain().focus().addRowAfter().run(),
    canExecute: (editor) => editor.can().chain().focus().addRowAfter().run(),
  })
  .register({
    key: "deleteRow",
    label: "Delete Row",
    execute: (editor) => editor.chain().focus().deleteRow().run(),
    canExecute: (editor) => editor.can().chain().focus().deleteRow().run(),
  })
  .register({
    key: "deleteTable",
    label: "Delete Table",
    execute: (editor) => editor.chain().focus().deleteTable().run(),
    canExecute: (editor) => editor.can().chain().focus().deleteTable().run(),
  })
  .register({
    key: "mergeCells",
    label: "Merge Cells",
    execute: (editor) => editor.chain().focus().mergeCells().run(),
    canExecute: (editor) => editor.can().chain().focus().mergeCells().run(),
  })
  .register({
    key: "splitCell",
    label: "Split Cell",
    execute: (editor) => editor.chain().focus().splitCell().run(),
    canExecute: (editor) => editor.can().chain().focus().splitCell().run(),
  })
  .register({
    key: "toggleHeaderColumn",
    label: "Toggle Header Column",
    execute: (editor) => editor.chain().focus().toggleHeaderColumn().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleHeaderColumn().run(),
  })
  .register({
    key: "toggleHeaderRow",
    label: "Toggle Header Row",
    execute: (editor) => editor.chain().focus().toggleHeaderRow().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleHeaderRow().run(),
  })
  .register({
    key: "toggleHeaderCell",
    label: "Toggle Header Cell",
    execute: (editor) => editor.chain().focus().toggleHeaderCell().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleHeaderCell().run(),
  })
  .register({
    key: "mergeOrSplit",
    label: "Merge or Split",
    execute: (editor) => editor.chain().focus().mergeOrSplit().run(),
    canExecute: (editor) => editor.can().chain().focus().mergeOrSplit().run(),
  })
  .register({
    key: "goToNextCell",
    label: "Go to Next Cell",
    execute: (editor) => editor.chain().focus().goToNextCell().run(),
    canExecute: (editor) => editor.can().chain().focus().goToNextCell().run(),
  })
  .register({
    key: "goToPreviousCell",
    label: "Go to Previous Cell",
    execute: (editor) => editor.chain().focus().goToPreviousCell().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().goToPreviousCell().run(),
  })
