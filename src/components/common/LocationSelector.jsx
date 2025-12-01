import { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import SelectDropdown from "./Select";

const LocationSelector = ({
  countryValue,
  stateValue,
  cityValue,
  onCountryChange,
  onStateChange,
  onCityChange,
  countryError,
  stateError,
  cityError,
}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    // Load countries
    const countryList = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));
    setCountries(countryList);
  }, []);

  useEffect(() => {
    // Load states when country changes
    if (countryValue) {
      const stateList = State.getStatesOfCountry(countryValue).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));
      setStates(stateList);
      // Reset state and city when country changes
      if (onStateChange) onStateChange({ target: { value: "" } });
      if (onCityChange) onCityChange({ target: { value: "" } });
    } else {
      setStates([]);
      setCities([]);
    }
  }, [countryValue]);

  useEffect(() => {
    // Load cities when state changes
    if (countryValue && stateValue) {
      const cityList = City.getCitiesOfState(countryValue, stateValue).map(
        (city) => ({
          value: city.name,
          label: city.name,
        })
      );
      setCities(cityList);
      // Reset city when state changes
      if (onCityChange) onCityChange({ target: { value: "" } });
    } else {
      setCities([]);
    }
  }, [countryValue, stateValue]);

  return (
    <>
      <SelectDropdown
        label="Country"
        value={countryValue}
        onChange={onCountryChange}
        options={countries}
        placeholder="Select country"
        error={countryError}
      />
      <SelectDropdown
        label="State"
        value={stateValue}
        onChange={onStateChange}
        options={states}
        placeholder={
          states.length > 0 ? "Select state" : "Select country first"
        }
        error={stateError}
        disabled={!countryValue || states.length === 0}
      />
      <SelectDropdown
        label="City"
        value={cityValue}
        onChange={onCityChange}
        options={cities}
        placeholder={cities.length > 0 ? "Select city" : "Select state first"}
        error={cityError}
        disabled={!stateValue || cities.length === 0}
      />
    </>
  );
};

export default LocationSelector;
