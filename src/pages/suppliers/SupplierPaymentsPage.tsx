import {useSearchParams} from 'react-router-dom';
import {PageActions} from '../../components/common/PageActions';
import {SupplierPaymentForm} from '../../components/suppliers/SupplierPaymentForm';
import {SupplierPaymentsTable} from '../../components/suppliers/SupplierPaymentsTable';
import {useLocalData} from '../../services/useLocalData';
export function Component(){useLocalData();const [params]=useSearchParams();return <><PageActions title="Supplier Payments"/><section className="panel mb-5 max-w-4xl p-5"><h2 className="mb-4 font-semibold">Record payment</h2><SupplierPaymentForm supplierId={params.get('supplier')??''} purchaseId={params.get('purchase')??''}/></section><section className="panel p-5"><h2 className="mb-4 font-semibold">Payment history</h2><SupplierPaymentsTable/></section></>;}
