# Configuration Table - Quick Reference

## New Unified Table Structure

### Column Layout

```
┌──────────┬─────────────┬─────────┬──────────────────┬───────────────────┬─────┬────────────┬────────┐
│   Make   │ Order Code  │ Wattage │     Driver       │   Accessories     │ Qty │   Total    │ Action │
├──────────┼─────────────┼─────────┼──────────────────┼───────────────────┼─────┼────────────┼────────┤
│ Philips  │ DN060B      │  6W     │  Philips         │  [XZT] [ABC]      │  10 │ ₹12,500.00 │   🗑️   │
│          │             │         │  HV9910          │                   │     │            │        │
├──────────┼─────────────┼─────────┼──────────────────┼───────────────────┼─────┼────────────┼────────┤
│ Osram    │ DL-SLIM-9   │  9W     │  No driver       │  No accessories   │  25 │ ₹45,000.00 │   🗑️   │
├──────────┼─────────────┼─────────┼──────────────────┼───────────────────┼─────┼────────────┼────────┤
│ Havells  │ LED-12W     │ 12W     │  Mean Well       │  [MOUNT] [CONN]   │  15 │ ₹67,800.00 │   🗑️   │
│          │             │         │  LPF-25D         │  [CABLE]          │     │            │        │
└──────────┴─────────────┴─────────┴──────────────────┴───────────────────┴─────┴────────────┴────────┘
```

## Column Descriptions

### 1. **Make** (Product Manufacturer)
- **Data Source**: `row.product_detail.make`
- **Display**: Plain text
- **Fallback**: "-" if missing

### 2. **Order Code** (Product Code)
- **Data Source**: `row.product_detail.order_code`
- **Display**: **Bold** text (primary identifier)
- **Fallback**: "-" if missing

### 3. **Wattage** (Power Consumption)
- **Data Source**: `row.product_detail.wattage`
- **Display**: Number with "W" suffix (e.g., "12 W")
- **Fallback**: "-" if missing

### 4. **Driver** (Power Driver Details)
- **Data Source**: `row.driverData`
- **Display**: 
  ```
  Make (bold)
  Order Code (muted)
  ```
- **Fallback**: "No driver" (muted text)
- **Example**:
  ```
  Philips
  HV9910
  ```

### 5. **Accessories** (Additional Components)
- **Data Source**: `row.accessoriesData[]`
- **Display**: Compact tags in flex layout
- **Fallback**: "No accessories" (muted text)
- **Example**: `[XZT] [ABC] [MOUNT]`
- **Supports**: Multiple accessories per product

### 6. **Qty** (Quantity)
- **Data Source**: `row.quantity`
- **Display**: Editable number input
- **Input Properties**:
  - Minimum: 1
  - Width: 70px
  - Center aligned
  - Disabled when BOQ approved
- **On Change**: Triggers `onUpdateQty(id, newQty)`

### 7. **Total** (Line Total Price)
- **Calculation**: 
  ```
  (Product Price + Driver Price + Σ Accessory Prices) × Quantity
  ```
- **Display**: 
  - **Bold** text in dark color
  - Indian Rupee format: `₹12,345.67`
  - 2 decimal places
  - Thousand separators
- **Example**: `₹1,234,567.89`

### 8. **Action** (Delete Button)
- **Display**: Trash icon button
- **On Click**: Triggers `onDelete(id)`
- **Disabled**: When BOQ approved

## Total Calculation Examples

### Example 1: Product Only
```
Product:     ₹1,000.00
Driver:      ₹0.00      (no driver)
Accessories: ₹0.00      (no accessories)
Quantity:    10
──────────────────────
Total:       ₹10,000.00
```

### Example 2: Product + Driver
```
Product:     ₹1,500.00
Driver:      ₹500.00
Accessories: ₹0.00      (no accessories)
Quantity:    25
──────────────────────
Total:       ₹50,000.00
```

### Example 3: Product + Driver + Accessories
```
Product:     ₹2,000.00
Driver:      ₹600.00
Accessories: ₹200.00    (₹100 + ₹50 + ₹50)
Quantity:    15
──────────────────────
Total:       ₹42,000.00
```

## Summary Statistics

Displayed in header when configurations exist:

```
┌─────────────────────────────────────────────────┐
│  Products: 25 | Total: ₹1,234,567.89            │
└─────────────────────────────────────────────────┘
```

**Calculation**:
- **Products**: Count of all configuration rows
- **Total**: Sum of all row totals

## Visual States

### Normal State
- White background
- All inputs enabled
- Delete button enabled
- Quantity editable

### Locked State (BOQ Approved)
- Light gray background for inputs
- All inputs disabled
- Delete button disabled
- Pointer cursor shows "not-allowed"
- Banner shows: "🔒 This BOQ version is locked"

### Empty State
- No table shown
- Card with message: "⚡ No configuration yet"
- "Add Product" button prominent
- Centered layout

## Responsive Behavior

### Desktop (> 1024px)
- Full table with all columns
- Comfortable spacing
- Large buttons

### Tablet (768px - 1024px)
- Slightly condensed columns
- Maintained readability
- Buttons remain visible

### Mobile (< 768px)
- Consider card layout instead of table
- Stack information vertically
- Large touch targets

## Accessibility

### Keyboard Navigation
- ✅ Tab through quantity inputs
- ✅ Tab to delete buttons
- ✅ Enter to confirm quantity change

### Screen Readers
- ✅ Proper column headers
- ✅ Row identifiers (product order code)
- ✅ Button labels
- ✅ Input labels

### Visual Indicators
- ✅ Clear disabled state
- ✅ High contrast text
- ✅ Large click targets (48px buttons)

## Performance Considerations

### Optimization Techniques
1. **useMemo** for expensive calculations
2. **Debounced quantity updates** (consider adding)
3. **Virtual scrolling** for 100+ rows (future)
4. **Pagination** for very large datasets (future)

### Current Limits
- Comfortable: Up to 50 configurations
- Acceptable: Up to 200 configurations
- Consider pagination: Beyond 200 configurations

## Data Flow Diagram

```
User Action
    ↓
┌──────────────────┐
│ Quantity Change  │ → onUpdateQty(id, qty)
└──────────────────┘       ↓
                      API PATCH /configurations/{id}/
                           ↓
                      loadProjectConfigurations()
                           ↓
                      configMapper()
                           ↓
                      Table Re-renders
                           ↓
                      ✅ New Total Displayed
```

## Integration Points

### Parent Components
- `ProjectWorkspace.tsx` (PROJECT_LEVEL and AREA_WISE)
- `UnifiedConfigurationTab.tsx` (wrapper)

### Props Required
```typescript
{
  data: Configuration[];           // Mapped configurations
  loadConfigurations: () => void; // Refresh function
  isLocked?: boolean;             // BOQ approval status
}
```

### Callbacks
```typescript
onUpdateQty(id: number, qty: number): Promise<void>
onDelete(id: number): Promise<void>
```

---

**Quick Tip**: To add a new column, insert it in the `productColumns` array and the table will automatically render it! 🚀
