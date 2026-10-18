import {formatTime as displayTime} from '../../utils/date';
import {useState} from 'react';
import {Tabs} from '../../components/common/Tabs';
import {AttendanceRecords} from '../../components/staff/AttendanceRecords';
import {StaffShell} from '../../components/staff/StaffShell';
import {ClockPanel} from '../../components/staff/ClockPanel';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {useLocalData} from '../../services/useLocalData';
import {usePermission} from '../../hooks/usePermission';
import {useCurrentUser} from '../../hooks/useCurrentUser';
import {useStaffStore} from '../../store/useStaffStore';
import {attendanceService} from '../../services/attendanceService';
import {localDate,workedHours} from '../../utils/attendance';
export function Component(){useLocalData();const [tab,setTab]=useState("Today");const {can}=usePermission(),user=useCurrentUser(),staff=useStaffStore(s=>s.staff),records=attendanceService.list(),today=localDate(),people=staff.filter(s=>can('attendance:manage')||s.id===user?.id);return <StaffShell title="Attendance"><ClockPanel/><Tabs items={["Today","Records"]} value={tab} onChange={setTab}/>{tab==="Records"?<AttendanceRecords/>:<section className="panel"><DataTable caption="Today's attendance" rows={people} rowKey={s=>s.id} searchText={s=>s.name} columns={[{id:'staff',header:'Staff',cell:s=>s.name},{id:'status',header:'Status',cell:s=><StatusBadge>{attendanceService.status(s.id,today)}</StatusBadge>},{id:'in',header:'Clock in',cell:s=>time(records.find(r=>r.staffId===s.id&&r.date===today)?.clockIn)},{id:'out',header:'Clock out',cell:s=>time(records.find(r=>r.staffId===s.id&&r.date===today)?.clockOut)},{id:'hours',header:'Worked hours',cell:s=>{const r=records.find(r=>r.staffId===s.id&&r.date===today);return r?workedHours(r).toFixed(2):'0.00';}}]}/></section>}</StaffShell>;}
function time(value?:string){return value?displayTime(new Date(value)):'—';}
