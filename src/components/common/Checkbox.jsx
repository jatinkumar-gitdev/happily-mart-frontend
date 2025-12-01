const Checkbox = ({
  label,
  name,
  checked,
  onChange,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      <label className="flex items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className={`w-4 h-4 text-sky-600 dark:text-sky-400 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-sky-500 dark:focus:ring-sky-400 bg-white dark:bg-gray-700 ${className}`}
          {...props}
        />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Checkbox;
