import PhoneInputWithCountry from "react-phone-number-input";
import "react-phone-number-input/style.css";

const PhoneInput = ({ value, onChange, label, error, required, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        className={`phone-input-container flex items-center px-4 py-2 border ${
          error
            ? "border-red-300 dark:border-red-600"
            : "border-gray-300 dark:border-gray-600"
        } rounded-lg focus-within:ring-2 focus-within:ring-sky-500 dark:focus-within:ring-sky-400 focus-within:border-transparent transition-all bg-white dark:bg-gray-700`}
      >
        <PhoneInputWithCountry
          international
          defaultCountry="IN"
          value={value}
          onChange={onChange}
          className="w-full"
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
