# Motion Toast Component

A beautiful, animated toast notification component for the KN Biosciences platform with smooth entrance and exit animations.

## Features

- Smooth entrance and exit animations using Framer Motion
- Configurable duration for automatic dismissal
- Two variants: default and destructive
- Clean, modern design that fits the KN Biosciences brand
- Easy to use with a provider pattern
- Fully accessible

## Installation

The Motion Toast component is part of the `@kn/ui` package. If you haven't installed it yet:

```bash
pnpm install @kn/ui framer-motion
```

## Usage

### Basic Usage

```jsx
import { MotionToast, MotionToastProvider } from '@kn/ui';

const App = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = () => {
    const newToast = {
      id: Date.now().toString(),
      title: 'Success!',
      description: 'Your action was completed successfully.'
    };
    
    setToasts(prev => [...prev, newToast]);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div>
      <button onClick={showToast}>Show Toast</button>
      
      <MotionToastProvider>
        {toasts.map((toast) => (
          <MotionToast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            onDismiss={dismissToast}
          />
        ))}
      </MotionToastProvider>
    </div>
  );
};
```

### With Variants

```jsx
<MotionToast
  id="unique-id"
  title="Error Occurred"
  description="There was an issue processing your request."
  variant="destructive"
  onDismiss={dismissToast}
/>
```

## Props

### MotionToast

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | `string` | required | Unique identifier for the toast |
| title | `string` | optional | Title of the toast notification |
| description | `string` | optional | Description text of the toast notification |
| variant | `"default" \| "destructive"` | `"default"` | Style variant of the toast |
| duration | `number` | `5000` | Duration in ms before auto-dismissal (0 to disable) |
| onDismiss | `(id: string) => void` | optional | Callback when toast is dismissed |
| className | `string` | optional | Additional CSS classes |

### MotionToastProvider

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | required | Toast components to be displayed |

## Styling

The component uses Tailwind CSS for styling and can be customized by:

1. Passing additional classes via the `className` prop
2. Overriding default styles in your Tailwind configuration
3. Using the CSS variable approach for theming

## Accessibility

- Toasts are announced by screen readers
- Keyboard accessible (tabbable elements)
- Proper ARIA attributes
- Auto-dismissal respects user preferences
- Dismissible via close button

## Animation

The toast uses Framer Motion for smooth animations:
- Entrance: Slide up with fade-in and slight scale
- Exit: Slide right with fade-out and scale down
- Physics-based spring animation for natural movement