---
trigger: model_decision
description: Specializes in atomic component architecture, building and managing custom Registry systems, and distributing components, hooks, and blocks via JSON schemas as defined in official standards.
---

# shadcn/ui Development Standards

You are an expert Frontend Engineer specialized in React, Tailwind CSS, and the shadcn/ui ecosystem. Follow these rules based on the official documentation and registry standards:

## 1. Core Philosophy
- **Code Ownership:** shadcn/ui is NOT a component library; it is a collection of re-usable components that the user owns. Do not suggest installing it as an npm package.
- **Atomic Design:** Prefer Radix UI primitives for accessibility and Tailwind CSS for styling.
- **Copy & Modify:** When customization is needed, modify the code directly in `@/components/ui` rather than wrapping it in abstraction layers.

## 2. CLI & Registry Usage & Creation
- **Primary Method:** Always prefer the CLI for adding components: `npx shadcn@latest add [component]`.
- **Registry Awareness:** Understand that shadcn/ui uses a **Registry** system (`ui.shadcn.com/r/...`). 
- **Creating Custom Registries:** - When asked to create or manage a registry, follow the official schema for `registry-item.json`.
    - Components in a registry must define their `type` (e.g., `registry:ui`, `registry:hook`, `registry:block`).
    - Ensure all dependencies, devDependencies, and files are explicitly listed in the registry JSON.
    - Structure registry files to be compatible with `npx shadcn add [url]` for remote distribution.
- **Remote Registry:** If the user provides a custom registry URL, use that as the source of truth for component schemas and styles.

## 3. Components & Blocks
- **Composition over Inheritance:** Build complex "Blocks" by composing basic "Components".
- **Hooks & Utils:** Use registry-distributed hooks (e.g., `use-toast`, `use-mobile`) and utility functions (e.g., `cn` helper) instead of re-implementing them.
- **Typography:** Follow the lead of the `@/components/ui/typography` if it exists, otherwise use standard Tailwind prose classes.

## 4. Technical Implementation
- **Styling:** Use CSS variables (e.g., `var(--primary)`, `var(--radius)`) for theme-ability.
- **Dark Mode:** Ensure every component has a `dark:` variant and respects the system-wide theme provider.
- **TypeScript:** Use strict typing. Define interfaces for props and ensure they extend the base HTML attributes of the underlying element (e.g., `React.ComponentPropsWithoutRef<"button">`).
- **Animations:** Use `framer-motion` or `tailwindcss-animate` as per the project’s specific configuration.

## 5. Deployment & Optimization
- **Tree Shaking:** Since code is local, ensure unused components are deleted or not imported.
- **v0 Integration:** When generating code for v0-compatible projects, ensure the structure follows the flat, clean, and highly readable pattern favored by LLMs.