import type {ReactNode} from 'react';
import {ProductWorkspace} from '../products/ProductWorkspace';
export function InventoryWorkspace({title,children}:{title:string;children:ReactNode}){return <ProductWorkspace title={title} section="Inventory" basePath="/inventory/stock-list">{children}</ProductWorkspace>;}
