"use client"

import Placeholder from "@tiptap/extension-placeholder"

// =============================================================================
// Placeholder Styles (Tailwind CSS classes for EditorContent)
// =============================================================================

/**
 * Apply these classes to EditorContent component to enable placeholder styling.
 * These use Tailwind's arbitrary selector syntax for ProseMirror elements.
 *
 * Usage:
 * ```tsx
 * <EditorContent className={cn("prose", EDITOR_PLACEHOLDER_CLASSES)} />
 * ```
 */
export const EDITOR_PLACEHOLDER_CLASSES = [
  // Empty paragraph placeholder
  "[&_.ProseMirror_p.is-empty::before]:text-muted-foreground",
  "[&_.ProseMirror_p.is-empty::before]:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_p.is-empty::before]:float-left",
  "[&_.ProseMirror_p.is-empty::before]:h-0",
  "[&_.ProseMirror_p.is-empty::before]:pointer-events-none",
  // Empty heading placeholders (h1-h6)
  "[&_.ProseMirror_h1.is-empty::before]:text-muted-foreground",
  "[&_.ProseMirror_h1.is-empty::before]:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_h1.is-empty::before]:float-left",
  "[&_.ProseMirror_h1.is-empty::before]:h-0",
  "[&_.ProseMirror_h1.is-empty::before]:pointer-events-none",
  "[&_.ProseMirror_h2.is-empty::before]:text-muted-foreground",
  "[&_.ProseMirror_h2.is-empty::before]:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_h2.is-empty::before]:float-left",
  "[&_.ProseMirror_h2.is-empty::before]:h-0",
  "[&_.ProseMirror_h2.is-empty::before]:pointer-events-none",
  "[&_.ProseMirror_h3.is-empty::before]:text-muted-foreground",
  "[&_.ProseMirror_h3.is-empty::before]:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_h3.is-empty::before]:float-left",
  "[&_.ProseMirror_h3.is-empty::before]:h-0",
  "[&_.ProseMirror_h3.is-empty::before]:pointer-events-none",
  "[&_.ProseMirror_h4.is-empty::before]:text-muted-foreground",
  "[&_.ProseMirror_h4.is-empty::before]:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_h4.is-empty::before]:float-left",
  "[&_.ProseMirror_h4.is-empty::before]:h-0",
  "[&_.ProseMirror_h4.is-empty::before]:pointer-events-none",
  "[&_.ProseMirror_h5.is-empty::before]:text-muted-foreground",
  "[&_.ProseMirror_h5.is-empty::before]:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_h5.is-empty::before]:float-left",
  "[&_.ProseMirror_h5.is-empty::before]:h-0",
  "[&_.ProseMirror_h5.is-empty::before]:pointer-events-none",
  "[&_.ProseMirror_h6.is-empty::before]:text-muted-foreground",
  "[&_.ProseMirror_h6.is-empty::before]:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_h6.is-empty::before]:float-left",
  "[&_.ProseMirror_h6.is-empty::before]:h-0",
  "[&_.ProseMirror_h6.is-empty::before]:pointer-events-none",
].join(" ")

// =============================================================================
// EditorPlaceholderExtension
// =============================================================================

export interface EditorPlaceholderOptions {
  placeholder?:
    | string
    | ((props: {
        node: { type: { name: string }; attrs: { level?: number } }
      }) => string)
  emptyEditorClass?: string
  emptyNodeClass?: string
}

/**
 * Creates a configured Placeholder extension.
 *
 * @example
 * ```tsx
 * // Default configuration
 * EditorPlaceholderExtension
 *
 * // Custom placeholder
 * createEditorPlaceholderExtension({
 *   placeholder: "Write something amazing..."
 * })
 * ```
 */
export function createEditorPlaceholderExtension(
  options: EditorPlaceholderOptions = {}
) {
  return Placeholder.configure({
    placeholder:
      options.placeholder ??
      (({ node }) => {
        if (node.type.name === "heading") {
          return `Heading ${node.attrs.level}`
        }
        return "Type '/' for commands..."
      }),
    emptyEditorClass: options.emptyEditorClass ?? "is-editor-empty",
    emptyNodeClass: options.emptyNodeClass ?? "is-empty",
  })
}

// Default export with standard configuration
export const EditorPlaceholderExtension = createEditorPlaceholderExtension()
