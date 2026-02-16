# KN Biosciences UI Library - Extended Component Summary

This document provides a comprehensive summary of all components in the @kn/ui library, including recently added components.

## Core Components

### Basic Elements
- **Button**: Customizable button component with multiple variants
- **Input**: Form input component with validation support
- **Textarea**: Multi-line text input component
- **Checkbox**: Form checkbox component
- **Badge**: Status indicators and labels
- **Skeleton**: Loading skeletons for content
- **Label**: Accessible form labels

### Layout Components
- **Card**: Content grouping component with header, footer, and content sections
- **Table**: Data table with sorting and pagination support
- **DataTable**: Advanced data table with filtering, sorting, and column visibility

### Navigation Components
- **Dropdown Menu**: Dropdown menu with customizable positioning
- **Sheet**: Side panel component for mobile navigation
- **Dialog**: Modal dialog component

## Form Components

### Form System
- **Form**: Wrapper component for react-hook-form integration
- **FormField**: Form field wrapper for react-hook-form
- **FormItem**: Form item container
- **FormLabel**: Form label component
- **FormControl**: Form control wrapper
- **FormDescription**: Form description text
- **FormMessage**: Form error message
- **FormField**: Form field wrapper
- **FormSelect**: Form-integrated select component

### Form Controls
- **Select**: Custom select dropdown component with all sub-components
- **Calendar**: Date picker component

## Notification Components

### Toast Notifications
- **Toast**: Standard notification component
- **ToastProvider**: Toast provider component
- **MotionToast**: Animated toast component with smooth transitions
- **MotionToastProvider**: Motion toast provider component

## Data Visualization

### Charts
- **Chart**: Flexible chart component supporting bar, line, and pie charts
- **ChartData**: Type definition for chart data

## Layout Components

### Dashboard
- **DashboardLayout**: Complete dashboard layout with sidebar and header

## Dialog Components

### Forms in Dialogs
- **DialogForm**: Form wrapped in a dialog component for modal forms

## Media Components

### File Upload
- **FileUpload**: Drag-and-drop file upload component with validation

## Product Components

### Product Display
- **ProductCard**: Product display card with pricing, ratings, and actions
- **ProductGallery**: Product image gallery with thumbnail navigation and fullscreen view

### Product Filtering
- **ProductFilter**: Filter sidebar with collapsible sections for product filtering

## Cart Components

### Shopping Cart
- **CartDrawer**: Slide-out cart drawer with item management

## Navigation Components

### Store Navigation
- **NavigationHeader**: Complete storefront header with search, cart, and user actions

## Search Components

### Search Interface
- **Search**: Search input with clear functionality

## Usage Examples

### Product Card Example
```jsx
import { ProductCard } from '@kn/ui';

function ProductListing({ product }) {
  return (
    <ProductCard
      id={product.id}
      name={product.name}
      description={product.description}
      price={product.price}
      mrp={product.mrp}
      image={product.image}
      isInStock={product.inStock}
      onAddToCart={() => addToCart(product)}
      onToggleFavorite={() => toggleFavorite(product.id)}
      role="customer" // 'customer', 'dealer', or 'distributor'
    />
  );
}
```

### Cart Drawer Example
```jsx
import { CartDrawer } from '@kn/ui';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  
  return (
    <>
      <button onClick={() => setIsCartOpen(true)}>Open Cart</button>
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={(id) => setCartItems(items => items.filter(i => i.id !== id))}
        onUpdateQuantity={(id, qty) => {
          setCartItems(items => 
            items.map(i => i.id === id ? {...i, quantity: qty} : i)
          );
        }}
        onCheckout={() => {
          // Handle checkout
          setIsCartOpen(false);
        }}
        subtotal={calculateSubtotal(cartItems)}
        total={calculateTotal(cartItems)}
      />
    </>
  );
}
```

### Product Filter Example
```jsx
import { ProductFilter } from '@kn/ui';

function ProductPage() {
  const [activeFilters, setActiveFilters] = useState({});
  
  const filterSections = [
    {
      id: 'category',
      title: 'Category',
      type: 'checkbox',
      options: [
        { id: 'fertilizers', label: 'Fertilizers', count: 12 },
        { id: 'pesticides', label: 'Pesticides', count: 8 },
        { id: 'seeds', label: 'Seeds', count: 15 },
      ]
    },
    {
      id: 'price',
      title: 'Price Range',
      type: 'checkbox',
      options: [
        { id: 'under-500', label: 'Under ₹500', count: 20 },
        { id: '500-1000', label: '₹500 - ₹1000', count: 15 },
        { id: 'over-1000', label: 'Over ₹1000', count: 8 },
      ]
    }
  ];
  
  const handleFilterChange = (sectionId, optionId, checked) => {
    setActiveFilters(prev => {
      const current = prev[sectionId] || [];
      let newSelections;
      
      if (checked) {
        newSelections = [...current, optionId];
      } else {
        newSelections = current.filter(id => id !== optionId);
      }
      
      return {
        ...prev,
        [sectionId]: newSelections
      };
    });
  };
  
  return (
    <ProductFilter
      sections={filterSections}
      activeFilters={activeFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={() => setActiveFilters({})}
    />
  );
}
```

## Theming

The components are styled using Tailwind CSS with CSS variables for consistent theming. You can customize the theme by modifying the CSS variables in your globals.css file.

## Accessibility

All components follow accessibility best practices:
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Focus management

## Responsive Design

All components are designed to be responsive and work well on different screen sizes.