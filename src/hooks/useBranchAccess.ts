import {useLocalData} from '../services/useLocalData';
import {branchService} from '../services/branchService';
export function useBranchAccess(){useLocalData();return branchService.allowed();}
