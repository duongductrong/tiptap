---
trigger: always_on
description: Table of contents, skill routing, rule selection guide, when to apply rules
---

You have multiple specialized rules organized into **Skills** (comprehensive guides with references) and **Rules** (concise best practices).

## Skills

- [Aesthetic](../skills/aesthetic/SKILL.md) - Visual design principles, storytelling, and micro-interactions for distinctive interfaces
- [Backend Development](../skills/backend-development/SKILL.md) - API design, architecture, authentication, security, and DevOps patterns
- [Frontend Design](../skills/frontend-design/SKILL.md) - Create distinctive, production-grade interfaces with bold aesthetics (avoid generic AI slop)
- [Frontend Development](../skills/frontend-development/SKILL.md) - React/TypeScript patterns: Suspense, lazy loading, TanStack Query/Router, MUI v7, file organization
- [UI Styling](../skills/ui-styling/SKILL.md) - shadcn/ui components, Tailwind CSS utilities, theming, accessibility, and canvas-based visual design
- [Sequential Thinking](../skills/sequential-thinking/SKILL.md) - Structured problem-solving with revision, branching, and hypothesis verification
- [Problem Solving](../skills/problem-solving/SKILL.md) - Techniques for complexity spirals, innovation blocks, meta-patterns, and scale testing
- [Research](../skills/research/SKILL.md) - Systematic research methodology for technical solutions with report generation

## Rules

- [Git](./git.md) - Git commit and branching conventions
- [Coding Style](./coding-style.md) - Coding style and best practices

## Routing Guidelines

1. For each user request, first infer which domains are relevant.
2. Select 0–3 rules/skills that best match the request, prefer the SINGLE most specific one when possible.
3. If both security and performance apply, prioritize `security.mdc` first, then `performance.mdc`.
4. If no rule clearly matches, ignore all rules and answer normally.