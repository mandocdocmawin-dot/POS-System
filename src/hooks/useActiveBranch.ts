import {useLocalData} from '../services/useLocalData';
import {branchService} from '../services/branchService';
export function useActiveBranch(){useLocalData();return branchService.get(branchService.activeId());}
