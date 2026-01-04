"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Blocks, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import EditorPlayground, { EditorMode } from "../components/editor-playground"

const PlaygroundPage = () => {
  const [mode, setMode] = useState<EditorMode>("essential")

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Editor Playground
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore the full capabilities of the Tiptap editor
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as EditorMode)}
          className="w-full"
        >
          <div className="flex justify-center">
            <TabsList className="mb-6">
              <TabsTrigger value="essential" className="gap-2">
                <FileText className="size-4" />
                Essential / Document
              </TabsTrigger>
              <TabsTrigger value="notion" className="gap-2">
                <Blocks className="size-4" />
                Notion Block Style
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="essential" className="mt-0">
            <EditorPlayground mode="essential" />
          </TabsContent>

          <TabsContent value="notion" className="mt-0">
            <EditorPlayground mode="notion" />
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <div className="mt-8 p-4">
          <h3 className="font-medium mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              • Type <code className="px-1 py-0.5 rounded bg-muted">/</code> to
              open the slash command menu
            </li>
            <li>• Select text to reveal the formatting toolbar</li>
            <li>
              • Use keyboard shortcuts:{" "}
              <kbd className="px-1 py-0.5 rounded bg-muted text-xs">
                Cmd/Ctrl + B
              </kbd>{" "}
              for bold,{" "}
              <kbd className="px-1 py-0.5 rounded bg-muted text-xs">
                Cmd/Ctrl + I
              </kbd>{" "}
              for italic
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default PlaygroundPage
