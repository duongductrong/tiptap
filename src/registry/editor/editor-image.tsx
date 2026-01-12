"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { DropdownMenuContent as DropdownMenuContentPrimitive } from "@radix-ui/react-dropdown-menu"
import { Node, mergeAttributes } from "@tiptap/core"
import {
  BubbleMenu,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react"
import {
  AlertCircle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  ChevronDown,
  ImageUp,
  Link2,
  Loader2,
  Lock,
  LockOpen,
  MessageSquare,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import * as React from "react"
import { EditorContext, createEditorExtension } from "./editor"

// =============================================================================
// Types & Configuration
// =============================================================================

export type EditorImageUploadStrategy = "base64" | "server" | "url"
export type EditorImageAlignment = "left" | "center" | "right"
export type EditorImageObjectFit =
  | "contain"
  | "cover"
  | "fill"
  | "none"
  | "scale-down"

export interface EditorImageConfig {
  uploadStrategy?: EditorImageUploadStrategy
  onUpload?: (file: File) => Promise<string>
  maxFileSize?: number
  acceptedTypes?: string[]
  onError?: (error: Error) => void
}

const DEFAULT_CONFIG: Required<
  Omit<EditorImageConfig, "onUpload" | "onError">
> = {
  uploadStrategy: "base64",
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
}

// =============================================================================
// Context
// =============================================================================

interface EditorImageContextType extends EditorImageConfig {
  isUploading: boolean
  setIsUploading: (value: boolean) => void
  error: string | null
  setError: (value: string | null) => void
}

const EditorImageContext = React.createContext<EditorImageContextType | null>(
  null
)

// =============================================================================
// Utility Functions
// =============================================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function validateFile(
  file: File,
  config: Pick<EditorImageConfig, "maxFileSize" | "acceptedTypes">
): string | null {
  const maxSize = config.maxFileSize ?? DEFAULT_CONFIG.maxFileSize
  const acceptedTypes = config.acceptedTypes ?? DEFAULT_CONFIG.acceptedTypes

  if (!acceptedTypes.includes(file.type)) {
    return `Invalid file type. Accepted: ${acceptedTypes.map((t) => t.split("/")[1]).join(", ")}`
  }

  if (file.size > maxSize) {
    return `File too large. Maximum size: ${formatFileSize(maxSize)}`
  }

  return null
}

// =============================================================================
// EditorImagePlaceholder - Upload UI shown when src is empty
// =============================================================================

interface EditorImagePlaceholderProps {
  onImageReady: (src: string, alt?: string) => void
  config: EditorImageConfig
}

export function EditorImagePlaceholder({
  onImageReady,
  config,
}: EditorImagePlaceholderProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<string>("upload")

  const contextValue: EditorImageContextType = {
    ...config,
    isUploading,
    setIsUploading,
    error,
    setError,
  }

  const handleUpload = React.useCallback(
    async (file: File) => {
      setError(null)

      const validationError = validateFile(file, config)
      if (validationError) {
        setError(validationError)
        return
      }

      setIsUploading(true)

      try {
        let src: string

        const strategy = config.uploadStrategy ?? DEFAULT_CONFIG.uploadStrategy

        if (strategy === "server" && config.onUpload) {
          src = await config.onUpload(file)
        } else {
          src = await convertToBase64(file)
        }

        onImageReady(src, file.name)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed"
        setError(message)
        config.onError?.(err instanceof Error ? err : new Error(message))
      } finally {
        setIsUploading(false)
      }
    },
    [config, onImageReady]
  )

  const handleUrlSubmit = React.useCallback(
    (url: string) => {
      if (!url.trim()) {
        setError("Please enter a valid URL")
        return
      }

      try {
        new URL(url)
        onImageReady(url)
      } catch {
        setError("Please enter a valid URL")
      }
    },
    [onImageReady]
  )

  return (
    <EditorImageContext.Provider value={contextValue}>
      <div className="border-border bg-muted/30 my-4 rounded-lg border">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mt-2 ml-2">
            <TabsTrigger value="upload">
              <Upload className="mr-2 size-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="embed">
              <Link2 className="mr-2 size-4" />
              Embed link
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            {error && (
              <div className="bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-md p-3 text-sm">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 w-6 p-0"
                  onClick={() => setError(null)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            )}

            <TabsContent value="upload" className="mt-0">
              <EditorImageUploadZone
                onUpload={handleUpload}
                disabled={isUploading}
              />
              <p className="text-muted-foreground mt-3 text-center text-xs">
                Maximum file size:{" "}
                {formatFileSize(
                  config.maxFileSize ?? DEFAULT_CONFIG.maxFileSize
                )}
              </p>
            </TabsContent>

            <TabsContent value="embed" className="mt-0">
              <EditorImageUrlInput
                onSubmit={handleUrlSubmit}
                disabled={isUploading}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </EditorImageContext.Provider>
  )
}

// =============================================================================
// EditorImageUploadZone - Drag & drop file upload
// =============================================================================

interface EditorImageUploadZoneProps {
  onUpload: (file: File) => void
  disabled?: boolean
}

export function EditorImageUploadZone({
  onUpload,
  disabled,
}: EditorImageUploadZoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const ctx = React.useContext(EditorImageContext)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) onUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {ctx?.isUploading ? (
        <>
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-sm">Uploading...</p>
        </>
      ) : (
        <>
          <ImageUp className="text-muted-foreground size-8" />
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            Upload file
          </Button>
          <p className="text-muted-foreground mt-2 text-sm">
            or drag and drop an image here
          </p>
        </>
      )}
    </div>
  )
}

// =============================================================================
// EditorImageUrlInput - External URL input
// =============================================================================

interface EditorImageUrlInputProps {
  onSubmit: (url: string) => void
  disabled?: boolean
}

export function EditorImageUrlInput({
  onSubmit,
  disabled,
}: EditorImageUrlInputProps) {
  const [url, setUrl] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSubmit(url)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="url"
        placeholder="Paste image URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" disabled={disabled || !url.trim()}>
        Embed
      </Button>
    </form>
  )
}

// =============================================================================
// Resize Handle Component
// =============================================================================

type ResizeDirection = "top-left" | "top-right" | "bottom-left" | "bottom-right"

interface ResizeHandleProps {
  direction: ResizeDirection
  onResizeStart: (e: React.MouseEvent, direction: ResizeDirection) => void
}

function ResizeHandle({ direction, onResizeStart }: ResizeHandleProps) {
  const positionClasses: Record<ResizeDirection, string> = {
    "top-left": "-left-1.5 -top-1.5 cursor-nwse-resize",
    "top-right": "-right-1.5 -top-1.5 cursor-nesw-resize",
    "bottom-left": "-bottom-1.5 -left-1.5 cursor-nesw-resize",
    "bottom-right": "-bottom-1.5 -right-1.5 cursor-nwse-resize",
  }

  return (
    <div
      className={cn(
        "border-primary bg-background absolute size-3 border-2 transition-transform hover:scale-125",
        positionClasses[direction]
      )}
      onMouseDown={(e) => onResizeStart(e, direction)}
    />
  )
}

// =============================================================================
// EditorImageBlock - Rendered image with styling
// =============================================================================

interface EditorImageBlockProps extends React.ComponentProps<"img"> {
  selected?: boolean
  imageWidth?: number | string | null
  imageHeight?: number | string | null
  objectFit?: EditorImageObjectFit | null
}

export const EditorImageBlock = React.forwardRef<
  HTMLImageElement,
  EditorImageBlockProps
>(
  (
    {
      className,
      selected,
      imageWidth,
      imageHeight,
      objectFit,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <img
        ref={ref}
        {...props}
        className={cn(
          "max-w-full",
          selected && "ring-primary ring-1 ring-offset-1",
          className
        )}
        style={{
          margin: 0,
          ...style,
          width: imageWidth
            ? typeof imageWidth === "string" && imageWidth.includes("%")
              ? imageWidth
              : `${imageWidth}px`
            : undefined,
          height: imageHeight
            ? typeof imageHeight === "string" && imageHeight.includes("%")
              ? imageHeight
              : `${imageHeight}px`
            : undefined,
          objectFit: objectFit ?? undefined,
        }}
      />
    )
  }
)
EditorImageBlock.displayName = "EditorImageBlock"

// =============================================================================
// ImageNodeView - Main NodeView component
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ImageNodeView(props: any) {
  const { node, updateAttributes, selected, extension, editor, getPos } = props

  const nodeAttrs = node.attrs as {
    src: string | null
    alt: string | null
    title: string | null
    width: number | string | null
    height: number | string | null
    alignment: EditorImageAlignment
    caption: string | null
    objectFit: EditorImageObjectFit
    lockAspectRatio: boolean
  }

  const hasSrc = !!nodeAttrs.src
  const imageRef = React.useRef<HTMLImageElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const [isResizing, setIsResizing] = React.useState(false)
  const [resizeDirection, setResizeDirection] =
    React.useState<ResizeDirection | null>(null)
  const [initialSize, setInitialSize] = React.useState({ width: 0, height: 0 })
  const [initialMousePos, setInitialMousePos] = React.useState({ x: 0, y: 0 })
  const [currentSize, setCurrentSize] = React.useState<{
    width: number
    height: number
  } | null>(null)

  const handleImageReady = React.useCallback(
    (src: string, alt?: string) => {
      updateAttributes({ src, alt: alt ?? nodeAttrs.alt })

      requestAnimationFrame(() => {
        const pos = getPos?.()
        if (typeof pos === "number" && editor) {
          editor.commands.setNodeSelection(pos)
          editor.commands.focus()
        }
      })
    },
    [updateAttributes, nodeAttrs.alt, getPos, editor]
  )

  const handleResizeStart = React.useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      e.preventDefault()
      e.stopPropagation()

      if (!imageRef.current) return

      const rect = imageRef.current.getBoundingClientRect()
      setIsResizing(true)
      setResizeDirection(direction)
      setInitialSize({
        width: rect.width,
        height: rect.height,
      })
      setInitialMousePos({ x: e.clientX, y: e.clientY })
      setCurrentSize({ width: rect.width, height: rect.height })
    },
    []
  )

  React.useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeDirection) return

      const deltaX = e.clientX - initialMousePos.x
      const deltaY = e.clientY - initialMousePos.y

      let newWidth = initialSize.width
      let newHeight = initialSize.height

      if (resizeDirection.includes("right")) newWidth += deltaX
      if (resizeDirection.includes("left")) newWidth -= deltaX
      if (resizeDirection.includes("bottom")) newHeight += deltaY
      if (resizeDirection.includes("top")) newHeight -= deltaY

      const shouldLockRatio = e.shiftKey || nodeAttrs.lockAspectRatio
      if (shouldLockRatio && initialSize.width > 0 && initialSize.height > 0) {
        const aspectRatio = initialSize.width / initialSize.height
        const containerMaxWidth =
          containerRef.current?.parentElement?.clientWidth ?? Infinity

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newWidth = Math.min(newWidth, containerMaxWidth)
          newHeight = newWidth / aspectRatio
        } else {
          newWidth = newHeight * aspectRatio
          if (newWidth > containerMaxWidth) {
            newWidth = containerMaxWidth
            newHeight = newWidth / aspectRatio
          }
        }
      }

      newWidth = Math.max(50, newWidth)
      newHeight = Math.max(50, newHeight)

      setCurrentSize({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      })
    }

    const handleMouseUp = () => {
      if (currentSize) {
        updateAttributes({
          width: currentSize.width,
          height: currentSize.height,
        })
      }
      setIsResizing(false)
      setResizeDirection(null)
      setCurrentSize(null)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    isResizing,
    resizeDirection,
    initialMousePos,
    initialSize,
    currentSize,
    updateAttributes,
    nodeAttrs.lockAspectRatio,
  ])

  const displayWidth = currentSize?.width ?? nodeAttrs.width
  const displayHeight = currentSize?.height ?? nodeAttrs.height

  const alignmentClasses: Record<EditorImageAlignment, string> = {
    left: "items-start",
    center: "items-center",
    right: "items-end",
  }

  return (
    <NodeViewWrapper
      data-type="image"
      data-src={nodeAttrs.src ?? undefined}
      data-alt={nodeAttrs.alt ?? undefined}
      data-title={nodeAttrs.title ?? undefined}
      data-alignment={nodeAttrs.alignment}
    >
      {hasSrc ? (
        <figure
          className={cn(
            "my-4 flex w-full flex-col",
            alignmentClasses[nodeAttrs.alignment]
          )}
        >
          <div
            ref={containerRef}
            className={cn(
              "group relative inline-block",
              isResizing && "select-none"
            )}
          >
            <EditorImageBlock
              ref={imageRef}
              src={nodeAttrs.src!}
              alt={nodeAttrs.alt ?? undefined}
              title={nodeAttrs.title ?? undefined}
              selected={selected}
              imageWidth={displayWidth}
              imageHeight={displayHeight}
              objectFit={nodeAttrs.objectFit}
              draggable={!isResizing}
            />
            {selected && (
              <>
                <ResizeHandle
                  direction="top-left"
                  onResizeStart={handleResizeStart}
                />
                <ResizeHandle
                  direction="top-right"
                  onResizeStart={handleResizeStart}
                />
                <ResizeHandle
                  direction="bottom-left"
                  onResizeStart={handleResizeStart}
                />
                <ResizeHandle
                  direction="bottom-right"
                  onResizeStart={handleResizeStart}
                />
              </>
            )}
            {isResizing && currentSize && (
              <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                {currentSize.width} × {currentSize.height}
              </div>
            )}
          </div>
          {nodeAttrs.caption && (
            <figcaption className="text-muted-foreground mt-2 text-center text-sm">
              {nodeAttrs.caption}
            </figcaption>
          )}
        </figure>
      ) : (
        <EditorImagePlaceholder
          onImageReady={handleImageReady}
          config={extension.options}
        />
      )}
    </NodeViewWrapper>
  )
}

// =============================================================================
// EditorImageExtension
// =============================================================================

export interface EditorImageOptions extends EditorImageConfig {
  inline: boolean
  HTMLAttributes: Record<string, unknown>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    editorImage: {
      setImage: (options: {
        src?: string | null
        alt?: string
        title?: string
      }) => ReturnType
    }
  }
}

const EditorImageNode = Node.create<EditorImageOptions>({
  name: "image",

  addOptions() {
    return {
      inline: false,
      uploadStrategy: "base64",
      maxFileSize: 5 * 1024 * 1024,
      acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      HTMLAttributes: {
        class: "rounded-lg border object-contain",
      },
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? "inline" : "block"
  },

  draggable: true,
  atom: false,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => (el as HTMLImageElement).getAttribute("src"),
        renderHTML: (attrs) => (attrs.src ? { src: attrs.src } : {}),
      },
      alt: {
        default: null,
        parseHTML: (el) => (el as HTMLImageElement).getAttribute("alt"),
        renderHTML: (attrs) => (attrs.alt ? { alt: attrs.alt } : {}),
      },
      title: {
        default: null,
        parseHTML: (el) => (el as HTMLImageElement).getAttribute("title"),
        renderHTML: (attrs) => (attrs.title ? { title: attrs.title } : {}),
      },
      width: {
        default: null,
        parseHTML: (el) => {
          const width = (el as HTMLImageElement).getAttribute("width")
          if (!width) return null
          return width.includes("%") ? width : parseInt(width, 10)
        },
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const height = (el as HTMLImageElement).getAttribute("height")
          if (!height) return null
          return height.includes("%") ? height : parseInt(height, 10)
        },
        renderHTML: (attrs) => (attrs.height ? { height: attrs.height } : {}),
      },
      alignment: {
        default: "left" as EditorImageAlignment,
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute("data-alignment") ?? "left",
        renderHTML: (attrs) => ({ "data-alignment": attrs.alignment }),
      },
      caption: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-caption"),
        renderHTML: (attrs) =>
          attrs.caption ? { "data-caption": attrs.caption } : {},
      },
      objectFit: {
        default: "contain" as EditorImageObjectFit,
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute("data-object-fit") ?? "contain",
        renderHTML: (attrs) => ({ "data-object-fit": attrs.objectFit }),
      },
      lockAspectRatio: {
        default: true,
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute("data-lock-aspect-ratio") !==
          "false",
        renderHTML: (attrs) => ({
          "data-lock-aspect-ratio": String(attrs.lockAspectRatio),
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: "img[src]" }, { tag: "img" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})

export const EditorImageExtension = createEditorExtension<EditorImageOptions>({
  extension: EditorImageNode,
  bubbleMenu: EditorBubbleMenuImage,
  commands: [
    {
      key: "image",
      icon: ImageUp,
      label: "Image",
      description: "Upload or embed an image",
      execute: (editor, options) =>
        editor
          .chain()
          .focus()
          .setImage({
            src: options?.src as string,
            alt: options?.alt as string,
            title: options?.title as string,
          })
          .run(),
      canExecute: () => true,
    },
  ],
  onConfigure: (options, current) => ({
    ...current,
    extension: EditorImageNode.configure(options),
  }),
})

// =============================================================================
// EditorBubbleMenuImage
// =============================================================================

const OBJECT_FIT_OPTIONS: { value: EditorImageObjectFit; label: string }[] = [
  { value: "contain", label: "Contain" },
  { value: "cover", label: "Cover" },
  { value: "fill", label: "Fill" },
  { value: "none", label: "None" },
  { value: "scale-down", label: "Scale Down" },
]

export function EditorBubbleMenuImage() {
  const ctx = React.useContext(EditorContext)
  const editor = ctx?.editor
  const [captionOpen, setCaptionOpen] = React.useState(false)
  const [captionValue, setCaptionValue] = React.useState("")
  const widthInputRef = React.useRef<HTMLInputElement>(null)
  const heightInputRef = React.useRef<HTMLInputElement>(null)
  const [forceUpdate, setForceUpdate] = React.useState(0)

  const isImageActive = editor?.isActive("image") ?? false

  // Subscribe to editor transaction updates to sync dimensions
  React.useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      if (editor.isActive("image")) {
        setForceUpdate((prev) => prev + 1)
      }
    }

    editor.on("transaction", handleUpdate)
    editor.on("selectionUpdate", handleUpdate)

    return () => {
      editor.off("transaction", handleUpdate)
      editor.off("selectionUpdate", handleUpdate)
    }
  }, [editor])

  const getDefaultDimensions = React.useCallback(() => {
    if (!editor || !isImageActive) return { width: "", height: "" }

    const attrs = editor.getAttributes("image")

    if (attrs.width && attrs.height) {
      return {
        width: attrs.width.toString(),
        height: attrs.height.toString(),
      }
    }

    const { node } = editor.state.selection as {
      node?: { type?: { name?: string }; attrs?: { src?: string } }
    }
    if (node?.type?.name === "image" && node.attrs?.src) {
      const imageElement = editor.view.dom.querySelector(
        `img[src="${node.attrs.src}"]`
      ) as HTMLImageElement | null

      if (imageElement?.complete && imageElement.naturalWidth > 0) {
        const rect = imageElement.getBoundingClientRect()
        return {
          width: Math.round(rect.width).toString(),
          height: Math.round(rect.height).toString(),
        }
      }
    }

    return { width: "", height: "" }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, isImageActive, forceUpdate])

  const defaultDimensions = getDefaultDimensions()

  if (!editor) return null

  const getImageAttrs = () => {
    if (!isImageActive) return null
    return editor.getAttributes("image") as {
      src: string | null
      alt: string | null
      width: number | string | null
      height: number | string | null
      alignment: EditorImageAlignment
      caption: string | null
      objectFit: EditorImageObjectFit
      lockAspectRatio: boolean
    }
  }

  const attrs = getImageAttrs()
  const isConstrained = attrs?.lockAspectRatio ?? true

  const handleToggleLockAspectRatio = () => {
    editor
      .chain()
      .focus()
      .updateAttributes("image", { lockAspectRatio: !isConstrained })
      .run()
  }

  const parseValue = (
    value: string
  ): { numericValue: number; isPercentage: boolean } | null => {
    const trimmed = value.trim()
    if (!trimmed) return null

    const isPercentage = trimmed.endsWith("%")
    const numStr = isPercentage ? trimmed.slice(0, -1) : trimmed
    const numValue = parseFloat(numStr)

    if (isNaN(numValue) || numValue <= 0) return null
    if (isPercentage && numValue > 100) return null

    return { numericValue: numValue, isPercentage }
  }

  const formatValue = (
    numericValue: number,
    isPercentage: boolean
  ): string | number => {
    return isPercentage ? `${numericValue}%` : Math.round(numericValue)
  }

  const applyWidth = (value: string) => {
    const parsed = parseValue(value)
    if (!parsed) return

    const { numericValue, isPercentage } = parsed
    const formattedValue = formatValue(numericValue, isPercentage)

    if (
      isConstrained &&
      defaultDimensions.width &&
      defaultDimensions.height &&
      !isPercentage
    ) {
      const currentWidth = parseFloat(defaultDimensions.width)
      const currentHeight = parseFloat(defaultDimensions.height)
      if (currentWidth > 0 && currentHeight > 0) {
        const aspectRatio = currentHeight / currentWidth
        const newHeight = Math.round(numericValue * aspectRatio)
        editor
          .chain()
          .focus()
          .updateAttributes("image", {
            width: formattedValue,
            height: newHeight,
          })
          .run()
        return
      }
    }

    editor
      .chain()
      .focus()
      .updateAttributes("image", { width: formattedValue })
      .run()
  }

  const applyHeight = (value: string) => {
    const parsed = parseValue(value)
    if (!parsed) return

    const { numericValue, isPercentage } = parsed
    const formattedValue = formatValue(numericValue, isPercentage)

    if (
      isConstrained &&
      defaultDimensions.width &&
      defaultDimensions.height &&
      !isPercentage
    ) {
      const currentWidth = parseFloat(defaultDimensions.width)
      const currentHeight = parseFloat(defaultDimensions.height)
      if (currentWidth > 0 && currentHeight > 0) {
        const aspectRatio = currentWidth / currentHeight
        const newWidth = Math.round(numericValue * aspectRatio)
        editor
          .chain()
          .focus()
          .updateAttributes("image", {
            width: newWidth,
            height: formattedValue,
          })
          .run()
        return
      }
    }

    editor
      .chain()
      .focus()
      .updateAttributes("image", { height: formattedValue })
      .run()
  }

  const handleWidthBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    applyWidth(e.target.value)
  }

  const handleHeightBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    applyHeight(e.target.value)
  }

  const handleWidthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      applyWidth(e.currentTarget.value)
    }
  }

  const handleHeightKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      applyHeight(e.currentTarget.value)
    }
  }

  const handleAlignmentChange = (alignment: EditorImageAlignment) => {
    editor.chain().focus().updateAttributes("image", { alignment }).run()
  }

  const handleObjectFitChange = (objectFit: EditorImageObjectFit) => {
    editor.chain().focus().updateAttributes("image", { objectFit }).run()
  }

  const handleCaptionSave = () => {
    editor
      .chain()
      .focus()
      .updateAttributes("image", { caption: captionValue || null })
      .run()
    setCaptionOpen(false)
  }

  const handleCaptionOpen = () => {
    const attrs = getImageAttrs()
    setCaptionValue(attrs?.caption ?? "")
    setCaptionOpen(true)
  }

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run()
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "bottom",
        offset: [0, 8],
        getReferenceClientRect: () => {
          const { state, view } = editor
          const { selection } = state

          const { node } = selection as {
            node?: { type?: { name?: string }; attrs?: { src?: string } }
          }
          if (node?.type?.name === "image" && node.attrs?.src) {
            const imageElement = view.dom.querySelector(
              `[data-type="image"][data-src="${node.attrs.src}"] img`
            ) as HTMLImageElement | null

            if (imageElement) {
              return imageElement.getBoundingClientRect()
            }
          }

          const selectedImageWrapper = view.dom
            .querySelector('[data-type="image"] .ring-primary')
            ?.closest('[data-type="image"]') as HTMLElement | null

          if (selectedImageWrapper) {
            const img = selectedImageWrapper.querySelector("img")
            if (img) {
              return img.getBoundingClientRect()
            }
          }

          const { from, to } = selection
          const start = view.coordsAtPos(from)
          const end = view.coordsAtPos(to)

          return new DOMRect(
            start.left,
            start.top,
            end.right - start.left,
            end.bottom - start.top
          )
        },
      }}
      shouldShow={({ editor: e }) => e.isActive("image")}
      className="w-fit"
    >
      <div className="bg-popover flex items-center gap-1 rounded-md border p-1 shadow-md">
        {/* Size Controls */}
        <div className="flex items-center gap-1">
          <Input
            ref={widthInputRef}
            key={`width-${defaultDimensions.width}-${isConstrained}`}
            type="text"
            placeholder="W"
            defaultValue={defaultDimensions.width}
            onBlur={handleWidthBlur}
            onKeyDown={handleWidthKeyDown}
            className="h-7 w-16 text-xs"
          />
          <Button
            variant={isConstrained ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleToggleLockAspectRatio}
            title={isConstrained ? "Unlock aspect ratio" : "Lock aspect ratio"}
          >
            {isConstrained ? (
              <Lock className="size-2" />
            ) : (
              <LockOpen className="size-2" />
            )}
          </Button>
          <Input
            ref={heightInputRef}
            key={`height-${defaultDimensions.height}-${isConstrained}`}
            type="text"
            placeholder="H"
            defaultValue={defaultDimensions.height}
            onBlur={handleHeightBlur}
            onKeyDown={handleHeightKeyDown}
            className="h-7 w-16 text-xs"
          />
        </div>

        <div className="bg-border mx-1 h-5 w-px" />

        {/* Alignment Controls */}
        <div className="flex items-center gap-0.5">
          <Button
            variant={attrs?.alignment === "left" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handleAlignmentChange("left")}
            title="Align left"
          >
            <AlignLeft className="size-3.5" />
          </Button>
          <Button
            variant={attrs?.alignment === "center" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handleAlignmentChange("center")}
            title="Align center"
          >
            <AlignCenter className="size-3.5" />
          </Button>
          <Button
            variant={attrs?.alignment === "right" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handleAlignmentChange("right")}
            title="Align right"
          >
            <AlignRight className="size-3.5" />
          </Button>
        </div>

        <div className="bg-border mx-1 h-5 w-px" />

        {/* Object Fit Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
            >
              {OBJECT_FIT_OPTIONS.find((o) => o.value === attrs?.objectFit)
                ?.label || "Contain"}
              <ChevronDown className="size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContentPrimitive
            className={cn(
              "bg-popover text-popover-foreground z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
            align="start"
            sideOffset={8}
          >
            {OBJECT_FIT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleObjectFitChange(option.value)}
              >
                {option.label}
                {attrs?.objectFit === option.value && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContentPrimitive>
        </DropdownMenu>

        <div className="bg-border mx-1 h-5 w-px" />

        {/* Caption Popover */}
        <Popover open={captionOpen} onOpenChange={setCaptionOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={attrs?.caption ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={handleCaptionOpen}
              title="Add caption"
            >
              <MessageSquare className="size-3.5" />
              Caption
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start" sideOffset={8}>
            <div className="space-y-2">
              <p className="text-sm font-medium">Image Caption</p>
              <Input
                placeholder="Enter caption..."
                value={captionValue}
                onChange={(e) => setCaptionValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleCaptionSave()
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCaptionValue("")
                    editor
                      .chain()
                      .focus()
                      .updateAttributes("image", { caption: null })
                      .run()
                    setCaptionOpen(false)
                  }}
                >
                  Clear
                </Button>
                <Button size="sm" onClick={handleCaptionSave}>
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="bg-border mx-1 h-5 w-px" />

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
          onClick={handleDelete}
          title="Delete image"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </BubbleMenu>
  )
}
