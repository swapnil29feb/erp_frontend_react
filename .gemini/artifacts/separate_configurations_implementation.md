# Configuration Loading Refactoring - Separate Endpoints

## Implementation Summary

Successfully implemented separate configuration loading for Products, Drivers, and Accessories using dedicated backend endpoints.

## Changes Made

### STEP 2: Added Separate State Variables

**File**: `src/pages/ProjectWorkspace.tsx`

Added three new state variables to track each configuration type independently:

```tsx
// STEP 2: Separate states for each configuration type
const [productConfigs, setProductConfigs] = useState<any[]>([]);
const [driverConfigs, setDriverConfigs] = useState<any[]>([]);
const [accessoryConfigs, setAccessoryConfigs] = useState<any[]>([]);
```

**Purpose**: 
- Allows separate tracking of products, drivers, and accessories
- Enables independent rendering and manipulation
- Supports future features like separate sections or filtering

### STEP 3: Added API Service Functions

**File**: `src/services/configService.ts`

Added three new API functions to the `configService`:

```typescript
getProductConfigurations: async (projectId: string | number, subareaId?: string | number) => {
    let url = `/configurations/products/?project=${projectId}`;
    if (subareaId) {
        url += `&subarea=${subareaId}`;
    }
    const res = await apiClient.get(url);
    return handleListResponse(res);
},

getDriverConfigurations: async (projectId: string | number, subareaId?: string | number) => {
    let url = `/configurations/drivers/?project=${projectId}`;
    if (subareaId) {
        url += `&subarea=${subareaId}`;
    }
    const res = await apiClient.get(url);
    return handleListResponse(res);
},

getAccessoryConfigurations: async (projectId: string | number, subareaId?: string | number) => {
    let url = `/configurations/accessories/?project=${projectId}`;
    if (subareaId) {
        url += `&subarea=${subareaId}`;
    }
    const res = await apiClient.get(url);
    return handleListResponse(res);
},
```

**API Endpoints**:
- `GET /configurations/products/?project={id}&subarea={id}`
- `GET /configurations/drivers/?project={id}&subarea={id}`
- `GET /configurations/accessories/?project={id}&subarea={id}`

**Features**:
- ✅ Support for PROJECT_LEVEL filtering (by project only)
- ✅ Support for AREA_WISE filtering (by project + subarea)
- ✅ Consistent response handling using `handleListResponse()`
- ✅ Type-safe parameters

### STEP 3: Unified Load Function

**File**: `src/pages/ProjectWorkspace.tsx`

Replaced the single-endpoint `loadProjectConfigurations` with a new `loadAllConfigurations` function:

```tsx
const loadAllConfigurations = async (
    projectId: number,
    subareaId?: number
) => {
    setLoadingConfig(true);
    try {
        const [prodRes, drvRes, accRes] = await Promise.all([
            configService.getProductConfigurations(projectId, subareaId),
            configService.getDriverConfigurations(projectId, subareaId),
            configService.getAccessoryConfigurations(projectId, subareaId),
        ]);

        setProductConfigs(prodRes);
        setDriverConfigs(drvRes);
        setAccessoryConfigs(accRes);

        // Also update the combined configurations for backward compatibility
        const combined = [...prodRes, ...drvRes, ...accRes];
        if (isProjectLevel) {
            setAllProjectConfigurations(combined);
        } else {
            setCurrentSubareaConfig(combined);
        }
    } catch (err) {
        console.error("Failed to load configurations", err);
    } finally {
        setLoadingConfig(false);
    }
};
```

**Implementation Details**:
- Uses `Promise.all()` for **parallel fetching** (faster performance)
- Sets separate states for each configuration type
- Maintains **backward compatibility** by combining all three into existing states
- Proper loading and error states

### Updated All References

Replaced all calls from:
```tsx
loadProjectConfigurations(project.id)
loadProjectConfigurations(project.id, selectedSubarea.id)
```

To:
```tsx
loadAllConfigurations(project.id)
loadAllConfigurations(project.id, selectedSubarea.id)
```

**Locations Updated**:
1. ✅ Initial project load useEffect
2. ✅ handleDeleteConfig callback
3. ✅ handleUpdateQty callback
4. ✅ SummaryTab onGenerateSuccess callback

## Architecture

### Before: Single Endpoint

```
┌─────────────────────────────────┐
│  GET /configurations/           │
│  ?project={id}&subarea={id}     │
└─────────────────────────────────┘
              ↓
    Returns mixed array:
    [product, driver, accessory, ...]
              ↓
    ┌──────────────────────┐
    │ setAllConfigurations │
    └──────────────────────┘
```

### After: Separate Endpoints

```
┌────────────────────────────────────────┐
│  Promise.all([                         │
│    GET /configurations/products/       │
│    GET /configurations/drivers/        │
│    GET /configurations/accessories/    │
│  ])                                    │
└────────────────────────────────────────┘
              ↓
    ┌─────────────────────────────┐
    │ prodRes, drvRes, accRes     │
    └─────────────────────────────┘
              ↓
    ┌─────────────────────────────┐
    │ setProductConfigs(prodRes)  │
    │ setDriverConfigs(drvRes)    │
    │ setAccessoryConfigs(accRes) │
    └─────────────────────────────┘
              ↓
    ┌─────────────────────────────┐
    │ combined = [...all]         │
    │ setAllConfigurations(...)   │
    └─────────────────────────────┘
```

## Benefits

### 1. **Parallel Loading**
- All three types load simultaneously
- Faster total load time
- Better user experience

### 2. **Granular Control**
- Can show/hide sections independently
- Individual loading states possible
- Separate error handling per type

### 3. **Backend Alignment**
- Matches backend architecture
- Uses proper dedicated endpoints
- Supports backend filtering logic

### 4. **Backward Compatibility**
- Maintains `allProjectConfigurations` state
- Existing display components work unchanged
- Gradual migration possible

### 5. **Future Extensibility**
- Easy to add separate sections
- Can implement type-specific features
- Supports advanced filtering

## Data Flow

### PROJECT_LEVEL Flow

```
User opens project
    ↓
loadAllConfigurations(projectId)
    ↓
Promise.all([
    GET /configurations/products/?project=123
    GET /configurations/drivers/?project=123
    GET /configurations/accessories/?project=123
])
    ↓
[prodRes, drvRes, accRes]
    ↓
setProductConfigs(10 products)
setDriverConfigs(5 drivers)
setAccessoryConfigs(8 accessories)
    ↓
combined = [23 total configurations]
    ↓
Display in UnifiedConfigurationTab
```

### AREA_WISE Flow

```
User selects subarea #456
    ↓
loadAllConfigurations(projectId, 456)
    ↓
Promise.all([
    GET /configurations/products/?project=123&subarea=456
    GET /configurations/drivers/?project=123&subarea=456
    GET /configurations/accessories/?project=123&subarea=456
])
    ↓
[prodRes, drvRes, accRes]
    ↓
setProductConfigs(3 products)
setDriverConfigs(2 drivers)
setAccessoryConfigs(1 accessory)
    ↓
combined = [6 total configurations for this subarea]
    ↓
Display in UnifiedConfigurationTab
```

## Next Steps (Optional)

### Immediate Use Cases

1. **Separate Display Sections**
   ```tsx
   <ProductSection data={productConfigs} />
   <DriverSection data={driverConfigs} />
   <AccessorySection data={accessoryConfigs} />
   ```

2. **Type-Specific Summaries**
   ```tsx
   <Stats>
     Products: {productConfigs.length}
     Drivers: {driverConfigs.length}
     Accessories: {accessoryConfigs.length}
   </Stats>
   ```

3. **Independent Loading States**
   ```tsx
   {loadingProducts && <Spinner />}
   {loadingDrivers && <Spinner />}
   {loadingAccessories && <Spinner />}
   ```

### Future Enhancements

1. **Separate Add/Edit Flows**
   - Dedicated forms for each type
   - Type-specific validation
   - Custom field layouts

2. **Advanced Filtering**
   - Filter products by wattage
   - Filter drivers by dimming protocol
   - Filter accessories by category

3. **Bulk Operations**
   - Select all products
   - Bulk update drivers
   - Export accessories only

4. **Performance Optimization**
   - Cache by type
   - Lazy load accessories
   - Paginate large product lists

## Current Status

✅ **STEP 2**: Separate states added  
✅ **STEP 3**: API functions created  
✅ **STEP 3**: Unified load function implemented  
✅ **All references updated**  
✅ **Backward compatibility maintained**  

⚠️ **Note**: The separate states are currently populated but not yet used independently in the UI. The combined array is still being used for display. This allows for gradual migration to type-specific rendering when needed.

## Testing Checklist

### API Integration
- [ ] Product endpoint returns correct data
- [ ] Driver endpoint returns correct data
- [ ] Accessory endpoint returns correct data
- [ ] PROJECT_LEVEL filtering works
- [ ] AREA_WISE filtering works
- [ ] Empty responses handled gracefully

### State Management
- [ ] productConfigs updates correctly
- [ ] driverConfigs updates correctly
- [ ] accessoryConfigs updates correctly
- [ ] Combined state updates correctly
- [ ] Loading states work properly

### User Flow
- [ ] Products load on project open
- [ ] Drivers load on project open
- [ ] Accessories load on project open
- [ ] Subarea selection filters all types
- [ ] Delete refreshes all types
- [ ] Quantity update refreshes all types

---

**Implementation Date**: February 16, 2026  
**Status**: ✅ Complete  
**Backend Dependency**: Requires `/configurations/products/`, `/configurations/drivers/`, `/configurations/accessories/` endpoints
