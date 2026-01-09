"use client"

/**
 * Read-Only Viewer Example
 *
 * This example shows how to use the editor as a read-only content viewer:
 * - Renders HTML content without editing capabilities
 * - Preserves all styling (code blocks, tables, images, etc.)
 * - Perfect for blog posts, documentation, or comment displays
 *
 * Use this for displaying user-generated content.
 */

import {
  EditorProvider,
  EditorContent,
} from "@/registry/tiptap/editor"

import {
  EditorImageExtension,
} from "@/registry/tiptap/editor-image"

import {
  EditorTableExtensions,
} from "@/registry/tiptap/editor-table"

import {
  EditorCodeBlockExtension,
  CODEBLOCK_STYLES,
} from "@/registry/tiptap/editor-code-block"

interface ReadOnlyViewerProps {
  content: string
  className?: string
}

export function ReadOnlyViewer({ content, className }: ReadOnlyViewerProps) {
  return (
    <EditorProvider
      content={content}
      editable={false}
      extensions={[
        EditorImageExtension,
        ...EditorTableExtensions,
        EditorCodeBlockExtension,
      ]}
    >
      <style>{CODEBLOCK_STYLES}</style>
      <EditorContent
        className={className ?? "prose prose-sm dark:prose-invert max-w-none p-4"}
      />
      {/* No bubble menus or toolbars needed for read-only mode */}
    </EditorProvider>
  )
}

// =============================================================================
// Example with sample content
// =============================================================================

const SAMPLE_CONTENT = `
<h1>Welcome to the Read-Only Viewer</h1>
<p>This content is rendered using the editor in read-only mode. All formatting is preserved, but users cannot edit the content.</p>

<h2>Features Supported</h2>
<ul>
  <li><strong>Bold</strong>, <em>italic</em>, and <u>underlined</u> text</li>
  <li><code>Inline code</code> formatting</li>
  <li>Links like <a href="https://example.com">this one</a></li>
  <li><mark>Highlighted text</mark></li>
</ul>

<h2>Code Block</h2>
<pre><code class="language-typescript">function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));</code></pre>

<h2>Blockquote</h2>
<blockquote>
  <p>The only way to do great work is to love what you do.</p>
  <p>— Steve Jobs</p>
</blockquote>

<h2>Task List</h2>
<ul data-type="taskList">
  <li data-checked="true"><label><input type="checkbox" checked></label><div>Completed task</div></li>
  <li data-checked="false"><label><input type="checkbox"></label><div>Pending task</div></li>
</ul>
`

export function ReadOnlyViewerDemo() {
  return (
    <div className="rounded-lg border">
      <div className="bg-muted/50 border-b px-4 py-2">
        <span className="text-muted-foreground text-sm">Read-Only Mode</span>
      </div>
      <ReadOnlyViewer content={SAMPLE_CONTENT} />
    </div>
  )
}
