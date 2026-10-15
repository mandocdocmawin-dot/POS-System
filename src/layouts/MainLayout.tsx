import { Outlet } from 'react-router-dom'
import { IconRail } from '../components/layout/IconRail'
export function MainLayout() { return <div className="flex min-h-dvh"><div className="sticky top-0 h-dvh"><IconRail /></div><div className="min-w-0 flex-1"><main className="p-6"><Outlet /></main></div></div> }
