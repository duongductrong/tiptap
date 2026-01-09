"use client"

/**
 * Minimal Editor Example
 *
 * This example shows the simplest possible editor configuration with:
 * - Basic text formatting (bold, italic, underline)
 * - Simple toolbar
 * - Text bubble menu
 *
 * Use this as a starting point for content editors that only need basic formatting.
 */

import {
  EditorBubbleMenuText,
  EditorButton,
  EditorButtonGroup,
  EditorContent,
  EditorProvider,
  EditorToolbar,
} from "@/registry/editor/editor"

import { Bold, Italic, Strikethrough, Underline } from "lucide-react"

export function MinimalEditor() {
  return (
    <EditorProvider content="<p>Start typing here...</p>">
      <EditorToolbar className="flex items-center gap-1 border-b p-2">
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
        </EditorButtonGroup>
      </EditorToolbar>

      <EditorContent className="prose prose-sm dark:prose-invert min-h-[300px] max-w-none p-4" />

      <EditorBubbleMenuText />
    </EditorProvider>
  )
}
