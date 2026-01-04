"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpRight, Diameter, Loader2 } from "lucide-react"
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
    <header className="flex items-center justify-between h-16 container mx-auto">
      <div className="flex items-center gap-2 text-primary">
        <Diameter className="size-4 cursor-pointer" />
        <span className="text-sm font-bold">Tiptap extensions</span>
      </div>

      <div className="flex items-center gap-8">
        <Link
          href="https://twitter.com/duongductrong_"
          target="_blank"
          className="text-sm font-normal flex items-center gap-1"
        >
          Twitter <ArrowUpRight className="size-3 text-muted-foreground" />
        </Link>
        <Link
          href="https://github.com/duongductrong"
          target="_blank"
          className="text-sm font-normal flex items-center gap-1"
        >
          Github <ArrowUpRight className="size-3 text-muted-foreground" />
        </Link>

        <SwitchThemeButton />
      </div>
    </header>
  )
}

export default FrontHeader
