"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Layers, Sparkles, Eye, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  MinimalEditor,
  FullFeaturedEditor,
  CustomExtensionEditor,
  ReadOnlyViewerDemo,
} from "../components"

type ExampleTab = "minimal" | "full" | "custom" | "readonly"

const PlaygroundPage = () => {
  const [tab, setTab] = useState<ExampleTab>("full")

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="mx-auto text-center">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Editor Playground
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore different ways to use the modular Tiptap editor
            </p>
          </div>
        </div>

        {/* Example Tabs */}
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as ExampleTab)}
          className="w-full"
        >
          <div className="flex justify-center">
            <TabsList className="mb-6 h-auto flex-wrap gap-1">
              <TabsTrigger value="minimal" className="gap-2">
                <FileText className="size-4" />
                Minimal
              </TabsTrigger>
              <TabsTrigger value="full" className="gap-2">
                <Layers className="size-4" />
                Full-Featured
              </TabsTrigger>
              <TabsTrigger value="custom" className="gap-2">
                <Sparkles className="size-4" />
                Custom Extensions
              </TabsTrigger>
              <TabsTrigger value="readonly" className="gap-2">
                <Eye className="size-4" />
                Read-Only
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Minimal Editor */}
          <TabsContent value="minimal" className="mt-0">
            <MinimalEditor />
          </TabsContent>

          {/* Full-Featured Editor */}
          <TabsContent value="full" className="mt-0">
            <FullFeaturedEditor />
          </TabsContent>

          {/* Custom Extension Editor */}
          <TabsContent value="custom" className="mt-0">
            <CustomExtensionEditor />
          </TabsContent>

          {/* Read-Only Viewer */}
          <TabsContent value="readonly" className="mt-0">
            <ReadOnlyViewerDemo />
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <div className="bg-muted/30 mt-8 rounded-lg border p-4">
          <h3 className="mb-2 font-medium">💡 Quick Tips</h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>
              • Type <code className="bg-muted rounded px-1 py-0.5">/</code> to
              open the slash command menu (Full-Featured & Custom)
            </li>
            <li>• Select text to reveal the formatting bubble menu</li>
            <li>
              • Use{" "}
              <kbd className="bg-muted rounded px-1 py-0.5 text-xs">
                Cmd/Ctrl + B
              </kbd>{" "}
              for bold,{" "}
              <kbd className="bg-muted rounded px-1 py-0.5 text-xs">
                Cmd/Ctrl + I
              </kbd>{" "}
              for italic
            </li>
            <li>• Each example uses the same modular registry components</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default PlaygroundPage
