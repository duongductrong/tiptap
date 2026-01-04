"use client"

import {
  TiptapBubbleMenu,
  TiptapContent,
  TiptapEditor,
} from "@/registry/tiptap/tiptap"
import { cn } from "@/lib/utils"

export type EditorMode = "essential" | "notion"

const ESSENTIAL_CONTENT = `
<h1>Essential Document Editor</h1>
<p>Welcome to the <strong>Essential/Document</strong> mode. This editor provides a clean, distraction-free writing experience perfect for:</p>
<ul>
  <li>Long-form articles and blog posts</li>
  <li>Technical documentation</li>
  <li>Meeting notes and reports</li>
</ul>

<h2>Rich Text Formatting</h2>
<p>You can use <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, and <code>inline code</code> to style your text.</p>

<blockquote>
  <p>"The art of writing is the art of discovering what you believe." — Gustave Flaubert</p>
</blockquote>

<h2>Code Blocks</h2>
<p>Syntax highlighting is built-in for all popular languages:</p>
<pre><code class="language-typescript">interface Document {
  title: string;
  content: string;
  createdAt: Date;
}

function createDocument(title: string): Document {
  return {
    title,
    content: "",
    createdAt: new Date(),
  };
}</code></pre>

<h2>Tables</h2>
<p>Organize data with fully editable tables:</p>
<table>
  <tbody>
    <tr>
      <th>Feature</th>
      <th>Description</th>
      <th>Status</th>
    </tr>
    <tr>
      <td>Rich Text</td>
      <td>Bold, italic, underline, and more</td>
      <td>✅ Complete</td>
    </tr>
    <tr>
      <td>Code Blocks</td>
      <td>Syntax highlighting for 30+ languages</td>
      <td>✅ Complete</td>
    </tr>
    <tr>
      <td>Tables</td>
      <td>Resizable columns with cell merging</td>
      <td>✅ Complete</td>
    </tr>
  </tbody>
</table>

<hr>
<p>Start editing above to experience the full power of the Essential editor!</p>
`

const NOTION_CONTENT = `
<h1>Notion Block Style Editor</h1>
<p>Welcome to the <strong>Notion Block Style</strong> mode! This editor emphasizes <em>block-based</em> content creation.</p>

<h2>/ Slash Commands</h2>
<p>Type <code>/</code> anywhere to open the block menu. Try these commands:</p>
<ul>
  <li><code>/heading</code> — Create section headings</li>
  <li><code>/bullet</code> — Add bullet lists</li>
  <li><code>/code</code> — Insert code blocks</li>
  <li><code>/quote</code> — Add blockquotes</li>
  <li><code>/table</code> — Insert tables</li>
  <li><code>/image</code> — Add images</li>
</ul>

<blockquote>
  <p>💡 <strong>Pro Tip:</strong> Slash commands make content creation lightning fast. Just type and go!</p>
</blockquote>

<h2>Interactive Blocks</h2>
<p>Each block is independently editable and can be reordered:</p>

<pre><code class="language-javascript">// You can insert code blocks with /code
const greeting = "Hello, Notion-style editor!";
console.log(greeting);</code></pre>

<h2>Quick Actions</h2>
<p>Select any text to reveal the <strong>bubble menu</strong> with formatting options. Try it now!</p>

<table>
  <tbody>
    <tr>
      <th>Shortcut</th>
      <th>Action</th>
    </tr>
    <tr>
      <td><code>/</code></td>
      <td>Open block menu</td>
    </tr>
    <tr>
      <td>Select text</td>
      <td>Show formatting toolbar</td>
    </tr>
    <tr>
      <td><code>---</code></td>
      <td>Insert horizontal rule</td>
    </tr>
  </tbody>
</table>

<hr>
<p>Try typing <code>/</code> below to start creating blocks!</p>
<p></p>
`

interface EditorPlaygroundProps {
  mode: EditorMode
  className?: string
}

const EditorPlayground = ({ mode, className }: EditorPlaygroundProps) => {
  const content = mode === "essential" ? ESSENTIAL_CONTENT : NOTION_CONTENT

  return (
    <div className={cn("relative", className)}>
      <TiptapEditor content={content} editable={true}>
        <TiptapContent
          className={cn(
            "prose dark:prose-invert max-w-full p-6 md:p-8",
            "min-h-[500px] md:min-h-[600px]",
            "[&_.tiptap]:outline-none [&_.tiptap]:min-h-full"
          )}
        />
        <TiptapBubbleMenu />
      </TiptapEditor>
    </div>
  )
}

export default EditorPlayground
