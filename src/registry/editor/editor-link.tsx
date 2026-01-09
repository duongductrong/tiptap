"use client"

import * as React from "react"
import Link from "@tiptap/extension-link"
import { BubbleMenu } from "@tiptap/react"
import { EditorContext } from "./editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ExternalLink, Link2, Link2Off } from "lucide-react"

// =============================================================================
// EditorLinkExtension
// =============================================================================

export const EditorLinkExtension = Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    class:
      "text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer",
  },
})

// =============================================================================
// EditorBubbleMenuLink
// =============================================================================

export interface EditorBubbleMenuLinkProps extends Omit<
  React.ComponentProps<typeof BubbleMenu>,
  "editor" | "children"
> {}

export const EditorBubbleMenuLink = React.forwardRef<
  HTMLDivElement,
  EditorBubbleMenuLinkProps
>((props, ref) => {
  const ctx = React.useContext(EditorContext)
  const editor = ctx?.editor
  const [isEditing, setIsEditing] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState("")

  if (!editor) return null

  const currentLink = editor.getAttributes("link").href || ""

  const handleEditLink = () => {
    setLinkUrl(currentLink)
    setIsEditing(true)
  }

  const handleSaveLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run()
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveLink()
    }
    if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  const handleOpenLink = () => {
    if (currentLink) {
      window.open(currentLink, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <BubbleMenu
      {...props}
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "bottom",
      }}
      shouldShow={({ editor: e, from, to }) => {
        if (from !== to) return false
        return e.isActive("link")
      }}
      className="w-fit"
    >
      <div
        ref={ref}
        className="bg-popover flex items-center gap-0.5 rounded-md border p-0.5 shadow-md"
      >
        {isEditing ? (
          <div className="flex items-center gap-1 px-1">
            <Input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 w-48 text-xs"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleSaveLink}
            >
              <Check className="size-3.5" />
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 max-w-[200px] gap-1 truncate px-2 text-xs font-normal"
              onClick={handleEditLink}
              title="Edit link"
            >
              <Link2 className="size-3.5 shrink-0" />
              <span className="truncate">{currentLink}</span>
            </Button>

            <div className="bg-border h-4 w-px" />

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleOpenLink}
              title="Open link"
            >
              <ExternalLink className="size-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive h-7 w-7 p-0"
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove link"
            >
              <Link2Off className="size-3.5" />
            </Button>
          </>
        )}
      </div>
    </BubbleMenu>
  )
})
EditorBubbleMenuLink.displayName = "EditorBubbleMenuLink"
