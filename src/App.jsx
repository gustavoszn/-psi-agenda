import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { DataProvider } from '@/contexts/DataContext'
import AppRoutes from '@/routes/AppRoutes'

// Only mount DataProvider when user is authenticated
function AuthenticatedData({ children }) {
  const { user } = useAuth()
  if (!user) return children
  return <DataProvider>{children}</DataProvider>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AuthenticatedData>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white text-sm',
                style: { borderRadius: '12px', fontSize: '14px' },
              }}
            />
          </AuthenticatedData>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
