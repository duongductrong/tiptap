"use client"

import {
  TiptapBubbleMenu,
  TiptapContent,
  TiptapEditor,
} from "@/registry/editor/tiptap"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

// Demo content for different editor showcases
const MAIN_EDITOR_CONTENT = `
<h2>Rich Text Editor</h2>
<p>This is a <strong>full-featured</strong> rich text editor built with <em>Tiptap</em> and <u>shadcn/ui</u>. Try the <code>/</code> slash command to insert blocks!</p>
<p>The editor supports various text styles including <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, and <code>inline code</code>.</p>
<blockquote>
  <p>"The best way to predict the future is to invent it." — Alan Kay</p>
</blockquote>
`

const CODE_BLOCK_CONTENT = `
<h3>Code Blocks</h3>
<p>Syntax highlighting built-in:</p>
<pre><code class="language-typescript">interface EditorProps {
  content: string;
  onChange?: (html: string) => void;
}

function Editor({ content }: EditorProps) {
  return <TiptapEditor content={content} />;
}</code></pre>
`

const TABLE_CONTENT = `
<h3>Tables</h3>
<table>
  <tbody>
    <tr>
      <th>Feature</th>
      <th>Status</th>
    </tr>
    <tr>
      <td>Rich Text</td>
      <td>✅ Complete</td>
    </tr>
    <tr>
      <td>Code Blocks</td>
      <td>✅ Complete</td>
    </tr>
    <tr>
      <td>Tables</td>
      <td>✅ Complete</td>
    </tr>
  </tbody>
</table>
`

const LIST_CONTENT = `
<h3>Lists & Structure</h3>
<ul>
  <li><strong>Bold text</strong> for emphasis</li>
  <li><em>Italic text</em> for subtle emphasis</li>
  <li><code>Inline code</code> for technical terms</li>
</ul>
<ol>
  <li>First ordered item</li>
  <li>Second ordered item</li>
  <li>Third ordered item</li>
</ol>
`

interface EditorCardProps {
  content: string
  className?: string
  size?: "default" | "large"
  delay?: number
}

const EditorCard = ({
  content,
  className,
  size = "default",
  delay = 0,
}: EditorCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "border-border bg-card relative overflow-hidden rounded-xl border",
        "ring-border/50 ring-1",
        size === "large" && "row-span-2",
        className
      )}
    >
      <TiptapEditor content={content} editable={false}>
        <TiptapContent
          className={cn(
            "prose dark:prose-invert max-w-full p-4",
            size === "large" ? "min-h-[400px]" : "min-h-[200px]",
            "[&_.tiptap]:min-h-full [&_.tiptap]:outline-none"
          )}
        />
        <TiptapBubbleMenu />
      </TiptapEditor>
    </motion.div>
  )
}

export interface PartialEditorProps {}

const PartialEditor = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Main Editor - Large Card */}
        <EditorCard content={MAIN_EDITOR_CONTENT} size="large" delay={0} />

        {/* Code Block Preview */}
        <EditorCard content={CODE_BLOCK_CONTENT} delay={0.1} />

        {/* Table Preview */}
        <EditorCard content={TABLE_CONTENT} delay={0.2} />

        {/* Lists Preview - spans 2 columns on md+ */}
        <EditorCard
          content={LIST_CONTENT}
          delay={0.3}
          className="md:col-span-2"
        />
      </div>
    </div>
  )
}

export default PartialEditor
