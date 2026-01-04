import { Node, mergeAttributes } from "@tiptap/core"

export interface ImageOptions {
    inline: boolean
    allowBase64: boolean
    allowLocal: boolean
    allowNetwork: boolean
    allowSameDomain: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
