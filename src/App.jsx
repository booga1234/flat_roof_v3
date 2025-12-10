import { Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Components from './pages/Components'
import Login from './pages/Login'
import Pipeline from './pages/Pipeline'
import Library from './pages/Library'
import TimeSlots from './pages/TimeSlots'
import Settings from './pages/Settings'
import Team from './pages/Team'
import Leads from './pages/Leads'
import Inspections from './pages/Inspections'
import Estimates from './pages/Estimates'
import Proposals from './pages/Proposals'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import { MainSidebar } from './components/Sidebar'
import SidebarLibrary from './components/SidebarLibrary'
import SidebarSettings from './components/SidebarSettings'
import Topbar from './components/Topbar'

function Layout() {
  const location = useLocation()
  const isLibraryRoute = location.pathname.startsWith('/library')
  const isSettingsRoute = location.pathname.startsWith('/settings')
  
  const getSidebarComponent = () => {
    if (isSettingsRoute) return SidebarSettings
    if (isLibraryRoute) return SidebarLibrary
    return MainSidebar
  }
  
  const SidebarComponent = getSidebarComponent()

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <SidebarComponent />
        <main className="flex-1 overflow-hidden min-h-0" style={{ backgroundColor: '#F3F3F3' }}>
          <div style={{ padding: '10px', paddingLeft: '0', paddingTop: '0', height: '100%', boxSizing: 'border-box' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/components" element={<Components />} />
        <Route path="/pipeline/:selection?" element={<Pipeline />} />
        <Route path="/library" element={<Library />} />
        <Route path="/library/time-slots" element={<TimeSlots />} />
        <Route path="/settings/*" element={<Settings />} />
        <Route path="/leads/:leadId?" element={<Leads />} />
        <Route path="/inspections/:inspectionId?" element={<Inspections />} />
        <Route path="/estimates" element={<Estimates />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route 
          path="/team" 
          element={
            <RoleProtectedRoute allowedRoles={['office_manager', 'owner']}>
              <Team />
            </RoleProtectedRoute>
          } 
        />
        {/* Catch-all route for unknown paths - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App

