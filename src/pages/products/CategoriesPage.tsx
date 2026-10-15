import { CatalogPage } from "./CatalogPage";
import { categoryService } from "../../services/categoryService";
import { subcategoryService } from "../../services/subcategoryService";
import { productService } from "../../services/productService";
export function Component() {
  return (
    <CatalogPage
      config={{
        title: "Categories",
        singular: "Category",
        ...categoryService,
        columns: [
          {
            id: "subcategories",
            header: "Subcategories",
            cell: (r) =>
              subcategoryService.list().filter((s) => s.categoryId === r.id)
                .length,
            sortValue: (r) =>
              subcategoryService.list().filter((s) => s.categoryId === r.id)
                .length,
          },
          {
            id: "products",
            header: "Products",
            cell: (r) =>
              productService.list().filter((p) => p.categoryId === r.id).length,
            sortValue: (r) =>
              productService.list().filter((p) => p.categoryId === r.id).length,
          },
        ],
      }}
    />
  );
}
