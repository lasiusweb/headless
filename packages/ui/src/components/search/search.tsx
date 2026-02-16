import * as React from "react";
import { Search as SearchIcon, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Input } from "../input";

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  loading?: boolean;
  className?: string;
}

const Search = React.forwardRef<
  HTMLInputElement,
  SearchProps
>(({ 
  onSearch, 
  onClear, 
  loading = false, 
  className, 
  value, 
  onChange, 
  ...props 
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(value || "");

  React.useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(e);
    onSearch?.(newValue);
  };

  const handleClear = () => {
    setInternalValue("");
    onChange?.({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
    onClear?.();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <Input
        ref={ref}
        type="search"
        placeholder="Search products..."
        value={internalValue}
        onChange={handleChange}
        className="pl-10 pr-10"
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

Search.displayName = "Search";

export { Search };