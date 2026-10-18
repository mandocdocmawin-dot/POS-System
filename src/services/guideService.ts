import { useGuideStore } from '../store/useGuideStore';
import { useActivityStore } from '../store/useActivityStore';
import { evaluateGuide } from '../utils/guide';
import { activityService } from './activityService';
import { currentUser } from './phase8Context';
export const guideService = {
  state: () => structuredClone(useGuideStore.getState()),
  steps: () => evaluateGuide(useActivityStore.getState().logs, useGuideStore.getState().startedAt),
  start: () => { if (!useGuideStore.getState().startedAt) useGuideStore.setState({ startedAt:new Date().toISOString(),dismissed:false,collapsed:false }); else useGuideStore.setState({dismissed:false,collapsed:false}); },
  restart: () => useGuideStore.setState({startedAt:new Date().toISOString(),dismissed:false,collapsed:false}),
  dismiss: () => useGuideStore.setState({dismissed:true,collapsed:true}),
  collapse: () => useGuideStore.setState({collapsed:true}),
  visit: (path:string) => { if(!useGuideStore.getState().startedAt || useGuideStore.getState().dismissed || !path.startsWith('/reports/'))return; currentUser(); if(!guideService.steps().find(s=>s.id==='report')?.complete)activityService.log('data',path,'report-open','Opened a report during the demo guide'); },
};
