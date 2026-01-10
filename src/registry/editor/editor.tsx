"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import * as React from "react"

import { TextAlign } from "@tiptap/extension-text-align"
import TiptapTypography from "@tiptap/extension-typography"
import TiptapUnderline from "@tiptap/extension-underline"
import {
  BubbleMenu,
  Editor,
  Extensions,
  FloatingMenu,
  EditorContent as TiptapEditorContent,
  useEditorState,
  useEditor as useTiptapEditor,
  type UseEditorOptions,
} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  CheckSquare,
  ChevronDown,
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
import { EditorBubbleMenuLink } from "./editor-link"
import { EDITOR_PLACEHOLDER_CLASSES } from "./editor-placeholder"

// =============================================================================
// Constants
// =============================================================================

export const EDITOR_ACTIONS = {
  // @tiptap/starter-kit
  undo: "undo",
  redo: "redo",
  bold: "bold",
  italic: "italic",
  strike: "strike",
  code: "code",
  divider: "divider",
  heading1: "heading1",
  heading2: "heading2",
  heading3: "heading3",
  heading4: "heading4",
  heading5: "heading5",
  heading6: "heading6",
  text: "paragraph",
  blockquote: "blockquote",
  bulletList: "bulletList",
  orderedList: "orderedList",
  codeBlock: "codeBlock",
  // @tiptap/extension-underline
  underline: "underline",
  // Text alignment
  left: "left",
  center: "center",
  right: "right",
  justify: "justify",
  // Image
  image: "image",
  // Table
  insertTable: "insertTable",
  addColumnBefore: "addColumnBefore",
  addColumnAfter: "addColumnAfter",
  deleteColumn: "deleteColumn",
  addRowBefore: "addRowBefore",
  addRowAfter: "addRowAfter",
  deleteRow: "deleteRow",
  deleteTable: "deleteTable",
  mergeCells: "mergeCells",
  splitCell: "splitCell",
  toggleHeaderColumn: "toggleHeaderColumn",
  toggleHeaderRow: "toggleHeaderRow",
  toggleHeaderCell: "toggleHeaderCell",
  mergeOrSplit: "mergeOrSplit",
  goToNextCell: "goToNextCell",
  goToPreviousCell: "goToPreviousCell",
  // Task list
  taskList: "taskList",
  // Highlight
  highlight: "highlight",
  // Link
  setLink: "setLink",
  unsetLink: "unsetLink",
} as const

export type EditorAction = (typeof EDITOR_ACTIONS)[keyof typeof EDITOR_ACTIONS]

const EDITOR_TEXT_ALIGN_ACTIONS: EditorAction[] = [
  EDITOR_ACTIONS.left,
  EDITOR_ACTIONS.center,
  EDITOR_ACTIONS.right,
  EDITOR_ACTIONS.justify,
]

// =============================================================================
// Types
// =============================================================================

export interface EditorBlock {
  key: EditorAction
  icon: React.ElementType
  label: string
  description: string
}

export const EDITOR_BLOCKS_MAP = new Map<EditorAction, EditorBlock>([
  [
    EDITOR_ACTIONS.undo,
    {
      key: EDITOR_ACTIONS.undo,
      icon: Undo,
      label: "Undo",
      description: "Undo the last action",
    },
  ],
  [
    EDITOR_ACTIONS.redo,
    {
      key: EDITOR_ACTIONS.redo,
      icon: Redo,
      label: "Redo",
      description: "Redo the last action",
    },
  ],
  [
    EDITOR_ACTIONS.text,
    {
      key: EDITOR_ACTIONS.text,
      icon: Type,
      label: "Text",
      description: "Start writing with plain text",
    },
  ],
  [
    EDITOR_ACTIONS.heading1,
    {
      key: EDITOR_ACTIONS.heading1,
      icon: Heading1,
      label: "Heading 1",
      description: "Use this for main titles",
    },
  ],
  [
    EDITOR_ACTIONS.heading2,
    {
      key: EDITOR_ACTIONS.heading2,
      icon: Heading2,
      label: "Heading 2",
      description: "Ideal for subsections",
    },
  ],
  [
    EDITOR_ACTIONS.heading3,
    {
      key: EDITOR_ACTIONS.heading3,
      icon: Heading3,
      label: "Heading 3",
      description: "Use for smaller subsections",
    },
  ],
  [
    EDITOR_ACTIONS.heading4,
    {
      key: EDITOR_ACTIONS.heading4,
      icon: Heading4,
      label: "Heading 4",
      description: "Suitable for detailed sections",
    },
  ],
  [
    EDITOR_ACTIONS.heading5,
    {
      key: EDITOR_ACTIONS.heading5,
      icon: Heading5,
      label: "Heading 5",
      description: "For minor details",
    },
  ],
  [
    EDITOR_ACTIONS.heading6,
    {
      key: EDITOR_ACTIONS.heading6,
      icon: Heading6,
      label: "Heading 6",
      description: "Use for the smallest details",
    },
  ],
  [
    EDITOR_ACTIONS.blockquote,
    {
      key: EDITOR_ACTIONS.blockquote,
      icon: TextQuote,
      label: "Quote",
      description: "Capture a quote",
    },
  ],
  [
    EDITOR_ACTIONS.bold,
    {
      key: EDITOR_ACTIONS.bold,
      icon: Bold,
      label: "Bold",
      description: "Make text bold",
    },
  ],
  [
    EDITOR_ACTIONS.italic,
    {
      key: EDITOR_ACTIONS.italic,
      icon: Italic,
      label: "Italic",
      description: "Italicize text",
    },
  ],
  [
    EDITOR_ACTIONS.underline,
    {
      key: EDITOR_ACTIONS.underline,
      icon: Underline,
      label: "Underline",
      description: "Underline text",
    },
  ],
  [
    EDITOR_ACTIONS.strike,
    {
      key: EDITOR_ACTIONS.strike,
      icon: Strikethrough,
      label: "Strikethrough",
      description: "Strike through text",
    },
  ],
  [
    EDITOR_ACTIONS.code,
    {
      key: EDITOR_ACTIONS.code,
      icon: Code,
      label: "Code",
      description: "Format text as code",
    },
  ],
  [
    EDITOR_ACTIONS.divider,
    {
      key: EDITOR_ACTIONS.divider,
      icon: Minus,
      label: "Divider",
      description: "Visually divide blocks",
    },
  ],
  [
    EDITOR_ACTIONS.bulletList,
    {
      key: EDITOR_ACTIONS.bulletList,
      icon: List,
      label: "Bullet List",
      description: "Create a bullet list",
    },
  ],
  [
    EDITOR_ACTIONS.orderedList,
    {
      key: EDITOR_ACTIONS.orderedList,
      icon: ListOrdered,
      label: "Ordered List",
      description: "Create an ordered list",
    },
  ],
  [
    EDITOR_ACTIONS.left,
    {
      key: EDITOR_ACTIONS.left,
      icon: AlignLeft,
      label: "Left",
      description: "Align text to the left",
    },
  ],
  [
    EDITOR_ACTIONS.center,
    {
      key: EDITOR_ACTIONS.center,
      icon: AlignCenter,
      label: "Center",
      description: "Align text to the center",
    },
  ],
  [
    EDITOR_ACTIONS.right,
    {
      key: EDITOR_ACTIONS.right,
      icon: AlignRight,
      label: "Right",
      description: "Align text to the right",
    },
  ],
  [
    EDITOR_ACTIONS.justify,
    {
      key: EDITOR_ACTIONS.justify,
      icon: AlignJustify,
      label: "Justify",
      description: "Align text to justify",
    },
  ],
  [
    EDITOR_ACTIONS.image,
    {
      key: EDITOR_ACTIONS.image,
      icon: ImageUp,
      label: "Image",
      description: "Upload or embed an image",
    },
  ],
  [
    EDITOR_ACTIONS.taskList,
    {
      key: EDITOR_ACTIONS.taskList,
      icon: CheckSquare,
      label: "Task List",
      description: "Create a task list with checkboxes",
    },
  ],
  [
    EDITOR_ACTIONS.highlight,
    {
      key: EDITOR_ACTIONS.highlight,
      icon: Highlighter,
      label: "Highlight",
      description: "Highlight selected text",
    },
  ],
  [
    EDITOR_ACTIONS.setLink,
    {
      key: EDITOR_ACTIONS.setLink,
      icon: Link2,
      label: "Add Link",
      description: "Insert a hyperlink",
    },
  ],
  [
    EDITOR_ACTIONS.unsetLink,
    {
      key: EDITOR_ACTIONS.unsetLink,
      icon: Link2Off,
      label: "Remove Link",
      description: "Remove the hyperlink",
    },
  ],
])

// =============================================================================
// Default Extensions
// =============================================================================

export const defaultExtensions = [
  StarterKit.configure({
    codeBlock: false, // Use CodeBlock extension separately
  }),
  TiptapUnderline.configure({
    HTMLAttributes: {
      class: "underline underline-offset-4",
    },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph", "blockquote", "bulletList", "orderedList"],
  }),
  TiptapTypography.configure({}),
]

// =============================================================================
// Context
// =============================================================================

export interface EditorContextValue {
  editor: Editor | null
}

export const EditorContext = React.createContext<EditorContextValue | null>(
  null
)

export function useEditor(): EditorContextValue {
  const ctx = React.useContext(EditorContext)
  if (!ctx) {
    throw new Error("useEditor must be used within EditorProvider")
  }
  return ctx
}

// =============================================================================
// Utility Functions
// =============================================================================

export function canUseEditorAction(
  editor: Editor | null,
  action: EditorAction
): boolean {
  if (!editor) return false

  switch (action) {
    case EDITOR_ACTIONS.undo:
      return editor.can().chain().focus().undo().run()
    case EDITOR_ACTIONS.redo:
      return editor.can().chain().focus().redo().run()
    case EDITOR_ACTIONS.text:
      return editor.can().chain().focus().setParagraph().run()
    case EDITOR_ACTIONS.heading1:
      return editor.can().chain().focus().setHeading({ level: 1 }).run()
    case EDITOR_ACTIONS.heading2:
      return editor.can().chain().focus().setHeading({ level: 2 }).run()
    case EDITOR_ACTIONS.heading3:
      return editor.can().chain().focus().setHeading({ level: 3 }).run()
    case EDITOR_ACTIONS.heading4:
      return editor.can().chain().focus().setHeading({ level: 4 }).run()
    case EDITOR_ACTIONS.heading5:
      return editor.can().chain().focus().setHeading({ level: 5 }).run()
    case EDITOR_ACTIONS.heading6:
      return editor.can().chain().focus().setHeading({ level: 6 }).run()
    case EDITOR_ACTIONS.codeBlock:
      return editor.can().chain().focus().toggleCodeBlock().run()
    case EDITOR_ACTIONS.divider:
      return editor.can().chain().focus().setHorizontalRule().run()
    case EDITOR_ACTIONS.bold:
      return editor.can().chain().focus().toggleBold().run()
    case EDITOR_ACTIONS.italic:
      return editor.can().chain().focus().toggleItalic().run()
    case EDITOR_ACTIONS.strike:
      return editor.can().chain().focus().toggleStrike().run()
    case EDITOR_ACTIONS.code:
      return editor.can().chain().focus().toggleCode().run()
    case EDITOR_ACTIONS.blockquote:
      return editor.can().chain().focus().setBlockquote().run()
    case EDITOR_ACTIONS.bulletList:
      return editor.can().chain().focus().toggleBulletList().run()
    case EDITOR_ACTIONS.orderedList:
      return editor.can().chain().focus().toggleOrderedList().run()
    case EDITOR_ACTIONS.left:
      return editor.can().chain().focus().setTextAlign("left").run()
    case EDITOR_ACTIONS.center:
      return editor.can().chain().focus().setTextAlign("center").run()
    case EDITOR_ACTIONS.right:
      return editor.can().chain().focus().setTextAlign("right").run()
    case EDITOR_ACTIONS.underline:
      return editor.can().chain().focus().toggleUnderline().run()
    case EDITOR_ACTIONS.image:
      return true
    case EDITOR_ACTIONS.insertTable:
      return editor
        .can()
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3 })
        .run()
    case EDITOR_ACTIONS.addColumnBefore:
      return editor.can().chain().focus().addColumnBefore().run()
    case EDITOR_ACTIONS.addColumnAfter:
      return editor.can().chain().focus().addColumnAfter().run()
    case EDITOR_ACTIONS.deleteColumn:
      return editor.can().chain().focus().deleteColumn().run()
    case EDITOR_ACTIONS.addRowBefore:
      return editor.can().chain().focus().addRowBefore().run()
    case EDITOR_ACTIONS.addRowAfter:
      return editor.can().chain().focus().addRowAfter().run()
    case EDITOR_ACTIONS.deleteRow:
      return editor.can().chain().focus().deleteRow().run()
    case EDITOR_ACTIONS.deleteTable:
      return editor.can().chain().focus().deleteTable().run()
    case EDITOR_ACTIONS.mergeCells:
      return editor.can().chain().focus().mergeCells().run()
    case EDITOR_ACTIONS.splitCell:
      return editor.can().chain().focus().splitCell().run()
    case EDITOR_ACTIONS.toggleHeaderColumn:
      return editor.can().chain().focus().toggleHeaderColumn().run()
    case EDITOR_ACTIONS.toggleHeaderRow:
      return editor.can().chain().focus().toggleHeaderRow().run()
    case EDITOR_ACTIONS.toggleHeaderCell:
      return editor.can().chain().focus().toggleHeaderCell().run()
    case EDITOR_ACTIONS.mergeOrSplit:
      return editor.can().chain().focus().mergeOrSplit().run()
    case EDITOR_ACTIONS.goToNextCell:
      return editor.can().chain().focus().goToNextCell().run()
    case EDITOR_ACTIONS.goToPreviousCell:
      return editor.can().chain().focus().goToPreviousCell().run()
    case EDITOR_ACTIONS.taskList:
      return editor.can().chain().focus().toggleTaskList().run()
    case EDITOR_ACTIONS.highlight:
      return editor.can().chain().focus().toggleHighlight().run()
    case EDITOR_ACTIONS.setLink:
      return true
    case EDITOR_ACTIONS.unsetLink:
      return editor.isActive("link")
    default:
      return true
  }
}

export function executeEditorAction(
  editor: Editor | null,
  action: EditorAction,
  options: Record<string, unknown> = {}
): void {
  if (!editor) return

  switch (action) {
    case EDITOR_ACTIONS.undo:
      editor.chain().focus().undo().run()
      break
    case EDITOR_ACTIONS.redo:
      editor.chain().focus().redo().run()
      break
    case EDITOR_ACTIONS.text:
      editor.chain().focus().setParagraph().run()
      break
    case EDITOR_ACTIONS.heading1:
      editor.chain().focus().setHeading({ level: 1 }).run()
      break
    case EDITOR_ACTIONS.heading2:
      editor.chain().focus().setHeading({ level: 2 }).run()
      break
    case EDITOR_ACTIONS.heading3:
      editor.chain().focus().setHeading({ level: 3 }).run()
      break
    case EDITOR_ACTIONS.heading4:
      editor.chain().focus().setHeading({ level: 4 }).run()
      break
    case EDITOR_ACTIONS.heading5:
      editor.chain().focus().setHeading({ level: 5 }).run()
      break
    case EDITOR_ACTIONS.heading6:
      editor.chain().focus().setHeading({ level: 6 }).run()
      break
    case EDITOR_ACTIONS.codeBlock:
      editor.chain().focus().toggleCodeBlock().run()
      break
    case EDITOR_ACTIONS.divider:
      editor.chain().focus().setHorizontalRule().run()
      break
    case EDITOR_ACTIONS.bold:
      editor.chain().focus().toggleBold().run()
      break
    case EDITOR_ACTIONS.italic:
      editor.chain().focus().toggleItalic().run()
      break
    case EDITOR_ACTIONS.strike:
      editor.chain().focus().toggleStrike().run()
      break
    case EDITOR_ACTIONS.code:
      editor.chain().focus().toggleCode().run()
      break
    case EDITOR_ACTIONS.blockquote:
      editor.chain().focus().setBlockquote().run()
      break
    case EDITOR_ACTIONS.bulletList:
      editor.chain().focus().toggleBulletList().run()
      break
    case EDITOR_ACTIONS.orderedList:
      editor.chain().focus().toggleOrderedList().run()
      break
    case EDITOR_ACTIONS.left:
      editor.chain().focus().setTextAlign("left").run()
      break
    case EDITOR_ACTIONS.center:
      editor.chain().focus().setTextAlign("center").run()
      break
    case EDITOR_ACTIONS.right:
      editor.chain().focus().setTextAlign("right").run()
      break
    case EDITOR_ACTIONS.justify:
      editor.chain().focus().setTextAlign("justify").run()
      break
    case EDITOR_ACTIONS.underline:
      editor.chain().focus().toggleUnderline().run()
      break
    case EDITOR_ACTIONS.image:
      editor
        .chain()
        .focus()
        .setImage({
          src: options.src as string,
          alt: options.alt as string,
          title: options.title as string,
        })
        .run()
      break
    case EDITOR_ACTIONS.insertTable:
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
      break
    case EDITOR_ACTIONS.addColumnBefore:
      editor.chain().focus().addColumnBefore().run()
      break
    case EDITOR_ACTIONS.addColumnAfter:
      editor.chain().focus().addColumnAfter().run()
      break
    case EDITOR_ACTIONS.deleteColumn:
      editor.chain().focus().deleteColumn().run()
      break
    case EDITOR_ACTIONS.addRowBefore:
      editor.chain().focus().addRowBefore().run()
      break
    case EDITOR_ACTIONS.addRowAfter:
      editor.chain().focus().addRowAfter().run()
      break
    case EDITOR_ACTIONS.deleteRow:
      editor.chain().focus().deleteRow().run()
      break
    case EDITOR_ACTIONS.deleteTable:
      editor.chain().focus().deleteTable().run()
      break
    case EDITOR_ACTIONS.mergeCells:
      editor.chain().focus().mergeCells().run()
      break
    case EDITOR_ACTIONS.splitCell:
      editor.chain().focus().splitCell().run()
      break
    case EDITOR_ACTIONS.toggleHeaderColumn:
      editor.chain().focus().toggleHeaderColumn().run()
      break
    case EDITOR_ACTIONS.toggleHeaderRow:
      editor.chain().focus().toggleHeaderRow().run()
      break
    case EDITOR_ACTIONS.toggleHeaderCell:
      editor.chain().focus().toggleHeaderCell().run()
      break
    case EDITOR_ACTIONS.mergeOrSplit:
      editor.chain().focus().mergeOrSplit().run()
      break
    case EDITOR_ACTIONS.goToNextCell:
      editor.chain().focus().goToNextCell().run()
      break
    case EDITOR_ACTIONS.goToPreviousCell:
      editor.chain().focus().goToPreviousCell().run()
      break
    case EDITOR_ACTIONS.taskList:
      editor.chain().focus().toggleTaskList().run()
      break
    case EDITOR_ACTIONS.highlight:
      editor.chain().focus().toggleHighlight().run()
      break
    case EDITOR_ACTIONS.unsetLink:
      editor.chain().focus().unsetLink().run()
      break
  }
}

export function getActiveEditorActions(editor: Editor | null): EditorAction[] {
  if (!editor) return [EDITOR_ACTIONS.text]

  const keys: Set<EditorAction> = new Set()

  if (editor.isActive("heading")) {
    const headingLevel = editor.getAttributes("heading").level
    const headingMap = `heading${headingLevel}` as EditorAction
    if (EDITOR_BLOCKS_MAP.has(headingMap)) {
      keys.add(headingMap)
    }
  }

  EDITOR_BLOCKS_MAP.forEach((block) => {
    if (EDITOR_TEXT_ALIGN_ACTIONS.includes(block.key)) {
      if (editor.isActive({ textAlign: block.key })) {
        keys.add(block.key)
      }
    } else if (editor.isActive(block.key)) {
      keys.add(block.key)
    }
  })

  // Paragraph (text) has lowest priority - if any other block is active, hide paragraph
  if (keys.size > 1 && keys.has(EDITOR_ACTIONS.text)) {
    keys.delete(EDITOR_ACTIONS.text)
  }

  return keys.size > 0 ? Array.from(keys) : [EDITOR_ACTIONS.text]
}

// =============================================================================
// EditorProvider
// =============================================================================

type NestedArray<T> = T | NestedArray<T>[]

export type EditorExtensions = NestedArray<Extensions[number]>

export interface EditorProviderProps
  extends React.PropsWithChildren, Omit<UseEditorOptions, "extensions"> {
  content?: string
  extensions?: EditorExtensions[]
  className?: string
}

const EditorProvider = React.forwardRef<HTMLDivElement, EditorProviderProps>(
  (
    { content, extensions = [], children, className, ...editorOptions },
    ref
  ) => {
    const editor = useTiptapEditor({
      content,
      extensions: toLatentArray(defaultExtensions, extensions),
      ...editorOptions,
    })

    const contextValue = React.useMemo<EditorContextValue>(
      () => ({ editor }),
      [editor]
    )

    return (
      <EditorContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("relative", className)}
          data-editor-root=""
        >
          {children}
        </div>
      </EditorContext.Provider>
    )
  }
)
EditorProvider.displayName = "EditorProvider"

// =============================================================================
// EditorContent
// =============================================================================

export interface EditorContentProps extends Omit<
  React.ComponentProps<typeof TiptapEditorContent>,
  "editor"
> {}

const EditorContent = React.forwardRef<HTMLDivElement, EditorContentProps>(
  ({ className, ...props }, ref) => {
    const { editor } = useEditor()

    if (!editor) return null

    return (
      <TiptapEditorContent
        ref={ref}
        editor={editor}
        className={cn(
          "w-full",
          "[&>*]:outline-none",
          // Inline code styles
          "[&_.ProseMirror_code]:bg-muted",
          "[&_.ProseMirror_code]:rounded",
          "[&_.ProseMirror_code]:px-1.5",
          "[&_.ProseMirror_code]:py-0.5",
          "[&_.ProseMirror_code]:font-mono",
          "[&_.ProseMirror_code]:text-[0.875em]",
          // Task list styles
          "[&_.ProseMirror_ul[data-type=taskList]]:list-none",
          "[&_.ProseMirror_ul[data-type=taskList]]:pl-0",
          "[&_.ProseMirror_ul[data-type=taskList]]:my-2",
          "[&_.ProseMirror_ul[data-type=taskList]_li]:flex",
          "[&_.ProseMirror_ul[data-type=taskList]_li]:items-start",
          "[&_.ProseMirror_ul[data-type=taskList]_li]:gap-2",
          "[&_.ProseMirror_ul[data-type=taskList]_li]:my-1",
          "[&_.ProseMirror_ul[data-type=taskList]_li>label]:shrink-0",
          "[&_.ProseMirror_ul[data-type=taskList]_li>label]:mt-0.5",
          "[&_.ProseMirror_ul[data-type=taskList]_li>label>input[type=checkbox]]:cursor-pointer",
          "[&_.ProseMirror_ul[data-type=taskList]_li>label>input[type=checkbox]]:size-4",
          "[&_.ProseMirror_ul[data-type=taskList]_li>label>input[type=checkbox]]:accent-primary",
          "[&_.ProseMirror_ul[data-type=taskList]_li>div]:flex-1",
          "[&_.ProseMirror_ul[data-type=taskList]_li[data-checked=true]>div]:line-through",
          "[&_.ProseMirror_ul[data-type=taskList]_li[data-checked=true]>div]:opacity-60",
          // Placeholder styles
          EDITOR_PLACEHOLDER_CLASSES,
          className
        )}
        {...props}
      />
    )
  }
)
EditorContent.displayName = "EditorContent"

// =============================================================================
// EditorToolbar
// =============================================================================

export interface EditorToolbarProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical"
}

const EditorToolbar = React.forwardRef<HTMLDivElement, EditorToolbarProps>(
  ({ className, orientation = "horizontal", children, ...props }, ref) => {
    const { editor } = useEditor()

    if (!editor) return null

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-orientation={orientation}
        className={cn(
          "flex items-center gap-1",
          orientation === "vertical" && "flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
EditorToolbar.displayName = "EditorToolbar"

// =============================================================================
// EditorButtonGroup
// =============================================================================

export interface EditorButtonGroupProps extends React.ComponentProps<"div"> {}

const EditorButtonGroup = React.forwardRef<
  HTMLDivElement,
  EditorButtonGroupProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
})
EditorButtonGroup.displayName = "EditorButtonGroup"

// Alias
const EditorToolbarGroup = EditorButtonGroup

// =============================================================================
// EditorButton
// =============================================================================

export interface EditorButtonProps extends React.ComponentProps<typeof Button> {
  action: EditorAction
  activeVariant?: "default" | "secondary" | "outline"
}

const EditorButton = React.forwardRef<HTMLButtonElement, EditorButtonProps>(
  (
    { action, activeVariant = "secondary", className, children, ...props },
    ref
  ) => {
    const { editor } = useEditor()
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

    React.useEffect(() => {
      if (!editor) return

      const handleUpdate = () => forceUpdate()
      editor.on("transaction", handleUpdate)

      return () => {
        editor.off("transaction", handleUpdate)
      }
    }, [editor])

    const isActive = React.useMemo(() => {
      if (!editor) return false
      if (EDITOR_TEXT_ALIGN_ACTIONS.includes(action)) {
        return editor.isActive({ textAlign: action })
      }
      return editor.isActive(action)
    }, [editor, action])

    const canUse = canUseEditorAction(editor, action)

    const handleClick = () => {
      executeEditorAction(editor, action)
    }

    const block = EDITOR_BLOCKS_MAP.get(action)

    if (!editor) return null

    return (
      <Button
        ref={ref}
        type="button"
        variant={isActive ? activeVariant : "ghost"}
        size="icon"
        disabled={!canUse}
        onClick={handleClick}
        aria-label={block?.label}
        className={cn("size-8", className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
EditorButton.displayName = "EditorButton"

// =============================================================================
// EditorSeparator
// =============================================================================

export interface EditorSeparatorProps extends React.ComponentProps<"span"> {}

const EditorSeparator = React.forwardRef<HTMLSpanElement, EditorSeparatorProps>(
  ({ className, ...props }, ref) => {
    const { editor } = useEditor()

    if (!editor) return null

    return (
      <span
        ref={ref}
        className={cn("text-border mx-1 inline-flex items-center", className)}
        {...props}
      >
        |
      </span>
    )
  }
)
EditorSeparator.displayName = "EditorSeparator"

// =============================================================================
// EditorDropdown Context
// =============================================================================

interface EditorDropdownContextValue {
  sharedBlocks: EditorBlock[]
}

const EditorDropdownContext =
  React.createContext<EditorDropdownContextValue | null>(null)

// =============================================================================
// EditorDropdown
// =============================================================================

export interface EditorDropdownProps extends React.ComponentProps<
  typeof DropdownMenu
> {
  actions: EditorAction[]
}

const EditorDropdown = React.forwardRef<HTMLButtonElement, EditorDropdownProps>(
  ({ actions, children, ...props }, _ref) => {
    const { editor } = useEditor()

    const handleChangeBlock = (key: EditorAction) => {
      executeEditorAction(editor, key)
    }

    const filteredBlocks = actions
      .map((action) => EDITOR_BLOCKS_MAP.get(action)!)
      .filter(Boolean)

    const contextValue = React.useMemo<EditorDropdownContextValue>(
      () => ({ sharedBlocks: filteredBlocks }),
      [filteredBlocks]
    )

    if (!editor) return null

    return (
      <EditorDropdownContext.Provider value={contextValue}>
        <DropdownMenu {...props}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shadow-none"
              aria-label="Open blocks menu"
            >
              {children}
              <ChevronDown className="text-muted-foreground ml-1 size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="pb-2">
            <ScrollArea
              style={{
                height: Math.min(filteredBlocks.length * 56, 300),
              }}
              className="max-h-[300px] overflow-auto"
            >
              {filteredBlocks.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  onClick={() => handleChangeBlock(item.key)}
                >
                  <div
                    className="border-border bg-background flex size-8 items-center justify-center rounded-lg border"
                    aria-hidden="true"
                  >
                    <item.icon
                      size={16}
                      strokeWidth={2}
                      className="opacity-60"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-muted-foreground text-xs">
                      {item.description}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </EditorDropdownContext.Provider>
    )
  }
)
EditorDropdown.displayName = "EditorDropdown"

// =============================================================================
// EditorLabel
// =============================================================================

export interface EditorLabelProps extends React.ComponentProps<"span"> {
  action?: EditorAction
  pattern?: ":icon :label" | ":label" | ":label :icon" | ":icon"
}

const EditorLabel = React.forwardRef<HTMLSpanElement, EditorLabelProps>(
  ({ className, action, pattern = ":label", ...props }, ref) => {
    const dropdownCtx = React.useContext(EditorDropdownContext)
    const { editor } = useEditor()

    const activeActions =
      useEditorState({
        editor,
        selector: ({ editor: e }) => getActiveEditorActions(e),
      }) ?? []

    const blocks = React.useMemo(() => {
      if (action) {
        const block = EDITOR_BLOCKS_MAP.get(action)
        return block ? [block] : []
      }

      const filteredActions = dropdownCtx?.sharedBlocks?.length
        ? activeActions.filter((a) =>
            dropdownCtx.sharedBlocks.some((b) => b.key === a)
          )
        : activeActions

      return filteredActions
        .map((key) => EDITOR_BLOCKS_MAP.get(key)!)
        .filter(Boolean)
    }, [action, activeActions, dropdownCtx])

    const renderBlock = (block: EditorBlock) => {
      switch (pattern) {
        case ":icon :label":
          return (
            <React.Fragment key={block.key}>
              <block.icon className="size-4" />
              {block.label}
            </React.Fragment>
          )
        case ":icon":
          return (
            <React.Fragment key={block.key}>
              <block.icon className="size-4" />
            </React.Fragment>
          )
        case ":label :icon":
          return (
            <React.Fragment key={block.key}>
              {block.label}
              <block.icon className="size-4" />
            </React.Fragment>
          )
        default:
          return block.label
      }
    }

    const content =
      blocks.length > 0
        ? blocks.map(renderBlock)
        : dropdownCtx?.sharedBlocks?.[0]
          ? renderBlock(dropdownCtx.sharedBlocks[0])
          : null

    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        {content}
      </span>
    )
  }
)
EditorLabel.displayName = "EditorLabel"

// =============================================================================
// EditorFloatingMenu
// =============================================================================

export interface EditorFloatingMenuProps extends Omit<
  React.ComponentProps<typeof FloatingMenu>,
  "editor"
> {}

function EditorFloatingMenu({ children, ...props }: EditorFloatingMenuProps) {
  const { editor } = useEditor()

  if (!editor) return null

  return (
    <FloatingMenu editor={editor} {...props}>
      {children}
    </FloatingMenu>
  )
}

// =============================================================================
// EditorBubbleMenuText
// =============================================================================

export interface EditorBubbleMenuTextProps extends Omit<
  React.ComponentProps<typeof BubbleMenu>,
  "editor" | "children"
> {}

const EditorBubbleMenuText = React.forwardRef<
  HTMLDivElement,
  EditorBubbleMenuTextProps
>((props, ref) => {
  const { editor } = useEditor()
  const [linkUrl, setLinkUrl] = React.useState("")
  const [showLinkInput, setShowLinkInput] = React.useState(false)

  if (!editor) return null

  const handleSetLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run()
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSetLink()
    }
    if (e.key === "Escape") {
      setShowLinkInput(false)
      setLinkUrl("")
    }
  }

  return (
    <BubbleMenu
      {...props}
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "top",
      }}
      shouldShow={({ editor: e, from, to }) => {
        if (from === to) return false
        if (e.isActive("table")) return false
        if (e.isActive("codeBlock")) return false
        if (e.isActive("image")) return false
        return true
      }}
      className="w-fit"
    >
      <div
        ref={ref}
        className="bg-popover flex items-center gap-0.5 rounded-md border p-0.5 shadow-md"
      >
        {showLinkInput ? (
          <div className="flex items-center gap-1 p-1">
            <Input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 w-48 text-xs"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleSetLink}
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => {
                setShowLinkInput(false)
                setLinkUrl("")
              }}
            >
              <Link2Off className="size-3.5" />
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <Bold className="size-3.5" />
            </Button>
            <Button
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <Italic className="size-3.5" />
            </Button>
            <Button
              variant={editor.isActive("underline") ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            >
              <Underline className="size-3.5" />
            </Button>
            <Button
              variant={editor.isActive("strike") ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <Strikethrough className="size-3.5" />
            </Button>
            <Button
              variant={editor.isActive("code") ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Code"
            >
              <Code className="size-3.5" />
            </Button>

            <div className="bg-border h-4 w-px" />

            <Button
              variant={editor.isActive("highlight") ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              title="Highlight"
            >
              <Highlighter className="size-3.5" />
            </Button>

            <div className="bg-border h-4 w-px" />

            {editor.isActive("link") ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => editor.chain().focus().unsetLink().run()}
                title="Remove Link"
              >
                <Link2Off className="size-3.5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setShowLinkInput(true)}
                title="Add Link"
              >
                <Link2 className="size-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    </BubbleMenu>
  )
})
EditorBubbleMenuText.displayName = "EditorBubbleMenuText"

// =============================================================================
// Hooks
// =============================================================================

export function useEditorIsActive(action: EditorAction): boolean {
  const { editor } = useEditor()

  return React.useMemo(() => {
    if (!editor) return false
    if (EDITOR_TEXT_ALIGN_ACTIONS.includes(action)) {
      return editor.isActive({ textAlign: action })
    }
    return editor.isActive(action)
  }, [editor, action])
}

export function useEditorCurrentActions(): EditorAction[] {
  const { editor } = useEditor()
  return React.useMemo(() => getActiveEditorActions(editor), [editor])
}

export function toLatentArray<T>(...inputs: NestedArray<T>[]): T[] {
  const out: T[] = []

  // Stack holds items to process. We push in reverse so we can pop and keep order.
  const stack: NestedArray<T>[] = []
  for (let i = inputs.length - 1; i >= 0; i--) stack.push(inputs[i])

  while (stack.length) {
    const cur = stack.pop() as NestedArray<T>

    if (Array.isArray(cur)) {
      // Push children in reverse to preserve original order.
      for (let i = cur.length - 1; i >= 0; i--) {
        stack.push(cur[i] as NestedArray<T>)
      }
    } else {
      out.push(cur)
    }
  }

  return out
}

// =============================================================================
// Exports
// =============================================================================

export {
  EditorBubbleMenuLink,
  EditorBubbleMenuText,
  EditorButton,
  EditorButtonGroup,
  EditorContent,
  EditorDropdown,
  EditorFloatingMenu,
  EditorLabel,
  EditorProvider,
  EditorSeparator,
  EditorToolbar,
  EditorToolbarGroup,
}
