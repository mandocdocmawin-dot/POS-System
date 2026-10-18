import { useState } from 'react';
import { FeaturePage } from '../../components/common/FeaturePage';
import { DataTable } from '../../components/common/DataTable';
import licenses from '../../data/generated/licenses.json';
export function Component() {
  const [query, setQuery] = useState('');
  return <FeaturePage title="Licenses" description={`${licenses.app.name} ${licenses.app.version} · ${licenses.app.license}`}><p className="card">Generated from installed package manifests at build time. License identifiers are provided for reference; consult the installed packages for full license notices.</p><label className="grid max-w-md gap-2">Search packages or licenses<input value={query} onChange={e => setQuery(e.target.value)} /></label><DataTable caption="Third-party package licenses" rows={licenses.packages.filter(pkg => `${pkg.name} ${pkg.license}`.toLowerCase().includes(query.toLowerCase()))} rowKey={p => `${p.name}@${p.version}`} columns={[{ id: 'name', header: 'Package', cell: p => p.name }, { id: 'version', header: 'Version', cell: p => p.version }, { id: 'license', header: 'License', cell: p => p.license }]} /></FeaturePage>;
}
