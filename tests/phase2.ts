import assert from "node:assert/strict";
class MemoryStorage implements Storage {
  rejectKey?: string;
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.rejectKey === key) {
      this.rejectKey = undefined;
      throw new DOMException("Storage full", "QuotaExceededError");
    }
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  clear() {
    this.values.clear();
  }
}
Object.defineProperty(globalThis, "localStorage", {
  value: new MemoryStorage(),
  configurable: true,
});
Object.defineProperty(globalThis, "window", {
  value: { localStorage: globalThis.localStorage },
  configurable: true,
});
const { dataService } = await import("../src/services/dataService");
const { authService } = await import("../src/services/authService");
const { productService } = await import("../src/services/productService");
const { categoryService, subcategoryService, brandService, unitService } =
  await import("../src/services/catalogService");
const { stockService } = await import("../src/services/stockService");
const { validateBackup } = await import("../src/services/backupSchema");
const { productFormSchema } =
  await import("../src/components/forms/productSchema");
const { useCatalogStore } = await import("../src/store/useCatalogStore");
const { useProductStore } = await import("../src/store/useProductStore");
const { useStockStore } = await import("../src/store/useStockStore");
const snapshot = () => ({
  version: 1,
  ...structuredClone(useCatalogStore.getState()),
  ...structuredClone(useProductStore.getState()),
  ...structuredClone(useStockStore.getState()),
});
let passed = 0;
function test(name: string, run: () => void) {
  run();
  passed++;
  console.log(`PASS ${name}`);
}
dataService.initialize();authService.login();
test("first run seeds 25 products and variant-level stock", () => {
  assert.equal(productService.list().length, 25);
  assert.equal(categoryService.list().length, 8);
  assert.equal(stockService.getStock("prod-11"), 6);
  assert.equal(stockService.getStock("prod-11", "prod-11-v0"), 3);
  validateBackup(snapshot());
});
const seed = productService.list()[1];
const base = { ...seed };
delete (base as Partial<typeof seed>).id;
delete (base as Partial<typeof seed>).createdAt;
delete (base as Partial<typeof seed>).updatedAt;
const input = {
  ...base,
  name: "Test Product",
  sku: "TEST-1",
  hasVariants: false,
};
test("create forms may pass undefined IDs", () => {
  const category = categoryService.save({
    id: undefined,
    name: "Form category",
    status: "active",
  });
  assert.ok(category.id);
  categoryService.remove(category.id);
});
const product = productService.save(
  { ...input, id: undefined },
  { openingStock: 10 },
);
test("opening stock is an initial movement", () => {
  assert.equal(stockService.getStock(product.id), 10);
  assert.equal(stockService.history(product.id)[0].type, "initial");
});
test("SKU uniqueness ignores case across products and variants", () => {
  assert.throws(
    () => productService.save({ ...input, sku: "test-1" }),
    /unique/,
  );
  assert.throws(
    () =>
      productService.save({ ...input, sku: productService.variants()[0].sku }),
    /unique/,
  );
});
test("missing and mismatched classifications are rejected", () => {
  assert.throws(
    () =>
      productService.save({ ...input, sku: "TEST-2", categoryId: "missing" }),
    /category/,
  );
  assert.throws(
    () =>
      productService.save({
        ...input,
        sku: "TEST-2",
        subcategoryId: "sub-1-0",
      }),
    /Subcategory/,
  );
});
test("in-use catalog records cannot be deleted but can deactivate", () => {
  assert.throws(() => categoryService.remove(seed.categoryId), /in use/);
  assert.throws(() => brandService.remove(seed.brandId!), /in use/);
  assert.throws(() => unitService.remove(seed.unitId), /in use/);
  assert.throws(() => subcategoryService.remove(seed.subcategoryId!), /in use/);
  categoryService.save({ ...categoryService.list()[0], status: "inactive" });
  assert.equal(categoryService.list()[0].status, "inactive");
});
const movement = {
  productId: product.id,
  quantity: 2,
  reason: "Test",
  createdAt: new Date().toISOString(),
};
test("stock in and out derive current quantity", () => {
  stockService.record({ ...movement, type: "in" });
  stockService.record({ ...movement, type: "out", quantity: 5 });
  assert.equal(stockService.getStock(product.id), 7);
});
test("stock out cannot go negative and failure is atomic", () => {
  const count = stockService.history().length;
  assert.throws(
    () => stockService.record({ ...movement, type: "out", quantity: 8 }),
    /Insufficient/,
  );
  assert.equal(stockService.getStock(product.id), 7);
  assert.equal(stockService.history().length, count);
});
test("adjustments support signed deltas and protect zero floor", () => {
  stockService.record({ ...movement, type: "adjustment", quantity: -3 });
  assert.equal(stockService.getStock(product.id), 4);
  assert.throws(
    () =>
      stockService.record({ ...movement, type: "adjustment", quantity: -5 }),
    /Insufficient/,
  );
  assert.throws(
    () => stockService.record({ ...movement, type: "adjustment", quantity: 0 }),
    /matches/,
  );
});
test("invalid, nonfinite and negative receipt quantities are rejected", () => {
  for (const quantity of [0, -1, NaN, Infinity])
    assert.throws(() =>
      stockService.record({ ...movement, type: "in", quantity }),
    );
});
test("variant movements require correct ownership and variant selection", () => {
  assert.throws(
    () =>
      stockService.record({ ...movement, productId: "prod-11", type: "in" }),
    /specific variant/,
  );
  assert.throws(
    () =>
      stockService.record({ ...movement, variantId: "prod-11-v0", type: "in" }),
    /belong/,
  );
  stockService.record({
    ...movement,
    productId: "prod-11",
    variantId: "prod-11-v0",
    type: "in",
  });
  assert.equal(stockService.getStock("prod-11", "prod-11-v0"), 5);
});
test("variant history cannot be orphaned by edits", () => {
  assert.throws(() => productService.removeVariant("prod-11-v0"), /history/);
  assert.throws(
    () =>
      productService.save(
        { ...product, hasVariants: true },
        {
          variants: [
            {
              name: "Large",
              sku: "TEST-V",
              costPrice: 1,
              sellingPrice: 2,
              attributes: {},
            },
          ],
        },
      ),
    /tracking mode/,
  );
});
test("variant creation and opening balances are isolated", () => {
  const p = productService.save(
    { ...input, sku: "TEST-VARIANTS", hasVariants: true },
    {
      variants: [
        {
          name: "Large",
          sku: "TEST-L",
          costPrice: 10,
          sellingPrice: 20,
          attributes: { Size: "L" },
        },
        {
          name: "Small",
          sku: "TEST-S",
          costPrice: 5,
          sellingPrice: 10,
          attributes: { Size: "S" },
        },
      ],
      variantOpening: { "TEST-L": 4, "TEST-S": 2 },
    },
  );
  assert.equal(stockService.getStock(p.id), 6);
  const variants = productService.variants(p.id);
  assert.equal(stockService.getStock(p.id, variants[0].id), 4);
});
test("edited product form data preserves its variants", () => {
  const p = productService.get("prod-11")!;
  const data = productFormSchema.parse({
    ...p,
    openingStock: 0,
    variants: productService
      .variants(p.id)
      .map((v) => ({ ...v, openingStock: 0, attributesText: "Size: Large" })),
  });
  assert.equal(data.variants.length, 2);
});
test("backup validation rejects malformed shape, duplicate SKU and orphan refs", () => {
  assert.throws(() => dataService.validate('{"products":[]}'));
  const duplicate = snapshot();
  duplicate.products[1].sku = duplicate.products[0].sku;
  assert.throws(() => validateBackup(duplicate), /duplicate SKUs/);
  const orphan = snapshot();
  orphan.movements[0].productId = "missing";
  assert.throws(() => validateBackup(orphan), /missing/);
  const negative = snapshot();
  negative.movements.push({
    ...negative.movements[0],
    id: "negative",
    type: "out",
    quantity: 99999,
  });
  assert.throws(() => validateBackup(negative), /negative/);
});
test("reinitialization does not overwrite saved data", () => {
  dataService.initialize();authService.login();
  assert.ok(productService.get(product.id));
  assert.ok(localStorage.getItem("tindapos:products"));
});
test("removing products removes dependent variants and movements", () => {
  productService.removeMany([product.id]);
  assert.equal(productService.get(product.id), undefined);
  assert.equal(stockService.history(product.id).length, 0);
});
await dataService.import(JSON.stringify(snapshot()));authService.login();
test("valid JSON backup round trips without losing stock", () => {
  assert.equal(stockService.getStock("prod-11", "prod-11-v0"), 5);
});
test("failed storage writes roll back product and opening movements", () => {
  const before = snapshot();
  (localStorage as MemoryStorage).rejectKey = "tindapos:stock";
  assert.throws(
    () =>
      productService.save({ ...input, sku: "TEST-QUOTA" }, { openingStock: 3 }),
    /Unable to save/,
  );
  assert.deepEqual(snapshot(), before);
  assert.deepEqual(
    JSON.parse(localStorage.getItem("tindapos:products")!).state.products,
    before.products,
  );
});
dataService.reset();authService.login();
test("reset restores demo state", () => {
  assert.equal(productService.list().length, 25);
  assert.equal(stockService.getStock("prod-11", "prod-11-v0"), 3);
  validateBackup(snapshot());
});
console.log(`${passed} Phase 2 service checks passed.`);
