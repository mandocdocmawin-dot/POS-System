import {useState} from 'react';
import {PageActions} from '../../components/common/PageActions';
import {Modal} from '../../components/common/Modal';
import {SupplierPaymentsTable} from '../../components/suppliers/SupplierPaymentsTable';
import {SupplierPaymentForm} from '../../components/suppliers/SupplierPaymentForm';
import {useLocalData} from '../../services/useLocalData';
export function Component(){useLocalData();const [open,setOpen]=useState(false);return <><PageActions title="Purchase Payments"><button className="btn-primary" onClick={()=>setOpen(true)}>Record payment</button></PageActions><div className="panel p-5"><SupplierPaymentsTable purchasesOnly/></div><Modal open={open} title="Record purchase payment" onClose={()=>setOpen(false)}><SupplierPaymentForm onSave={()=>setOpen(false)}/></Modal></>;}
