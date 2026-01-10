"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { DropdownMenuContent as DropdownMenuContentPrimitive } from "@radix-ui/react-dropdown-menu"
import { Table } from "@tiptap/extension-table"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableRow } from "@tiptap/extension-table-row"
import { BubbleMenu, useEditorState } from "@tiptap/react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  ChevronDown,
  Columns3,
  Combine,
  Rows3,
  Split,
  TableProperties,
  Trash2,
} from "lucide-react"
import * as React from "react"
import { EditorContext, createEditorExtension } from "./editor"

// =============================================================================
// EditorTableExtension
// =============================================================================

export interface EditorTableOptions {
  resizable?: boolean
  HTMLAttributes?: Record<string, unknown>
}

export const EditorTableExtension = Table.configure({
  resizable: true,
  HTMLAttributes: {
    class: cn(
      "w-full caption-bottom text-sm my-4 border border-border",
      "border-collapse table-fixed",
      // Resize cursor when resizing
      "[&.resize-cursor]:cursor-col-resize"
    ),
  },
})

export const EditorTableRowExtension = TableRow.configure({
  HTMLAttributes: {
    class:
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
  },
})

export const EditorTableHeaderExtension = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: null,
        parseHTML: (element) =>
          element.style.textAlign || element.getAttribute("data-text-align"),
        renderHTML: (attributes) => {
          if (!attributes.textAlign) return {}
          return {
            style: `text-align: ${attributes.textAlign}`,
            "data-text-align": attributes.textAlign,
          }
        },
      },
      verticalAlign: {
        default: null,
        parseHTML: (element) =>
          element.style.verticalAlign ||
          element.getAttribute("data-vertical-align"),
        renderHTML: (attributes) => {
          if (!attributes.verticalAlign) return {}
          return {
            style: `vertical-align: ${attributes.verticalAlign}`,
            "data-vertical-align": attributes.verticalAlign,
          }
        },
      },
    }
  },
}).configure({
  HTMLAttributes: {
    class: cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
      "border-b border-r last:border-r-0 bg-muted/10",
      "relative box-border min-w-[1em]",
      "[&>p]:m-0",
      // Selected cell overlay using Tailwind after: pseudo-element
      "[&.selectedCell]:after:content-[''] [&.selectedCell]:after:absolute [&.selectedCell]:after:inset-0",
      "[&.selectedCell]:after:bg-primary [&.selectedCell]:after:opacity-[0.08] [&.selectedCell]:after:pointer-events-none"
    ),
  },
})

export const EditorTableCellExtension = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: null,
        parseHTML: (element) =>
          element.style.textAlign || element.getAttribute("data-text-align"),
        renderHTML: (attributes) => {
          if (!attributes.textAlign) return {}
          return {
            style: `text-align: ${attributes.textAlign}`,
            "data-text-align": attributes.textAlign,
          }
        },
      },
      verticalAlign: {
        default: null,
        parseHTML: (element) =>
          element.style.verticalAlign ||
          element.getAttribute("data-vertical-align"),
        renderHTML: (attributes) => {
          if (!attributes.verticalAlign) return {}
          return {
            style: `vertical-align: ${attributes.verticalAlign}`,
            "data-vertical-align": attributes.verticalAlign,
          }
        },
      },
    }
  },
}).configure({
  HTMLAttributes: {
    class: cn(
      "p-2 align-middle border-b",
      "[&:not(:last-child)]:border-r",
      "relative box-border min-w-[1em]",
      "[&>p]:m-0",
      // Selected cell overlay using Tailwind after: pseudo-element
      "[&.selectedCell]:after:content-[''] [&.selectedCell]:after:absolute [&.selectedCell]:after:inset-0",
      "[&.selectedCell]:after:bg-primary [&.selectedCell]:after:opacity-[0.08] [&.selectedCell]:after:pointer-events-none"
    ),
  },
})

export const EditorTableExtensions = createEditorExtension({
  extension: [
    EditorTableExtension,
    EditorTableRowExtension,
    EditorTableHeaderExtension,
    EditorTableCellExtension,
  ],
  bubbleMenu: EditorBubbleMenuTable,
})

// =============================================================================
// EditorBubbleMenuTable
// =============================================================================

export interface EditorBubbleMenuTableProps extends Omit<
  React.ComponentProps<typeof BubbleMenu>,
  "editor" | "children"
> {}

export function EditorBubbleMenuTable(props: EditorBubbleMenuTableProps) {
  const ctx = React.useContext(EditorContext)
  const editor = ctx?.editor

  const {
    canMergeCells = false,
    canSplitCell = false,
    canDeleteColumn = false,
    canDeleteRow = false,
  } = useEditorState({
    editor: editor ?? null,
    selector: ({
      editor: e,
    }): {
      canMergeCells: boolean
      canSplitCell: boolean
      canDeleteColumn: boolean
      canDeleteRow: boolean
    } => {
      if (!e) {
        return {
          canMergeCells: false,
          canSplitCell: false,
          canDeleteColumn: false,
          canDeleteRow: false,
        }
      }
      return {
        canMergeCells: e.can().mergeCells(),
        canSplitCell: e.can().splitCell(),
        canDeleteColumn: e.can().deleteColumn(),
        canDeleteRow: e.can().deleteRow(),
      }
    },
  }) ?? {}

  if (!editor) return null

  return (
    <BubbleMenu
      {...props}
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "bottom",
        getReferenceClientRect: () => {
          const { view, state } = editor
          const domAtPos = view.domAtPos(state.selection.from)
          const node = domAtPos.node
          const tableElement =
            node instanceof Element
              ? node.closest("table")
              : node.parentElement?.closest("table")
          if (tableElement) {
            return tableElement.getBoundingClientRect()
          }
          return view.dom.getBoundingClientRect()
        },
      }}
      shouldShow={({ editor: e }) => e.isActive("table")}
      className="w-fit"
    >
      <div className="bg-popover flex items-center gap-0.5 rounded-md border p-0.5 shadow-md">
        {/* Column Actions */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
            >
              <Columns3 className="size-3.5" />
              Column
              <ChevronDown className="size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContentPrimitive
            align="start"
            sideOffset={8}
            className={cn(
              "min-w-[160px]",
              "bg-popover text-popover-foreground z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]"
            )}
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
            >
              <TableProperties className="mr-2 size-3.5" />
              Toggle Header
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
              <ArrowLeftToLine className="mr-2 size-3.5" />
              Insert Before
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <ArrowRightToLine className="mr-2 size-3.5" />
              Insert After
            </DropdownMenuItem>
            <div className="bg-border my-1 h-px" />
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .setCellAttribute("textAlign", "left")
                  .run()
              }
            >
              <AlignLeft className="mr-2 size-3.5" />
              Align Left
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .setCellAttribute("textAlign", "center")
                  .run()
              }
            >
              <AlignCenter className="mr-2 size-3.5" />
              Align Center
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .setCellAttribute("textAlign", "right")
                  .run()
              }
            >
              <AlignRight className="mr-2 size-3.5" />
              Align Right
            </DropdownMenuItem>
            <div className="bg-border my-1 h-px" />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-3.5" />
              Delete Column
            </DropdownMenuItem>
          </DropdownMenuContentPrimitive>
        </DropdownMenu>

        {/* Row Actions */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
            >
              <Rows3 className="size-3.5" />
              Row
              <ChevronDown className="size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContentPrimitive
            align="start"
            sideOffset={8}
            className={cn(
              "min-w-[160px]",
              "bg-popover text-popover-foreground z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]"
            )}
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            >
              <TableProperties className="mr-2 size-3.5" />
              Toggle Header
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowBefore().run()}
            >
              <ArrowUpToLine className="mr-2 size-3.5" />
              Insert Above
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <ArrowDownToLine className="mr-2 size-3.5" />
              Insert Below
            </DropdownMenuItem>

            <div className="bg-border my-1 h-px" />
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .setCellAttribute("verticalAlign", "top")
                  .run()
              }
            >
              <AlignVerticalJustifyStart className="mr-2 size-3.5" />
              Align Top
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .setCellAttribute("verticalAlign", "middle")
                  .run()
              }
            >
              <AlignVerticalJustifyCenter className="mr-2 size-3.5" />
              Align Middle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .setCellAttribute("verticalAlign", "bottom")
                  .run()
              }
            >
              <AlignVerticalJustifyEnd className="mr-2 size-3.5" />
              Align Bottom
            </DropdownMenuItem>
            <div className="bg-border my-1 h-px" />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-3.5" />
              Delete Row
            </DropdownMenuItem>
          </DropdownMenuContentPrimitive>
        </DropdownMenu>

        {/* Cell Actions */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
            >
              <Combine className="size-3.5" />
              Cell
              <ChevronDown className="size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContentPrimitive
            align="start"
            sideOffset={8}
            className={cn(
              "min-w-[160px]",
              "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            )}
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().mergeCells().run()}
              disabled={!canMergeCells}
            >
              <Combine className="mr-2 size-3.5" />
              Merge Cells
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().splitCell().run()}
              disabled={!canSplitCell}
            >
              <Split className="mr-2 size-3.5" />
              Split Cell
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeaderCell().run()}
            >
              <TableProperties className="mr-2 size-3.5" />
              Toggle Header Cell
            </DropdownMenuItem>
          </DropdownMenuContentPrimitive>
        </DropdownMenu>

        {/* Quick Delete Actions */}
        <div className="ml-0.5 flex items-center gap-0.5 border-l pl-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 gap-1 px-2 text-xs"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!canDeleteColumn}
            title="Delete Column"
          >
            <Columns3 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 gap-1 px-2 text-xs"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!canDeleteRow}
            title="Delete Row"
          >
            <Rows3 className="size-3.5" />
          </Button>
        </div>

        {/* Delete Table */}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
          onClick={() => editor.chain().focus().deleteTable().run()}
          title="Delete Table"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </BubbleMenu>
  )
}
