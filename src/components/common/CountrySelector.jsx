import { useState, useEffect } from "react";
import Select from "./Select";

const CountrySelector = ({ value, onChange, label, error, ...props }) => {
  const [countryOptions, setCountryOptions] = useState([]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        // Dynamic import for world-countries
        const countriesModule = await import("world-countries");

        // Handle different export formats
        let countries = [];
        if (Array.isArray(countriesModule.default)) {
          countries = countriesModule.default;
        } else if (Array.isArray(countriesModule)) {
          countries = countriesModule;
        } else if (countriesModule.countries) {
          countries = countriesModule.countries;
        }

        const options = countries.map((country) => ({
          value: country.cca2 || country.code || country.iso2 || "",
          label: country.name?.common || country.name || country.label || "",
        }));

        setCountryOptions(options);
      } catch (error) {
        console.error("Error loading countries:", error);
        // Fallback countries
        setCountryOptions([
          { value: "US", label: "United States" },
          { value: "IN", label: "India" },
          { value: "GB", label: "United Kingdom" },
          { value: "CA", label: "Canada" },
          { value: "AU", label: "Australia" },
          { value: "DE", label: "Germany" },
          { value: "FR", label: "France" },
          { value: "JP", label: "Japan" },
          { value: "CN", label: "China" },
          { value: "BR", label: "Brazil" },
        ]);
      }
    };

    loadCountries();
  }, []);

  return (
    <Select
      label={label}
      value={value}
      onChange={onChange}
      options={countryOptions}
      placeholder="Select a country"
      error={error}
      {...props}
    />
  );
};

export default CountrySelector;
