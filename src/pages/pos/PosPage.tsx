import { OrderPanel } from "./OrderPanel";
import { ProductBrowser } from "./ProductBrowser";
export function Component() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
      <ProductBrowser />
      <OrderPanel />
    </div>
  );
}
