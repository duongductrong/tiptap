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
import { mergeAttributes, Node } from "@tiptap/core"
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
import React, {
  ComponentProps,
  createContext,
  DragEvent,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { TipTapContext } from "./tiptap"

// =============================================================================
// Types & Configuration
// =============================================================================

export type TiptapImageUploadStrategy = "base64" | "server" | "url"
export type TiptapImageAlignment = "left" | "center" | "right"
export type TiptapImageObjectFit =
  | "contain"
  | "cover"
  | "fill"
  | "none"
  | "scale-down"

export interface TiptapImageConfig {
  uploadStrategy?: TiptapImageUploadStrategy
  onUpload?: (file: File) => Promise<string>
  maxFileSize?: number
  acceptedTypes?: string[]
  onError?: (error: Error) => void
}

const DEFAULT_CONFIG: Required<
  Omit<TiptapImageConfig, "onUpload" | "onError">
> = {
  uploadStrategy: "base64",
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
}

// =============================================================================
// Context
// =============================================================================

interface TiptapImageContextType extends TiptapImageConfig {
  isUploading: boolean
  setIsUploading: (value: boolean) => void
  error: string | null
  setError: (value: string | null) => void
}

const TiptapImageContext = createContext<TiptapImageContextType | null>(null)

function useTiptapImageContext() {
  const ctx = useContext(TiptapImageContext)
  if (!ctx) {
    throw new Error(
      "TiptapImage components must be used within TiptapImage.Extension"
    )
  }
  return ctx
}

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
  config: Pick<TiptapImageConfig, "maxFileSize" | "acceptedTypes">
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
// ImagePlaceholder - Upload UI shown when src is empty
// =============================================================================

interface ImagePlaceholderProps {
  onImageReady: (src: string, alt?: string) => void
  config: TiptapImageConfig
}

function ImagePlaceholder({ onImageReady, config }: ImagePlaceholderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("upload")

  const contextValue: TiptapImageContextType = {
    ...config,
    isUploading,
    setIsUploading,
    error,
    setError,
  }

  const handleUpload = useCallback(
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

  const handleUrlSubmit = useCallback(
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
    <TiptapImageContext.Provider value={contextValue}>
      <div className="border-border bg-muted/30 my-4 rounded-lg border">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="ml-2 mt-2">
            <TabsTrigger
              value="upload"
            >
              <Upload className="mr-2 size-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger
              value="embed"
            >
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
              <UploadZone onUpload={handleUpload} disabled={isUploading} />
              <p className="text-muted-foreground mt-3 text-center text-xs">
                Maximum file size:{" "}
                {formatFileSize(
                  config.maxFileSize ?? DEFAULT_CONFIG.maxFileSize
                )}
              </p>
            </TabsContent>

            <TabsContent value="embed" className="mt-0">
              <UrlInput onSubmit={handleUrlSubmit} disabled={isUploading} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </TiptapImageContext.Provider>
  )
}

// =============================================================================
// UploadZone - Drag & drop file upload
// =============================================================================

interface UploadZoneProps {
  onUpload: (file: File) => void
  disabled?: boolean
}

function UploadZone({ onUpload, disabled }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const ctx = useContext(TiptapImageContext)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent) => {
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
// UrlInput - External URL input
// =============================================================================

interface UrlInputProps {
  onSubmit: (url: string) => void
  disabled?: boolean
}

function UrlInput({ onSubmit, disabled }: UrlInputProps) {
  const [url, setUrl] = useState("")

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
// ImageBlock - Rendered image with styling
// =============================================================================

interface ImageBlockProps extends ComponentProps<"img"> {
  selected?: boolean
  imageWidth?: number | null
  imageHeight?: number | null
  objectFit?: TiptapImageObjectFit | null
}

const ImageBlock = forwardRef<HTMLImageElement, ImageBlockProps>(
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
          width: imageWidth ? `${imageWidth}px` : undefined,
          height: imageHeight ? `${imageHeight}px` : undefined,
          objectFit: objectFit ?? undefined,
        }}
      />
    )
  }
)
ImageBlock.displayName = "ImageBlock"

// =============================================================================
// ImageNodeView - Main NodeView component
// =============================================================================

interface ImageNodeViewProps {
  node: {
    attrs: {
      src: string | null
      alt: string | null
      title: string | null
      width: number | null
      height: number | null
      alignment: TiptapImageAlignment
      caption: string | null
      objectFit: TiptapImageObjectFit
    }
  }
  updateAttributes: (attrs: Record<string, unknown>) => void
  deleteNode: () => void
  selected: boolean
  extension: {
    options: TiptapImageConfig
  }
}

function ImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
  extension,
}: ImageNodeViewProps) {
  const hasSrc = !!node.attrs.src
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] =
    useState<ResizeDirection | null>(null)
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 })
  const [currentSize, setCurrentSize] = useState<{
    width: number
    height: number
  } | null>(null)

  const handleImageReady = (src: string, alt?: string) => {
    updateAttributes({ src, alt: alt ?? node.attrs.alt })
  }

  const handleResizeStart = useCallback(
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

  useEffect(() => {
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

      // Preserve aspect ratio if Shift is held
      if (e.shiftKey && initialSize.width > 0 && initialSize.height > 0) {
        const aspectRatio = initialSize.width / initialSize.height
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio
        } else {
          newWidth = newHeight * aspectRatio
        }
      }

      // Apply minimum constraints
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
  ])

  const displayWidth = currentSize?.width ?? node.attrs.width
  const displayHeight = currentSize?.height ?? node.attrs.height

  const alignmentClasses: Record<TiptapImageAlignment, string> = {
    left: "items-start",
    center: "items-center",
    right: "items-end",
  }

  return (
    <NodeViewWrapper
      data-type="image"
      data-src={node.attrs.src ?? undefined}
      data-alt={node.attrs.alt ?? undefined}
      data-title={node.attrs.title ?? undefined}
      data-alignment={node.attrs.alignment}
    >
      {hasSrc ? (
        <figure className={cn("my-4 flex w-full flex-col", alignmentClasses[node.attrs.alignment])}>
          <div
            ref={containerRef}
            className={cn(
              "group relative inline-block",
              isResizing && "select-none"
            )}
          >
            <ImageBlock
              ref={imageRef}
              src={node.attrs.src!}
              alt={node.attrs.alt ?? undefined}
              title={node.attrs.title ?? undefined}
              selected={selected}
              imageWidth={displayWidth}
              imageHeight={displayHeight}
              objectFit={node.attrs.objectFit}
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
          {node.attrs.caption && (
            <figcaption className="text-muted-foreground mt-2 text-center text-sm">
              {node.attrs.caption}
            </figcaption>
          )}
        </figure>
      ) : (
        <ImagePlaceholder
          onImageReady={handleImageReady}
          config={extension.options}
        />
      )}
    </NodeViewWrapper>
  )
}

// =============================================================================
// TiptapImage Extension
// =============================================================================

export interface TiptapImageOptions extends TiptapImageConfig {
  inline: boolean
  HTMLAttributes: Record<string, unknown>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tiptapImage: {
      setImage: (options: {
        src?: string | null
        alt?: string
        title?: string
      }) => ReturnType
    }
  }
}

export const TiptapImageExtension = Node.create<TiptapImageOptions>({
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

  // Ensure content is preserved during drag operations
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
          return width ? parseInt(width, 10) : null
        },
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const height = (el as HTMLImageElement).getAttribute("height")
          return height ? parseInt(height, 10) : null
        },
        renderHTML: (attrs) => (attrs.height ? { height: attrs.height } : {}),
      },
      alignment: {
        default: "left" as TiptapImageAlignment,
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
        default: "contain" as TiptapImageObjectFit,
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute("data-object-fit") ?? "contain",
        renderHTML: (attrs) => ({ "data-object-fit": attrs.objectFit }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: "img[src]" },
      // Also parse img tags without src (for placeholder state)
      { tag: "img" },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView as any)
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

// =============================================================================
// Image Bubble Menu
// =============================================================================

const OBJECT_FIT_OPTIONS: { value: TiptapImageObjectFit; label: string }[] = [
  { value: "contain", label: "Contain" },
  { value: "cover", label: "Cover" },
  { value: "fill", label: "Fill" },
  { value: "none", label: "None" },
  { value: "scale-down", label: "Scale Down" },
]

export const ImageBubbleMenu = () => {
  const { editor } = useContext(TipTapContext)
  const [captionOpen, setCaptionOpen] = useState(false)
  const [captionValue, setCaptionValue] = useState("")
  const [isConstrained, setIsConstrained] = useState(true)
  const widthInputRef = useRef<HTMLInputElement>(null)
  const heightInputRef = useRef<HTMLInputElement>(null)

  const isImageActive = editor?.isActive("image") ?? false

  const getDefaultDimensions = useCallback(() => {
    if (!editor || !isImageActive) return { width: "", height: "" }

    const attrs = editor.getAttributes("image")

    // If node has stored width/height, use those
    if (attrs.width && attrs.height) {
      return {
        width: attrs.width.toString(),
        height: attrs.height.toString(),
      }
    }

    // Otherwise, get actual rendered dimensions from DOM
    const { node } = editor.state.selection as any
    if (node?.type?.name === "image" && node.attrs.src) {
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
  }, [editor, isImageActive])

  const defaultDimensions = getDefaultDimensions()

  if (!editor) return null

  const getImageAttrs = () => {
    if (!isImageActive) return null
    return editor.getAttributes("image") as {
      src: string | null
      alt: string | null
      width: number | null
      height: number | null
      alignment: TiptapImageAlignment
      caption: string | null
      objectFit: TiptapImageObjectFit
    }
  }

  const applyWidth = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue > 0) {
      if (isConstrained && defaultDimensions.width && defaultDimensions.height) {
        const aspectRatio = parseInt(defaultDimensions.height, 10) / parseInt(defaultDimensions.width, 10)
        const newHeight = Math.round(numValue * aspectRatio)
        editor
          .chain()
          .focus()
          .updateAttributes("image", { width: numValue, height: newHeight })
          .run()
      } else {
        editor
          .chain()
          .focus()
          .updateAttributes("image", { width: numValue })
          .run()
      }
    }
  }

  const applyHeight = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue > 0) {
      if (isConstrained && defaultDimensions.width && defaultDimensions.height) {
        const aspectRatio = parseInt(defaultDimensions.width, 10) / parseInt(defaultDimensions.height, 10)
        const newWidth = Math.round(numValue * aspectRatio)
        editor
          .chain()
          .focus()
          .updateAttributes("image", { width: newWidth, height: numValue })
          .run()
      } else {
        editor
          .chain()
          .focus()
          .updateAttributes("image", { height: numValue })
          .run()
      }
    }
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

  const handleAlignmentChange = (alignment: TiptapImageAlignment) => {
    editor.chain().focus().updateAttributes("image", { alignment }).run()
  }

  const handleObjectFitChange = (objectFit: TiptapImageObjectFit) => {
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

  const attrs = getImageAttrs()

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "bottom",
        offset: [0, 8],
      }}
      shouldShow={({ editor }) => editor.isActive("image")}
      className="w-fit"
    >
      <div className="bg-popover flex items-center gap-1 rounded-md border p-1 shadow-md">
        {/* Size Controls */}
        <div className="flex items-center gap-1">
          <Input
            ref={widthInputRef}
            key={`width-${defaultDimensions.width}-${isConstrained}`}
            type="number"
            placeholder="W"
            defaultValue={defaultDimensions.width}
            onBlur={handleWidthBlur}
            onKeyDown={handleWidthKeyDown}
            className="appearance-[textfield-number-spin-button] h-7 w-16 text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            min={50}
          />
          <Button
            variant={isConstrained ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsConstrained(!isConstrained)}
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
            type="number"
            placeholder="H"
            defaultValue={defaultDimensions.height}
            onBlur={handleHeightBlur}
            onKeyDown={handleHeightKeyDown}
            className="appearance-[textfield-number-spin-button] h-7 w-16 text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            min={50}
          />
        </div>

        {/* Divider */}
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

        {/* Divider */}
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
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]"
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

        {/* Divider */}
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

        {/* Divider */}
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

// =============================================================================
// Export Namespace
// =============================================================================

export const TiptapImage = {
  Extension: TiptapImageExtension,
  Placeholder: ImagePlaceholder,
  UploadZone,
  UrlInput,
  Block: ImageBlock,
}
