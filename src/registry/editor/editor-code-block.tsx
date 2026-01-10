"use client"

import * as React from "react"
import { Extension } from "@tiptap/core"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { BubbleMenu } from "@tiptap/react"
import { all, createLowlight } from "lowlight"
import { EditorContext, createEditorExtension } from "./editor"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, ClipboardCopy, Code2, Trash2 } from "lucide-react"

// =============================================================================
// Constants
// =============================================================================

interface CodeBlockLanguage {
  name: string
  value: string
}

export const CODEBLOCK_LANGUAGES: CodeBlockLanguage[] = [
  { name: "Plain Text", value: "plaintext" },
  { name: "JavaScript", value: "javascript" },
  { name: "TypeScript", value: "typescript" },
  { name: "JSX", value: "jsx" },
  { name: "TSX", value: "tsx" },
  { name: "HTML", value: "html" },
  { name: "CSS", value: "css" },
  { name: "SCSS", value: "scss" },
  { name: "JSON", value: "json" },
  { name: "Markdown", value: "markdown" },
  { name: "Python", value: "python" },
  { name: "Java", value: "java" },
  { name: "C", value: "c" },
  { name: "C++", value: "cpp" },
  { name: "C#", value: "csharp" },
  { name: "Go", value: "go" },
  { name: "Rust", value: "rust" },
  { name: "Ruby", value: "ruby" },
  { name: "PHP", value: "php" },
  { name: "Swift", value: "swift" },
  { name: "Kotlin", value: "kotlin" },
  { name: "Scala", value: "scala" },
  { name: "SQL", value: "sql" },
  { name: "GraphQL", value: "graphql" },
  { name: "Shell", value: "bash" },
  { name: "PowerShell", value: "powershell" },
  { name: "Docker", value: "dockerfile" },
  { name: "YAML", value: "yaml" },
  { name: "XML", value: "xml" },
  { name: "Diff", value: "diff" },
]

export type CodeBlockLanguageValue =
  (typeof CODEBLOCK_LANGUAGES)[number]["value"]

// =============================================================================
// Lowlight instance with all languages
// =============================================================================

const lowlight = createLowlight(all)

// =============================================================================
// EditorCodeBlockExtension
// =============================================================================

export interface EditorCodeBlockOptions {
  defaultLanguage?: CodeBlockLanguageValue
  HTMLAttributes?: Record<string, unknown>
}

const EditorCodeBlockNode = Extension.create({
  name: "codeBlockLowlight",
  addExtensions() {
    return [
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
    ]
  },
})

export const EditorCodeBlockExtension = createEditorExtension({
  extension: EditorCodeBlockNode,
  bubbleMenu: EditorBubbleMenuCodeBlock,
})

// =============================================================================
// Syntax Highlighting Styles (GitHub Dark-inspired)
// Injected into document on first use
// =============================================================================

export const CODEBLOCK_STYLES = `
  /* ==========================================================================
     Syntax Highlighting Theme (GitHub Dark-inspired)
     ========================================================================== */
  /* Comments */
  .ProseMirror .hljs-comment,
  .ProseMirror .hljs-quote {
    color: hsl(215 12% 50%);
    font-style: italic;
  }

  /* Keywords & Tags */
  .ProseMirror .hljs-keyword,
  .ProseMirror .hljs-selector-tag {
    color: hsl(350 89% 72%);
  }

  /* Strings & Regex */
  .ProseMirror .hljs-string,
  .ProseMirror .hljs-regexp,
  .ProseMirror .hljs-attribute,
  .ProseMirror .hljs-template-variable,
  .ProseMirror .hljs-variable.language_ {
    color: hsl(212 97% 81%);
  }

  /* Numbers */
  .ProseMirror .hljs-number,
  .ProseMirror .hljs-literal {
    color: hsl(212 97% 81%);
  }

  /* Functions & Classes */
  .ProseMirror .hljs-title,
  .ProseMirror .hljs-title.class_,
  .ProseMirror .hljs-title.function_ {
    color: hsl(260 83% 79%);
  }

  /* Built-in & Types */
  .ProseMirror .hljs-built_in,
  .ProseMirror .hljs-type {
    color: hsl(29 67% 75%);
  }

  /* Variables & Params */
  .ProseMirror .hljs-variable,
  .ProseMirror .hljs-params {
    color: hsl(210 14% 93%);
  }

  /* Properties & Attributes */
  .ProseMirror .hljs-attr,
  .ProseMirror .hljs-property {
    color: hsl(212 97% 81%);
  }

  /* Symbols & Bullets */
  .ProseMirror .hljs-symbol,
  .ProseMirror .hljs-bullet {
    color: hsl(350 89% 72%);
  }

  /* Meta & Preprocessor */
  .ProseMirror .hljs-meta,
  .ProseMirror .hljs-meta .hljs-keyword {
    color: hsl(350 89% 72%);
  }

  /* Links */
  .ProseMirror .hljs-link {
    color: hsl(212 97% 81%);
    text-decoration: underline;
  }

  /* Deletion (diff) */
  .ProseMirror .hljs-deletion {
    color: hsl(350 89% 72%);
    background: hsl(350 89% 72% / 0.15);
  }

  /* Addition (diff) */
  .ProseMirror .hljs-addition {
    color: hsl(139 66% 69%);
    background: hsl(139 66% 69% / 0.15);
  }

  /* Section */
  .ProseMirror .hljs-section {
    color: hsl(212 97% 81%);
    font-weight: bold;
  }

  /* Emphasis */
  .ProseMirror .hljs-emphasis {
    font-style: italic;
  }

  /* Strong */
  .ProseMirror .hljs-strong {
    font-weight: bold;
  }

  /* Punctuation */
  .ProseMirror .hljs-punctuation {
    color: hsl(210 14% 66%);
  }

  /* Pre code reset */
  .ProseMirror pre code {
    background: transparent;
    padding: 0;
    font-size: inherit;
    color: inherit;
    font-family: inherit;
  }
`

// Inject styles once
let stylesInjected = false
export function injectCodeBlockStyles() {
  if (stylesInjected || typeof document === "undefined") return
  const styleEl = document.createElement("style")
  styleEl.id = "editor-codeblock-styles"
  styleEl.textContent = CODEBLOCK_STYLES
  document.head.appendChild(styleEl)
  stylesInjected = true
}

// =============================================================================
// EditorBubbleMenuCodeBlock
// =============================================================================

export interface EditorBubbleMenuCodeBlockProps extends Omit<
  React.ComponentProps<typeof BubbleMenu>,
  "editor" | "children"
> {
  children?: React.ReactNode
}

export function EditorBubbleMenuCodeBlock(
  props: EditorBubbleMenuCodeBlockProps
) {
  const ctx = React.useContext(EditorContext)
  const editor = ctx?.editor
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  // Inject styles on first render
  React.useEffect(() => {
    injectCodeBlockStyles()
  }, [])

  if (!editor) return null

  const currentLanguage =
    editor.getAttributes("codeBlock").language || "plaintext"

  const currentLanguageLabel =
    CODEBLOCK_LANGUAGES.find((lang) => lang.value === currentLanguage)?.name ||
    currentLanguage

  const handleSelectLanguage = (value: string) => {
    editor
      .chain()
      .focus()
      .updateAttributes("codeBlock", { language: value })
      .run()
    setOpen(false)
  }

  const handleCopyCode = async () => {
    const { state } = editor
    const { from } = state.selection

    let codeContent = ""

    // Try to find the code block and get its content
    state.doc.nodesBetween(from, from, (node) => {
      if (node.type.name === "codeBlock") {
        codeContent = node.textContent
        return false
      }
      // Also handle if we're inside the text of a code block
      if (node.type.name === "text") {
        // Check parent
        const $pos = state.doc.resolve(from)
        for (let depth = $pos.depth; depth >= 0; depth--) {
          const parentNode = $pos.node(depth)
          if (parentNode.type.name === "codeBlock") {
            codeContent = parentNode.textContent
            return false
          }
        }
      }
      return true
    })

    // Fallback: traverse from current position up to find code block
    if (!codeContent) {
      const $pos = state.doc.resolve(from)
      for (let depth = $pos.depth; depth >= 0; depth--) {
        const node = $pos.node(depth)
        if (node.type.name === "codeBlock") {
          codeContent = node.textContent
          break
        }
      }
    }

    if (codeContent) {
      await navigator.clipboard.writeText(codeContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDelete = () => {
    const { state } = editor
    const { from } = state.selection

    // Find the code block node position
    let codeBlockPos: number | null = null
    let codeBlockNode: typeof state.doc | null = null

    // Traverse up from the current position to find the code block
    const $pos = state.doc.resolve(from)
    for (let depth = $pos.depth; depth >= 0; depth--) {
      const node = $pos.node(depth)
      if (node.type.name === "codeBlock") {
        codeBlockPos = $pos.before(depth)
        codeBlockNode = node
        break
      }
    }

    if (codeBlockPos !== null && codeBlockNode) {
      // Delete the entire code block
      editor
        .chain()
        .focus()
        .deleteRange({
          from: codeBlockPos,
          to: codeBlockPos + codeBlockNode.nodeSize,
        })
        .run()
    }
  }

  return (
    <BubbleMenu
      {...props}
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "top-end",
        offset: [0, 8],
        getReferenceClientRect: () => {
          const { view, state } = editor
          const { from } = state.selection

          // Find the code block node and get its position
          let codeBlockPos = from
          state.doc.nodesBetween(from, from, (node, pos) => {
            if (node.type.name === "codeBlock") {
              codeBlockPos = pos
              return false
            }
          })

          const domNode = view.nodeDOM(codeBlockPos)
          if (domNode instanceof HTMLElement) {
            const preElement = domNode.querySelector("pre") || domNode
            if (preElement instanceof HTMLElement) {
              return preElement.getBoundingClientRect()
            }
          }
          return view.dom.getBoundingClientRect()
        },
      }}
      shouldShow={({ editor: e }) => e.isActive("codeBlock")}
      className="w-fit"
    >
      <div className="bg-popover flex items-center gap-0.5 rounded-md border p-0.5 shadow-md">
        {/* Language Selector with Search */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs font-normal"
              role="combobox"
              aria-expanded={open}
            >
              <Code2 className="size-3.5" />
              {currentLanguageLabel}
              <ChevronDown className="size-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[200px] p-0"
            align="start"
            sideOffset={8}
          >
            <Command>
              <CommandInput placeholder="Search language..." className="h-9" />
              <CommandList>
                <CommandEmpty>No language found.</CommandEmpty>
                <CommandGroup>
                  {CODEBLOCK_LANGUAGES.map((lang) => (
                    <CommandItem
                      key={lang.value}
                      value={lang.name}
                      onSelect={() => handleSelectLanguage(lang.value)}
                    >
                      {lang.name}
                      {currentLanguage === lang.value && (
                        <Check className="ml-auto size-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="bg-border h-4 w-px" />

        {/* Copy Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleCopyCode}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <ClipboardCopy className="size-3.5" />
          )}
        </Button>

        {/* Divider */}
        <div className="bg-border h-4 w-px" />

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
          onClick={handleDelete}
          title="Delete code block"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </BubbleMenu>
  )
}
