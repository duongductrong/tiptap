"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, Variants } from "motion/react"
import { ArrowRight, Copy, Check } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export interface IntroductionProps {}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const buttonVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
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
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.2,
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
        <motion.button
          onClick={handleCopy}
          className={cn(
            "ml-2 rounded-md p-1.5",
            "text-muted-foreground hover:text-foreground",
            "transition-colors duration-200"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Copy command"
        >
          <motion.span
            key={copied ? "check" : "copy"}
            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </motion.span>
        </motion.button>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        variants={itemVariants}
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <motion.div variants={buttonVariants}>
          <Button
            className="gap-2 transition-shadow duration-200 hover:shadow-lg"
            asChild
          >
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="size-4" />
              </motion.span>
            </motion.span>
          </Button>
        </motion.div>
        <motion.div variants={buttonVariants}>
          <Button variant="ghost" asChild>
            <Link href="/playground">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Examples
              </motion.span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default Introduction
