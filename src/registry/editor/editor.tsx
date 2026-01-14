"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import * as React from "react"

import {
  BubbleMenu,
  Editor,
  Extensions,
  FloatingMenu,
  EditorContent as TiptapEditorContent,
  useEditorState,
  useEditor as useTiptapEditor,
  type UseEditorOptions,
} from "@tiptap/react"
import { Check, ChevronDown, ChevronRight, Link2Off } from "lucide-react"
import { EditorBubbleMenuLink } from "./editor-link"
import { EDITOR_PLACEHOLDER_CLASSES } from "./editor-placeholder"
import type { EditorActionKey } from "./editor.d"

type NestedArray<T> = T | NestedArray<T>[]

// =============================================================================
// Types
// =============================================================================

export interface EditorActionConfig<TEditor = unknown> {
  key: string
  icon?: React.ElementType
  label: string
  description?: string
  execute: (editor: TEditor, options?: Record<string, unknown>) => void
  canExecute?: (editor: TEditor) => boolean
  isActive?: (editor: TEditor) => boolean
}

// =============================================================================
// EditorActionRegistry
// =============================================================================

export class EditorActionRegistry<TEditor = unknown> {
  private actions = new Map<string, EditorActionConfig<TEditor>>()

  register(config: EditorActionConfig<TEditor>): this {
    this.actions.set(config.key, config)
    return this
  }

  registerMany(configs: EditorActionConfig<TEditor>[]): this {
    for (const config of configs) {
      this.register(config)
    }
    return this
  }

  unregister(key: string): this {
    this.actions.delete(key)
    return this
  }

  extend(registry: EditorActionRegistry<TEditor>): this {
    for (const config of registry.values()) {
      this.register(config)
    }
    return this
  }

  get(key: string): EditorActionConfig<TEditor> | undefined {
    return this.actions.get(key)
  }

  has(key: string): boolean {
    return this.actions.has(key)
  }

  keys(): string[] {
    return Array.from(this.actions.keys())
  }

  values(): EditorActionConfig<TEditor>[] {
    return Array.from(this.actions.values())
  }

  size(): number {
    return this.actions.size
  }

  execute(
    editor: TEditor | null,
    key: string,
    options?: Record<string, unknown>
  ): void {
    if (!editor) return
    const action = this.get(key)
    action?.execute(editor, options)
  }

  canExecute(editor: TEditor | null, key: string): boolean {
    if (!editor) return false
    const action = this.get(key)
    return action?.canExecute?.(editor) ?? true
  }

  isActive(editor: TEditor | null, key: string): boolean {
    if (!editor) return false
    const action = this.get(key)
    return action?.isActive?.(editor) ?? false
  }

  getActiveKeys(editor: TEditor | null): string[] {
    if (!editor) return []
    return this.keys().filter((key) => this.isActive(editor, key))
  }
}

// =============================================================================
// Factory
// =============================================================================

export function createEditorRegistry<
  TEditor = unknown,
>(): EditorActionRegistry<TEditor> {
  return new EditorActionRegistry<TEditor>()
}

/**
 * Default empty registry. Commands are now registered via the `commands`
 * property in `createEditorExtension()`. This empty registry serves as the
 * base that extension commands are merged into.
 *
 * @example
 * ```tsx
 * // Extensions now define their own commands inline:
 * const MyExtension = createEditorExtension({
 *   extension: SomeTiptapExtension,
 *   commands: [
 *     { key: "myAction", label: "My Action", execute: (editor) => {...} }
 *   ],
 * })
 * ```
 */
export const defaultEditorRegistry = createEditorRegistry<Editor>()

export type EditorExtensions = NestedArray<Extensions[number]>

export interface BubbleMenuComponentProps {
  className?: string
}

export interface EditorExtensionWithBubbleMenu<TConfig = unknown> {
  __editorExtension: true
  extension: EditorExtensions | EditorExtensions[]
  bubbleMenu?: React.ComponentType<BubbleMenuComponentProps>
  bubbleMenuProps?: BubbleMenuComponentProps
  commands?: EditorActionConfig<Editor>[]
  configure: (
    options: Partial<TConfig>
  ) => EditorExtensionWithBubbleMenu<TConfig>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EditorExtensionInput =
  | EditorExtensions
  | EditorExtensions[]
  | EditorExtensionWithBubbleMenu<any>

function isEditorExtensionWithBubbleMenu(
  ext: EditorExtensionInput
): ext is EditorExtensionWithBubbleMenu {
  return (
    typeof ext === "object" &&
    ext !== null &&
    "__editorExtension" in ext &&
    ext.__editorExtension === true
  )
}

export interface CreateEditorExtensionOptions<TConfig = unknown> {
  extension: EditorExtensions | EditorExtensions[]
  bubbleMenu?: React.ComponentType<BubbleMenuComponentProps>
  bubbleMenuProps?: BubbleMenuComponentProps
  defaultConfig?: TConfig
  commands?: EditorActionConfig<Editor>[]
  onConfigure?: (
    options: Partial<TConfig>,
    current: CreateEditorExtensionOptions<TConfig>
  ) => CreateEditorExtensionOptions<TConfig>
}

export function createEditorExtension<TConfig = unknown>(
  options: CreateEditorExtensionOptions<TConfig>
): EditorExtensionWithBubbleMenu<TConfig> {
  const result: EditorExtensionWithBubbleMenu<TConfig> = {
    __editorExtension: true,
    extension: options.extension,
    bubbleMenu: options.bubbleMenu,
    bubbleMenuProps: options.bubbleMenuProps,
    commands: options.commands,
    configure(config: Partial<TConfig>) {
      if (options.onConfigure) {
        const newOptions = options.onConfigure(config, options)
        return createEditorExtension(newOptions)
      }

      const extensions = Array.isArray(options.extension)
        ? options.extension
        : [options.extension]

      const configuredExtensions = extensions.map((ext) => {
        if (
          ext &&
          typeof ext === "object" &&
          "configure" in ext &&
          typeof ext.configure === "function"
        ) {
          return ext.configure(config as Record<string, unknown>)
        }
        return ext
      })

      return createEditorExtension({
        ...options,
        extension:
          configuredExtensions.length === 1
            ? configuredExtensions[0]
            : configuredExtensions,
        bubbleMenuProps: {
          ...options.bubbleMenuProps,
          ...((config as Record<string, unknown>)?.bubbleMenuProps as
            | BubbleMenuComponentProps
            | undefined),
        },
      })
    },
  }

  return result
}

function extractExtensionsAndBubbleMenus(inputs: EditorExtensionInput[]): {
  extensions: EditorExtensions[]
  bubbleMenus: Array<{
    component: React.ComponentType<BubbleMenuComponentProps>
    props?: BubbleMenuComponentProps
  }>
  commands: EditorActionConfig<Editor>[]
} {
  const extensions: EditorExtensions[] = []
  const bubbleMenus: Array<{
    component: React.ComponentType<BubbleMenuComponentProps>
    props?: BubbleMenuComponentProps
  }> = []
  const commands: EditorActionConfig<Editor>[] = []

  for (const input of inputs) {
    if (isEditorExtensionWithBubbleMenu(input)) {
      if (Array.isArray(input.extension)) {
        extensions.push(...input.extension)
      } else {
        extensions.push(input.extension)
      }

      if (input.bubbleMenu) {
        bubbleMenus.push({
          component: input.bubbleMenu,
          props: input.bubbleMenuProps,
        })
      }

      if (input.commands) {
        commands.push(...input.commands)
      }
    } else if (Array.isArray(input)) {
      extensions.push(...input)
    } else {
      extensions.push(input)
    }
  }

  return { extensions, bubbleMenus, commands }
}

// =============================================================================
// Context
// =============================================================================

export interface EditorContextValue {
  editor: Editor | null
  registry: EditorActionRegistry<Editor>
}

export const EditorContext = React.createContext<EditorContextValue | null>(
  null
)

export function useEditor(): EditorContextValue {
  const ctx = React.useContext(EditorContext)
  if (!ctx) {
    throw new Error("useEditor must be used within EditorProvider")
  }
  return ctx
}

// =============================================================================
// EditorProvider
// =============================================================================

export interface EditorProviderProps
  extends React.PropsWithChildren, Omit<UseEditorOptions, "extensions"> {
  content?: string
  extensions?: EditorExtensionInput[]
  registry?: EditorActionRegistry<Editor>
  className?: string
}

const EditorProvider = React.forwardRef<HTMLDivElement, EditorProviderProps>(
  (
    {
      content,
      extensions = [],
      registry = defaultEditorRegistry,
      children,
      className,
      ...editorOptions
    },
    ref
  ) => {
    const {
      extensions: extractedExtensions,
      bubbleMenus,
      commands: extractedCommands,
    } = React.useMemo(
      () => extractExtensionsAndBubbleMenus(extensions),
      [extensions]
    )

    const editor = useTiptapEditor({
      content,
      extensions: toLatentArray(extractedExtensions),
      ...editorOptions,
    })

    // Merge base registry with extension commands
    const mergedRegistry = React.useMemo(() => {
      if (extractedCommands.length === 0) {
        return registry
      }
      const merged = createEditorRegistry<Editor>()
      merged.extend(registry)
      merged.registerMany(extractedCommands)
      return merged
    }, [registry, extractedCommands])

    const contextValue = React.useMemo<EditorContextValue>(
      () => ({ editor, registry: mergedRegistry }),
      [editor, mergedRegistry]
    )

    return (
      <EditorContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("relative", className)}
          data-editor-root=""
        >
          {children}
          {bubbleMenus.map((menu, index) => (
            <menu.component key={index} {...menu.props} />
          ))}
        </div>
      </EditorContext.Provider>
    )
  }
)
EditorProvider.displayName = "EditorProvider"

// =============================================================================
// EditorContent
// =============================================================================

export interface EditorContentProps extends Omit<
  React.ComponentProps<typeof TiptapEditorContent>,
  "editor"
> {}

const EditorContent = React.forwardRef<HTMLDivElement, EditorContentProps>(
  ({ className, ...props }, ref) => {
    const { editor } = useEditor()

    if (!editor) return null

    return (
      <TiptapEditorContent
        ref={ref}
        editor={editor}
        className={cn(
          "w-full",
          "[&>*]:outline-none",
          // Inline code styles
          "[&_.ProseMirror_code]:bg-muted",
          "[&_.ProseMirror_code]:rounded",
          "[&_.ProseMirror_code]:px-1.5",
          "[&_.ProseMirror_code]:py-0.5",
          "[&_.ProseMirror_code]:font-mono",
          "[&_.ProseMirror_code]:text-[0.875em]",
          // Task list styles
          "[&_.ProseMirror_ul[data-type=taskList]]:list-none",
          "[&_.ProseMirror_ul[data-type=taskList]]:pl-0",
          "[&_.ProseMirror_ul[data-type=taskList]]:my-2",
          "[&_.ProseMirror_ul[data-type=taskList]_li]:flex",
          "[&_.ProseMirror_ul[data-type=taskList]_li]:items-start",
          "[&_.ProseMirror_ul[data-type=taskList]_li]:gap-2",
          "[&_.ProseMirror_ul[data-type=taskList]_li]:my-1",
          "[&_.ProseMirror_ul[data-type=taskList]_li>label]:shrink-0",
          "[&_.ProseMirror_ul[data-type=taskList]_li>label]:mt-0.5",
          "[&_.ProseMirror_ul[data-type=taskList]_li>label>input[type=checkbox]]:cursor-pointer",
          "[&_.ProseMirror_ul[data-type=taskList]_li>label>input[type=checkbox]]:size-4",
          "[&_.ProseMirror_ul[data-type=taskList]_li>label>input[type=checkbox]]:accent-primary",
          "[&_.ProseMirror_ul[data-type=taskList]_li>div]:flex-1",
          "[&_.ProseMirror_ul[data-type=taskList]_li[data-checked=true]>div]:line-through",
          "[&_.ProseMirror_ul[data-type=taskList]_li[data-checked=true]>div]:opacity-60",
          // Placeholder styles
          EDITOR_PLACEHOLDER_CLASSES,
          className
        )}
        {...props}
      />
    )
  }
)
EditorContent.displayName = "EditorContent"

// =============================================================================
// EditorToolbar
// =============================================================================

export interface EditorToolbarProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical"
}

const EditorToolbar = React.forwardRef<HTMLDivElement, EditorToolbarProps>(
  ({ className, orientation = "horizontal", children, ...props }, ref) => {
    const { editor } = useEditor()

    if (!editor) return null

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-orientation={orientation}
        className={cn(
          "flex items-center gap-1",
          orientation === "vertical" && "flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
EditorToolbar.displayName = "EditorToolbar"

// =============================================================================
// EditorButtonGroup
// =============================================================================

export interface EditorButtonGroupProps extends React.ComponentProps<"div"> {}

const EditorButtonGroup = React.forwardRef<
  HTMLDivElement,
  EditorButtonGroupProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
})
EditorButtonGroup.displayName = "EditorButtonGroup"

// Alias
const EditorToolbarGroup = EditorButtonGroup

// =============================================================================
// EditorButton
// =============================================================================

export interface EditorButtonProps extends React.ComponentProps<typeof Button> {
  action: EditorActionKey
  activeVariant?: "default" | "secondary" | "outline"
}

const EditorButton = React.forwardRef<HTMLButtonElement, EditorButtonProps>(
  (
    { action, activeVariant = "secondary", className, children, ...props },
    ref
  ) => {
    const { editor, registry } = useEditor()
    const [updateKey, forceUpdate] = React.useReducer((x) => x + 1, 0)

    React.useEffect(() => {
      if (!editor) return

      const handleUpdate = () => forceUpdate()
      editor.on("transaction", handleUpdate)

      return () => {
        editor.off("transaction", handleUpdate)
      }
    }, [editor])

    const isActive = React.useMemo(() => {
      return registry.isActive(editor, action)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, registry, action, updateKey])

    const canUse = registry.canExecute(editor, action)

    const handleClick = () => {
      registry.execute(editor, action)
    }

    const config = registry.get(action)

    if (!editor) return null

    return (
      <Button
        ref={ref}
        type="button"
        variant={isActive ? activeVariant : "ghost"}
        size="icon"
        disabled={!canUse}
        onClick={handleClick}
        aria-label={config?.label}
        className={cn("size-8", className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
EditorButton.displayName = "EditorButton"

// =============================================================================
// EditorSeparator
// =============================================================================

export interface EditorSeparatorProps extends React.ComponentProps<"span"> {}

const EditorSeparator = React.forwardRef<HTMLSpanElement, EditorSeparatorProps>(
  ({ className, ...props }, ref) => {
    const { editor } = useEditor()

    if (!editor) return null

    return (
      <span
        ref={ref}
        className={cn("text-border mx-1 inline-flex items-center", className)}
        {...props}
      >
        |
      </span>
    )
  }
)
EditorSeparator.displayName = "EditorSeparator"

// =============================================================================
// EditorDropdown Context
// =============================================================================

interface EditorDropdownContextValue {
  sharedConfigs: EditorActionConfig<Editor>[]
}

const EditorDropdownContext =
  React.createContext<EditorDropdownContextValue | null>(null)

// =============================================================================
// EditorDropdown
// =============================================================================

export interface EditorDropdownProps extends React.ComponentProps<
  typeof DropdownMenu
> {
  actions: EditorActionKey[]
}

const EditorDropdown = React.forwardRef<HTMLButtonElement, EditorDropdownProps>(
  ({ actions, children, ...props }, _ref) => {
    const { editor, registry } = useEditor()

    const handleChangeAction = (key: string) => {
      registry.execute(editor, key)
    }

    const filteredConfigs = actions
      .map((action) => registry.get(action))
      .filter((c): c is EditorActionConfig<Editor> => Boolean(c))

    const contextValue = React.useMemo<EditorDropdownContextValue>(
      () => ({ sharedConfigs: filteredConfigs }),
      [filteredConfigs]
    )

    if (!editor) return null

    return (
      <EditorDropdownContext.Provider value={contextValue}>
        <DropdownMenu {...props}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shadow-none"
              aria-label="Open blocks menu"
            >
              {children}
              <ChevronDown className="text-muted-foreground ml-1 size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="pb-2">
            <ScrollArea
              style={{
                height: Math.min(filteredConfigs.length * 56, 300),
              }}
              className="max-h-[300px] overflow-auto"
            >
              {filteredConfigs.map((item) => (
                <DropdownMenuItem
                  key={item.key}
                  onClick={() => handleChangeAction(item.key)}
                >
                  <div
                    className="border-border bg-background flex size-8 items-center justify-center rounded-lg border"
                    aria-hidden="true"
                  >
                    {item.icon && (
                      <item.icon
                        size={16}
                        strokeWidth={2}
                        className="opacity-60"
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-muted-foreground text-xs">
                        {item.description}
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </EditorDropdownContext.Provider>
    )
  }
)
EditorDropdown.displayName = "EditorDropdown"

// =============================================================================
// EditorLabel
// =============================================================================

export interface EditorLabelProps extends React.ComponentProps<"span"> {
  action?: string
  pattern?: ":icon :label" | ":label" | ":label :icon" | ":icon"
}

const EditorLabel = React.forwardRef<HTMLSpanElement, EditorLabelProps>(
  ({ className, action, pattern = ":label", ...props }, ref) => {
    const dropdownCtx = React.useContext(EditorDropdownContext)
    const { editor, registry } = useEditor()

    const activeActions =
      useEditorState({
        editor,
        selector: ({ editor: e }) => (e ? registry.getActiveKeys(e) : []),
      }) ?? []

    const configs = React.useMemo(() => {
      if (action) {
        const config = registry.get(action)
        return config ? [config] : []
      }

      const filteredActions = dropdownCtx?.sharedConfigs?.length
        ? activeActions.filter((a) =>
            dropdownCtx.sharedConfigs.some((c) => c.key === a)
          )
        : activeActions

      return filteredActions
        .map((key) => registry.get(key))
        .filter((c): c is EditorActionConfig<Editor> => Boolean(c))
    }, [action, activeActions, dropdownCtx, registry])

    const renderConfig = (config: EditorActionConfig<Editor>) => {
      switch (pattern) {
        case ":icon :label":
          return (
            <React.Fragment key={config.key}>
              {config.icon && <config.icon className="size-4" />}
              {config.label}
            </React.Fragment>
          )
        case ":icon":
          return (
            <React.Fragment key={config.key}>
              {config.icon && <config.icon className="size-4" />}
            </React.Fragment>
          )
        case ":label :icon":
          return (
            <React.Fragment key={config.key}>
              {config.label}
              {config.icon && <config.icon className="size-4" />}
            </React.Fragment>
          )
        default:
          return config.label
      }
    }

    const content =
      configs.length > 0
        ? configs.map(renderConfig)
        : dropdownCtx?.sharedConfigs?.[0]
          ? renderConfig(dropdownCtx.sharedConfigs[0])
          : null

    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        {content}
      </span>
    )
  }
)
EditorLabel.displayName = "EditorLabel"

// =============================================================================
// EditorFloatingMenu
// =============================================================================

export interface EditorFloatingMenuProps extends Omit<
  React.ComponentProps<typeof FloatingMenu>,
  "editor"
> {}

function EditorFloatingMenu({ children, ...props }: EditorFloatingMenuProps) {
  const { editor } = useEditor()

  if (!editor) return null

  return (
    <FloatingMenu editor={editor} {...props}>
      {children}
    </FloatingMenu>
  )
}

// =============================================================================
// EditorBubbleMenu (Core Composition Component)
// =============================================================================

export interface EditorBubbleMenuProps extends Omit<
  React.ComponentProps<typeof BubbleMenu>,
  "editor"
> {}

const EditorBubbleMenu = React.forwardRef<
  HTMLDivElement,
  EditorBubbleMenuProps
>(({ shouldShow, tippyOptions, className, children, ...props }, ref) => {
  const { editor } = useEditor()

  if (!editor) return null

  return (
    <BubbleMenu
      {...props}
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "top",
        ...tippyOptions,
      }}
      shouldShow={shouldShow}
      className={cn("w-fit", className)}
    >
      <div ref={ref}>{children}</div>
    </BubbleMenu>
  )
})
EditorBubbleMenu.displayName = "EditorBubbleMenu"

// =============================================================================
// EditorBubbleMenuContent
// =============================================================================

export interface EditorBubbleMenuContentProps extends React.ComponentProps<"div"> {}

const EditorBubbleMenuContent = React.forwardRef<
  HTMLDivElement,
  EditorBubbleMenuContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-popover flex items-center gap-0.5 rounded-md border p-0.5 shadow-md",
        className
      )}
      {...props}
    />
  )
})
EditorBubbleMenuContent.displayName = "EditorBubbleMenuContent"

// =============================================================================
// EditorBubbleMenuGroup
// =============================================================================

export interface EditorBubbleMenuGroupProps extends React.ComponentProps<"div"> {}

const EditorBubbleMenuGroup = React.forwardRef<
  HTMLDivElement,
  EditorBubbleMenuGroupProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
})
EditorBubbleMenuGroup.displayName = "EditorBubbleMenuGroup"

// =============================================================================
// EditorBubbleMenuSeparator
// =============================================================================

export interface EditorBubbleMenuSeparatorProps extends React.ComponentProps<"div"> {}

const EditorBubbleMenuSeparator = React.forwardRef<
  HTMLDivElement,
  EditorBubbleMenuSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("bg-border h-4 w-px", className)} {...props} />
  )
})
EditorBubbleMenuSeparator.displayName = "EditorBubbleMenuSeparator"

// =============================================================================
// EditorBubbleMenuButton
// =============================================================================

export interface EditorBubbleMenuButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onClick"
> {
  action?: string
  isActive?: boolean
  onAction?: () => void
}

const EditorBubbleMenuButton = React.forwardRef<
  HTMLButtonElement,
  EditorBubbleMenuButtonProps
>(
  (
    { action, isActive: isActiveProp, onAction, className, children, ...props },
    ref
  ) => {
    const { editor, registry } = useEditor()
    const [updateKey, forceUpdate] = React.useReducer((x) => x + 1, 0)

    React.useEffect(() => {
      if (!editor) return

      const handleUpdate = () => forceUpdate()
      editor.on("transaction", handleUpdate)

      return () => {
        editor.off("transaction", handleUpdate)
      }
    }, [editor])

    const isActiveFromAction = React.useMemo(() => {
      if (!action) return false
      return registry.isActive(editor, action)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, registry, action, updateKey])

    const isActive = isActiveProp ?? isActiveFromAction

    const handleClick = () => {
      if (onAction) {
        onAction()
        return
      }
      if (action) {
        registry.execute(editor, action)
      }
    }

    const config = action ? registry.get(action) : undefined
    const canUse = action ? registry.canExecute(editor, action) : true

    if (!editor) return null

    return (
      <Button
        ref={ref}
        type="button"
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        disabled={!canUse}
        onClick={handleClick}
        aria-label={config?.label}
        className={cn("h-7 w-7 p-0", className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
EditorBubbleMenuButton.displayName = "EditorBubbleMenuButton"

// =============================================================================
// EditorBubbleMenuPopover Context
// =============================================================================

interface EditorBubbleMenuPopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const EditorBubbleMenuPopoverContext =
  React.createContext<EditorBubbleMenuPopoverContextValue | null>(null)

function useEditorBubbleMenuPopover() {
  const ctx = React.useContext(EditorBubbleMenuPopoverContext)
  if (!ctx) {
    throw new Error(
      "useEditorBubbleMenuPopover must be used within EditorBubbleMenuPopover"
    )
  }
  return ctx
}

// =============================================================================
// EditorBubbleMenuPopover
// =============================================================================

export interface EditorBubbleMenuPopoverProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function EditorBubbleMenuPopover({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: EditorBubbleMenuPopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  const contextValue = React.useMemo(() => ({ open, setOpen }), [open, setOpen])

  return (
    <EditorBubbleMenuPopoverContext.Provider value={contextValue}>
      <div className="relative">{children}</div>
    </EditorBubbleMenuPopoverContext.Provider>
  )
}
EditorBubbleMenuPopover.displayName = "EditorBubbleMenuPopover"

// =============================================================================
// EditorBubbleMenuPopoverTrigger
// =============================================================================

export interface EditorBubbleMenuPopoverTriggerProps extends React.ComponentProps<"button"> {
  asChild?: boolean
}

const EditorBubbleMenuPopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  EditorBubbleMenuPopoverTriggerProps
>(({ asChild, onClick, children, ...props }, ref) => {
  const { open, setOpen } = useEditorBubbleMenuPopover()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(!open)
    onClick?.(e)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{
        onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
        "data-state"?: string
      }>,
      {
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          handleClick(e)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(children as any).props?.onClick?.(e)
        },
        "data-state": open ? "open" : "closed",
      }
    )
  }

  return (
    <button
      ref={ref}
      type="button"
      data-state={open ? "open" : "closed"}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
EditorBubbleMenuPopoverTrigger.displayName = "EditorBubbleMenuPopoverTrigger"

// =============================================================================
// EditorBubbleMenuPopoverContent
// =============================================================================

export interface EditorBubbleMenuPopoverContentProps extends React.ComponentProps<"div"> {
  align?: "start" | "center" | "end"
  side?: "top" | "bottom"
  sideOffset?: number
}

const EditorBubbleMenuPopoverContent = React.forwardRef<
  HTMLDivElement,
  EditorBubbleMenuPopoverContentProps
>(
  (
    { className, align = "start", side = "bottom", sideOffset = 4, ...props },
    ref
  ) => {
    const { open, setOpen } = useEditorBubbleMenuPopover()
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (!open) return

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false)
        }
      }

      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }, [open, setOpen])

    React.useEffect(() => {
      if (open && contentRef.current) {
        const firstInput = contentRef.current.querySelector("input")
        if (firstInput) {
          firstInput.focus()
        }
      }
    }, [open])

    if (!open) return null

    const alignClasses = {
      start: "left-0",
      center: "left-1/2 -translate-x-1/2",
      end: "right-0",
    }

    const sideClasses = {
      top: "bottom-full mb-1",
      bottom: "top-full mt-1",
    }

    return (
      <div
        ref={(node) => {
          contentRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          "bg-popover text-popover-foreground absolute z-50 min-w-[200px] rounded-md border p-2 shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          alignClasses[align],
          sideClasses[side],
          className
        )}
        style={{
          marginTop: side === "bottom" ? sideOffset : undefined,
          marginBottom: side === "top" ? sideOffset : undefined,
        }}
        {...props}
      />
    )
  }
)
EditorBubbleMenuPopoverContent.displayName = "EditorBubbleMenuPopoverContent"

// =============================================================================
// EditorBubbleMenuForm Context
// =============================================================================

interface EditorBubbleMenuFormContextValue {
  values: Record<string, string>
  setValue: (name: string, value: string) => void
  submit: () => void
  cancel: () => void
}

const EditorBubbleMenuFormContext =
  React.createContext<EditorBubbleMenuFormContextValue | null>(null)

function useEditorBubbleMenuForm() {
  const ctx = React.useContext(EditorBubbleMenuFormContext)
  if (!ctx) {
    throw new Error(
      "useEditorBubbleMenuForm must be used within EditorBubbleMenuForm"
    )
  }
  return ctx
}

// =============================================================================
// EditorBubbleMenuForm
// =============================================================================

export interface EditorBubbleMenuFormProps extends Omit<
  React.ComponentProps<"form">,
  "onSubmit"
> {
  onSubmit?: (values: Record<string, string>, editor: Editor) => void
  onCancel?: () => void
  closeOnSubmit?: boolean
}

const EditorBubbleMenuForm = React.forwardRef<
  HTMLFormElement,
  EditorBubbleMenuFormProps
>(
  (
    {
      onSubmit: onSubmitProp,
      onCancel,
      closeOnSubmit = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { editor } = useEditor()
    const popoverCtx = React.useContext(EditorBubbleMenuPopoverContext)
    const [values, setValues] = React.useState<Record<string, string>>({})

    const setValue = React.useCallback((name: string, value: string) => {
      setValues((prev) => ({ ...prev, [name]: value }))
    }, [])

    const submit = React.useCallback(() => {
      onSubmitProp?.(values, editor!)
      if (closeOnSubmit && popoverCtx) {
        popoverCtx.setOpen(false)
      }
    }, [values, onSubmitProp, closeOnSubmit, popoverCtx])

    const cancel = React.useCallback(() => {
      onCancel?.()
      popoverCtx?.setOpen(false)
    }, [onCancel, popoverCtx])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      submit()
    }

    const contextValue = React.useMemo(
      () => ({ values, setValue, submit, cancel }),
      [values, setValue, submit, cancel]
    )

    return (
      <EditorBubbleMenuFormContext.Provider value={contextValue}>
        <form
          ref={ref}
          onSubmit={handleSubmit}
          className={cn("flex flex-col gap-2", className)}
          {...props}
        >
          {children}
        </form>
      </EditorBubbleMenuFormContext.Provider>
    )
  }
)
EditorBubbleMenuForm.displayName = "EditorBubbleMenuForm"

// =============================================================================
// EditorBubbleMenuInput
// =============================================================================

export type EditorBubbleMenuInputBinding =
  | string
  | ((editor: Editor) => string | undefined)

export interface EditorBubbleMenuInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "name" | "value" | "onChange"
> {
  name: string
  binding?: EditorBubbleMenuInputBinding
  onValueChange?: (value: string) => void
}

const EditorBubbleMenuInput = React.forwardRef<
  HTMLInputElement,
  EditorBubbleMenuInputProps
>(({ name, binding, onValueChange, onKeyDown, className, ...props }, ref) => {
  const { editor } = useEditor()
  const formCtx = React.useContext(EditorBubbleMenuFormContext)
  const [localValue, setLocalValue] = React.useState("")

  // Use ref for setValue to avoid dependency issues
  const setValueRef = React.useRef(formCtx?.setValue)
  setValueRef.current = formCtx?.setValue

  // Get initial value from binding - only run once when popover opens
  React.useEffect(() => {
    if (!editor || !binding) return

    let initialValue: string | undefined

    if (typeof binding === "function") {
      initialValue = binding(editor)
    } else {
      // Parse dot notation: "link.href" -> mark="link", attr="href"
      const [mark, attr] = binding.split(".")
      if (mark && attr) {
        const attrs = editor.getAttributes(mark)
        initialValue = attrs?.[attr] as string | undefined
      } else {
        // Single value means it's just a mark name, get all attributes
        initialValue = editor.getAttributes(binding)?.[binding] as
          | string
          | undefined
      }
    }

    const value = initialValue ?? ""
    setLocalValue(value)
    setValueRef.current?.(name, value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, binding, name])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    formCtx?.setValue(name, newValue)
    onValueChange?.(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && formCtx) {
      e.preventDefault()
      formCtx.submit()
    }
    onKeyDown?.(e)
  }

  return (
    <Input
      ref={ref}
      name={name}
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={cn("h-8 text-sm", className)}
      {...props}
    />
  )
})
EditorBubbleMenuInput.displayName = "EditorBubbleMenuInput"

// =============================================================================
// EditorBubbleMenuFormActions
// =============================================================================

export interface EditorBubbleMenuFormActionsProps extends React.ComponentProps<"div"> {}

const EditorBubbleMenuFormActions = React.forwardRef<
  HTMLDivElement,
  EditorBubbleMenuFormActionsProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-end gap-1", className)}
      {...props}
    />
  )
})
EditorBubbleMenuFormActions.displayName = "EditorBubbleMenuFormActions"

// =============================================================================
// EditorBubbleMenuFormSubmit
// =============================================================================

export interface EditorBubbleMenuFormSubmitProps extends Omit<
  React.ComponentProps<typeof Button>,
  "type" | "onClick"
> {}

const EditorBubbleMenuFormSubmit = React.forwardRef<
  HTMLButtonElement,
  EditorBubbleMenuFormSubmitProps
>(({ className, children, ...props }, ref) => {
  const { submit } = useEditorBubbleMenuForm()

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="sm"
      onClick={submit}
      className={cn("h-7 w-7 p-0", className)}
      {...props}
    >
      {children ?? <Check className="size-3.5" />}
    </Button>
  )
})
EditorBubbleMenuFormSubmit.displayName = "EditorBubbleMenuFormSubmit"

// =============================================================================
// EditorBubbleMenuFormCancel
// =============================================================================

export interface EditorBubbleMenuFormCancelProps extends Omit<
  React.ComponentProps<typeof Button>,
  "type" | "onClick"
> {}

const EditorBubbleMenuFormCancel = React.forwardRef<
  HTMLButtonElement,
  EditorBubbleMenuFormCancelProps
>(({ className, children, ...props }, ref) => {
  const { cancel } = useEditorBubbleMenuForm()

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="sm"
      onClick={cancel}
      className={cn("h-7 w-7 p-0", className)}
      {...props}
    >
      {children ?? <Link2Off className="size-3.5" />}
    </Button>
  )
})
EditorBubbleMenuFormCancel.displayName = "EditorBubbleMenuFormCancel"

// =============================================================================
// EditorBubbleMenuDropdown (Radix-based Dropdown System)
// =============================================================================

const EditorBubbleMenuDropdownRoot = DropdownMenuPrimitive.Root

export interface EditorBubbleMenuDropdownProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Root
> {}

function EditorBubbleMenuDropdown({
  children,
  ...props
}: EditorBubbleMenuDropdownProps) {
  return (
    <EditorBubbleMenuDropdownRoot {...props}>
      {children}
    </EditorBubbleMenuDropdownRoot>
  )
}
EditorBubbleMenuDropdown.displayName = "EditorBubbleMenuDropdown"

// =============================================================================
// EditorBubbleMenuDropdownTrigger
// =============================================================================

export interface EditorBubbleMenuDropdownTriggerProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Trigger
> {}

const EditorBubbleMenuDropdownTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  EditorBubbleMenuDropdownTriggerProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    asChild
    className={cn("outline-none", className)}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Trigger>
))
EditorBubbleMenuDropdownTrigger.displayName = "EditorBubbleMenuDropdownTrigger"

// =============================================================================
// EditorBubbleMenuDropdownContent
// =============================================================================

export interface EditorBubbleMenuDropdownContentProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Content
> {
  portal?: boolean
}

const EditorBubbleMenuDropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  EditorBubbleMenuDropdownContentProps
>(({ className, portal = false, sideOffset = 4, ...props }, ref) => {
  const Portal = portal ? DropdownMenuPrimitive.Portal : React.Fragment
  return (
    <Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-lg border p-1.5 shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </Portal>
  )
})
EditorBubbleMenuDropdownContent.displayName = "EditorBubbleMenuDropdownContent"

// =============================================================================
// EditorBubbleMenuDropdownItem
// =============================================================================

export interface EditorBubbleMenuDropdownItemProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Item
> {
  inset?: boolean
}

const EditorBubbleMenuDropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  EditorBubbleMenuDropdownItemProps
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors outline-none select-none",
      "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "[&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
EditorBubbleMenuDropdownItem.displayName = "EditorBubbleMenuDropdownItem"

// =============================================================================
// EditorBubbleMenuDropdownSub
// =============================================================================

const EditorBubbleMenuDropdownSub = DropdownMenuPrimitive.Sub

// =============================================================================
// EditorBubbleMenuDropdownSubTrigger
// =============================================================================

export interface EditorBubbleMenuDropdownSubTriggerProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.SubTrigger
> {
  inset?: boolean
}

const EditorBubbleMenuDropdownSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  EditorBubbleMenuDropdownSubTriggerProps
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none",
      "focus:bg-accent data-[state=open]:bg-accent",
      "[&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto size-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
EditorBubbleMenuDropdownSubTrigger.displayName =
  "EditorBubbleMenuDropdownSubTrigger"

// =============================================================================
// EditorBubbleMenuDropdownSubContent
// =============================================================================

export interface EditorBubbleMenuDropdownSubContentProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.SubContent
> {}

const EditorBubbleMenuDropdownSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  EditorBubbleMenuDropdownSubContentProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-lg border p-1.5 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
EditorBubbleMenuDropdownSubContent.displayName =
  "EditorBubbleMenuDropdownSubContent"

// =============================================================================
// EditorBubbleMenuDropdownSeparator
// =============================================================================

export interface EditorBubbleMenuDropdownSeparatorProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Separator
> {}

const EditorBubbleMenuDropdownSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  EditorBubbleMenuDropdownSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("bg-muted -mx-1 my-1.5 h-px", className)}
    {...props}
  />
))
EditorBubbleMenuDropdownSeparator.displayName =
  "EditorBubbleMenuDropdownSeparator"

// =============================================================================
// EditorBubbleMenuDropdownLabel
// =============================================================================

export interface EditorBubbleMenuDropdownLabelProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Label
> {
  inset?: boolean
}

const EditorBubbleMenuDropdownLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  EditorBubbleMenuDropdownLabelProps
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "text-muted-foreground px-2 py-1.5 text-xs font-medium",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
EditorBubbleMenuDropdownLabel.displayName = "EditorBubbleMenuDropdownLabel"

// =============================================================================
// EditorBubbleMenuDropdownGroup
// =============================================================================

export interface EditorBubbleMenuDropdownGroupProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Group
> {}

const EditorBubbleMenuDropdownGroup = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Group>,
  EditorBubbleMenuDropdownGroupProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Group
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
EditorBubbleMenuDropdownGroup.displayName = "EditorBubbleMenuDropdownGroup"

// =============================================================================
// Hooks
// =============================================================================

export function useEditorIsActive(action: string): boolean {
  const { editor, registry } = useEditor()

  return React.useMemo(() => {
    return registry.isActive(editor, action)
  }, [editor, registry, action])
}

export function useEditorCurrentActions(): string[] {
  const { editor, registry } = useEditor()
  return React.useMemo(() => registry.getActiveKeys(editor), [editor, registry])
}

export function toLatentArray<T>(...inputs: NestedArray<T>[]): T[] {
  const out: T[] = []

  // Stack holds items to process. We push in reverse so we can pop and keep order.
  const stack: NestedArray<T>[] = []
  for (let i = inputs.length - 1; i >= 0; i--) stack.push(inputs[i])

  while (stack.length) {
    const cur = stack.pop() as NestedArray<T>

    if (Array.isArray(cur)) {
      // Push children in reverse to preserve original order.
      for (let i = cur.length - 1; i >= 0; i--) {
        stack.push(cur[i] as NestedArray<T>)
      }
    } else {
      out.push(cur)
    }
  }

  return out
}

// =============================================================================
// Exports
// =============================================================================

export {
  EditorBubbleMenu,
  EditorBubbleMenuButton,
  EditorBubbleMenuContent,
  EditorBubbleMenuDropdown,
  EditorBubbleMenuDropdownContent,
  EditorBubbleMenuDropdownGroup,
  EditorBubbleMenuDropdownItem,
  EditorBubbleMenuDropdownLabel,
  EditorBubbleMenuDropdownSeparator,
  EditorBubbleMenuDropdownSub,
  EditorBubbleMenuDropdownSubContent,
  EditorBubbleMenuDropdownSubTrigger,
  EditorBubbleMenuDropdownTrigger,
  EditorBubbleMenuForm,
  EditorBubbleMenuFormActions,
  EditorBubbleMenuFormCancel,
  EditorBubbleMenuFormSubmit,
  EditorBubbleMenuGroup,
  EditorBubbleMenuInput,
  EditorBubbleMenuLink,
  EditorBubbleMenuPopover,
  EditorBubbleMenuPopoverContent,
  EditorBubbleMenuPopoverTrigger,
  EditorBubbleMenuSeparator,
  EditorButton,
  EditorButtonGroup,
  EditorContent,
  EditorDropdown,
  EditorFloatingMenu,
  EditorLabel,
  EditorProvider,
  EditorSeparator,
  EditorToolbar,
  EditorToolbarGroup,
}
