import { FeaturePage, accountTabs } from '../../components/common/FeaturePage';
import { ActivityList } from '../../components/account/ActivityList';
import { profileService } from '../../services/profileService';
import { useLocalData } from '../../services/useLocalData';
export function Component() { useLocalData(); return <FeaturePage title="My activity logs" tabs={accountTabs}><ActivityList logs={profileService.logs()} /></FeaturePage>; }
