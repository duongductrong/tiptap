"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, Variants } from "motion/react"
import { ArrowRight, Copy, Check } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export interface IntroductionProps {}

const variants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

const INSTALL_COMMAND =
  "npx shadcn@latest add https://tiptap-seven.vercel.app/schema/editor.json"

const Introduction = () => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMAND)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      className="flex flex-col items-center py-16 text-center md:py-24"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
      }}
    >
      {/* Main Headline */}
      <motion.h1
        variants={itemVariants}
        className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
      >
        Beautiful editors, made simple.
      </motion.h1>

      {/* Description */}
      <motion.p
        variants={itemVariants}
        className="text-muted-foreground mt-6 max-w-2xl text-base leading-relaxed sm:text-lg"
      >
        Beautiful, ready to use, and customizable editor components built on
        Tiptap. Styled with shadcn/ui. Zero config. One command setup.
      </motion.p>

      {/* Install Command */}
      <motion.div
        variants={itemVariants}
        className="bg-muted/50 border-border mt-8 flex items-center gap-2 rounded-lg border px-4 py-2.5 font-mono text-sm"
      >
        <span className="text-muted-foreground">$</span>
        <code className="text-foreground">{INSTALL_COMMAND}</code>
        <button
          onClick={handleCopy}
          className={cn(
            "ml-2 rounded-md p-1.5 transition-colors",
            "hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
          aria-label="Copy command"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        variants={itemVariants}
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <Button className="gap-2">
          Get Started
          <ArrowRight className="size-4" />
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/playground">View Examples</Link>
        </Button>
      </motion.div>
    </motion.div>
  )
}

export default Introduction
