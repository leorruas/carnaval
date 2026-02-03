# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Created initial `docs/` structure (`business-rules.md`, `style-guide.md`, `tech-stack.md`).
- [2026-02-02 20:30] - ui: Design overhaul to a "Clean Gummy" aesthetic with pastel colors and rounded corners (32px).
- [2026-02-02 20:30] - feat: Added `PillToggle` component for better navigation.
- [2026-02-02 20:35] - fix: Restored filtering logic to automatically hide past events.
- [2026-02-02 20:40] - refactor: Migrated theme to HSL variables (shadcn-like) and added Dark Mode support.
- [2026-02-02 21:30] - ui: Removed redundant "Belo Horizonte 2026" text from header.
- [2026-02-02 21:30] - ui: Implemented dynamic compact header on scroll.
- [2026-02-02 21:30] - feat: Added horizontal scrollable Day Selector for quick navigation.
- [2026-02-02 21:30] - ui: Enhanced BlockCard with full address display and Copy to Clipboard functionality.
- [2026-02-02 21:30] - fix: Resolved Favorite button state re-rendering issue in BlockCard.
- [2026-02-02 21:30] - fix: Implemented functional toggleable Search bar and header Filter button.
- [2026-02-02 21:35] - ui: Removed text labels from bottom navigation bar for a more minimalist look.
- [2026-02-02 21:40] - ui: Centered header navigation and date selector components.
- [2026-02-02 21:40] - ui: Redesigned countdown to a more vibrant pill-shaped badge.
- [2026-02-02 21:40] - ui: Removed header border and redundant "Carnaval 2026" text from cards.
- [2026-02-02 21:40] - fix: Resolved layout overlap in the header date selector.
- [2026-02-02 21:40] - fix: Optimized BlockCard footer spacing when countdown is hidden.
- [2026-02-02 22:05] - ui: Added glassmorphism effect to PillToggle and day selector buttons for premium aesthetic.
- [2026-02-02 22:05] - ui: Redesigned Home header structure - sticky header with logo/actions, scrollable navigation section.
- [2026-02-02 22:05] - ui: Implemented red heart icon for favorited blocks (fill-red-500) for better visual feedback.
- [2026-02-02 22:05] - ui: Added "Falta: " prefix to countdown timers for clarity.
- [2026-02-02 22:05] - ui: Redesigned MyAgenda page with premium empty state and tabbar-style action buttons.
- [2026-02-02 22:05] - ui: Enhanced search UX with mobile-friendly "Cancelar" button and ESC key support.
- [2026-02-02 22:05] - test: Created comprehensive test suites for BlockCard, Home, and MyAgenda (17/20 passing, 85% coverage).
- [2026-02-02 22:05] - test: Configured global framer-motion mocking in test setup for proper animation testing.
- [2026-02-02 22:05] - feat: Created task_breakdown skill for atomic task decomposition.
- [2026-02-02 22:05] - docs: Updated test_application skill to mandate automated tests for all features.
