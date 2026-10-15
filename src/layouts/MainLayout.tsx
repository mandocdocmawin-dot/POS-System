import { Topbar } from '../components/layout/Topbar'
import { useUiStore } from '../store/useUiStore'
import { Sidebar } from '../components/layout/Sidebar'
import { Outlet } from 'react-router-dom'
import { IconRail } from '../components/layout/IconRail'
export function MainLayout() { const sidebarOpen = useUiStore(s => s.sidebarOpen); const compact = useUiStore(s => s.compact); return <div className="flex min-h-dvh"><div className="sticky top-0 h-dvh"><IconRail /></div>{sidebarOpen && <div className="sticky top-0 h-dvh"><Sidebar /></div>}<div className="min-w-0 flex-1"><Topbar /><main className={compact ? "p-3" : "p-6"}><Outlet /></main></div></div> }
