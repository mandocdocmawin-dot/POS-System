import {useLocalData} from '../services/useLocalData';
import {reportService} from '../services/reportService';
export function useReportFilters(){useLocalData();return reportService.filters();}
