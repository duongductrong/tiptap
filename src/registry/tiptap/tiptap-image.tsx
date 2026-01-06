"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { mergeAttributes, Node } from "@tiptap/core"
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
import { AlertCircle, ImageUp, Link2, Loader2, Upload, X } from "lucide-react"
import {
    ComponentProps,
    createContext,
    DragEvent,
    PropsWithChildren,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react"

// =============================================================================
// Types & Configuration
// =============================================================================

export type TiptapImageUploadStrategy = "base64" | "server" | "url"

export interface TiptapImageConfig {
    uploadStrategy?: TiptapImageUploadStrategy
    onUpload?: (file: File) => Promise<string>
    maxFileSize?: number
    acceptedTypes?: string[]
    onError?: (error: Error) => void
}

const DEFAULT_CONFIG: Required<Omit<TiptapImageConfig, "onUpload" | "onError">> = {
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
        throw new Error("TiptapImage components must be used within TiptapImage.Extension")
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
        return `Invalid file type. Accepted: ${acceptedTypes.map(t => t.split("/")[1]).join(", ")}`
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
            <div className="my-4 rounded-lg border border-border bg-muted/30">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                        <TabsTrigger
                            value="upload"
                            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                            <Upload className="mr-2 size-4" />
                            Upload
                        </TabsTrigger>
                        <TabsTrigger
                            value="embed"
                            className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                            <Link2 className="mr-2 size-4" />
                            Embed link
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-4">
                        {error && (
                            <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
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
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                Maximum file size: {formatFileSize(config.maxFileSize ?? DEFAULT_CONFIG.maxFileSize)}
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
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
                </>
            ) : (
                <>
                    <ImageUp className="size-8 text-muted-foreground" />
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled}
                    >
                        Upload file
                    </Button>
                    <p className="mt-2 text-sm text-muted-foreground">
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
// ImageBlock - Rendered image with styling
// =============================================================================

interface ImageBlockProps extends ComponentProps<"img"> {
    selected?: boolean
}

function ImageBlock({ className, selected, ...props }: ImageBlockProps) {
    return (
        <img
            {...props}
            className={cn(
                "my-4 max-w-full rounded-lg border object-contain",
                selected && "ring-2 ring-primary ring-offset-2",
                className
            )}
        />
    )
}

// =============================================================================
// ImageNodeView - Main NodeView component
// =============================================================================

interface ImageNodeViewProps {
    node: {
        attrs: {
            src: string | null
            alt: string | null
            title: string | null
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

    const handleImageReady = (src: string, alt?: string) => {
        updateAttributes({ src, alt: alt ?? node.attrs.alt })
    }

    return (
        <NodeViewWrapper
            data-type="image"
            data-src={node.attrs.src ?? undefined}
            data-alt={node.attrs.alt ?? undefined}
            data-title={node.attrs.title ?? undefined}
        >
            {hasSrc ? (
                <div className="relative group">
                    <ImageBlock
                        src={node.attrs.src!}
                        alt={node.attrs.alt ?? undefined}
                        title={node.attrs.title ?? undefined}
                        selected={selected}
                        draggable={false}
                    />
                    {selected && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={deleteNode}
                        >
                            <X className="size-4" />
                        </Button>
                    )}
                </div>
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
// Export Namespace
// =============================================================================

export const TiptapImage = {
    Extension: TiptapImageExtension,
    Placeholder: ImagePlaceholder,
    UploadZone,
    UrlInput,
    Block: ImageBlock,
}
