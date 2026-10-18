import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReportFilter } from '../types/accounts';
import { defaultReportFilter } from '../utils/reports/period';
export const useReportFilterStore=create<{filter:ReportFilter;dashboardBranchId?:string}>()(persist(()=>({filter:{...defaultReportFilter(),branchId:'Main Branch'}}),{name:'tindapos:report-filters',version:1}));
