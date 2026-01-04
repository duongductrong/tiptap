"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TiptapBubbleMenu,
  TiptapButton,
  TiptapContent,
  TiptapDivider,
  TiptapDropdown,
  TiptapEditor,
  TiptapLabel,
  TiptapToolbar,
} from "@/registry/tiptap/tiptap"
import { motion } from "motion/react"
import PartialEditorAddExtension from "./partial-editor-add-extension"

const DEMO_CONTENT = `
<h1>Welcome to the Tiptap Editor</h1>
<p>This is a <strong>full-featured</strong> rich text editor built with <em>Tiptap</em> and <u>shadcn/ui</u>. Try the <code>/</code> slash command to insert blocks!</p>

<h2>Text Formatting</h2>
<p>The editor supports various text styles:</p>
<ul>
  <li><strong>Bold text</strong> for emphasis</li>
  <li><em>Italic text</em> for subtle emphasis</li>
  <li><u>Underlined text</u> for highlights</li>
  <li><s>Strikethrough</s> for corrections</li>
  <li><code>Inline code</code> for technical terms</li>
</ul>

<h2>Lists & Structure</h2>
<p>Organize your content with lists:</p>
<ol>
  <li>First ordered item</li>
  <li>Second ordered item</li>
  <li>Third ordered item</li>
</ol>

<h3>Blockquotes</h3>
<blockquote>
  <p>"The best way to predict the future is to invent it." — Alan Kay</p>
</blockquote>

<hr />

<h2>Code Blocks</h2>
<p>Syntax highlighting is built-in:</p>
<pre><code class="language-typescript">interface EditorProps {
  content: string;
  onChange?: (html: string) => void;
}

function Editor({ content, onChange }: EditorProps) {
  return <TiptapEditor content={content} />;
}</code></pre>

<h2>Tables</h2>
<p>Create and edit tables with ease:</p>
<table>
  <tbody>
    <tr>
      <th>Feature</th>
      <th>Status</th>
      <th>Notes</th>
    </tr>
    <tr>
      <td>Rich Text</td>
      <td>✅ Complete</td>
      <td>Bold, italic, underline, strike</td>
    </tr>
    <tr>
      <td>Code Blocks</td>
      <td>✅ Complete</td>
      <td>Syntax highlighting included</td>
    </tr>
    <tr>
      <td>Tables</td>
      <td>✅ Complete</td>
      <td>Resizable columns</td>
    </tr>
  </tbody>
</table>

<h2>Text Alignment</h2>
<p style="text-align: left">Left aligned text (default)</p>
<p style="text-align: center">Center aligned text</p>
<p style="text-align: right">Right aligned text</p>

<hr />

<p>Start editing to explore all features! 🚀</p>
`

export interface PartialEditorProps {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PartialEditor = (props: PartialEditorProps) => {
  return (
    <motion.div
      className="max-w-4xl mx-auto mt-8 md:mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <div className="flex items-center justify-center mb-4">
        <Tabs defaultValue="document">
          <TabsList>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="essential" disabled>
              Essential
            </TabsTrigger>
            <TabsTrigger value="advanced" disabled>
              Advanced
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TiptapEditor content={DEMO_CONTENT}>
        <TiptapToolbar className="sticky top-0 p-4 justify-center mb-8 bg-background z-10">
          <TiptapButton action="undo">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapButton action="redo">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapDivider />
          <TiptapDropdown
            actions={[
              "paragraph",
              "heading1",
              "heading2",
              "heading3",
              "heading4",
              "heading5",
              "heading6",
              "divider",
              "codeBlock",
              "blockquote",
            ]}
          >
            <TiptapLabel label=":icon :label" />
          </TiptapDropdown>
          <TiptapDivider />
          <TiptapButton action="bold">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapButton action="italic">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapButton action="underline">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapButton action="strike">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapButton action="image">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapDivider />
          <TiptapButton action="left">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapButton action="center">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapButton action="right">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapButton action="justify">
            <TiptapLabel label=":icon" />
          </TiptapButton>
          <TiptapDropdown actions={["left", "center", "right", "justify"]}>
            <TiptapLabel label=":icon :label" />
          </TiptapDropdown>
          <TiptapDivider />
          <PartialEditorAddExtension />
        </TiptapToolbar>
        <TiptapContent className="prose dark:prose-invert max-w-full" />

        <TiptapBubbleMenu />
      </TiptapEditor>
    </motion.div>
  )
}

export default PartialEditor
