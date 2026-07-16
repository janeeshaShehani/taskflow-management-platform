"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function AppSelect({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
  className = "",
}: AppSelectProps) {
  return (
    <Select
      value={value || "__ALL__"}
     onValueChange={(selectedValue) => {
        const value =
            selectedValue == null
            ? ""
            : selectedValue === "__ALL__"
                ? ""
                : selectedValue;

        onChange(value);
     }}
      disabled={disabled}
    >
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="__ALL__">
          {placeholder}
        </SelectItem>

        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}