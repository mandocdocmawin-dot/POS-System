import type { Holiday } from '../../types/staff';
// Proclamation 1006 s.2025; Eid proclamations for March 20 and May 27, 2026.
// Sources: https://www.pna.gov.ph/articles/1258046
// https://customs.gov.ph/wp-content/uploads/2026/03/2026-31-OCOM-MEMO.pdf
// https://pco.gov.ph/news_releases/palace-declares-may-27-as-a-regular-holiday-for-eidl-adha-observance/
const regular=[['2026-01-01',"New Year's Day"],['2026-03-20',"Eid’l Fitr"],['2026-04-02','Maundy Thursday'],['2026-04-03','Good Friday'],['2026-04-09','Araw ng Kagitingan'],['2026-05-01','Labor Day'],['2026-05-27',"Eid’l Adha"],['2026-06-12','Independence Day'],['2026-08-31','National Heroes Day'],['2026-11-30','Bonifacio Day'],['2026-12-25','Christmas Day'],['2026-12-30','Rizal Day']];
const special=[['2026-02-17','Chinese New Year'],['2026-04-04','Black Saturday'],['2026-08-21','Ninoy Aquino Day'],['2026-11-01',"All Saints’ Day"],['2026-11-02',"All Souls’ Day"],['2026-12-08','Feast of the Immaculate Conception of Mary'],['2026-12-24','Christmas Eve'],['2026-12-31','Last Day of the Year']];
export const holidays2026:Holiday[]=[...regular.map(([date,name])=>({id:`holiday-${date}`,name,date,type:'regular' as const,paid:true})),...special.map(([date,name])=>({id:`holiday-${date}`,name,date,type:'special' as const,paid:false}))].sort((a,b)=>a.date.localeCompare(b.date));
