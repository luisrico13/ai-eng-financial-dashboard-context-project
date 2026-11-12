# Agent Guidance

Agents working on this project **must**:

- Read the **work instructions and rules** in [`.agents/rules`](./.agents/rules)
  before working, and apply each rule whose scope matches the task:
  - [Documentation](./.agents/rules/documentation.md)
  - [Frontend financial data](./.agents/rules/frontend-data.md)
  - [Backend API contracts](./.agents/rules/backend-api.md)
  - [Git and verification](./.agents/rules/git-verification.md)

- Look for available **agent skills** in `./.agents/skills` if the directory exists.
- For financial dashboard QA, read and apply the project workflow in
  [`.skills/dashboard-financial-qa/SKILL.md`](./.skills/dashboard-financial-qa/SKILL.md).

- Read the **project memory bank**:
  - [Product overview](./memory-bank/README.md)
  - [Technology and environment](./memory-bank/tech-context.md)
  - [Current state and pending decisions](./memory-bank/current-state.md)

Before taking action (analyzing code, modifying files, or generating outputs), always review the latest files in these locations to ensure compliance with project conventions, context, and operational constraints.

The rules are project guidance loaded through this file, not executable hooks.
Do not create optional skills or memory directories just to satisfy this checklist.
