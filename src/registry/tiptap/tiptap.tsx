/* eslint-disable consistent-return */
/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Extension, mergeAttributes, Node, Range } from "@tiptap/core"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { TextAlign } from "@tiptap/extension-text-align"
import TiptapTypography from "@tiptap/extension-typography"
import TiptapUnderline from "@tiptap/extension-underline"
import {
    BubbleMenu,
    Editor,
    EditorContent,
    FloatingMenu,
    ReactRenderer,
    useEditor,
    UseEditorOptions,
} from "@tiptap/react"
import Suggestion, { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion"
import StarterKit from "@tiptap/starter-kit"
import tippy, { Instance as TippyInstance } from "tippy.js"
import { all, createLowlight } from "lowlight"
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    ChevronDown,
    Code,
    Code2,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    ImageUp,
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
    MessageSquare,
    Table,
    CheckSquare,
} from "lucide-react"
import React, {
    Children,
    cloneElement,
    ComponentProps,
    ComponentType,
    createContext,
    Fragment,
    PropsWithChildren,
    ReactElement,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"

// =============================================================================
// CodeBlock Extension (inlined from extensions/code-block.tsx)
// =============================================================================

const lowlight = createLowlight(all)

const CodeBlock = Extension.create({
    name: "codeBlockLowlight",
    addExtensions() {
        return [
            CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
        ]
    },
})

// =============================================================================
// Image Extension (inlined from extensions/image.tsx)
// =============================================================================

export interface ImageOptions {
    inline: boolean
    allowBase64: boolean
    allowLocal: boolean
    allowNetwork: boolean
    allowSameDomain: boolean
    HTMLAttributes: Record<string, any>
    validate?: (url: string) => boolean
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        image: {
            setImage: (options: {
                src: string
                alt?: string
                title?: string
            }) => ReturnType
        }
    }
}

export const ImageEvent = new Event("tiptap:image")

export const Image = Node.create<ImageOptions>({
    name: "image",

    addOptions() {
        return {
            inline: false,
            allowBase64: true,
            allowLocal: true,
            allowNetwork: true,
            allowSameDomain: true,
            HTMLAttributes: {
                class: "rounded-lg border object-contain",
            },
            validate(url: string) {
                if (!this.allowBase64 && url.startsWith("data:")) return false
                if (!this.allowLocal && url.startsWith("file:")) return false
                if (!this.allowNetwork && !url.startsWith("http")) return false
                if (!this.allowSameDomain && url.startsWith("http")) return false
                return true
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

    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: (el) => (el as HTMLImageElement).getAttribute("src"),
                renderHTML: (attrs) => ({ src: attrs.src }),
            },
            alt: {
                default: null,
                parseHTML: (el) => (el as HTMLImageElement).getAttribute("alt"),
                renderHTML: (attrs) => ({ alt: attrs.alt }),
            },
            title: {
                default: null,
                parseHTML: (el) => (el as HTMLImageElement).getAttribute("title"),
                renderHTML: (attrs) => ({ title: attrs.title }),
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: "img[src]",
                getAttrs: (el) => {
                    const url = (el as HTMLImageElement).getAttribute("src") || ""
                    if (!this.options?.validate?.(url)) return false
                    return null
                },
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
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
// Slash Menu Extension
// =============================================================================

export interface SlashMenuItem {
    title: string
    description: string
    icon: React.ElementType
    searchTerms: string[]
    command: (editor: Editor) => void
}

const slashMenuItems: SlashMenuItem[] = [
    // Basic Blocks
    {
        title: "Text",
        description: "Start writing with plain text",
        icon: Type,
        searchTerms: ["paragraph", "text", "plain"],
        command: (editor) => editor.chain().focus().setParagraph().run(),
    },
    {
        title: "Heading 1",
        description: "Large section heading",
        icon: Heading1,
        searchTerms: ["heading", "h1", "title", "large"],
        command: (editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
        title: "Heading 2",
        description: "Medium section heading",
        icon: Heading2,
        searchTerms: ["heading", "h2", "subtitle", "medium"],
        command: (editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
        title: "Heading 3",
        description: "Small section heading",
        icon: Heading3,
        searchTerms: ["heading", "h3", "small"],
        command: (editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
        title: "Bullet List",
        description: "Create a simple bullet list",
        icon: List,
        searchTerms: ["bullet", "list", "unordered", "ul"],
        command: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
        title: "Ordered List",
        description: "Create a numbered list",
        icon: ListOrdered,
        searchTerms: ["ordered", "list", "numbered", "ol"],
        command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    // Advanced Blocks
    {
        title: "Quote",
        description: "Capture a quote",
        icon: TextQuote,
        searchTerms: ["quote", "blockquote", "citation"],
        command: (editor) => editor.chain().focus().setBlockquote().run(),
    },
    {
        title: "Code Block",
        description: "Display code with syntax highlighting",
        icon: Code2,
        searchTerms: ["code", "codeblock", "programming"],
        command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
        title: "Horizontal Rule",
        description: "Insert a visual divider",
        icon: Minus,
        searchTerms: ["divider", "hr", "horizontal", "rule", "line"],
        command: (editor) => editor.chain().focus().setHorizontalRule().run(),
    },
    {
        title: "Image",
        description: "Insert an image from the library",
        icon: ImageUp,
        searchTerms: ["image", "picture", "photo", "media"],
        command: () => document.dispatchEvent(ImageEvent),
    },
    {
        title: "Callout",
        description: "Highlight important information",
        icon: MessageSquare,
        searchTerms: ["callout", "note", "info", "warning", "alert"],
        command: (editor) =>
            editor
                .chain()
                .focus()
                .insertContent({
                    type: "blockquote",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", text: "💡 " }],
                        },
                    ],
                })
                .run(),
    },
    {
        title: "Table",
        description: "Insert a table",
        icon: Table,
        searchTerms: ["table", "grid", "spreadsheet"],
        command: (editor) => {
            // Table extension not included - placeholder
            editor
                .chain()
                .focus()
                .insertContent("⚠️ Table extension not installed")
                .run()
        },
    },
    {
        title: "Todo List",
        description: "Task list with checkboxes",
        icon: CheckSquare,
        searchTerms: ["todo", "task", "checkbox", "checklist"],
        command: (editor) => {
            // TaskList extension not included - placeholder
            editor
                .chain()
                .focus()
                .insertContent("⚠️ TaskList extension not installed")
                .run()
        },
    },
]

function filterSlashMenuItems(query: string): SlashMenuItem[] {
    if (!query) return slashMenuItems
    const lowerQuery = query.toLowerCase()
    return slashMenuItems.filter(
        (item) =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.searchTerms.some((term) => term.includes(lowerQuery))
    )
}

export interface SlashMenuListProps {
    items: SlashMenuItem[]
    command: (item: SlashMenuItem) => void
    editor: Editor
}

export interface SlashMenuListRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const SlashMenuList = React.forwardRef<SlashMenuListRef, SlashMenuListProps>(
    ({ items, command }, ref) => {
        const [selectedIndex, setSelectedIndex] = useState(0)
        const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([])

        const selectItem = (index: number) => {
            const item = items[index]
            if (item) command(item)
        }

        const handleKeyDown = (props: { event: KeyboardEvent }): boolean => {
            const { event } = props
            if (event.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
                return true
            }
            if (event.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev + 1) % items.length)
                return true
            }
            if (event.key === "Enter") {
                selectItem(selectedIndex)
                return true
            }
            return false
        }

        React.useImperativeHandle(ref, () => ({
            onKeyDown: handleKeyDown,
        }))

        useEffect(() => {
            setSelectedIndex(0)
        }, [items])

        useEffect(() => {
            const selectedItem = itemRefs.current[selectedIndex]
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: "nearest", behavior: "smooth" })
            }
        }, [selectedIndex])

        if (items.length === 0) {
            return (
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                    No results found
                </div>
            )
        }

        return (
            <ScrollArea className="max-h-[300px] overflow-auto rounded-md border bg-popover p-1 shadow-md">
                {items.map((item, index) => (
                    <button
                        key={item.title}
                        ref={(el) => { itemRefs.current[index] = el }}
                        onClick={() => selectItem(index)}
                        className={cn(
                            "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                            index === selectedIndex
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <div
                            className="flex size-8 items-center justify-center rounded-lg border border-border bg-background"
                            aria-hidden="true"
                        >
                            <item.icon size={16} strokeWidth={2} className="opacity-60" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className="text-xs text-muted-foreground">
                                {item.description}
                            </span>
                        </div>
                    </button>
                ))}
            </ScrollArea>
        )
    }
)
SlashMenuList.displayName = "SlashMenuList"

interface SlashMenuSuggestionOptions {
    editor: Editor
}

function createSlashMenuSuggestion(): Omit<SuggestionOptions<SlashMenuItem>, "editor"> {
    return {
        char: "/",
        items: ({ query }) => filterSlashMenuItems(query),
        render: () => {
            let component: ReactRenderer<SlashMenuListRef> | null = null
            let popup: TippyInstance[] | null = null

            return {
                onStart: (props: SuggestionProps<SlashMenuItem>) => {
                    component = new ReactRenderer(SlashMenuList, {
                        props: {
                            ...props,
                            command: (item: SlashMenuItem) => {
                                props.command(item)
                            },
                        },
                        editor: props.editor,
                    })

                    if (!props.clientRect) return

                    popup = tippy("body", {
                        getReferenceClientRect: props.clientRect as () => DOMRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: "manual",
                        placement: "bottom-start",
                    })
                },
                onUpdate: (props: SuggestionProps<SlashMenuItem>) => {
                    component?.updateProps({
                        ...props,
                        command: (item: SlashMenuItem) => {
                            props.command(item)
                        },
                    })

                    if (!props.clientRect || !popup?.[0]) return

                    popup[0].setProps({
                        getReferenceClientRect: props.clientRect as () => DOMRect,
                    })
                },
                onKeyDown: (props: { event: KeyboardEvent }): boolean => {
                    if (props.event.key === "Escape") {
                        popup?.[0]?.hide()
                        return true
                    }
                    return component?.ref?.onKeyDown(props) ?? false
                },
                onExit: () => {
                    popup?.[0]?.destroy()
                    component?.destroy()
                },
            }
        },
        command: ({ editor, range, props }) => {
            // Delete the "/" trigger and any query text
            editor.chain().focus().deleteRange(range).run()
            // Execute the selected command
            props.command(editor)
        },
    }
}

export const SlashMenuExtension = Extension.create({
    name: "slashMenu",

    addOptions() {
        return {
            suggestion: createSlashMenuSuggestion(),
        }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ]
    },
})

// =============================================================================
// ImageWidget (inlined from widgets/image.tsx)
// =============================================================================

export interface ImageWidgetAsset {
    id: string
    src: string
    alt: string
    title: string
    type: string
    size: string
}

const extensions = [
    /**
     * >Nodes
     * Blockquote, BulletList, CodeBlock, Document, HardBreak, Heading,
     * HorizontalRule, ListItem, OrderedList, Paragraph, Text
     *
     * >Marks
     * Bold, Code, Italic, Strike
     *
     * >Extensions
     * Dropcursor, Gapcursor, History
     * @reference https://tiptap.dev/api/extensions/starter-kit
     */
    StarterKit,

    /**
     * @reference https://tiptap.dev/docs/editor/extensions/marks/underline
     */
    TiptapUnderline.configure({
        HTMLAttributes: {
            class: "underline underline-offset-4",
        },
    }),

    /**
     * @reference https://tiptap.dev/api/extensions/text-align
     */
    TextAlign.configure({
        types: ["heading", "paragraph", "blockquote", "bulletList", "orderedList"],
        defaultAlignment: "left",
    }),

    /**
     * @reference https://tiptap.dev/api/extensions/typography
     */
    TiptapTypography.configure({}),

    /**
     * @description Allow to format text as code block with syntax highlighting, lowlight
     * @reference @/registry/tiptap/extensions/code-block.tsx
     */
    CodeBlock.configure({}),

    /**
     * @description Allow to insert images from the internet
     * @reference @/registry/tiptap/extensions/image.tsx
     */
    Image.configure({
        inline: false,
        allowBase64: true,
        allowLocal: true,
        allowNetwork: true,
        allowSameDomain: true,
    }),

    /**
     * @description Slash Menu for inserting blocks via "/" trigger
     * @reference Notion-style slash commands
     */
    SlashMenuExtension.configure({}),
]

const tiptapActions = {
    // @tiptap/starter-kit
    undo: "undo",
    redo: "redo",
    bold: "bold",
    italic: "italic",
    strike: "strike",
    code: "code",
    divider: "divider",
    heading1: "heading1",
    heading2: "heading2",
    heading3: "heading3",
    heading4: "heading4",
    heading5: "heading5",
    heading6: "heading6",
    text: "paragraph",
    blockquote: "blockquote",
    bulletList: "bulletList",
    orderedList: "orderedList",
    codeBlock: "codeBlock",
    // @tiptap/extension-underline
    underline: "underline",
    // @/registry/tiptap/extensions/text-align.tsx
    left: "left",
    center: "center",
    right: "right",
    justify: "justify",
    // @/registry/tiptap/extensions/image.tsx
    image: "image",
} as const

const tiptapTextAlignActiveActions = [
    tiptapActions.left,
    tiptapActions.center,
    tiptapActions.right,
    tiptapActions.justify,
] as TiptapAction[]

type TiptapAction = (typeof tiptapActions)[keyof typeof tiptapActions]

type TiptapBlock = {
    key: TiptapAction
    icon: React.ElementType
    label: string
    description: string

    /**
     * @description Optional component to render when the action is selected
     * @example const ImageWidget = () => JSX.Element
     */
    widget?: ComponentType<any>

    /**
     * @description Optional event to dispatch when the action is selected
     * @example const ImageEvent = new Event("tiptap:image")
     */
    event?: Event
}

const tiptapBlocksMap = new Map<TiptapAction, TiptapBlock>([
    [
        tiptapActions.undo,
        {
            key: tiptapActions.undo,
            icon: Undo,
            label: "Undo",
            description: "Undo the last action",
        },
    ],
    [
        tiptapActions.redo,
        {
            key: tiptapActions.redo,
            icon: Redo,
            label: "Redo",
            description: "Redo the last action",
        },
    ],
    [
        tiptapActions.text,
        {
            key: tiptapActions.text,
            icon: Type,
            label: "Text",
            description: "Start writing with plain text",
        },
    ],
    [
        tiptapActions.heading1,
        {
            key: tiptapActions.heading1,
            icon: Heading1,
            label: "Heading 1",
            description: "Use this for main titles",
        },
    ],
    [
        tiptapActions.heading2,
        {
            key: tiptapActions.heading2,
            icon: Heading2,
            label: "Heading 2",
            description: "Ideal for subsections",
        },
    ],
    [
        tiptapActions.heading3,
        {
            key: tiptapActions.heading3,
            icon: Heading3,
            label: "Heading 3",
            description: "Use for smaller subsections",
        },
    ],
    [
        tiptapActions.heading4,
        {
            key: tiptapActions.heading4,
            icon: Heading4,
            label: "Heading 4",
            description: "Suitable for detailed sections",
        },
    ],
    [
        tiptapActions.heading5,
        {
            key: tiptapActions.heading5,
            icon: Heading5,
            label: "Heading 5",
            description: "For minor details",
        },
    ],
    [
        tiptapActions.heading6,
        {
            key: tiptapActions.heading6,
            icon: Heading6,
            label: "Heading 6",
            description: "Use for the smallest details",
        },
    ],
    [
        tiptapActions.blockquote,
        {
            key: tiptapActions.blockquote,
            icon: TextQuote,
            label: "Quote",
            description: "Capture a quote",
        },
    ],
    [
        tiptapActions.bold,
        {
            key: tiptapActions.bold,
            icon: Bold,
            label: "Bold",
            description: "Make text bold",
        },
    ],
    [
        tiptapActions.italic,
        {
            key: tiptapActions.italic,
            icon: Italic,
            label: "Italic",
            description: "Italicize text",
        },
    ],
    [
        tiptapActions.underline,
        {
            key: tiptapActions.underline,
            icon: Underline,
            label: "Underline",
            description: "Underline text",
        },
    ],
    [
        tiptapActions.strike,
        {
            key: tiptapActions.strike,
            icon: Strikethrough,
            label: "Strikethrough",
            description: "Strike through text",
        },
    ],
    [
        tiptapActions.code,
        {
            key: tiptapActions.code,
            icon: Code,
            label: "Code",
            description: "Format text as code",
        },
    ],
    [
        tiptapActions.codeBlock,
        {
            key: tiptapActions.codeBlock,
            icon: Code2,
            label: "Code Block",
            description: "Format text as code block",
        },
    ],
    [
        tiptapActions.divider,
        {
            key: tiptapActions.divider,
            icon: Minus,
            label: "Divider",
            description: "Visually divide blocks",
        },
    ],
    [
        tiptapActions.bulletList,
        {
            key: tiptapActions.bulletList,
            icon: List,
            label: "Bullet List",
            description: "Create a bullet list",
        },
    ],
    [
        tiptapActions.orderedList,
        {
            key: tiptapActions.orderedList,
            icon: ListOrdered,
            label: "Ordered List",
            description: "Create an ordered list",
        },
    ],
    [
        tiptapActions.left,
        {
            key: tiptapActions.left,
            icon: AlignLeft,
            label: "Left",
            description: "Align text to the left",
        },
    ],
    [
        tiptapActions.center,
        {
            key: tiptapActions.center,
            icon: AlignCenter,
            label: "Center",
            description: "Align text to the center",
        },
    ],
    [
        tiptapActions.right,
        {
            key: tiptapActions.right,
            icon: AlignRight,
            label: "Right",
            description: "Align text to the right",
        },
    ],
    [
        tiptapActions.justify,
        {
            key: tiptapActions.justify,
            icon: AlignJustify,
            label: "Justify",
            description: "Align text to the justify",
        },
    ],
    [
        tiptapActions.image,
        {
            key: tiptapActions.image,
            icon: ImageUp,
            label: "Image",
            description: "Insert an image",
            event: ImageEvent,
            widget: ImageWidget,
        },
    ],
])

const tiptapAllBlocks = Array.from(tiptapBlocksMap.values())

export interface TipTapContextType {
    editor: Editor
}

export const TipTapContext = createContext<TipTapContextType>(
    {} as TipTapContextType
)

export const useTiptapEditor = () => {
    const ctx = useContext(TipTapContext)

    if (!ctx)
        throw new Error("useTiptapEditor must be used within a TiptapEditor")

    return ctx
}

// =============================================================================
// ImageWidget (inlined from widgets/image.tsx)
// =============================================================================

function ImageWidget() {
    const { editor } = useTiptapEditor()
    const assets: ImageWidgetAsset[] = [
        {
            id: "1",
            src: "https://images.unsplash.com/photo-1740165886179-c2be3d6447ca",
            alt: "Sunset at the beach",
            title: "Sunset at the beach",
            type: "image/jpeg",
            size: "1024x768",
        },
        {
            id: "2",
            src: "https://images.unsplash.com/photo-1682687982501-1e58ab814714",
            alt: "Mountain landscape",
            title: "Mountain landscape",
            type: "image/jpeg",
            size: "1920x1080",
        },
        {
            id: "3",
            src: "https://images.unsplash.com/photo-1682687218147-9806132dc697",
            alt: "City skyline",
            title: "City skyline",
            type: "image/jpeg",
            size: "2048x1365",
        },
        {
            id: "4",
            src: "https://images.unsplash.com/photo-1682687982501-1e58ab814714",
            alt: "Forest path",
            title: "Forest path",
            type: "image/jpeg",
            size: "2048x1365",
        },
        {
            id: "5",
            src: "https://images.unsplash.com/photo-1682687218147-9806132dc697",
            alt: "Desert landscape",
            title: "Desert landscape",
            type: "image/jpeg",
            size: "2048x1365",
        },
        {
            id: "6",
            src: "https://images.unsplash.com/photo-1682695796497-31a44224d6d6",
            alt: "Ocean waves",
            title: "Ocean waves",
            type: "image/jpeg",
            size: "2048x1365",
        },
        {
            id: "7",
            src: "https://images.unsplash.com/photo-1682695797221-8164ff1fafc9",
            alt: "Snow capped peaks",
            title: "Snow capped peaks",
            type: "image/jpeg",
            size: "2048x1365",
        },
        {
            id: "8",
            src: "https://images.unsplash.com/photo-1682686581551-867e0b208bd1",
            alt: "Autumn forest",
            title: "Autumn forest",
            type: "image/jpeg",
            size: "2048x1365",
        },
    ]

    const [open, setOpen] = useState(false)

    const handleSelect = (asset: ImageWidgetAsset) => {
        editor.chain().focus().setImage({ src: asset.src, alt: asset.alt }).run()

        setOpen(false)
    }

    useEffect(() => {
        const handler = () => {
            setOpen((prev) => !prev)
        }

        document.addEventListener("tiptap:image", handler)

        return () => {
            document.removeEventListener("tiptap:image", handler)
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-screen-lg">
                <DialogHeader className="mb-4">
                    <DialogTitle>Media Library</DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Input type="search" placeholder="Search" className="w-full" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm">
                            Add new folder
                        </Button>

                        <Button variant="default" size="sm">
                            Add new assets
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {assets.map((asset) => (
                        <div
                            key={asset.id}
                            className="flex flex-col bg-muted rounded-md overflow-hidden"
                        >
                            <img
                                src={asset.src}
                                alt={asset.alt}
                                className="rounded-lg border w-full h-[175px] object-cover leading-none"
                            />
                            <div className="p-3">
                                <p className="text-sm font-medium">{asset.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {asset.type} - {asset.size}
                                </p>
                                <div className="flex items-center gap-2 justify-end">
                                    <Button size="sm" onClick={() => handleSelect(asset)}>
                                        Select
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export interface TiptapEditorProps extends PropsWithChildren, UseEditorOptions {
    content: string
    floatingMenu?: React.ReactNode
    bubbleMenu?: React.ReactNode
}

export const TiptapEditor = ({
    content,
    floatingMenu,
    bubbleMenu,
    children,
    ...editorProps
}: TiptapEditorProps) => {
    const editor = useEditor({
        content,
        extensions,
        ...editorProps,
    })

    const sharedValues = useMemo<TipTapContextType>(
        () => ({ editor: editor! }),
        [editor?.state]
    )

    return (
        <TipTapContext.Provider value={sharedValues}>
            {children}

            {floatingMenu}
            {bubbleMenu}
        </TipTapContext.Provider>
    )
}

export interface TiptapLabelProps extends ComponentProps<"div"> {
    action?: TiptapAction
    label: ":icon :label" | ":label" | ":label :icon" | ":icon"
}

export const TiptapLabel = ({
    className,
    action,
    label: labelPattern = ":label",
    ...props
}: TiptapLabelProps) => {
    const ctx = useContext(TipTapDropdownContext)

    const keyLabels = useTiptapEditorCurrentActionKeys()

    const tiptapBlocks = useMemo(() => {
        const filteredKeyLabels = ctx?.sharedBlocks?.length
            ? keyLabels.filter((k) => ctx?.sharedBlocks.find((b) => b.key === k))
            : keyLabels

        return filteredKeyLabels.map((key) => tiptapBlocksMap.get(key)!)
    }, [keyLabels, ctx])

    const getLabelNode = (block: TiptapBlock) => {
        if (labelPattern === ":icon :label") {
            return (
                <Fragment key={block.key}>
                    {block?.icon ? <block.icon className="size-4" /> : null}{" "}
                    {block?.label}
                </Fragment>
            )
        }

        if (labelPattern === ":icon") {
            return (
                <Fragment key={block.key}>
                    {block?.icon ? <block.icon className="size-4" /> : null}
                </Fragment>
            )
        }

        if (labelPattern === ":label :icon") {
            return (
                <Fragment key={block.key}>
                    {block?.label}{" "}
                    {block?.icon ? <block.icon className="size-4" /> : null}
                </Fragment>
            )
        }

        return block?.label
    }

    const label = useMemo(() => {
        if (action) {
            const block = tiptapBlocksMap.get(action)

            if (!block) return null

            return getLabelNode(block)
        }

        return tiptapBlocks.map(getLabelNode)
    }, [action, tiptapBlocks])

    if (tiptapBlocks.length) {
        // console.log("tiptapBlocksMap.get(action!)!", tiptapBlocks)
    }

    return (
        <span
            {...props}
            className={cn("inline-flex items-center gap-2", className)}
        >
            {Children.count(label) !== 0 ? label : getLabelNode(ctx?.sharedBlocks[0])}
        </span>
    )
}

export interface TiptapButtonProps extends ComponentProps<typeof Button> {
    action: TiptapAction
}

export const TiptapButton = ({
    action,
    children,
    className,
    ...props
}: TiptapButtonProps) => {
    const { editor } = useTiptapEditor()

    const isActive = useTiptapEditorIsActive(action)

    const handleOnClick = () => {
        const dispatchEventHandler = () => {
            const customEvt = tiptapBlocksMap.get(action)?.event
            if (customEvt) {
                document.dispatchEvent(customEvt)
            }
        }

        switch (action) {
            case tiptapActions.image:
                dispatchEventHandler()
                break
            default:
                onTiptapEventChangeBlock(editor, action)
        }
    }

    const block = useMemo(() => tiptapBlocksMap.get(action), [action])

    if (!editor) return null

    return (
        <>
            <Button
                variant={isActive ? "secondary" : "ghost"}
                size="icon"
                type="button"
                {...props}
                className={cn("size-8 w-auto min-w-8 px-2", className)}
                onClick={handleOnClick}
                aria-label={block?.label}
                disabled={!canUseAction(editor, action)}
            >
                {cloneElement(children as ReactElement, { action } as any)}
            </Button>
            {block?.widget ? <block.widget /> : null}
        </>
    )
}

export const TiptapDivider = (props: ComponentProps<"span">) => {
    const { editor } = useTiptapEditor()

    if (!editor) return null

    return (
        <span {...props} className="inline-flex items-center gap-2 text-border">
            |
        </span>
    )
}

export interface TipTapDropdownContextType {
    sharedBlocks: TiptapBlock[]
}

export const TipTapDropdownContext = createContext<TipTapDropdownContextType>({
    sharedBlocks: [],
} as TipTapDropdownContextType)

export interface TiptapDropdownProps
    extends ComponentProps<typeof DropdownMenu> {
    actions: TiptapAction[]
}

export const TiptapDropdown = ({
    actions = tiptapAllBlocks.map((block) => block.key),
    children,
    ...props
}: TiptapDropdownProps) => {
    const { editor } = useTiptapEditor()

    const handleChangeBlock = (key: TiptapAction) => {
        onTiptapEventChangeBlock(editor, key)
    }

    const filteredBlocks = actions.map((action) => tiptapBlocksMap.get(action)!)

    const sharedValues = useMemo<TipTapDropdownContextType>(
        () => ({ sharedBlocks: filteredBlocks }),
        [filteredBlocks]
    )

    if (!editor) return null

    return (
        <TipTapDropdownContext.Provider value={sharedValues}>
            <DropdownMenu {...props}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="shadow-none"
                        aria-label="Open blocks menu"
                    >
                        {children}

                        <ChevronDown className="size-3 text-muted-foreground ml-1" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="pb-2">
                    <ScrollArea className="max-h-[300px] overflow-auto">
                        {filteredBlocks.map((item) => (
                            <DropdownMenuItem
                                key={item.label}
                                onClick={() => handleChangeBlock(item.key)}
                            >
                                <div
                                    className="flex size-8 items-center justify-center rounded-lg border border-border bg-background"
                                    aria-hidden="true"
                                >
                                    <item.icon size={16} strokeWidth={2} className="opacity-60" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{item.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.description}
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </ScrollArea>
                </DropdownMenuContent>
            </DropdownMenu>
        </TipTapDropdownContext.Provider>
    )
}

export interface TiptapToolbarProps extends ComponentProps<"div"> { }

export const TiptapToolbar = ({ className, ...props }: TiptapToolbarProps) => (
    <div
        {...props}
        className={cn("flex flex-row items-center gap-2", className)}
    />
)

export interface TiptapContentProps
    extends Omit<ComponentProps<typeof EditorContent>, "editor"> { }

export const TiptapContent = ({ className, ...props }: TiptapContentProps) => {
    const { editor } = useContext(TipTapContext)

    if (!editor) return null

    return (
        <EditorContent
            {...props}
            className={cn("w-full [&>*]:outline-none", className)}
            editor={editor}
        />
    )
}
export interface TipTapFloatingMenuProps
    extends Omit<ComponentProps<typeof FloatingMenu>, "editor"> { }

export const TipTapFloatingMenu = (props: TipTapFloatingMenuProps) => {
    const { editor } = useContext(TipTapContext)

    return (
        <FloatingMenu {...props} editor={editor}>
            {/* <ScrollArea className="pb-2 max-h-[400px] overflow-auto bg-background border border-border rounded-md">
        {tiptapAllBlocks.map((item, index) => (
          <div
            className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0"
            key={`${item.key}-${index}`}
          >
            <div
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background"
              aria-hidden="true"
            >
              <item.icon size={16} strokeWidth={2} className="opacity-60" />
            </div>
            <div>
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea> */}
        </FloatingMenu>
    )
}

export interface TipTapBubbleMenuProps
    extends Omit<ComponentProps<typeof BubbleMenu>, "editor"> { }

export const TipTapBubbleMenu = (props: TipTapBubbleMenuProps) => {
    const { editor } = useContext(TipTapContext)

    if (!editor) return null

    return (
        <BubbleMenu {...props} editor={editor}>
            This is the bubble menu
        </BubbleMenu>
    )
}

export function useTiptapEditorCurrentActionKeys() {
    const { editor } = useTiptapEditor()
    const selectionKeys = getCurrentTiptapAction(editor)

    return selectionKeys.length ? selectionKeys : [tiptapActions.text]
}

export function useTiptapEditorIsActive(key: TiptapAction) {
    const { editor } = useTiptapEditor()
    return !editor
        ? false
        : tiptapTextAlignActiveActions.includes(key)
            ? editor?.isActive({ textAlign: key })
            : editor?.isActive(key)
}

export function onTiptapEventChangeBlock(
    editor: Editor,
    key: TiptapAction,
    options: Record<string, any> = {}
) {
    switch (key) {
        case tiptapActions.undo:
            editor.chain().focus().undo().run()
            break
        case tiptapActions.redo:
            editor.chain().focus().redo().run()
            break
        case tiptapActions.text:
            editor.chain().focus().setParagraph().run()
            break
        case tiptapActions.heading1:
            editor.chain().focus().setHeading({ level: 1 }).run()
            break
        case tiptapActions.heading2:
            editor.chain().focus().setHeading({ level: 2 }).run()
            break
        case tiptapActions.heading3:
            editor.chain().focus().setHeading({ level: 3 }).run()
            break
        case tiptapActions.heading4:
            editor.chain().focus().setHeading({ level: 4 }).run()
            break
        case tiptapActions.heading5:
            editor.chain().focus().setHeading({ level: 5 }).run()
            break
        case tiptapActions.heading6:
            editor.chain().focus().setHeading({ level: 6 }).run()
            break
        case tiptapActions.codeBlock:
            editor.chain().focus().toggleCodeBlock().run()
            break
        case tiptapActions.divider:
            editor.chain().focus().setHorizontalRule().run()
            break
        case tiptapActions.bold:
            editor.chain().focus().toggleBold().run()
            break
        case tiptapActions.italic:
            editor.chain().focus().toggleItalic().run()
            break
        case tiptapActions.strike:
            editor.chain().focus().toggleStrike().run()
            break
        case tiptapActions.code:
            editor.chain().focus().toggleCode().run()
            break
        case tiptapActions.blockquote:
            editor.chain().focus().setBlockquote().run()
            break
        case tiptapActions.bulletList:
            editor.chain().focus().toggleBulletList().run()
            break
        case tiptapActions.orderedList:
            editor.chain().focus().toggleOrderedList().run()
            break
        case tiptapActions.left:
            editor.chain().focus().setTextAlign("left").run()
            break
        case tiptapActions.center:
            editor.chain().focus().setTextAlign("center").run()
            break
        case tiptapActions.right:
            editor.chain().focus().setTextAlign("right").run()
            break
        case tiptapActions.underline:
            editor.chain().focus().toggleUnderline().run()
            break
        case tiptapActions.image:
            editor
                .chain()
                .focus()
                .setImage({
                    src: options.src,
                    alt: options?.alt,
                    title: options?.title,
                })
                .run()
            break
    }
}

export function canUseAction(editor: Editor, action: TiptapAction) {
    switch (action) {
        // Required @tiptap/starter-kit
        case tiptapActions.undo:
            return editor.can().chain().focus().undo().run()
        case tiptapActions.redo:
            return editor.can().chain().focus().redo().run()
        case tiptapActions.text:
            return editor.can().chain().focus().setParagraph().run()
        case tiptapActions.heading1:
            return editor.can().chain().focus().setHeading({ level: 1 }).run()
        case tiptapActions.heading2:
            return editor.can().chain().focus().setHeading({ level: 2 }).run()
        case tiptapActions.heading3:
            return editor.can().chain().focus().setHeading({ level: 3 }).run()
        case tiptapActions.heading4:
            return editor.can().chain().focus().setHeading({ level: 4 }).run()
        case tiptapActions.heading5:
            return editor.can().chain().focus().setHeading({ level: 5 }).run()
        case tiptapActions.heading6:
            return editor.can().chain().focus().setHeading({ level: 6 }).run()
        case tiptapActions.codeBlock:
            return editor.can().chain().focus().toggleCodeBlock().run()
        case tiptapActions.divider:
            return editor.can().chain().focus().setHorizontalRule().run()
        case tiptapActions.bold:
            return editor.can().chain().focus().toggleBold().run()
        case tiptapActions.italic:
            return editor.can().chain().focus().toggleItalic().run()
        case tiptapActions.strike:
            return editor.can().chain().focus().toggleStrike().run()
        case tiptapActions.code:
            return editor.can().chain().focus().toggleCode().run()
        case tiptapActions.blockquote:
            return editor.can().chain().focus().setBlockquote().run()
        case tiptapActions.bulletList:
            return editor.can().chain().focus().toggleBulletList().run()
        case tiptapActions.orderedList:
            return editor.can().chain().focus().toggleOrderedList().run()
        // Required @tiptap/extension-text-align
        case tiptapActions.left:
            return editor.can().chain().focus().setTextAlign("left").run()
        case tiptapActions.center:
            return editor.can().chain().focus().setTextAlign("center").run()
        case tiptapActions.right:
            return editor.can().chain().focus().setTextAlign("right").run()
        // Required @tiptap/extension-underline
        case tiptapActions.underline:
            return editor.can().chain().focus().toggleUnderline().run()
        case tiptapActions.image:
            return true
    }
}

export function getCurrentTiptapAction(editor: Editor): TiptapAction[] {
    const keys: Set<TiptapAction> = new Set([tiptapActions.text])

    keys.clear()

    if (editor.isActive("heading")) {
        const headingLevel = editor.getAttributes("heading").level
        const headingMap = `heading${headingLevel}`
        keys.add((tiptapActions as any)[headingMap])
    }

    tiptapAllBlocks.forEach((block) => {
        if (tiptapTextAlignActiveActions.includes(block.key)) {
            if (editor.isActive({ textAlign: block.key })) {
                keys.add(block.key)
            }
        }

        if (editor.isActive(block.key)) {
            keys.add(block.key)
        }
    })

    return Array.from(keys)
}
