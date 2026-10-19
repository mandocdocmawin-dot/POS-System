import { T } from "../../i18n/T";
import { useState } from 'react';
import { FeaturePage } from '../../components/common/FeaturePage';
import { ActivityList } from '../../components/account/ActivityList';
import { activityHistoryService } from '../../services/activityHistoryService';
import { useLocalData } from '../../services/useLocalData';
export function Component() { useLocalData(); const [branch, setBranch] = useState('all'); return <FeaturePage title="Activity history" description="Global activity recorded in this browser. Use filters to inspect changes or export a CSV."><label className="grid max-w-sm gap-2"><T text={"Branch"}/><select value={branch} onChange={e => setBranch(e.target.value)}><option value="all"><T text={"All accessible branches"}/></option>{activityHistoryService.branches().map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label><ActivityList global logs={activityHistoryService.list(branch)} /></FeaturePage>; }
