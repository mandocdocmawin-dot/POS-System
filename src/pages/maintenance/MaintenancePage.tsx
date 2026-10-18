import { Link } from 'react-router-dom';
import { FeaturePage } from '../../components/common/FeaturePage';
import { useSettings } from '../../hooks/useSettings';
export function Component() {
  const settings = useSettings(s => s.general);
  return <FeaturePage title="A little care for your store"><section className="card mx-auto max-w-xl space-y-6 py-12 text-center"><h2 className="text-2xl font-semibold">{settings.maintenanceMode ? 'Maintenance in progress' : 'Everything is available'}</h2><p>{settings.maintenanceMode ? settings.maintenanceMessage : 'Maintenance mode is currently turned off.'}</p>{settings.maintenanceReturnAt && <p>Expected return: {new Date(settings.maintenanceReturnAt).toLocaleString()}</p>}<p>Your cart and saved browser records are preserved.</p><Link className="btn" to="/sign-in">Back to sign in</Link><Link className="btn ml-3" to="/landing">About TindaPOS</Link></section></FeaturePage>;
}
