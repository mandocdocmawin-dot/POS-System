import {inDateRange} from '../../utils/dateRange';
import {useState} from 'react';
import {PageActions} from '../../components/common/PageActions';
import {DateRangeFilter,type DateRange} from '../../components/common/DateRangeFilter';
import {Timeline} from '../../components/common/Timeline';
import {customerService} from '../../services/customerService';
import {activityService} from '../../services/activityService';
import {useLocalData} from '../../services/useLocalData';
export function Component(){useLocalData();const [customer,setCustomer]=useState(''),[action,setAction]=useState(''),[range,setRange]=useState<DateRange>({from:'',to:''});const logs=activityService.customerActivity(customer),rows=logs.filter(a=>(!action||a.action===action)&&inDateRange(a.createdAt,range));return <><PageActions title="Customer Activity Log"/><div className="mb-5 flex flex-wrap gap-3"><select aria-label="Customer" value={customer} onChange={e=>setCustomer(e.target.value)}><option value="">All customers</option>{customerService.list().map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select aria-label="Action type" value={action} onChange={e=>setAction(e.target.value)}><option value="">All actions</option>{[...new Set(logs.map(l=>l.action))].map(a=><option key={a}>{a}</option>)}</select><DateRangeFilter value={range} onChange={setRange}/></div><div className="panel p-5"><Timeline items={rows}/></div></>;}
