"use client"

import type { Editor } from "@tiptap/react"
import TaskItem from "@tiptap/extension-task-item"
import TaskList from "@tiptap/extension-task-list"
import { CheckSquare } from "lucide-react"
import { createEditorExtension } from "./editor"

// =============================================================================
// EditorTaskListExtension
// =============================================================================

const EditorTaskListNode = TaskList.configure({
  HTMLAttributes: {
    class: "not-prose pl-0 list-none",
  },
})

// =============================================================================
// EditorTaskItemExtension
// =============================================================================

const EditorTaskItemNode = TaskItem.configure({
  nested: true,
  HTMLAttributes: {
    class: "flex items-start gap-2 [&>label]:mt-0.5",
  },
})

// =============================================================================
// EditorTaskListExtensions
// =============================================================================

export const EditorTaskListExtensions = createEditorExtension({
  extension: [EditorTaskListNode, EditorTaskItemNode],
  commands: [
    {
      key: "taskList",
      icon: CheckSquare,
      label: "Task List",
      description: "Create a task list with checkboxes",
      execute: (editor: Editor) =>
        editor.chain().focus().toggleTaskList().run(),
      canExecute: (editor: Editor) =>
        editor.can().chain().focus().toggleTaskList().run(),
      isActive: (editor: Editor) => editor.isActive("taskList"),
    },
  ],
})

// Export individual extensions for backward compatibility
export const EditorTaskListExtension = EditorTaskListNode
export const EditorTaskItemExtension = EditorTaskItemNode
