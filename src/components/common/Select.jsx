const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  placeholder = "Select an option",
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border ${
          error
            ? "border-red-300 dark:border-red-600"
            : "border-gray-300 dark:border-gray-600"
        } rounded-lg focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Select;
