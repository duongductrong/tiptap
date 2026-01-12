"use client"

import type { Editor } from "@tiptap/react"
import { TextAlign } from "@tiptap/extension-text-align"
import TiptapTypography from "@tiptap/extension-typography"
import TiptapUnderline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
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
import { createEditorExtension, type EditorActionConfig } from "./editor"

const essentialCommands: EditorActionConfig<Editor>[] = [
  // History
  {
    key: "undo",
    icon: Undo,
    label: "Undo",
    description: "Undo the last action",
    execute: (editor) => editor.chain().focus().undo().run(),
    canExecute: (editor) => editor.can().chain().focus().undo().run(),
  },
  {
    key: "redo",
    icon: Redo,
    label: "Redo",
    description: "Redo the last action",
    execute: (editor) => editor.chain().focus().redo().run(),
    canExecute: (editor) => editor.can().chain().focus().redo().run(),
  },
  // Text formatting
  {
    key: "bold",
    icon: Bold,
    label: "Bold",
    description: "Make text bold",
    execute: (editor) => editor.chain().focus().toggleBold().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
  },
  {
    key: "italic",
    icon: Italic,
    label: "Italic",
    description: "Italicize text",
    execute: (editor) => editor.chain().focus().toggleItalic().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
  },
  {
    key: "underline",
    icon: Underline,
    label: "Underline",
    description: "Underline text",
    execute: (editor) => editor.chain().focus().toggleUnderline().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive("underline"),
  },
  {
    key: "strike",
    icon: Strikethrough,
    label: "Strikethrough",
    description: "Strike through text",
    execute: (editor) => editor.chain().focus().toggleStrike().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
  },
  {
    key: "code",
    icon: Code,
    label: "Code",
    description: "Format text as code",
    execute: (editor) => editor.chain().focus().toggleCode().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive("code"),
  },
  // Block types
  {
    key: "paragraph",
    icon: Type,
    label: "Text",
    description: "Start writing with plain text",
    execute: (editor) => editor.chain().focus().setParagraph().run(),
    canExecute: (editor) => editor.can().chain().focus().setParagraph().run(),
    isActive: (editor) => editor.isActive("paragraph"),
  },
  {
    key: "heading1",
    icon: Heading1,
    label: "Heading 1",
    description: "Use this for main titles",
    execute: (editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    key: "heading2",
    icon: Heading2,
    label: "Heading 2",
    description: "Ideal for subsections",
    execute: (editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    key: "heading3",
    icon: Heading3,
    label: "Heading 3",
    description: "Use for smaller subsections",
    execute: (editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    key: "heading4",
    icon: Heading4,
    label: "Heading 4",
    description: "Suitable for detailed sections",
    execute: (editor) => editor.chain().focus().setHeading({ level: 4 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 4 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 4 }),
  },
  {
    key: "heading5",
    icon: Heading5,
    label: "Heading 5",
    description: "For minor details",
    execute: (editor) => editor.chain().focus().setHeading({ level: 5 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 5 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 5 }),
  },
  {
    key: "heading6",
    icon: Heading6,
    label: "Heading 6",
    description: "Use for the smallest details",
    execute: (editor) => editor.chain().focus().setHeading({ level: 6 }).run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHeading({ level: 6 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 6 }),
  },
  {
    key: "blockquote",
    icon: TextQuote,
    label: "Quote",
    description: "Capture a quote",
    execute: (editor) => editor.chain().focus().toggleBlockquote().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    key: "divider",
    icon: Minus,
    label: "Divider",
    description: "Visually divide blocks",
    execute: (editor) => editor.chain().focus().setHorizontalRule().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setHorizontalRule().run(),
  },
  // Lists
  {
    key: "bulletList",
    icon: List,
    label: "Bullet List",
    description: "Create a bullet list",
    execute: (editor) => editor.chain().focus().toggleBulletList().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    key: "orderedList",
    icon: ListOrdered,
    label: "Ordered List",
    description: "Create an ordered list",
    execute: (editor) => editor.chain().focus().toggleOrderedList().run(),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  // Text alignment
  {
    key: "left",
    icon: AlignLeft,
    label: "Left",
    description: "Align text to the left",
    execute: (editor) => editor.chain().focus().setTextAlign("left").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("left").run(),
    isActive: (editor) => editor.isActive({ textAlign: "left" }),
  },
  {
    key: "center",
    icon: AlignCenter,
    label: "Center",
    description: "Align text to the center",
    execute: (editor) => editor.chain().focus().setTextAlign("center").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("center").run(),
    isActive: (editor) => editor.isActive({ textAlign: "center" }),
  },
  {
    key: "right",
    icon: AlignRight,
    label: "Right",
    description: "Align text to the right",
    execute: (editor) => editor.chain().focus().setTextAlign("right").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("right").run(),
    isActive: (editor) => editor.isActive({ textAlign: "right" }),
  },
  {
    key: "justify",
    icon: AlignJustify,
    label: "Justify",
    description: "Align text to justify",
    execute: (editor) => editor.chain().focus().setTextAlign("justify").run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign("justify").run(),
    isActive: (editor) => editor.isActive({ textAlign: "justify" }),
  },
]

export const EditorEssentialExtension = createEditorExtension({
  extension: [
    StarterKit.configure({
      codeBlock: false, // Use CodeBlock extension separately
    }),
    TiptapUnderline.configure({
      HTMLAttributes: {
        class: "underline underline-offset-4",
      },
    }),
    TextAlign.configure({
      types: [
        "heading",
        "paragraph",
        "blockquote",
        "bulletList",
        "orderedList",
      ],
    }),
    TiptapTypography.configure({}),
  ],
  commands: essentialCommands,
})
