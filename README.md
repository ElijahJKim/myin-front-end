# MYIN (Global Influencer Marketing Platform)

This repository is the frontend application for MYIN, built with **Svelte 5** and **TypeScript**.

## Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev/)
- **Language:** TypeScript
- **Styling:** SCSS
- **Internationalization:** i18n
- **Package Manager:** pnpm
- **Deployment:** Cloudflare Pages

## Git Workflow & Branch Strategy

We follow a 4-tier branching strategy to ensure stability.

- **`main`**: **Production.** Only stable code is deployed here. (Reflects the live website)
- **`qa`**: **Staging/Final Testing.** Merged from `dev`. The entire team performs QA here before production.
- **`dev`**: **Development Integration.** Merged from `feature/*`. Developers merge here first to test integration.
- **`feature/*`, `fix/*`**: **Workspaces.** Create branches from `dev` and merge back to `dev`.

**Flow:** `feature` → `dev` (Dev Test) → `qa` (Final QA) → `main` (Production)

## Getting Started

Ensure you have the following installed:

- **Node.js** (v18.x or higher recommended)
- **pnpm** (Required)

# Clone the repository (dev branch)

git clone -b dev https://github.com/TEAM-MYIN/front-end.git

# Navigate to the directory

cd front-end

# Install dependencies

pnpm install

# Start the development server

pnpm run dev

## Contribution & Pull Request (PR) Workflow

To maintain code quality and stability, please follow these steps strictly.

### 1. Commit Convention

We follow the **Conventional Commits** structure.

- **Format:** `type: subject`
- **Types:**
  - `feat`: New feature (e.g., `feat: add login page`)
  - `fix`: Bug fix (e.g., `fix: navigation bar overflow`)
  - `style`: Formatting, missing semi-colons, etc. (no code change)
  - `refactor`: Refactoring code without changing functionality
  - `chore`: Maintenance, build tasks, etc.

### 2. Creating a Pull Request (PR)

1. **Base Branch:** Ensure your PR targets **`dev`** (NOT `qa` or `main`).
2. **Push** your branch to the remote repository.
3. **Title:** Must match your commit message (e.g., `feat: implement collaboration room UI`).
4. **Description:**
   - Explain **what** changed and **why**.
   - If UI changes are involved, **attach screenshots** or GIFs.

### 3. CI/CD & Review Process (Important!)

After creating a PR, **Cloudflare Pages** will automatically trigger a build test.

1. **Wait for Checks:**
   - 🛑 **DO NOT MERGE** immediately.
   - Wait until the Cloudflare build finishes and shows **"No conflicts"** or **"All checks passed"**.

2. **Code Review:**
   - Tag **@Elijah** for a review.
   - **Scenario A (Sync):** We will review the code together and then proceed to merge.
   - **Scenario B (Async):** If I(Elijah) review it alone, I will leave a comment with **:shipit:** emoji.
     - **Only after seeing :shipit:**, you may proceed to merge.

3. **Merging:**
   - Always use **"Squash and Merge"** to keep the main history clean.
