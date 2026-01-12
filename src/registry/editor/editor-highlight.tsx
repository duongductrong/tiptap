"use client"

import type { Editor } from "@tiptap/react"
import Highlight from "@tiptap/extension-highlight"
import { Highlighter } from "lucide-react"
import { createEditorExtension } from "./editor"

// =============================================================================
// EditorHighlightExtension
// =============================================================================

export const EditorHighlightExtension = createEditorExtension({
  extension: Highlight.configure({
    multicolor: false,
    HTMLAttributes: {
      class: "bg-yellow-200 dark:bg-yellow-500 px-0.5 rounded",
    },
  }),
  commands: [
    {
      key: "highlight",
      icon: Highlighter,
      label: "Highlight",
      description: "Highlight selected text",
      execute: (editor: Editor) =>
        editor.chain().focus().toggleHighlight().run(),
      canExecute: (editor: Editor) =>
        editor.can().chain().focus().toggleHighlight().run(),
      isActive: (editor: Editor) => editor.isActive("highlight"),
    },
  ],
})
