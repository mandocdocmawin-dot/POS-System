import { useLocation } from 'react-router-dom'
import { findRoute } from '../../config/menu'
import { featureStatus } from '../../config/featureStatus'
import { PlaceholderPage } from '../../components/common/PlaceholderPage'
export function Component() { const { pathname } = useLocation(); const route = findRoute(pathname); const feature = featureStatus[pathname]; if (!route || !feature) return <p>Page not found.</p>; const planned = ['components','forms','tables','charts','maps'].includes(route.sectionId); return <PlaceholderPage title={route.title} breadcrumb={route.breadcrumb} description={planned ? 'Planned for a later phase.' : feature.description} plannedFeatures={feature.plannedFeatures} status={feature.status}/> }
