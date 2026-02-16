# KN Biosciences UI Library - Component Summary

This document provides a comprehensive summary of all components in the @kn/ui library.

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
- **Sidebar**: Navigation sidebar for admin panels

## Dialog Components

### Forms in Dialogs
- **DialogForm**: Form wrapped in a dialog component for modal forms

## Usage Examples

### Basic Form Example
```jsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@kn/ui';

function MyForm() {
  const form = useForm();
  
  return (
    <Form {...form}>
      <FormField
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Enter your email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
```

### Dashboard Layout Example
```jsx
import { DashboardLayout } from '@kn/ui';

function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <div>Your dashboard content goes here</div>
    </DashboardLayout>
  );
}
```

### Data Table Example
```jsx
import { DataTable } from '@kn/ui';

function ProductTable({ products }) {
  const columns = [
    {
      accessorKey: 'name',
      header: 'Product Name',
    },
    {
      accessorKey: 'price',
      header: 'Price',
    },
  ];
  
  return <DataTable columns={columns} data={products} />;
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