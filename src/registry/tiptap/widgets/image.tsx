import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useTiptapEditor } from "@/registry/tiptap/tiptap"

export interface ImageWidgetAsset {
    id: string
    src: string
    alt: string
    title: string
    type: string
    size: string
}
export const ImageWidget = () => {
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
