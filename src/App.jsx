import { Routes, Route, useLocation, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import Components from './pages/Components'
import Login from './pages/Login'
import Pipeline from './pages/Pipeline'
import Library from './pages/Library'
import TimeSlots from './pages/TimeSlots'
import Settings from './pages/Settings'
import Team from './pages/Team'
import Leads from './pages/Leads'
import Estimates from './pages/Estimates'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import Sidebar from './components/Sidebar'
import SidebarLibrary from './components/SidebarLibrary'
import Topbar from './components/Topbar'

function Layout() {
  const location = useLocation()
  const isLibraryRoute = location.pathname.startsWith('/library')
  const SidebarComponent = isLibraryRoute ? SidebarLibrary : Sidebar

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <SidebarComponent />
        <main className="flex-1 overflow-hidden min-h-0" style={{ backgroundColor: '#F3F3F3' }}>
          <div style={{ paddingBottom: '10px', paddingRight: '10px', height: '100%' }}>
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
        <Route path="/settings" element={<Settings />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/estimates" element={<Estimates />} />
        <Route 
          path="/team" 
          element={
            <RoleProtectedRoute allowedRoles={['office_manager', 'owner']}>
              <Team />
            </RoleProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  )
}

export default App

