"use client"

/**
 * Custom Extension Example
 *
 * This example demonstrates how to create and integrate custom extensions:
 * - Custom "Ask AI" extension with bubble menu
 * - Custom slash menu items
 * - Integration with the modular editor architecture
 *
 * Use this as a reference for adding AI features, custom blocks, or other functionality.
 */

import {
  EditorContent,
  EditorContext,
  EditorProvider,
} from "@/registry/editor/editor"
import { Extension } from "@tiptap/core"
import { BubbleMenu } from "@tiptap/react"
import * as React from "react"

import {
  EditorSlashMenuExtension,
  defaultSlashMenuItems,
  type SlashMenuItem,
} from "@/registry/editor/editor-slash-menu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { CheckCheck, Languages, Loader2, Sparkles, Wand2 } from "lucide-react"
import { EditorEssentialExtension } from "@/registry/editor/editor-essential"

// =============================================================================
// Custom "Ask AI" Extension
// =============================================================================

interface AskAIOptions {
  onAskAI?: (selectedText: string, prompt: string) => Promise<string>
}

const AskAIExtension = Extension.create<AskAIOptions>({
  name: "askAI",

  addOptions() {
    return {
      onAskAI: async (text: string, prompt: string) => {
        // Simulate AI response (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        return `[AI: Based on "${prompt}"] ${text.toUpperCase()}`
      },
    }
  },
})

// =============================================================================
// Custom Bubble Menu for AI
// =============================================================================

function EditorBubbleMenuAI() {
  const ctx = React.useContext(EditorContext)
  const editor = ctx?.editor
  const [isOpen, setIsOpen] = React.useState(false)
  const [prompt, setPrompt] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  if (!editor) return null

  const handleAskAI = async () => {
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)

    if (!selectedText || !prompt) return

    setIsLoading(true)

    try {
      // Get the onAskAI function from extension options
      const askAIExt = editor.extensionManager.extensions.find(
        (ext) => ext.name === "askAI"
      )
      const onAskAI = askAIExt?.options?.onAskAI

      if (onAskAI) {
        const result = await onAskAI(selectedText, prompt)

        // Replace selected text with AI result
        editor.chain().focus().deleteSelection().insertContent(result).run()
      }
    } finally {
      setIsLoading(false)
      setIsOpen(false)
      setPrompt("")
    }
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: "top" }}
      shouldShow={({ from, to }) =>
        from !== to && !editor.isActive("codeBlock")
      }
      className="w-fit"
    >
      <div className="bg-popover flex items-center gap-0.5 rounded-md border p-0.5 shadow-md">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
            >
              <Sparkles className="size-3.5" />
              Ask AI
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start" sideOffset={8}>
            <div className="space-y-3">
              <p className="text-sm font-medium">What do you want AI to do?</p>
              <Input
                placeholder="e.g., Improve this text, Translate to Spanish..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    e.preventDefault()
                    handleAskAI()
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPrompt("Improve this text")}
                >
                  <Wand2 className="mr-1 size-3" />
                  Improve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPrompt("Translate to Spanish")}
                >
                  <Languages className="mr-1 size-3" />
                  Translate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPrompt("Fix grammar")}
                >
                  <CheckCheck className="mr-1 size-3" />
                  Grammar
                </Button>
              </div>
              <Button
                className="w-full"
                onClick={handleAskAI}
                disabled={isLoading || !prompt}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Apply
                  </>
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </BubbleMenu>
  )
}

// =============================================================================
// Custom Slash Menu Items
// =============================================================================

const customSlashMenuItems: SlashMenuItem[] = [
  {
    title: "AI Writer",
    description: "Let AI continue writing for you",
    icon: Sparkles,
    searchTerms: ["ai", "write", "generate", "continue"],
    command: (editor) => {
      if (!editor) return

      // Insert a placeholder that AI would fill
      editor
        .chain()
        .focus()
        .insertContent("<p><em>[AI is generating content...]</em></p>")
        .run()

      // In a real implementation, you would:
      // 1. Get context from previous paragraphs
      // 2. Call your AI API
      // 3. Stream the response into the editor
    },
  },
  {
    title: "AI Summary",
    description: "Summarize the document",
    icon: Wand2,
    searchTerms: ["summary", "summarize", "tldr"],
    command: (editor) => {
      if (!editor) return

      editor
        .chain()
        .focus()
        .insertContent(
          "<blockquote><p><strong>Summary:</strong> [AI would generate a summary of the document here]</p></blockquote>"
        )
        .run()
    },
  },
]

// =============================================================================
// Main Editor Component
// =============================================================================

interface CustomExtensionEditorProps {
  onAIRequest?: (text: string, prompt: string) => Promise<string>
}

export function CustomExtensionEditor({
  onAIRequest,
}: CustomExtensionEditorProps) {
  return (
    <EditorProvider
      content="<p>Select some text and click 'Ask AI' to see the custom extension in action.</p><p>Or type <code>/</code> and search for 'AI' to see custom slash menu items.</p>"
      extensions={[
        EditorEssentialExtension,

        // Custom AI extension
        AskAIExtension.configure({
          onAskAI:
            onAIRequest ??
            (async (text, prompt) => {
              // Default mock implementation
              await new Promise((r) => setTimeout(r, 1000))
              return `[${prompt}]: ${text}`
            }),
        }),

        // Slash menu with custom items added
        EditorSlashMenuExtension.configure({
          items: [...defaultSlashMenuItems, ...customSlashMenuItems],
        }),
      ]}
    >
      <EditorContent className="prose dark:prose-invert min-h-[300px] max-w-none p-4" />

      {/* Custom AI bubble menu */}
      <EditorBubbleMenuAI />
    </EditorProvider>
  )
}
