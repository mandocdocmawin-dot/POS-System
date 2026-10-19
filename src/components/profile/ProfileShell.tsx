import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {FeaturePage} from '../common/FeaturePage';

import { profileService } from '../../services/profileService';
import { ProfileHeader } from './ProfileHeader';
export function ProfileShell({ children }: { children: ReactNode }) {
  const { staffId } = useParams(), user = profileService.get(staffId), prefix = staffId ? `/profile/${staffId}` : '/profile';
  return <FeaturePage localizeTitle={false} title={user.name} banner={<ProfileHeader staffId={staffId} />} tabs={(['overview', 'activity', 'followers', 'documents', 'notes', 'projects'] as const).map(tab => [tab[0].toUpperCase() + tab.slice(1), `${prefix}/${tab}`])}>{children}</FeaturePage>;
}
