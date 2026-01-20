# Asset Management System - Authentication

## 🚀 Quick Start Guide for Beginners

### What is this project?
This is a login and registration system for your Asset Management System. Users can:
- Create an account (register)
- Log in with email OR username
- Access a protected dashboard after logging in

### Tech Stack (What technologies we're using)
- **React** + **TypeScript**: Frontend framework (UI components)
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Styling framework (makes things look nice)
- **Supabase**: Backend (database + authentication)

---

## 📁 Project Structure - Where Everything Lives

```
Asset Management System - 2026/
│
├── src/                              ← All your source code
│   ├── components/                   ← Reusable UI pieces
│   │   └── PasswordStrengthIndicator.tsx  ← Shows password strength meter
│   │
│   ├── hooks/                        ← Custom React hooks (reusable logic)
│   │   └── useAuth.ts               ← All authentication logic (login, register, etc.)
│   │
│   ├── lib/                          ← External service connections
│   │   └── supabase.ts              ← Supabase client configuration
│   │
│   ├── pages/                        ← Different pages/screens
│   │   ├── LoginPage.tsx            ← Login form UI
│   │   ├── RegisterPage.tsx         ← Registration form UI
│   │   └── Dashboard.tsx            ← Protected page after login
│   │
│   ├── utils/                        ← Utility functions
│   │   └── validation.ts            ← Form validation rules (Zod schemas)
│   │
│   ├── App.tsx                       ← Main app component (routing)
│   ├── main.tsx                      ← App entry point
│   └── index.css                     ← Global styles
│
├── index.html                        ← HTML template
├── package.json                      ← Project config & dependencies
├── tailwind.config.js                ← Tailwind CSS config
├── tsconfig.json                     ← TypeScript config
├── postcss.config.js                 ← PostCSS config (for Tailwind)
├── supabase-schema.sql              ← Database setup SQL (RUN THIS IN SUPABASE!)
└── README.md                         ← This file!
```

---

## 📋 How the Files Connect to Each Other

```
AUTHENTICATION FLOW:

1. User visits /login or /register
   ↓
2. LoginPage.tsx / RegisterPage.tsx
   ├─→ Uses: useAuth.ts (for login/register functions)
   ├─→ Uses: validation.ts (for form validation)
   └─→ Uses: PasswordStrengthIndicator.tsx (register page only)
   ↓
3. useAuth.ts
   ├─→ Uses: supabase.ts (to talk to backend)
   └─→ Uses: validation.ts types (LoginFormData, RegisterFormData)
   ↓
4. supabase.ts
   └─→ Connects to: Your Supabase backend (database + auth)
   ↓
5. Backend Success!
   └─→ User redirected to Dashboard.tsx
```

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```
**What this does:** Downloads all the libraries your project needs

### Step 2: Set Up Database (CRITICAL - Do this ONCE!)

1. Go to https://tpvidhjwzheswatnxwxi.supabase.co
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Open `supabase-schema.sql` file
5. Copy ALL the SQL code
6. Paste it into the SQL Editor
7. Click "Run" button

**What this does:** Creates the `user_profiles` table and security policies

### Step 3: Enable Email Authentication

1. In Supabase Dashboard, go to "Authentication" → "Providers"
2. Make sure "Email" is enabled
3. (Optional) Customize email templates under "Email Templates"

### Step 4: Start Development Server
```bash
npm run dev
```
**What this does:** Starts the app at http://localhost:5173

---

## 🎯 Main Commands You'll Use

| Command | What It Does | When To Use It |
|---------|-------------|----------------|
| `npm install` | Install dependencies | First time setup, or after pulling new code |
| `npm run dev` | Start dev server | Every time you want to work on the project |
| `npm run build` | Build for production | When deploying to a server |
| `npm run preview` | Preview production build | To test production build locally |

**Keyboard Shortcuts in Dev Mode:**
- Press `h` in terminal → Show help
- Press `q` in terminal → Quit server
- `Ctrl+C` in terminal → Stop server

---

## 🔍 Understanding Key Files

### Configuration Files (You usually don't need to edit these)

**`package.json`**
- Lists all the libraries (dependencies) your project uses
- Defines npm scripts (dev, build, etc.)

**`tsconfig.json`**
- TypeScript compiler settings
- Tells TypeScript how strict to be about types

**`tailwind.config.js`**
- Tailwind CSS configuration
- Custom colors, animations, extensions

**`postcss.config.js`**
- Processes CSS files
- Required for Tailwind CSS to work

---

### Source Code Files (These you WILL edit)

#### **`src/lib/supabase.ts`** - Backend Connection
```typescript
// This file creates the connection to your Supabase backend
// Import it like this:
import { supabase } from './lib/supabase'
```
- **Purpose**: Connect to Supabase database and auth
- **Edit when**: Never (unless you change Supabase projects)

#### **`src/utils/validation.ts`** - Form Rules
```typescript
// This file defines what makes a valid password, email, etc.
// Import validation schemas like this:
import { loginSchema, registerSchema } from './utils/validation'
```
- **Purpose**: Define what's allowed in forms (email format, password rules)
- **Edit when**: You want to change password requirements or add new fields

#### **`src/hooks/useAuth.ts`** - Authentication Logic
```typescript
// This file has all the login/logout/register functions
// Import like this:
import { useAuth } from './hooks/useAuth'
```
- **Purpose**: All authentication operations
- **Edit when**: You want to add features like password reset, profile updates

#### **`src/pages/LoginPage.tsx`** - Login Screen
- **Purpose**: The UI for the login form
- **Edit when**: 
  - Change how the login page looks
  - Add/remove fields
  - Change colors, text, layout

#### **`src/pages/RegisterPage.tsx`** - Registration Screen
- **Purpose**: The UI for the registration form
- **Edit when**:
  - Change how the registration page looks
  - Add/remove fields (like phone number)
  - Modify branch options

#### **`src/pages/Dashboard.tsx`** - After Login Page
- **Purpose**: What users see after successfully logging in
- **Edit when**: 
  - Add asset management features
  - Display more user information
  - Create your actual application content

#### **`src/components/PasswordStrengthIndicator.tsx`** - Password Meter
- **Purpose**: Visual feedback for password strength
- **Edit when**:
  - Change colors
  - Add/remove password requirements
  - Modify the visual design

#### **`src/App.tsx`** - Routing Setup
- **Purpose**: Defines all the pages and URLs
- **Edit when**:
  - Add new pages (like /forgot-password)
  - Change URLs
  - Add protected routes

---

## 🎨 How to Customize

### Change Colors
**File**: `tailwind.config.js`
```javascript
colors: {
  primary: {
    600: '#0284c7',  // ← Change this to your brand color
  }
}
```

### Change Password Requirements
**File**: `src/utils/validation.ts`
```typescript
export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')  // ← Change from 8 to 10
```

### Add a New Page
1. Create file: `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`:
```typescript
<Route path="/your-page" element={<YourPage />} />
```

### Change Branch Options
**File**: `src/utils/validation.ts` AND `supabase-schema.sql`
```typescript
// In validation.ts
branch: z.enum(['Branch A', 'Branch B', 'Branch C'])

// Also update in supabase-schema.sql (line 27)
CHECK (branch IN ('Branch A', 'Branch B', 'Branch C'))
```
⚠️ Must update BOTH files!

---

## 🧪 Testing Your Changes

### Test Registration
1. Go to http://localhost:5173/register
2. Fill out form with:
   - Full Name: Test User
   - Username: testuser
   - Email: test@example.com
   - Branch: QM Builders
   - Password: Test123!@#
   - Confirm Password: Test123!@#
   - ✅ Accept Terms
3. Click "Create Account"
4. Check your email for confirmation

### Test Login
1. Confirm email (or manually in Supabase: Auth → Users → Confirm)
2. Go to http://localhost:5173/login
3. Try both:
   - Login with email: test@example.com
   - Login with username: testuser
4. Click "Sign In"
5. Should redirect to dashboard

### Check Database
1. Go to Supabase Dashboard → Table Editor
2. Select `user_profiles` table
3. See your user's data

---

## ❓ Common Questions

### Where is the password strength validation?
**Answer**: 
- Rules defined in: `src/utils/validation.ts`
- UI component: `src/components/PasswordStrengthIndicator.tsx`
- Used in: `src/pages/RegisterPage.tsx`

### How do I add a "Forgot Password" feature?
**Answer**: Create a new page `ForgotPasswordPage.tsx` and use:
```typescript
await supabase.auth.resetPasswordForEmail(email)
```

### Where are passwords stored?
**Answer**: In Supabase's `auth.users` table (encrypted, you can't see them). 
NEVER store passwords in `user_profiles`!

### Can I change the port from 5173?
**Answer**: Yes! In `package.json`, change:
```json
"dev": "vite --port 3000"
```

### How do I deploy to production?
**Answer**:
1. Run `npm run build` → Creates optimized files in `dist/` folder
2. Upload `dist/` folder to hosting (Vercel, Netlify, etc.)
3. Set environment variables for Supabase URL and key

---

## 🐛 Troubleshooting

### Blank white screen?
**Check**:
1. Browser console for errors (F12 → Console tab)
2. Is dev server running? (`npm run dev`)
3. Are there TypeScript errors in VS Code?

### "Module not found" error?
**Solution**: Run `npm install` again

### Login not working?
**Check**:
1. Did you run `supabase-schema.sql` in Supabase?
2. Is email authentication enabled in Supabase?
3. Did user confirm their email?

### Changes not showing?
**Solution**: 
1. Hard refresh browser (Ctrl+Shift+R)
2. Restart dev server (Ctrl+C, then `npm run dev`)

---

## 📚 Learn More

- **React**: https://react.dev/learn
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/

---

## ✅ Next Steps

Now that authentication works, you can:

1. **Add Profile Editing**
   - Create `ProfilePage.tsx`
   - Let users update their name, username, etc.

2. **Add Asset Management**
   - Create `AssetsPage.tsx`
   - Add assets table to database
   - CRUD operations (Create, Read, Update, Delete)

3. **Add Role-Based Access**
   - Add `role` field to `user_profiles`
   - Create admin-only pages
   - Protect routes based on role

4. **Add Password Reset**
   - Create `ForgotPasswordPage.tsx`
   - Use Supabase password reset

---

**Need Help?** Check the comments in each file - they explain exactly what each part does!

**Happy Coding!** 🚀
