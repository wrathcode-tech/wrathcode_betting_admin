import { Outlet } from 'react-router-dom'
import { LayoutProvider } from '../context/LayoutContext'
import Sidebar from './Sidebar'
import Header from './Header'
import CommandPalette from './CommandPalette'

export default function Layout() {
  return (
    <LayoutProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <Header />
          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 bg-gray-50">
            <Outlet />
          </main>
        </div>
        <CommandPalette />
      </div>
    </LayoutProvider>
  )
}
