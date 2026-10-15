import { OrderPanel } from "./OrderPanel";
import { ProductBrowser } from "./ProductBrowser";
export function Component() {
  return (
    <div className="flex flex-1 flex-col xl:flex-row">
      <ProductBrowser />
      <OrderPanel />
    </div>
  );
}
