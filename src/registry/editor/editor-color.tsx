"use client"

import * as React from "react"
import Color from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import type { Editor } from "@tiptap/react"
import { useEditorState } from "@tiptap/react"
import { HexColorPicker } from "react-colorful"
import { Palette, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  createEditorExtension,
  EditorBubbleMenuDropdown,
  EditorBubbleMenuDropdownContent,
  EditorBubbleMenuDropdownLabel,
  EditorBubbleMenuDropdownTrigger,
  useEditor,
} from "./editor"

// =============================================================================
// EditorColorPicker Context
// =============================================================================

interface EditorColorPickerContextValue {
  currentTextColor: string
  currentHighlightColor: string
  setTextColor: (color: string) => void
  setHighlightColor: (color: string) => void
}

const EditorColorPickerContext =
  React.createContext<EditorColorPickerContextValue | null>(null)

function useEditorColorPicker() {
  const ctx = React.useContext(EditorColorPickerContext)
  if (!ctx) {
    throw new Error(
      "useEditorColorPicker must be used within EditorColorPicker"
    )
  }
  return ctx
}

// =============================================================================
// EditorColorPicker
// =============================================================================

export interface EditorColorPickerProps {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function EditorColorPicker({ children, ...props }: EditorColorPickerProps) {
  const { editor } = useEditor()

  const { currentTextColor, currentHighlightColor } = useEditorState({
    editor: editor ?? null,
    selector: ({ editor: e }) => ({
      currentTextColor:
        (e?.getAttributes("textStyle").color as string) || "inherit",
      currentHighlightColor:
        (e?.getAttributes("highlight").color as string) || "transparent",
    }),
  }) ?? { currentTextColor: "inherit", currentHighlightColor: "transparent" }

  const setTextColor = React.useCallback(
    (color: string) => {
      if (!editor) return
      if (color === "inherit") {
        editor.chain().focus().unsetColor().run()
      } else {
        editor.chain().focus().setColor(color).run()
      }
    },
    [editor]
  )

  const setHighlightColor = React.useCallback(
    (color: string) => {
      if (!editor) return
      if (color === "transparent") {
        editor.chain().focus().unsetHighlight().run()
      } else {
        editor.chain().focus().setHighlight({ color }).run()
      }
    },
    [editor]
  )

  const contextValue = React.useMemo<EditorColorPickerContextValue>(
    () => ({
      currentTextColor,
      currentHighlightColor,
      setTextColor,
      setHighlightColor,
    }),
    [currentTextColor, currentHighlightColor, setTextColor, setHighlightColor]
  )

  if (!editor) return null

  return (
    <EditorColorPickerContext.Provider value={contextValue}>
      <EditorBubbleMenuDropdown {...props}>{children}</EditorBubbleMenuDropdown>
    </EditorColorPickerContext.Provider>
  )
}
EditorColorPicker.displayName = "EditorColorPicker"

// =============================================================================
// EditorColorPickerTrigger
// =============================================================================

export interface EditorColorPickerTriggerProps {
  children: React.ReactNode
}

function EditorColorPickerTrigger({ children }: EditorColorPickerTriggerProps) {
  return (
    <EditorBubbleMenuDropdownTrigger>
      {children}
    </EditorBubbleMenuDropdownTrigger>
  )
}
EditorColorPickerTrigger.displayName = "EditorColorPickerTrigger"

// =============================================================================
// EditorColorPickerContent
// =============================================================================

export interface EditorColorPickerContentProps extends React.ComponentProps<
  typeof EditorBubbleMenuDropdownContent
> {}

const EditorColorPickerContent = React.forwardRef<
  React.ElementRef<typeof EditorBubbleMenuDropdownContent>,
  EditorColorPickerContentProps
>(({ className, children, ...props }, ref) => (
  <EditorBubbleMenuDropdownContent
    ref={ref}
    className={cn("w-48", className)}
    {...props}
  >
    {children}
  </EditorBubbleMenuDropdownContent>
))
EditorColorPickerContent.displayName = "EditorColorPickerContent"

// =============================================================================
// EditorColorPickerLabel
// =============================================================================

export interface EditorColorPickerLabelProps extends React.ComponentProps<
  typeof EditorBubbleMenuDropdownLabel
> {}

const EditorColorPickerLabel = React.forwardRef<
  React.ElementRef<typeof EditorBubbleMenuDropdownLabel>,
  EditorColorPickerLabelProps
>((props, ref) => <EditorBubbleMenuDropdownLabel ref={ref} {...props} />)
EditorColorPickerLabel.displayName = "EditorColorPickerLabel"

// =============================================================================
// EditorColorPickerGrid
// =============================================================================

export interface EditorColorPickerGridProps extends React.ComponentProps<"div"> {}

const EditorColorPickerGrid = React.forwardRef<
  HTMLDivElement,
  EditorColorPickerGridProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid grid-cols-5 gap-1 px-1 py-1", className)}
      {...props}
    >
      {children}
    </div>
  )
})
EditorColorPickerGrid.displayName = "EditorColorPickerGrid"

// =============================================================================
// EditorColorPickerItem
// =============================================================================

export interface EditorColorPickerItemProps extends Omit<
  React.ComponentProps<"button">,
  "color"
> {
  color: string
  variant: "text" | "highlight"
}

const EditorColorPickerItem = React.forwardRef<
  HTMLButtonElement,
  EditorColorPickerItemProps
>(({ color, variant, className, onClick, ...props }, ref) => {
  const {
    currentTextColor,
    currentHighlightColor,
    setTextColor,
    setHighlightColor,
  } = useEditorColorPicker()

  const isActive =
    variant === "text"
      ? currentTextColor === color
      : currentHighlightColor === color

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === "text") {
      setTextColor(color)
    } else {
      setHighlightColor(color)
    }
    onClick?.(e)
  }

  const isDefault = color === "inherit" || color === "transparent"

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex size-7 items-center justify-center rounded-full transition-all",
        "hover:ring-ring hover:ring-2 hover:ring-offset-1",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
        isActive && "ring-primary ring-2 ring-offset-1",
        className
      )}
      style={
        variant === "highlight"
          ? { backgroundColor: isDefault ? "#e3e2e0" : color }
          : undefined
      }
      onClick={handleClick}
      {...props}
    >
      {variant === "text" && (
        <span
          className={cn(
            "text-sm font-semibold",
            isDefault && "text-foreground"
          )}
          style={!isDefault ? { color } : undefined}
        >
          A
        </span>
      )}
      {variant === "highlight" && isDefault && (
        <span className="text-muted-foreground relative size-full">
          <span className="bg-destructive absolute top-1/2 left-1/2 h-px w-5/6 -translate-x-1/2 -translate-y-1/2 rotate-45" />
        </span>
      )}
    </button>
  )
})
EditorColorPickerItem.displayName = "EditorColorPickerItem"

// =============================================================================
// EditorColorPickerIndicator
// =============================================================================

export interface EditorColorPickerIndicatorProps extends React.ComponentProps<"div"> {}

const EditorColorPickerIndicator = React.forwardRef<
  HTMLDivElement,
  EditorColorPickerIndicatorProps
>(({ className, ...props }, ref) => {
  const { currentTextColor, currentHighlightColor } = useEditorColorPicker()

  const backgroundColor =
    currentHighlightColor !== "transparent"
      ? currentHighlightColor
      : currentTextColor !== "inherit"
        ? currentTextColor
        : "currentColor"

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-x-1.5 bottom-1 h-0.5 rounded-full",
        className
      )}
      style={{ backgroundColor }}
      {...props}
    />
  )
})
EditorColorPickerIndicator.displayName = "EditorColorPickerIndicator"

// =============================================================================
// EditorColorPickerCustom
// =============================================================================

export interface EditorColorPickerCustomProps extends Omit<
  React.ComponentProps<"button">,
  "onChange" | "color"
> {
  variant: "text" | "highlight"
}

const EditorColorPickerCustom = React.forwardRef<
  HTMLButtonElement,
  EditorColorPickerCustomProps
>(({ variant, className, ...props }, ref) => {
  const [open, setOpen] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const {
    currentTextColor,
    currentHighlightColor,
    setTextColor,
    setHighlightColor,
  } = useEditorColorPicker()

  const currentColor =
    variant === "text" ? currentTextColor : currentHighlightColor

  const displayColor =
    currentColor === "inherit" || currentColor === "transparent"
      ? "#000000"
      : currentColor

  const handleChange = (color: string) => {
    if (variant === "text") {
      setTextColor(color)
    } else {
      setHighlightColor(color)
    }
  }

  const handlePointerDown = () => {
    setIsDragging(true)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  React.useEffect(() => {
    if (open) {
      window.addEventListener("pointerup", handlePointerUp)
      return () => window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [open])

  const handleInteractOutside = (e: Event) => {
    if (isDragging) {
      e.preventDefault()
    }
  }

  const isDefault = currentColor === "inherit" || currentColor === "transparent"
  const hasCustomColor = !isDefault

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          className={cn(
            "flex size-7 items-center justify-center rounded-full transition-all",
            "hover:ring-ring hover:ring-2 hover:ring-offset-1",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
            hasCustomColor
              ? "ring-primary ring-2 ring-offset-1"
              : "bg-muted border-border border border-dashed",
            className
          )}
          style={
            variant === "highlight" && hasCustomColor
              ? { backgroundColor: currentColor }
              : undefined
          }
          title="Custom color"
          {...props}
        >
          {variant === "text" ? (
            <span
              className={cn(
                "text-sm font-semibold",
                !hasCustomColor && "text-muted-foreground"
              )}
              style={hasCustomColor ? { color: currentColor } : undefined}
            >
              A
            </span>
          ) : (
            !hasCustomColor && (
              <Palette className="text-muted-foreground size-3.5" />
            )
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[9999] w-auto p-3"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={handleInteractOutside}
        onInteractOutside={handleInteractOutside}
      >
        <div onPointerDown={handlePointerDown}>
          <HexColorPicker
            color={displayColor}
            onChange={handleChange}
            style={{ width: "180px", height: "140px" }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
})
EditorColorPickerCustom.displayName = "EditorColorPickerCustom"

// =============================================================================
// EditorColorExtension
// =============================================================================

export const EditorColorExtension = createEditorExtension({
  extension: [
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
      HTMLAttributes: {
        class: "px-0.5 rounded",
      },
    }),
  ],
  commands: [
    {
      key: "setTextColor",
      icon: Type,
      label: "Text Color",
      description: "Change text color",
      execute: (editor: Editor, options) =>
        editor
          .chain()
          .focus()
          .setColor(options?.color as string)
          .run(),
      canExecute: () => true,
      isActive: (editor: Editor) =>
        editor.getAttributes("textStyle").color !== undefined,
    },
    {
      key: "unsetTextColor",
      icon: Type,
      label: "Remove Text Color",
      description: "Remove text color",
      execute: (editor: Editor) => editor.chain().focus().unsetColor().run(),
      canExecute: (editor: Editor) =>
        editor.getAttributes("textStyle").color !== undefined,
      isActive: () => false,
    },
    {
      key: "setHighlightColor",
      icon: Type,
      label: "Highlight",
      description: "Highlight selected text",
      execute: (editor: Editor, options) =>
        editor
          .chain()
          .focus()
          .setHighlight({ color: options?.color as string })
          .run(),
      canExecute: () => true,
      isActive: (editor: Editor) => editor.isActive("highlight"),
    },
    {
      key: "unsetHighlightColor",
      icon: Type,
      label: "Remove Highlight",
      description: "Remove highlight",
      execute: (editor: Editor) =>
        editor.chain().focus().unsetHighlight().run(),
      canExecute: (editor: Editor) => editor.isActive("highlight"),
      isActive: () => false,
    },
  ],
})

// =============================================================================
// Exports
// =============================================================================

export {
  EditorColorPicker,
  EditorColorPickerTrigger,
  EditorColorPickerContent,
  EditorColorPickerLabel,
  EditorColorPickerGrid,
  EditorColorPickerItem,
  EditorColorPickerIndicator,
  EditorColorPickerCustom,
  useEditorColorPicker,
}
