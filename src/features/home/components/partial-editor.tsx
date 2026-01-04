"use client"

import {
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface PartialEditorProps { }

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

      <TiptapEditor
        // floatingMenu={<TipTapFloatingMenu> </TipTapFloatingMenu>}
        // bubbleMenu={
        //   <TipTapBubbleMenu>This is the bubble menu</TipTapBubbleMenu>
        // }
        content={`<h2>Welcome to Tiptap!</h2>
        <p>This is a <em>basic</em> example of <strong>Tiptap</strong>. It offers a variety of text styles you’d expect from a text editor. Let's explore some features:</p>
        <ul>
          <li><p>Here’s a bullet list with one item…</p></li>
          <li><p>…and here’s another item.</p></li>
        </ul>
        <p>Isn’t that great? All of this is editable. But wait, there’s more. Check out this code block:</p>
        <pre><code class="language-css">body {
  display: none;
}</code></pre>
        <p>Impressive, right? This is just the beginning. Try clicking around and explore more features. Don’t forget to check the other examples too.</p>
        <blockquote><p>Wow, that’s amazing. Keep up the great work! 👏 <br>— Your Mentor</p></blockquote>
        <h3>Advanced Features</h3>
        <p>Beyond basic text editing, Tiptap supports advanced features like:</p>
        <ol>
          <li><p>Nested lists for better organization.</p></li>
          <li><p>Tables to structure data efficiently.</p></li>
          <li><p>Embeds for integrating multimedia content.</p></li>
        </ol>
        <p>With Tiptap, the possibilities are endless. Dive deeper and discover what you can create!</p>`}
      >
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
      </TiptapEditor>
    </motion.div>
  )
}

export default PartialEditor
