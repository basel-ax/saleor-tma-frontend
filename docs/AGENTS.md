# Food Order — Telegram Mini App (AGENTS.md)

> Opencode-compatible AI coding agent instructions for the `saleor-tma-frontend` project.
> This file works with Claude Code, Cursor, Copilot, Codex, Jules, Amp, Aider, and all AGENTS.md-compatible tools.

---

## 🎯 Project Overview

A **Telegram Mini App (TMA)** for food ordering. Users browse restaurants → categories → dishes, build a cart, and check out with GPS or a Google Maps link. The app is a **pure static SPA** deployed on Cloudflare Pages; all business logic lives in a separate backend.

**Key characteristics:**
- **Frontend-only** — no server-side rendering, no API routes in this repo
- **Telegram WebView first** — must work inside Telegram on iOS, Android, and Desktop
- **Single-restaurant cart** — a hard business rule enforced at the store level
- **Vanilla Telegram integration** — uses `window.Telegram.WebApp` from a CDN `<script>` tag, not an npm SDK

---

## 🛠️ Opencode Tool Usage Patterns

When working with this codebase, follow these opencode tool usage patterns:

### Mandatory Tool Delegation
- **Codebase exploration**: Use `explore` agent for finding patterns (`task(subagent_type="explore", run_in_background=true)`)
- **Documentation lookup**: Use `librarian` agent for external references (`task(subagent_type="librarian", run_in_background=true)`)  
- **Planning**: Always use `plan` agent for non-trivial tasks (`task(subagent_type="plan", load_skills=[])`)
- **Hard problems**: Use `oracle` for conventional issues, `artistry` category for unconventional problems
- **Implementation**: Delegate to domain-optimized categories with relevant skills

### Preferred Tools by Task Type
| Task | Tool | Pattern |
|------|------|---------|
| Finding files/patterns | `glob`/`grep` | Use for known locations or simple patterns |
| Deep code analysis | `explore` agent | For unfamiliar codebase areas |
| External documentation | `librarian` agent | For library/docs research |
| Architecture review | `oracle` agent | For complex tradeoffs |
| Plan refinement | `plan` agent (with session_id) | For iterative planning |
| Simple edits | `write`/`edit` tools | For trivial file changes |

### Tool Usage Rules
1. **Parallelize independent operations** - Fire multiple agents/tools simultaneously
2. **Background first** - Use `run_in_background=true` for exploration/research
3. **Verify after changes** - Run `lsp_diagnostics` on modified files
4. **Never duplicate research** - If you delegated to explore/librarian, don't re-search same topic

---

## 👥 Task Delegation Approach

Follow this delegation workflow for all tasks:

### MANDATORY: Category + Skill Selection Protocol

**STEP 1: Select Category** - Match task to domain-optimized model:
- `visual-engineering` - Frontend, UI/UX, design, styling, animation (**USE FOR ALL UI WORK**)
- `ultrabrain` - Hard logic-heavy tasks (algorithms, architecture decisions)
- `deep` - Goal-oriented autonomous problem-solving (research + implementation)
- `artistry` - Creative problem-solving beyond standard patterns
- `quick` - Trivial tasks (single file changes, typo fixes)
- `writing` - Documentation, prose, technical writing

**STEP 2: Evaluate ALL Skills** - For EVERY skill, ask: "Does this skill's expertise domain overlap with my task?"
- **User-installed skills get PRIORITY** - Always prefer `ui-ux-pro-max` when domain matches
- Include ALL relevant skills in `load_skills=[...]`
- Never delegate with empty `load_skills` without justification

### Delegation Pattern
```typescript
task(
  category="[selected-category]", 
  load_skills=["skill-1", "skill-2"],  // Include ALL relevant skills
  prompt="[Detailed prompt with context, goal, constraints]"
)
```

### Domain Matching (ZERO TOLERANCE)
- **VISUAL WORK = ALWAYS `visual-engineering`** - NO EXCEPTIONS
- Any task involving UI, UX, CSS, styling, layout, animation, design → `visual-engineering`
- Never delegate visual work to `quick`, `unspecified-*`, or other categories

### Session Continuity (MANDATORY)
- **ALWAYS use session_id** for follow-ups with same agent
- Starting fresh loses 70%+ token efficiency and context
- Pattern: `task(session_id="{returned_session_id}", load_skills=[], prompt="<follow-up>")`

---

## 🔍 Codebase Assessment Methods

Before implementing changes, assess codebase maturity:

### Quick Assessment Checklist
1. **Config files**: Check linter, formatter, type configs (`eslint`, `prettier`, `tsconfig`)
2. **Pattern sampling**: Review 2-3 similar files for consistency
3. **Age signals**: Note dependency versions, architectural patterns

### State Classification & Response
- **Disciplined** (consistent patterns, configs present, tests exist) → Follow existing style strictly
- **Transitional** (mixed patterns, some structure) → Ask: "I see X and Y patterns. Which to follow?"
- **Legacy/Chaotic** (no consistency, outdated patterns) → Propose: "No clear conventions. I suggest [X]. OK?"
- **Greenfield** (new/empty project) → Apply modern best practices

### Verification Before Assuming
If codebase appears undisciplined, verify:
- Different patterns may serve different purposes (intentional)
- Migration might be in progress
- You might be looking at wrong reference files

---

## 🔎 Exploration & Research Protocols

### Exploration Agent = Contextual Grep (Internal)
Use as peer tool for discovering OUR codebase patterns:
```typescript
// CORRECT: Always background, always parallel
task(subagent_type="explore", run_in_background=true, load_skills=[], 
  description="Find auth implementations", 
  prompt="[CONTEXT]: What task I'm working on, which files/modules involved, approach
[GOAL]: Specific outcome needed - what decision/action results will unblock
[DOWNSTREAM]: How I'll use results - what I'll build/decide based on findings
[REQUEST]: Concrete search instructions - what to find, format, what to SKIP")
```

### Librarian Agent = Reference Grep (External)
Search EXTERNAL resources (docs, OSS, web):
```typescript
// Trigger phrases - fire librarian immediately when seeing:
task(subagent_type="librarian", run_in_background=true, load_skills=[],
  description="Find JWT security docs",
  prompt="[CONTEXT]: What task I'm working on involving [external library]
[GOAL]: Specific information needed - what decision this will inform
[DOWNSTREAM]: How I'll use results - what I'll build/decide based on findings
[REQUEST]: Concrete search instructions - what to find, format, what to SKIP")
```

### Anti-Duplication Rule (CRITICAL)
**Once you delegate exploration to explore/librarian agents, DO NOT perform the same search yourself.**

**FORBIDDEN:** After firing explore/librarian, manually grepping/searching for same information
**ALLOWED:** Continue with non-overlapping work while waiting for results

### Search Stop Conditions
STOP searching when:
- You have enough context to proceed confidently
- Same information appearing across multiple sources
- 2 search iterations yielded no new useful data
- Direct answer found

---

## 🛠️ Implementation Guidelines

### Pre-Implementation Checklist
0. **Load relevant skills** IMMEDIATELY before delegation
1. **Create todo list** IMMEDIATELY for multi-step tasks (use TodoWrite tool)
2. **Mark current task in_progress** before starting
3. **Mark completed IMMEDIATELY** when done (obsessive tracking)

### Delegation Quality Standards
**MANDATORY prompt structure for ALL delegations (6 sections):**
```
1. TASK: Atomic, specific goal (one action per delegation)
2. EXPECTED OUTCOME: Concrete deliverables with success criteria
3. REQUIRED TOOLS: Explicit tool whitelist (prevents tool sprawl)
4. MUST DO: Exhaustive requirements - leave NOTHING implicit
5. MUST NOT DO: Forbidden actions - anticipate and block rogue behavior
6. CONTEXT: File paths, existing patterns, constraints
```

### Implementation Rules
- Match existing patterns (if codebase is disciplined)
- Propose approach first (if codebase is chaotic)
- **NEVER suppress type errors** with `as any`, `@ts-ignore`, `@ts-expect-error`
- **NEVER commit** unless explicitly requested
- **Bugfix Rule**: Fix minimally. NEVER refactor while fixing.

### Verification Requirements (task NOT complete without these)
- **File edit** → `lsp_diagnostics` clean on changed files
- **Build command** → Exit code 0 (if applicable)
- **Test run** → Pass (or explicit note of pre-existing failures)
- **Delegation** → Agent result received and verified
- **NO EVIDENCE = NOT COMPLETE**

---

## ⚠️ Failure Recovery Procedures

### When Fixes Fail:
1. Fix root causes, not symptoms
2. Re-verify after EVERY fix attempt
3. Never shotgun debug (random changes hoping something works)

### After 3 Consecutive Failures:
1. **STOP** all further edits immediately
2. **REVERT** to last known working state (git checkout / undo edits)
3. **DOCUMENT** what was attempted and what failed
4. **CONSULT** Oracle with full failure context
5. If Oracle cannot resolve → **ASK USER** before proceeding

**NEVER**: Leave code in broken state, continue hoping it'll work, delete failing tests to "pass"

---

## ✅ Completion Verification Guarantee

A task is complete when ALL evidence requirements are met:

### Pre-Implementation: Define Success Criteria
BEFORE writing ANY code, define:
- **Functional**: What specific behavior must work (e.g., "Button click triggers API call")
- **Observable**: What can be measured/seen (e.g., "Console shows 'success', no errors")
- **Pass/Fail**: Binary, no ambiguity (e.g., "Returns 200 OK" not "should work")

**Record criteria in TODO items** - Each task MUST include "QA: [how to verify]"

### Test Plan Template (MANDATORY for non-trivial tasks)
```
## Test Plan
### Objective: [What we're verifying]
### Prerequisites: [Setup needed]
### Test Cases:
1. [Test Name]: [Input] → [Expected Output] → [How to verify]
2. ...
### Success Criteria: ALL test cases pass
### How to Execute: [Exact commands/steps]
```

### Execution & Evidence Requirements
| Phase | Action | Required Evidence |
|-------|--------|-------------------|
| **Build** | Run build command | Exit code 0, no errors |
| **Test** | Execute test suite | All tests pass (screenshot/output) |
| **Manual Verify** | Test actual feature | Demonstrate it works (describe observation) |
| **Regression** | Ensure nothing broke | Existing tests still pass |

### Manual QA Mandate (NON-NEGOTIABLE)
**YOU MUST EXECUTE MANUAL QA YOURSELF.**

If your change... YOU MUST...
- Adds/modifies CLI command → Run command with Bash. Show output.
- Changes build output → Run build. Verify output files exist and are correct.
- Modifies API behavior → Call endpoint. Show response.
- Changes UI rendering → Describe what renders. Use browser tool if available.
- Adds new tool/hook/feature → Test end-to-end in real scenario.
- Modifies config handling → Load config. Verify it parses correctly.

**UNACCEPTABLE QA CLAIMS:**
- "This should work" — RUN IT.
- "The types check out" — Types don't catch logic bugs. RUN IT.
- "lsp_diagnostics is clean" — That's a TYPE check, not FUNCTIONAL. RUN IT.
- "Tests pass" — Does ACTUAL FEATURE work as user expects? RUN IT.

**CLAIM NOTHING WITHOUT PROOF. EXECUTE. VERIFY. SHOW EVIDENCE.**

---

## 📱 Telegram-Specific Rules (from original AGENTS.md)

### The `mockEnv.ts` import order is sacred
`src/main.tsx` must import `mockEnv` as the **first** import, before `index.css` and before anything that touches `window.Telegram`:
```typescript
// main.tsx — order matters
import "./mockEnv";   // 1st — sets up window.Telegram.WebApp if missing
import "./index.css"; // 2nd
import ...            // everything else
```

### BackButton sync
`TelegramBackButtonSync` in `App.tsx` manages the native Telegram back button. It:
- Hides the button on `"/"`, shows it everywhere else
- Calls `navigate(-1)` on click
- Cleans up the listener in the `useEffect` return

If you add a page that needs **custom back behavior** (e.g., the cart-reset confirmation), override it with `onBack` prop on `<PageHeader>` rather than modifying `TelegramBackButtonSync`.

### Haptic feedback
Add haptic feedback to user actions where appropriate:
```typescript
// Button taps / item added
window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
// Quantity stepper
window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
// Success / failure
window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
```

### Single-restaurant cart — the confirmation flow
This is a non-negotiable business rule. The full flow:
1. User selects a restaurant on `RestaurantsPage`
2. `isDifferentRestaurant(restaurant.id)` returns `true`
3. Show `<CartResetConfirmModal>` (bottom sheet, not a browser alert)
4. **Cancel** → `setPendingRestaurant(null)` → nothing changes
5. **Continue** → `clearCart()` → `navigate('/restaurants/:id')` → `setPendingRestaurant(null)`
**Never call `clearCart()` without explicit user confirmation.**

---

## 🧩 Opencode Skill Integration

### Available Skills in this Project
- **`ui-ux-pro-max`** (USER-INSTALLED - PRIORITY) - UI/UX design intelligence with searchable database
- Built-in skills: `playwright`, `frontend-ui-ux`, `git-master`, `dev-browser`

### Skill Usage Guidelines
**ALWAYS prefer USER-INSTALLED skills** when domain matches:
- UI/UX work → Load `ui-ux-pro-max` skill
- Visual/frontend tasks → Combine `visual-engineering` category + `ui-ux-pro-max` skill
- Git operations → Load `git-master` skill
- Browser automation → Load `playwright` or `dev-browser` skill

### Delegation Examples with Skills
```typescript
// Visual work with UI/UX skill
task(category="visual-engineering", load_skills=["ui-ux-pro-max"], 
  prompt="Redesign the sidebar layout with new spacing...")

// Git operations
task(category="quick", load_skills=["git-master"], 
  prompt="Fix merge conflict in package.json")

// Browser testing
task(category="quick", load_skills=["playwright"], 
  prompt="Test checkout flow with broken image scenarios")
```

### Skill Evaluation Protocol
For EVERY skill available, ask:
> "Does this skill's expertise domain overlap with my task?"

- If YES → INCLUDE in `load_skills=[...]`
- If NO → OMIT (no justification needed)

**Remember:** User-installed skills (`ui-ux-pro-max`) get PRIORITY over built-in defaults.

---

## 📁 Project Structure Reference

```
saleor-tma-frontend/
├── docs/
│   ├── AGENTS.md               # This file - AI agent instructions
│   ├── AI_AGENTS_INTEGRATION_GUIDE.txt  # Backend agent integration
│   ├── CORS.md                 # CORS debugging and testing (merged)
│   ├── DEBUGGING.md            # General debugging guide
│   ├── DEPLOY.md               # Cloudflare Pages deployment
│   ├── TELEGRAM_INIT_DATA_GUIDE.md      # Telegram init data guide
│   ├── TELEGRAM_INIT_DATA_SOLUTION.md   # Telegram init data solutions
│   ├── frontend-tma.md         # Frontend implementation spec
│   └── screen-descriptions.md  # Screen descriptions (converted from HTML)
├── public/
│   ├── _redirects              # CRITICAL — enables SPA routing on CF Pages
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── index.ts            # API client — all fetch calls, auth headers
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Page components (one per route)
│   ├── store/                  # Zustand cart store
│   ├── types/                  # TypeScript interfaces
│   ├── utils/                  # Telegram init data utilities
│   ├── mockEnv.ts              # Telegram mock (IMPORT FIRST in main.tsx)
│   ├── App.tsx                 # React Router + BackButton sync
│   ├── main.tsx                # App entry point
│   └── index.css               # Tailwind directives + TG theme CSS vars
```

---

## 🔌 Routes Reference

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | `RestaurantsPage` | No |
| `/restaurants/:restaurantId` | `CategoriesPage` | No |
| `/restaurants/:restaurantId/categories/:categoryId` | `DishesPage` | No |
| `/cart` | `CartPage` | No |
| `/checkout` | `CheckoutPage` | No |
| `/order-success` | `OrderSuccessPage` | No — reads state from `location.state.orderId` |
| `*` | `RestaurantsPage` | — (fallback) |

---

## 🚀 Deployment Quick Reference

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for full guide.

```bash
# Build
npm run build        # outputs to dist/

# Deploy via Wrangler CLI
npx wrangler pages deploy dist --project-name=saleor-tma-frontend

# Or push to main branch — Cloudflare Pages auto-deploys via Git integration
```

Required environment variables in Cloudflare Pages dashboard:
```
VITE_BACKEND_BASE_URL = https://your-backend-api.com
NODE_VERSION          = 18
```

The file `public/_redirects` contains `/* /index.html 200` and is **required** — without it every route except `/` returns 404.

---

## 📝 Changelog

- 2025-06-02: Initial AGENTS.md created from codebase analysis
- 2026-04-03: Restructured for opencode compatibility with:
  - Tool usage patterns section
  - Task delegation approach with category/skill selection
  - Codebase assessment methods
  - Exploration and research protocols
  - Implementation guidelines with verification requirements
  - Failure recovery procedures
  - Completion verification guarantee
  - Telegram-specific rules preserved
  - Opencode skill integration (ui-ux-pro-max priority)
  - Merged CORS documentation
  - Converted screen descriptions to Markdown
