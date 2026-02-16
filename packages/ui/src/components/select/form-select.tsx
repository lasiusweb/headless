import * as React from "react";
import { Controller } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface FormSelectProps {
  name: string;
  control: any; // Should be ControllerProps["control"] but keeping generic for compatibility
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: string;
  className?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  name,
  control,
  options,
  placeholder,
  label,
  className,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={className}>
          {label && (
            <label className="block text-sm font-medium mb-1">
              {label}
            </label>
          )}
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
};

export { FormSelect };