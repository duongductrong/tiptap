"use client"

/**
 * Full-Featured Editor Example
 *
 * This example demonstrates a complete editor with all extensions:
 * - Image upload with resize, alignment, and captions
 * - Tables with column/row controls
 * - Code blocks with syntax highlighting
 * - Slash menu for quick block insertion
 * - All formatting options
 *
 * Use this as a reference for building a Notion-like editing experience.
 */

import type { Editor } from "@tiptap/react"

import {
  defaultEditorRegistry,
  EditorBubbleMenu,
  EditorBubbleMenuButton,
  EditorBubbleMenuContent,
  EditorBubbleMenuForm,
  EditorBubbleMenuFormActions,
  EditorBubbleMenuFormCancel,
  EditorBubbleMenuFormSubmit,
  EditorBubbleMenuGroup,
  EditorBubbleMenuInput,
  EditorBubbleMenuPopover,
  EditorBubbleMenuPopoverContent,
  EditorBubbleMenuPopoverTrigger,
  EditorBubbleMenuSeparator,
  EditorButton,
  EditorButtonGroup,
  EditorContent,
  EditorDropdown,
  EditorLabel,
  EditorProvider,
  EditorSeparator,
  EditorToolbar,
  useEditor,
} from "@/registry/editor/editor"

import { EditorImageExtension } from "@/registry/editor/editor-image"
import { EditorTableExtensions } from "@/registry/editor/editor-table"

import { EditorCodeBlockExtension } from "@/registry/editor/editor-code-block"

import { EditorSlashMenuExtension } from "@/registry/editor/editor-slash-menu"

import { EditorHighlightExtension } from "@/registry/editor/editor-highlight"
import { EditorLinkExtensions } from "@/registry/editor/editor-link"
import { EditorPlaceholderExtension } from "@/registry/editor/editor-placeholder"
import { EditorTaskListExtensions } from "@/registry/editor/editor-task-list"
import {
  Bold,
  CheckSquare,
  Code,
  Code2,
  Highlighter,
  ImageUp,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Table,
  Underline,
  Undo,
} from "lucide-react"

// Bubble menu should show for text selection, excluding tables/code blocks/images
const shouldShowTextBubbleMenu = ({
  editor,
  from,
  to,
}: {
  editor: Editor
  from: number
  to: number
}) => {
  if (from === to) return false
  if (editor.isActive("table")) return false
  if (editor.isActive("codeBlock")) return false
  if (editor.isActive("image")) return false
  return true
}

// Word count component using useEditor hook
function WordCount() {
  const { editor } = useEditor()

  if (!editor) return null

  const text = editor.getText()
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length

  return (
    <div className="text-muted-foreground border-t px-4 py-2 text-xs">
      {words} words · {chars} characters
    </div>
  )
}

interface FullFeaturedEditorProps {
  content?: string
  onUpdate?: (html: string) => void
}

export function FullFeaturedEditor({
  content = "<p>Start typing or press <code>/</code> for commands...</p>",
  onUpdate,
}: FullFeaturedEditorProps) {
  return (
    <EditorProvider
      content={content}
      extensions={[
        EditorLinkExtensions,

        EditorTaskListExtensions,

        EditorPlaceholderExtension,

        EditorHighlightExtension,

        // Image with base64 upload (for demo, use server upload in production)
        EditorImageExtension.configure({
          uploadStrategy: "base64",
          maxFileSize: 10 * 1024 * 1024, // 10MB
        }),

        // Table with resizable columns
        EditorTableExtensions,

        // Code block with syntax highlighting
        EditorCodeBlockExtension,

        // Slash menu for quick commands
        EditorSlashMenuExtension,
      ]}
      onUpdate={({ editor }) => {
        onUpdate?.(editor.getHTML())
      }}
    >
      {/* Main Toolbar */}
      <EditorToolbar className="flex flex-wrap items-center gap-1 p-2">
        {/* Undo/Redo */}
        <EditorButtonGroup>
          <EditorButton action="undo">
            <Undo className="size-4" />
          </EditorButton>
          <EditorButton action="redo">
            <Redo className="size-4" />
          </EditorButton>
        </EditorButtonGroup>

        <EditorSeparator />

        {/* Block Type Dropdown */}
        <EditorDropdown
          actions={[
            "paragraph",
            "heading1",
            "heading2",
            "heading3",
            "blockquote",
            "codeBlock",
          ]}
        >
          <EditorLabel pattern=":icon :label" />
        </EditorDropdown>

        <EditorSeparator />

        {/* Text Formatting */}
        <EditorButtonGroup>
          <EditorButton action="bold">
            <Bold className="size-4" />
          </EditorButton>
          <EditorButton action="italic">
            <Italic className="size-4" />
          </EditorButton>
          <EditorButton action="underline">
            <Underline className="size-4" />
          </EditorButton>
          <EditorButton action="strike">
            <Strikethrough className="size-4" />
          </EditorButton>
          <EditorButton action="code">
            <Code className="size-4" />
          </EditorButton>
          <EditorButton action="highlight">
            <Highlighter className="size-4" />
          </EditorButton>
        </EditorButtonGroup>

        <EditorSeparator />

        {/* Alignment Dropdown */}
        <EditorDropdown actions={["left", "center", "right", "justify"]}>
          <EditorLabel pattern=":icon" />
        </EditorDropdown>

        <EditorSeparator />

        {/* Lists */}
        <EditorButtonGroup>
          <EditorButton action="bulletList">
            <List className="size-4" />
          </EditorButton>
          <EditorButton action="orderedList">
            <ListOrdered className="size-4" />
          </EditorButton>
          <EditorButton action="taskList">
            <CheckSquare className="size-4" />
          </EditorButton>
        </EditorButtonGroup>

        <EditorSeparator />

        {/* Insert Blocks */}
        <EditorButtonGroup>
          <EditorButton action="setLink">
            <Link2 className="size-4" />
          </EditorButton>
          <EditorButton action="image">
            <ImageUp className="size-4" />
          </EditorButton>
          <EditorButton action="insertTable">
            <Table className="size-4" />
          </EditorButton>
          <EditorButton action="codeBlock">
            <Code2 className="size-4" />
          </EditorButton>
        </EditorButtonGroup>
      </EditorToolbar>

      {/* Editor Content */}
      <EditorContent className="prose dark:prose-invert min-h-[500px] max-w-none p-4" />

      {/* Word Count Footer */}
      <WordCount />

      {/* Composable Bubble Menu for Text Selection */}
      <EditorBubbleMenu shouldShow={shouldShowTextBubbleMenu}>
        <EditorBubbleMenuContent>
          <EditorBubbleMenuGroup>
            <EditorBubbleMenuButton action="bold" title="Bold">
              <Bold className="size-3.5" />
            </EditorBubbleMenuButton>
            <EditorBubbleMenuButton action="italic" title="Italic">
              <Italic className="size-3.5" />
            </EditorBubbleMenuButton>
            <EditorBubbleMenuButton action="underline" title="Underline">
              <Underline className="size-3.5" />
            </EditorBubbleMenuButton>
            <EditorBubbleMenuButton action="strike" title="Strikethrough">
              <Strikethrough className="size-3.5" />
            </EditorBubbleMenuButton>
            <EditorBubbleMenuButton action="code" title="Code">
              <Code className="size-3.5" />
            </EditorBubbleMenuButton>
          </EditorBubbleMenuGroup>

          <EditorBubbleMenuSeparator />

          <EditorBubbleMenuButton action="highlight" title="Highlight">
            <Highlighter className="size-3.5" />
          </EditorBubbleMenuButton>

          <EditorBubbleMenuSeparator />

          <EditorBubbleMenuPopover>
            <EditorBubbleMenuPopoverTrigger asChild>
              <EditorBubbleMenuButton title="Add Link">
                <Link2 className="size-3.5" />
              </EditorBubbleMenuButton>
            </EditorBubbleMenuPopoverTrigger>
            <EditorBubbleMenuPopoverContent align="end">
              <EditorBubbleMenuForm
                className="flex gap-4"
                onSubmit={(values, editor) =>
                  editor
                    ?.chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: values?.href })
                    .run()
                }
              >
                <EditorBubbleMenuInput
                  name="href"
                  binding="link.href"
                  placeholder="https://..."
                  type="url"
                />
                <EditorBubbleMenuFormActions>
                  <EditorBubbleMenuFormCancel />
                  <EditorBubbleMenuFormSubmit />
                </EditorBubbleMenuFormActions>
              </EditorBubbleMenuForm>
            </EditorBubbleMenuPopoverContent>
          </EditorBubbleMenuPopover>
        </EditorBubbleMenuContent>
      </EditorBubbleMenu>
    </EditorProvider>
  )
}
