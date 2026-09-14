import type { menuCategories, menuItems } from "../../db/schema";
import { AddCategoryForm } from "./admin/AddCategoryForm";
import { AddItemForm } from "./admin/AddItemForm";
import { DeleteButton } from "./admin/DeleteButton";
import { ItemImage } from "./ItemImage";
import { Badge } from "./admin/ui/Badge";
import { Button } from "./admin/ui/Button";
import { Card, CardHead } from "./admin/ui/Card";
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "./admin/ui/Table";
import { deleteCategoryAction, deleteItemAction, toggleItemAvailabilityAction } from "../admin/business-actions";

type Category = typeof menuCategories.$inferSelect;
type Item = typeof menuItems.$inferSelect;

function formatPrice(minor: number, currency: string): string {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

// Shared between /admin/businesses/[id] (staff, managing on a client's
// behalf) and /portal (a business owner managing their own menu) — the
// underlying Server Actions authorize either caller via
// requireBusinessAccess(), so this component doesn't need to know which
// surface it's rendered on.
export function MenuEditor({
  businessId,
  categories,
  items,
}: {
  businessId: number;
  categories: Category[];
  items: Item[];
}) {
  return (
    <>
      <h2>Menu</h2>
      {categories.length === 0 && <p className="admin-empty">No categories yet — add one below.</p>}
      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.categoryId === category.id);
        return (
          <Card key={category.id} className="admin-category-card">
            <CardHead>
              <h3>{category.name}</h3>
              <DeleteButton
                action={deleteCategoryAction.bind(null, category.id, businessId)}
                label="Delete category"
                confirmMessage={`Delete "${category.name}" and all its items?`}
              />
            </CardHead>
            {categoryItems.length > 0 && (
              <Table>
                <TableHead>
                  <TableHeaderCell>Photo</TableHeaderCell>
                  <TableHeaderCell>Item</TableHeaderCell>
                  <TableHeaderCell>Price</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableHead>
                <TableBody>
                  {categoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <ItemImage
                          itemId={item.id}
                          categoryId={category.id}
                          businessId={businessId}
                          imageKey={item.imageKey}
                        />
                      </TableCell>
                      <TableCell>
                        <strong>{item.name}</strong>
                        {item.description && <div className="admin-table-subtext">{item.description}</div>}
                      </TableCell>
                      <TableCell>{formatPrice(item.priceMinor, item.currency)}</TableCell>
                      <TableCell>
                        <Badge tone={item.isAvailable ? "success" : "neutral"}>
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="admin-row-actions">
                          <form
                            action={toggleItemAvailabilityAction.bind(null, item.id, category.id, businessId, item.isAvailable)}
                            className="admin-inline-form"
                          >
                            <Button type="submit" variant="ghost" size="sm">
                              {item.isAvailable ? "Mark unavailable" : "Mark available"}
                            </Button>
                          </form>
                          <DeleteButton
                            action={deleteItemAction.bind(null, item.id, category.id, businessId)}
                            confirmMessage={`Delete "${item.name}"?`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="ui-card-body">
              <AddItemForm categoryId={category.id} businessId={businessId} />
            </div>
          </Card>
        );
      })}

      <AddCategoryForm businessId={businessId} />
    </>
  );
}
