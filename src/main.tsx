/**
 * ============================================================================
 * MAIN.TSX - Application Entry Point
 * ============================================================================
 * 
 * 📍 FILE PURPOSE:
 * This is the FIRST file that runs when your app starts.
 * Think of it as the ignition key that starts the car.
 * 
 * 🔗 WHAT IT CONNECTS TO:
 * main.tsx (YOU ARE HERE)
 *    ↓ imports
 * App.tsx → Your main application with routes
 *    ↓ imports
 * LoginPage.tsx, RegisterPage.tsx, Dashboard.tsx
 * 
 * 📝 WHEN TO EDIT:
 * - Almost never! This file is standard for all React apps
 * - Only edit if adding global providers (like themes, Redux, etc.)
 * 
 * ⚙️ HOW IT WORKS:
 * 1. Find the HTML element with id="root" (from index.html)
 * 2. Create a React "root" that can render components
 * 3. Render the App component inside StrictMode
 * 4. StrictMode = Development helper that catches bugs
 * 
 * ============================================================================
 */

// Import React's StrictMode - helps catch bugs during development
import { StrictMode } from 'react'

// Import createRoot - the function that mounts your React app to the DOM
import { createRoot } from 'react-dom/client'

// Import global CSS styles (includes Tailwind directives)
import './index.css'

// Import the main App component (handles routing and layout)
import App from './App.tsx'

/**
 * MOUNT THE REACT APP
 * 
 * Step 1: Get the root HTML element from index.html
 * - The "!" tells TypeScript "I promise this element exists"
 * - If the element is missing, the app won't render
 */
const rootElement = document.getElementById('root')!

/**
 * Step 2: Create a React root and render the app
 * 
 * createRoot(rootElement) - Prepares the DOM element to hold React components
 * .render() - Actually renders your components into that element
 * 
 * <StrictMode> - Wrapper that:
 *   - Runs extra checks during development
 *   - Warns about deprecated features
 *   - Highlights potential problems
 *   - Does NOT affect production builds
 * 
 * <App /> - Your main component with all the routes and pages
 */
createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

/**
 * ============================================================================
 * TROUBLESHOOTING
 * ============================================================================
 * 
 * 🔴 Blank screen?
 * Check browser console (F12) for errors like:
 * - "Cannot find element with id 'root'" → Check index.html has <div id="root">
 * - Module errors → Run npm install again
 * 
 * 🔴 Changes not showing?
 * 1. Make sure dev server is running (npm run dev)
 * 2. Hard refresh browser (Ctrl+Shift+R)
 * 3. Check for TypeScript errors in VS Code
 * 
 * ============================================================================
 * 
 * 📚 LEARN MORE:
 * - React 18 Root API: https://react.dev/reference/react-dom/client/createRoot
 * - StrictMode: https://react.dev/reference/react/StrictMode
 * 
 * ============================================================================
 */
