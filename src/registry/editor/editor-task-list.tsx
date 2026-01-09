"use client"

import TaskItem from "@tiptap/extension-task-item"
import TaskList from "@tiptap/extension-task-list"

// =============================================================================
// EditorTaskListExtension
// =============================================================================

export const EditorTaskListExtension = TaskList.configure({
  HTMLAttributes: {
    class: "not-prose pl-0 list-none",
  },
})

// =============================================================================
// EditorTaskItemExtension
// =============================================================================

export const EditorTaskItemExtension = TaskItem.configure({
  nested: true,
  HTMLAttributes: {
    class: "flex items-start gap-2 [&>label]:mt-0.5",
  },
})

// Export as array for easy use
export const EditorTaskListExtensions = [
  EditorTaskListExtension,
  EditorTaskItemExtension,
]
