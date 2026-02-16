# Lookup Control Components

This document describes the reusable Lookup control components implemented for the ApartmentRentalMobile project.

## Overview

The Lookup control provides a user-friendly way to select records from a list with search functionality. It consists of two main components:

1. **ListView** - A reusable list component with search functionality
2. **LookupInput** - A lookup field with modal popup for record selection

## Components

### ListView

A reusable component for displaying a searchable list of items.

#### Props

- `data: T[]` - Array of items to display (must have an `id` field)
- `onSelectItem: (item: T) => void` - Callback when an item is selected
- `displayField: keyof T | ((item: T) => string)` - Field to display as primary text, or function to generate display text
- `secondaryField?: keyof T | ((item: T) => string)` - Optional field to display as secondary text
- `searchable?: boolean` - Enable/disable search functionality (default: true)
- `searchPlaceholder?: string` - Placeholder text for search input (default: "Search...")
- `emptyMessage?: string` - Message to display when no items found (default: "No items found")
- `containerStyle?: ViewStyle` - Optional container style

#### Example Usage

```typescript
import { ListView } from '../../components/ui';

const buildings = [
  { id: '1', name: 'Building A', address: '123 Main St' },
  { id: '2', name: 'Building B', address: '456 Oak Ave' },
];

<ListView
  data={buildings}
  onSelectItem={(building) => console.log(building)}
  displayField="name"
  secondaryField="address"
  searchPlaceholder="Search buildings..."
/>
```

### LookupInput

A lookup input field with icon button that opens a modal containing a ListView for record selection.

#### Props

- `label?: string` - Label for the input field
- `placeholder?: string` - Placeholder text when no value selected
- `value?: T` - Currently selected item
- `data: T[]` - Array of items available for selection
- `onSelect: (item: T | undefined) => void` - Callback when an item is selected or cleared
- `displayField: keyof T | ((item: T) => string)` - Field to display in input and list
- `secondaryField?: keyof T | ((item: T) => string)` - Optional secondary field in list
- `searchPlaceholder?: string` - Placeholder for search in modal
- `emptyMessage?: string` - Message when no items available
- `error?: string` - Error message to display
- `containerStyle?: ViewStyle` - Optional container style
- `inputStyle?: ViewStyle` - Optional input style
- `disabled?: boolean` - Disable the input field

#### Features

- **Lookup Icon Button** (🔍) - Opens modal with searchable list
- **Clear Button** (✕) - Appears when a value is selected, clears the selection
- **Modal Popup** - Full-screen modal with ListView for selection
- **Search Functionality** - Built-in search within the modal
- **Disabled State** - Can be disabled to prevent changes (useful in edit mode)

#### Example Usage

```typescript
import { LookupInput } from '../../components/ui';
import type { Database } from '../../types/database.types';

type Building = Database['public']['Tables']['buildings']['Row'];

const [selectedBuilding, setSelectedBuilding] = useState<Building | undefined>();
const [buildings, setBuildings] = useState<Building[]>([]);

<LookupInput
  label="Building *"
  placeholder="Select a building"
  value={selectedBuilding}
  data={buildings}
  onSelect={(building) => setSelectedBuilding(building)}
  displayField="name"
  secondaryField={(building) => `${building.address}, ${building.city}`}
  searchPlaceholder="Search buildings..."
  emptyMessage="No buildings found. Please create a building first."
  error={validationError}
/>
```

## One-to-Many Relationship Implementation

The Lookup control is designed to handle one-to-many relationships. In the ApartmentRentalMobile project, it's used to manage the relationship between Buildings and Rooms:

- **One Building** can have **Many Rooms**
- When creating/editing a Room, the LookupInput allows selecting the parent Building
- The Building selection is disabled in edit mode to prevent changing the building association

### Implementation in AddEditRoomScreen

The AddEditRoomScreen demonstrates the one-to-many relationship:

```typescript
// State management
const [selectedBuilding, setSelectedBuilding] = useState<Building | undefined>();
const [buildings, setBuildings] = useState<Building[]>([]);

// Load buildings from database
const loadBuildings = async (clientIdParam: string) => {
  const { data } = await DatabaseService.getBuildings(clientIdParam);
  if (data) {
    setBuildings(data);
    // Pre-select building if passed from navigation
    if (buildingId && !isEdit) {
      const building = data.find(b => b.id === buildingId);
      if (building) {
        setSelectedBuilding(building);
      }
    }
  }
};

// Use LookupInput in the form
<LookupInput
  label="Building *"
  value={selectedBuilding}
  data={buildings}
  onSelect={setSelectedBuilding}
  displayField="name"
  secondaryField={(building) => `${building.address}, ${building.city}`}
  disabled={isEdit} // Prevent changing building in edit mode
/>
```

## Design Benefits

### Reusability
Both components are generic and can be used with any data type that has an `id` field:
- Buildings
- Rooms
- Users
- Clients
- Any custom entity

### Type Safety
Components use TypeScript generics to ensure type safety:
```typescript
export function ListView<T extends ListViewItem>({ ... })
export function LookupInput<T extends ListViewItem>({ ... })
```

### Flexibility
- Supports both field names and custom functions for display
- Searchable or non-searchable lists
- Customizable styling
- Optional secondary information display

### User Experience
- Intuitive lookup icon button
- Full-screen modal for better visibility
- Built-in search for large lists
- Clear button for easy value removal
- Error message support for validation

## Future Enhancements

Possible future improvements:
- Multi-select support
- Pagination for large datasets
- Custom item renderers
- Sorting options
- Recent selections history
- Loading states during data fetch
