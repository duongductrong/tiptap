import { TextAlign } from "@tiptap/extension-text-align"
import TiptapTypography from "@tiptap/extension-typography"
import TiptapUnderline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import { createEditorExtension } from "./editor"

export const EditorEssentialExtension = createEditorExtension({
  extension: [
    StarterKit.configure({
      codeBlock: false, // Use CodeBlock extension separately
    }),
    TiptapUnderline.configure({
      HTMLAttributes: {
        class: "underline underline-offset-4",
      },
    }),
    TextAlign.configure({
      types: [
        "heading",
        "paragraph",
        "blockquote",
        "bulletList",
        "orderedList",
      ],
    }),
    TiptapTypography.configure({}),
  ],
})
