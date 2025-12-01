import React from "react";
import Select from "react-select";
import { Controller } from "react-hook-form";

const ReactSelect = ({
  label,
  name,
  control,
  options = [],
  error,
  placeholder = "Select an option",
  isSearchable = true,
  isClearable = false,
  className = "",
  ...props
}) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: error ? "#fca5a5" : state.isFocused ? "#10b981" : "#d1d5db",
      backgroundColor: "#ffffff",
      boxShadow: state.isFocused
        ? error
          ? "0 0 0 1px #fca5a5"
          : "0 0 0 2px #10b981"
        : "none",
      "&:hover": {
        borderColor: error ? "#fca5a5" : "#10b981",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#10b981"
        : state.isFocused
        ? "#d1fae5"
        : "#ffffff",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#10b981" : "#d1fae5",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#ffffff",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#374151",
    }),
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            options={options}
            placeholder={placeholder}
            isSearchable={isSearchable}
            isClearable={isClearable}
            styles={customStyles}
            classNamePrefix="react-select"
            {...props}
          />
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default ReactSelect;
