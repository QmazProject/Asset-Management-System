/**
 * ============================================================================
 * APP.TSX - Main Application Component & Routing
 * ============================================================================
 * 
 * 📍 FILE PURPOSE:
 * This is your app's "traffic controller" - it decides which page to show
 * based on the URL (like /login, /register, /dashboard).
 * 
 * 🔗 FILE CONNECTIONS:
 * main.tsx
 *    ↓ renders
 * App.tsx (YOU ARE HERE) - Sets up routes
 *    ↓ renders one of these based on URL:
 * LoginPage.tsx      (/login)
 * RegisterPage.tsx   (/register)
 * Dashboard.tsx      (/dashboard)
 * 
 * 📝 WHEN TO EDIT THIS FILE:
 * - Adding new pages (like /forgot-password, /profile, /settings)
 * - Changing URLs (like /signin instead of /login)
 * - Adding protected routes (routes that require login)
 * - Adding layout components (header, footer, sidebar)
 * 
 * ============================================================================
 */

// Import React's Component class and ReactNode type
import { Component, type ReactNode } from 'react'

// Import React Router components for navigation
// Router = Enables routing in your app
// Routes = Container for all your Route definitions
// Route = Defines a single route (URL → Component mapping)
// Navigate = Redirects users to a different URL
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Import your page components
import { LoginPage } from './pages/LoginPage'          // Login form UI
import { RegisterPage } from './pages/RegisterPage'    // Registration form UI
import { Dashboard } from './pages/Dashboard'          // Protected dashboard
import { ManageServicePage } from './pages/ManageServicePage'
import { HistoricService } from './pages/HistoricService'
import { UpcomingService } from './pages/UpcomingService'

/**
 * ============================================================================
 * ERROR BOUNDARY - Catches React errors and displays them
 * ============================================================================
 * 
 * PURPOSE: 
 * If any component crashes, this catches the error and shows a friendly
 * error message instead of a blank white screen.
 * 
 * HOW IT WORKS:
 * 1. Wraps your entire app
 * 2. If any child component throws an error, this catches it
 * 3. Shows the error message instead of crashing the whole app
 * 
 * BEGINNER NOTE:
 * You don't need to understand class components. This is a special case.
 * Most of your code uses function components.
 */
class ErrorBoundary extends Component<
    { children: ReactNode },              // Props: Expects children components
    { hasError: boolean; error: Error | null }  // State: Tracks if there's an error
> {
    constructor(props: { children: ReactNode }) {
        super(props)
        // Initial state: No error yet
        this.state = { hasError: false, error: null }
    }

    // This special method is called when an error occurs
    static getDerivedStateFromError(error: Error) {
        // Update state to show error UI
        return { hasError: true, error }
    }

    // This method is called after an error is caught
    componentDidCatch(error: Error, errorInfo: any) {
        // Log error details to browser console for debugging
        console.error('Error caught by boundary:', error, errorInfo)
    }

    render() {
        // If there's an error, show the error UI
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#fee', minHeight: '100vh' }}>
                    <h1 style={{ color: '#c00' }}>Something went wrong</h1>
                    <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
                        {this.state.error?.toString()}
                        {'\n\n'}
                        {this.state.error?.stack}
                    </pre>
                </div>
            )
        }

        // If no error, render children normally
        return this.props.children
    }
}

/**
 * ============================================================================
 * APP COMPONENT - Main Application
 * ============================================================================
 * 
 * This is the root component of your application.
 * It sets up routing and wraps everything in an ErrorBoundary.
 */
function App() {
    try {
        return (
            // ErrorBoundary catches any errors in child components
            <ErrorBoundary>
                {/* Router enables navigation without full page reloads */}
                <Router>
                    {/* Routes container holds all route definitions */}
                    <Routes>
                        {/* 
              ROUTE DEFINITIONS
              Each <Route> maps a URL path to a component
              
              Format: <Route path="/url" element={<Component />} />
            */}

                        {/* Root path "/" redirects to "/login" */}
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* /login shows the Login page */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* /register shows the Registration page */}
                        <Route path="/register" element={<RegisterPage />} />

                        {/* /dashboard shows the Dashboard (protected page after login) */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/manage-services" element={<ManageServicePage />} />
                        <Route path="/assign-historic-service" element={<HistoricService />} />
                        <Route path="/assign-upcoming-service" element={<UpcomingService />} />

                        {/* 
              TO ADD A NEW PAGE:
              1. Create a new file: src/pages/YourPage.tsx
              2. Add a route here: <Route path="/your-page" element={<YourPage />} />
              3. Import the component at the top of this file
              
              Example:
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            */}
                    </Routes>
                </Router>
            </ErrorBoundary>
        )
    } catch (error) {
        // If there's an error outside React's render cycle, this catches it
        console.error('Error in App:', error)
        return (
            <div style={{ padding: '20px', background: '#fee' }}>
                <h1 style={{ color: '#c00' }}>App Error</h1>
                <pre>{String(error)}</pre>
            </div>
        )
    }
}

// Export the App component so main.tsx can use it
export default App

/**
 * ============================================================================
 * HOW ROUTING WORKS:
 * ============================================================================
 * 
 * 1. User goes to http://localhost:5173/login
 * 2. Router sees the URL is "/login"
 * 3. Finds the matching <Route path="/login" ... />
 * 4. Renders <LoginPage />
 * 
 * When user clicks a link or button that navigates to /register:
 * 1. URL changes to /register (WITHOUT page reload)
 * 2. Router sees the new URL
 * 3. Renders <RegisterPage /> instead
 * 4. Old component (LoginPage) is unmounted
 * 
 * ============================================================================
 * PROTECTED ROUTES (Future Enhancement):
 * ============================================================================
 * 
 * To make a route require login, you can create a ProtectedRoute wrapper:
 * 
 * <Route 
 *   path="/dashboard" 
 *   element={
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   } 
 * />
 * 
 * The ProtectedRoute component would check if user is logged in,
 * and redirect to /login if not.
 * 
 * ============================================================================
 */
