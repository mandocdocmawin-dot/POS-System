import { CatalogPage } from "./CatalogPage";
import { categoryService } from "../../services/categoryService";
import { subcategoryService } from "../../services/subcategoryService";
import { productService } from "../../services/productService";
import { useLocalData } from "../../services/useLocalData";
export function Component() {
  useLocalData();
  const parents = categoryService.list();
  return (
    <CatalogPage
      config={{
        title: "Subcategories",
        singular: "Subcategory",
        ...subcategoryService,
        parents,
        columns: [
          {
            id: "parent",
            header: "Category",
            cell: (r) =>
              parents.find((p) => p.id === r.categoryId)?.name ?? "—",
            sortValue: (r) =>
              parents.find((p) => p.id === r.categoryId)?.name ?? "",
          },
          {
            id: "products",
            header: "Products",
            cell: (r) =>
              productService.list().filter((p) => p.subcategoryId === r.id)
                .length,
          },
        ],
      }}
    />
  );
}
