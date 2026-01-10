"use client"

import { Button } from "@/components/ui/button"
import { Github, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"

const SwitchThemeButton = dynamic(
  () =>
    import("@/components/widgets/theme").then((mod) => mod.SwitchThemeButton),
  {
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="icon">
        <Loader2 className="size-4 animate-spin" />
      </Button>
    ),
  }
)

export interface FrontHeaderProps {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FrontHeader = (props: FrontHeaderProps) => {
  return (
    <header className="bg-background sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="bg-foreground flex size-6 items-center justify-center rounded-md">
            <span className="text-background text-xs font-bold">T</span>
          </div>
          <span className="hidden sm:inline-block">Editor</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="https://github.com/duongductrong/tiptap"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Github className="size-4" />
              <span className="hidden sm:inline-block">GitHub</span>
            </Link>
          </Button>

          <SwitchThemeButton />
        </div>
      </div>
    </header>
  )
}

export default FrontHeader
