# shadcn/ui Setup for KN Biosciences

This package contains the UI components for the KN Biosciences e-commerce platform, built using the shadcn/ui framework.

## Getting Started

### Installation

To install the UI components:

```bash
pnpm install @kn/ui
```

### Setup

The UI library is already configured with:

- Tailwind CSS with custom configuration
- CSS variables for consistent theming
- Utility functions for class name manipulation
- Pre-built components with accessibility in mind

## Components

This library includes the following components:

- **Button**: Customizable button component
- **Card**: Content grouping component with header, footer, and content sections
- **Input**: Form input component with validation support
- **Textarea**: Multi-line text input component
- **Select**: Custom select dropdown component
- **Checkbox**: Form checkbox component
- **Dialog**: Modal dialog component
- **Dropdown Menu**: Dropdown menu with customizable positioning
- **Table**: Data table with sorting and pagination support
- **Badge**: Status indicators and labels
- **Skeleton**: Loading skeletons for content
- **Toast**: Notification component with auto-dismiss
- **Motion Toast**: Animated toast component with smooth transitions

## Usage

To use the components, import them from the package:

```jsx
import { Button, Card, Input } from '@kn/ui';

function MyComponent() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Login</Card.Title>
      </Card.Header>
      <Card.Content>
        <Input placeholder="Email" />
        <Input type="password" placeholder="Password" />
      </Card.Content>
      <Card.Footer>
        <Button>Login</Button>
      </Card.Footer>
    </Card>
  );
}
```

## Styling

The components are styled using Tailwind CSS with the following features:

- CSS variables for consistent theming
- Dark mode support
- Responsive design
- Accessible color contrast
- Consistent spacing and typography

## Theming

The theme is controlled through CSS variables defined in the `globals.css` file. You can customize the theme by modifying these variables:

```css
:root {
  --background: 0 0% 100%; /* Background color */
  --foreground: 222.2 84% 4.9%; /* Foreground/text color */
  --primary: 222.2 47.4% 11.2%; /* Primary color */
  --secondary: 210 40% 96.1%; /* Secondary color */
  --accent: 210 40% 96.1%; /* Accent color */
  --destructive: 0 84.2% 60.2%; /* Destructive/error color */
  --border: 214.3 31.8% 91.4%; /* Border color */
  --radius: 0.5rem; /* Border radius */
}
```

## Adding New Components

To add new components, follow the shadcn/ui patterns:

1. Create the component file in the `src/components` directory
2. Use the `cn()` utility function for class name manipulation
3. Follow the existing component patterns for consistency
4. Export the component from the main `index.ts` file

## Contributing

When contributing new components or modifications:

1. Follow the existing code style and patterns
2. Ensure components are accessible
3. Add proper TypeScript types
4. Include necessary documentation
5. Test components in different contexts

## Dependencies

- `react`: React library
- `react-dom`: React DOM bindings
- `clsx`: Conditional class name utility
- `tailwind-merge`: Tailwind CSS class merging
- `lucide-react`: Icon library
- `framer-motion`: Animation library
- `tailwindcss-animate`: Tailwind CSS animations