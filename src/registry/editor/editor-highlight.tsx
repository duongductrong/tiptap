"use client"

import Highlight from "@tiptap/extension-highlight"

// =============================================================================
// EditorHighlightExtension
// =============================================================================

export const EditorHighlightExtension = Highlight.configure({
  multicolor: false,
  HTMLAttributes: {
    class: "bg-yellow-200 dark:bg-yellow-500 px-0.5 rounded",
  },
})
