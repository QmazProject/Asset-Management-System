# Package.json Guide - For Beginners

## What is package.json?

This file tells Node.js and npm about your project - what it's called, what libraries it needs, and what commands you can run.

**IMPORTANT:** JSON files can't have comments, so I created this separate guide file to explain everything!

---

## Main Commands (Scripts)

These are commands you'll run in your terminal:

### `npm run dev`
```bash
npm run dev
```
**What it does:** Starts the development server at http://localhost:5173
**When to use:** Every time you want to work on the project
**What actually runs:** `vite` (the Vite dev server)

### `npm run build`
```bash
npm run build
```
**What it does:** 
1. Type-checks your code with `tsc` (TypeScript compiler)
2. Builds optimized files for production with `vite build`
**When to use:** When you're ready to deploy to a real server
**Output:** Creates a `dist/` folder with optimized files

### `npm run preview`
```bash
npm run preview
```
**What it does:** Serves the production build locally for testing
**When to use:** After running `build`, to test the production version before deploying

---

## Dependencies Explained

### Development Dependencies (devDependencies)

These are **only needed during development**, not in production:

| Package | What It Does | Where It's Used |
|---------|--------------|-----------------|
| `@types/react` | TypeScript definitions for React | Everywhere you use React |
| `@types/react-dom` | TypeScript definitions for React DOM | main.tsx, App.tsx |
| `autoprefixer` | Adds browser prefixes to CSS | PostCSS (for Tailwind) |
| `postcss` | CSS processor | Required by Tailwind |
| `tailwindcss` | Utility-first CSS framework | All .tsx files via className |
| `typescript` | TypeScript compiler | Checks all .ts/.tsx files |
| `vite` | Build tool & dev server | Runs your app |

### Production Dependencies (dependencies)

These are **included in your final app** and needed at runtime:

#### Form Handling
| Package | What It Does | Files That Use It |
|---------|--------------|-------------------|
| `@hookform/resolvers` | Connects Zod to React Hook Form | LoginPage.tsx, RegisterPage.tsx |
| `react-hook-form` | Easy form state management | LoginPage.tsx, RegisterPage.tsx |
| `zod` | Schema validation library | validation.ts |

**How they work together:**
```typescript
// 1. Zod defines the rules (validation.ts)
export const loginSchema = z.object({ ... })

// 2. React Hook Form manages the form state (LoginPage.tsx)
const { register, handleSubmit } = useForm()

// 3. @hookform/resolvers connects them
const form = useForm({
  resolver: zodResolver(loginSchema)  // ← This connection!
})
```

#### Backend
| Package | What It Does | Files That Use It |
|---------|--------------|-------------------|
| `@supabase/supabase-js` | Supabase client library | lib/supabase.ts, hooks/useAuth.ts |

Connects to your Supabase backend for authentication and database operations.

#### UI & Icons
| Package | What It Does | Files That Use It |
|---------|--------------|-------------------|
| `lucide-react` | Icon components | LoginPage.tsx, RegisterPage.tsx (Mail, Lock, Eye icons) |
| `framer-motion` | Animation library | Available for future use |

#### Routing
| Package | What It Does | Files That Use It |
|---------|--------------|-------------------|
| `react-router-dom` | Client-side routing | App.tsx (Router, Routes, Route, Navigate) |

Enables navigation between pages without full page reloads.

#### React Core
| Package | What It Does | Files That Use It |
|---------|--------------|-------------------|
| `react` | Core React library | Every .tsx file |
| `react-dom` | React renderer for web | main.tsx |

---

## How Files Connect to Dependencies

### Example Flow: Form Validation

```
User types in LoginPage.tsx
    ↓
React Hook Form (react-hook-form) captures input
    ↓
@hookform/resolvers passes it to Zod
    ↓
Zod (zod) validates against schema from validation.ts
    ↓
Error message or success
```

### Example Flow: Authentication

```
User clicks "Sign In" in LoginPage.tsx
    ↓
Calls login() from useAuth.ts
    ↓
useAuth.ts uses supabase client from lib/supabase.ts
    ↓
@supabase/supabase-js sends request to Supabase
    ↓
Response comes back
    ↓
React Router (react-router-dom) navigates to /dashboard
```

### Example Flow: Styling

```
You write: className="bg-blue-500 hover:bg-blue-600"
    ↓
Vite processes the file
    ↓
PostCSS (postcss) runs
    ↓
Tailwind CSS (tailwindcss) converts to actual CSS
    ↓
Autoprefixer (autoprefixer) adds browser prefixes
    ↓
Final CSS in your browser
```

---

## Common Tasks

### Adding a New Dependency

**For production:**
```bash
npm install package-name
```

**For development only:**
```bash
npm install -D package-name
```

### Removing a Dependency

```bash
npm uninstall package-name
```

### Updating All Dependencies

```bash
npm update
```

### Check for Security Issues

```bash
npm audit
```

### Fix Security Issues

```bash
npm audit fix
```

---

## Version Numbers Explained

Each package has a version like `^19.2.8`. Here's what the symbols mean:

- `^19.2.8` - Install any version from 19.2.8 up to (but not including) 20.0.0
- `~5.9.3` - Install any version from 5.9.3 up to (but not including) 5.10.0
- `19.0.0` - Install exactly this version

**The `^` is most common** - it allows minor updates but not major version changes.

---

## Troubleshooting

### "Module not found" Error
**Solution:**
```bash
npm install
```
Reinstalls all dependencies from package.json

### Old Package Versions
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```
Deletes everything and reinstalls fresh

### Package Conflicts
**Solution:** Check package-lock.json to see exact versions installed

---

## When to Edit package.json

### ✅ You SHOULD edit when:
- Adding new features that need new libraries
- Removing features you don't need anymore
- Changing npm script commands
- Updating package versions

### ❌ You SHOULD NOT manually edit:
- The actual code (that's in src/)
- Version numbers (use `npm update` instead)
- Lock files (package-lock.json is auto-generated)

---

## Related Files

- **package-lock.json** - Auto-generated, locks exact versions. Don't edit manually!
- **node_modules/** - Where packages are installed. Don't commit to git!
- **.gitignore** - Should include `node_modules/` so you don't upload thousands of files

---

**For more details on each package, check their official documentation linked in the README.md!**
