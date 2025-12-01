import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import SignupStepper from "../../components/auth/SignupStepper";
import OTPVerification from "../../components/auth/OTPVerification";
import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import SelectDropdown from "../../components/common/Select";
import Checkbox from "../../components/common/Checkbox";
import LocationSelector from "../../components/common/LocationSelector";
import Button from "../../components/common/Button";
import PhoneInput from "../../components/common/PhoneInput";
import ReCaptcha from "../../components/common/ReCaptcha";
import { showError, showSuccess } from "../../utils/toast";
import {
  signupUserDetailsSchema,
  signupAddressSchema,
  signupDigitalLinksSchema,
} from "../../validators/authSchema";
import { authService } from "../../services/auth.service";
import { SIGNUP_STEPS, STEP_LABELS } from "../../utils/constants";
import {
  DESIGNATION_OPTIONS,
  SECTOR_OPTIONS,
  SUB_SECTOR_OPTIONS,
  COMMODITIES_OPTIONS,
  COMPANY_TYPE_OPTIONS,
} from "../../utils/dropdownOptions";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiLink,
  FiLock,
} from "react-icons/fi";
import { HiOutlineLightningBolt } from "react-icons/hi";

const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(SIGNUP_STEPS.USER_DETAILS);
  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState("");
  const [showCustomDesignation, setShowCustomDesignation] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef(null);

  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const steps = [
    { step: SIGNUP_STEPS.USER_DETAILS, label: STEP_LABELS[1] },
    { step: SIGNUP_STEPS.ADDRESS_DETAILS, label: STEP_LABELS[2] },
    { step: SIGNUP_STEPS.DIGITAL_LINKS, label: STEP_LABELS[3] },
    { step: SIGNUP_STEPS.TERMS, label: STEP_LABELS[4] },
    { step: SIGNUP_STEPS.OTP_VERIFICATION, label: STEP_LABELS[5] },
    { step: SIGNUP_STEPS.COMPLETE, label: STEP_LABELS[6] },
  ];

  const userDetailsForm = useForm({
    resolver: zodResolver(signupUserDetailsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      designation: "",
      customDesignation: "",
      email: "",
      alternateEmail: "",
      phone: "",
      countryCode: "",
      alternatePhone: "",
      alternateCountryCode: "",
      password: "",
      companyName: "",
      gstinNumber: "",
      companyType: "",
    },
  });

  const addressForm = useForm({
    resolver: zodResolver(signupAddressSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      address1: "",
      alternateAddress: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      commodities: "",
      sector: "",
      subSector: "",
    },
  });

  const digitalLinksForm = useForm({
    resolver: zodResolver(signupDigitalLinksSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      linkedin: "",
      twitter: "",
      website: "",
    },
  });

  // Sync form data when navigating between steps - persist data
  useEffect(() => {
    if (
      currentStep === SIGNUP_STEPS.USER_DETAILS &&
      Object.keys(formData).length > 0
    ) {
      userDetailsForm.reset({
        name: formData.name || "",
        designation: formData.designation || "",
        customDesignation: formData.customDesignation || "",
        email: formData.email || "",
        alternateEmail: formData.alternateEmail || "",
        phone: formData.phone || "",
        countryCode: formData.countryCode || "",
        alternatePhone: formData.alternatePhone || "",
        alternateCountryCode: formData.alternateCountryCode || "",
        password: formData.password || "",
        companyName: formData.companyName || "",
        gstinNumber: formData.gstinNumber || "",
        companyType: formData.companyType || "",
      });
      if (formData.designation === "Others" || formData.customDesignation) {
        setShowCustomDesignation(true);
      }
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === SIGNUP_STEPS.ADDRESS_DETAILS) {
      if (formData.address1 !== undefined) {
        addressForm.reset({
          address1: formData.address1 || "",
          alternateAddress: formData.alternateAddress || "",
          country: formData.country || "",
          state: formData.state || "",
          city: formData.city || "",
          pincode: formData.pincode || "",
          commodities: formData.commodities || "",
          sector: formData.sector || "",
          subSector: formData.subSector || "",
        });
      }
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === SIGNUP_STEPS.DIGITAL_LINKS) {
      if (formData.linkedin !== undefined) {
        digitalLinksForm.reset({
          linkedin: formData.linkedin || "",
          twitter: formData.twitter || "",
          website: formData.website || "",
        });
      }
    }
  }, [currentStep]);

  const signupMutation = useMutation({
    mutationFn: (data) => authService.signup(data),
    onSuccess: () => {
      // Don't advance step here - we'll do it manually
    },
    onError: (error) => {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      if (error.response?.status === 429) {
        showError(
          errorMessage ||
            "Too many requests. Please wait a moment and try again."
        );
      } else if (error.response?.status === 409) {
        showError("User already exists with this email. Please login instead.");
      } else {
        showError(errorMessage || "Signup failed. Please try again.");
      }
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: () => authService.sendOTP(email),
    onSuccess: () => {
      setCurrentStep(SIGNUP_STEPS.OTP_VERIFICATION);
    },
  });

  const handleUserDetailsSubmit = (data) => {
    // If "Others" is selected, use customDesignation
    if (data.designation === "Others" && data.customDesignation) {
      data.designation = data.customDesignation;
    }
    // Save current form values to formData
    const currentFormValues = userDetailsForm.getValues();
    const mergedData = { ...formData, ...currentFormValues, ...data };
    setFormData(mergedData);
    setEmail(data.email || formData.email || "");
    // Just advance to next step, don't send to backend yet
    setCurrentStep(SIGNUP_STEPS.ADDRESS_DETAILS);
  };

  const handleAddressSubmit = (data) => {
    // Save current form values to formData
    const currentFormValues = addressForm.getValues();
    const mergedData = { ...formData, ...currentFormValues, ...data };
    setFormData(mergedData);
    // Just advance to next step
    setCurrentStep(SIGNUP_STEPS.DIGITAL_LINKS);
  };

  const handleDigitalLinksSubmit = (data) => {
    // Save current form values to formData
    const currentFormValues = digitalLinksForm.getValues();
    const mergedData = { ...formData, ...currentFormValues, ...data };
    setFormData(mergedData);
    // Just advance to next step
    setCurrentStep(SIGNUP_STEPS.TERMS);
  };

  const handleTermsSubmit = async () => {
    if (!agreedToTerms) {
      setTermsError("You must agree to the Terms & Conditions to proceed.");
      return;
    }

    // Only require CAPTCHA if site key is configured
    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      setTermsError("Please complete the CAPTCHA verification.");
      return;
    }

    setTermsError(""); // Clear error if valid

    try {
      await signupMutation.mutateAsync({
        ...formData,
        recaptchaToken: captchaToken,
      });
      await sendOTPMutation.mutateAsync();
    } catch (error) {
      console.error("Error in terms submit:", error);
      // Reset captcha on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken("");
    }
  };

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
    setTermsError("");
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken("");
    setTermsError("CAPTCHA expired. Please verify again.");
  };

  const handleCaptchaError = () => {
    setCaptchaToken("");
    setTermsError("CAPTCHA verification failed. Please try again.");
  };

  const handleOTPSuccess = () => {
    setCurrentStep(SIGNUP_STEPS.COMPLETE);
    setTimeout(() => {
      navigate("/feed");
    }, 3000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case SIGNUP_STEPS.USER_DETAILS:
        return (
          <form
            onSubmit={userDetailsForm.handleSubmit(handleUserDetailsSubmit)}
            className="space-y-3 sm:space-y-4 md:space-y-6"
          >
            <Input
              label="Name"
              icon={FiUser}
              placeholder="Enter your name"
              defaultValue={formData.name || ""}
              {...userDetailsForm.register("name", {
                required: false,
                onChange: (e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                },
              })}
              error={
                userDetailsForm.formState.touchedFields.name ||
                userDetailsForm.formState.isSubmitted
                  ? userDetailsForm.formState.errors.name?.message
                  : ""
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Designation (Optional)
              </label>
              <Controller
                name="designation"
                control={userDetailsForm.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={DESIGNATION_OPTIONS}
                    placeholder="Select or search designation"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    onChange={(selected) => {
                      const value = selected?.value || "";
                      field.onChange(value);
                      setShowCustomDesignation(value === "Others");
                      if (value !== "Others") {
                        userDetailsForm.setValue("customDesignation", "");
                        setFormData((prev) => ({
                          ...prev,
                          customDesignation: "",
                        }));
                      }
                      // Save to formData immediately
                      setFormData((prev) => ({
                        ...prev,
                        designation: value,
                      }));
                    }}
                    value={DESIGNATION_OPTIONS.find(
                      (opt) =>
                        opt.value === (formData.designation || field.value)
                    )}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: userDetailsForm.formState.errors
                          .designation
                          ? "#fca5a5"
                          : "#d1d5db",
                        backgroundColor: state.isFocused
                          ? "#ffffff"
                          : "#ffffff",
                        "&:hover": {
                          borderColor: userDetailsForm.formState.errors
                            .designation
                            ? "#fca5a5"
                            : "#10b981",
                        },
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#87ceeb"
                          : state.isFocused
                          ? "#b0e0e6"
                          : "#ffffff",
                        color: state.isSelected ? "#ffffff" : "#1e3a5f",
                        "&:active": {
                          backgroundColor: "#87ceeb",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#ffffff",
                        zIndex: 9999,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#1e3a5f",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "#1e3a5f",
                      }),
                    }}
                  />
                )}
              />
              {userDetailsForm.formState.errors.designation && (
                <p className="mt-1 text-sm text-red-600">
                  {userDetailsForm.formState.errors.designation.message}
                </p>
              )}
              {showCustomDesignation && (
                <div className="mt-3 sm:mt-4">
                  <Input
                    label="Enter Custom Designation"
                    icon={FiUser}
                    placeholder="Enter your designation"
                    defaultValue={formData.customDesignation || ""}
                    {...userDetailsForm.register("customDesignation", {
                      onChange: (e) => {
                        setFormData((prev) => ({
                          ...prev,
                          customDesignation: e.target.value,
                        }));
                      },
                    })}
                    error={
                      userDetailsForm.formState.errors.customDesignation
                        ?.message
                    }
                  />
                </div>
              )}
            </div>
            <Input
              label="Email"
              type="email"
              icon={FiMail}
              placeholder="Enter your email"
              defaultValue={formData.email || ""}
              {...userDetailsForm.register("email", {
                required: false,
                onChange: (e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                  setEmail(e.target.value);
                },
              })}
              error={
                userDetailsForm.formState.touchedFields.email ||
                userDetailsForm.formState.isSubmitted
                  ? userDetailsForm.formState.errors.email?.message
                  : ""
              }
            />
            <Input
              label="Alternate Email"
              type="email"
              icon={FiMail}
              placeholder="Enter alternate email (optional)"
              defaultValue={formData.alternateEmail || ""}
              {...userDetailsForm.register("alternateEmail", {
                onChange: (e) => {
                  setFormData((prev) => ({
                    ...prev,
                    alternateEmail: e.target.value,
                  }));
                },
              })}
              error={userDetailsForm.formState.errors.alternateEmail?.message}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhoneInput
                label="Phone"
                required
                value={formData.phone || userDetailsForm.watch("phone") || ""}
                onChange={(value) => {
                  userDetailsForm.setValue("phone", value || "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  if (value) {
                    // Extract country code from the phone number format
                    const match = value.match(/^\+(\d+)/);
                    if (match) {
                      const countryCode = match[1];
                      userDetailsForm.setValue("countryCode", countryCode, {
                        shouldValidate: false,
                      });
                      setFormData((prev) => ({
                        ...prev,
                        phone: value,
                        countryCode: countryCode,
                      }));
                    }
                  } else {
                    userDetailsForm.setValue("countryCode", "", {
                      shouldValidate: false,
                    });
                    setFormData((prev) => ({
                      ...prev,
                      phone: "",
                      countryCode: "",
                    }));
                  }
                }}
                error={
                  userDetailsForm.formState.touchedFields.phone ||
                  userDetailsForm.formState.isSubmitted
                    ? userDetailsForm.formState.errors.phone?.message
                    : ""
                }
              />
              {/* Hidden input to register alternate phone field */}
              <input
                type="hidden"
                {...userDetailsForm.register("alternatePhone")}
              />
              <input
                type="hidden"
                {...userDetailsForm.register("alternateCountryCode")}
              />
              <PhoneInput
                label="Alternate Phone (Optional)"
                value={
                  formData.alternatePhone ||
                  userDetailsForm.watch("alternatePhone") ||
                  ""
                }
                onChange={(value) => {
                  userDetailsForm.setValue("alternatePhone", value || "", {
                    shouldValidate: false,
                  });
                  if (value) {
                    const match = value.match(/^\+(\d+)/);
                    if (match) {
                      const countryCode = match[1];
                      userDetailsForm.setValue(
                        "alternateCountryCode",
                        countryCode,
                        {
                          shouldValidate: false,
                        }
                      );
                      setFormData((prev) => ({
                        ...prev,
                        alternatePhone: value,
                        alternateCountryCode: countryCode,
                      }));
                    }
                  } else {
                    userDetailsForm.setValue("alternateCountryCode", "", {
                      shouldValidate: false,
                    });
                    setFormData((prev) => ({
                      ...prev,
                      alternatePhone: "",
                      alternateCountryCode: "",
                    }));
                  }
                }}
                error={userDetailsForm.formState.errors.alternatePhone?.message}
              />
            </div>
            <div className="space-y-4 md:space-y-6">
              {" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {" "}
                <Input
                  label="Company Name"
                  icon={FiBriefcase}
                  placeholder="Enter company name"
                  defaultValue={formData.companyName || ""}
                  {...userDetailsForm.register("companyName", {
                    onChange: (e) => {
                      setFormData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }));
                    },
                  })}
                  error={userDetailsForm.formState.errors.companyName?.message}
                />
                <Input
                  label="GSTIN Number"
                  icon={FiBriefcase}
                  placeholder="Enter GSTIN number"
                  defaultValue={formData.gstinNumber || ""}
                  {...userDetailsForm.register("gstinNumber", {
                    onChange: (e) => {
                      setFormData((prev) => ({
                        ...prev,
                        gstinNumber: e.target.value,
                      }));
                    },
                  })}
                  error={userDetailsForm.formState.errors.gstinNumber?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Type
                </label>
                <Controller
                  name="companyType"
                  control={userDetailsForm.control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={COMPANY_TYPE_OPTIONS}
                      placeholder="Select company type"
                      isSearchable
                      isClearable
                      className="react-select-container"
                      classNamePrefix="react-select"
                      onChange={(selected) => {
                        const value = selected?.value || "";
                        field.onChange(value);
                        setFormData((prev) => ({
                          ...prev,
                          companyType: value,
                        }));
                      }}
                      value={COMPANY_TYPE_OPTIONS.find(
                        (opt) =>
                          opt.value === (formData.companyType || field.value)
                      )}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          backgroundColor: "#ffffff",
                          borderColor: "#d1d5db",
                          "&:hover": {
                            borderColor: "#10b981",
                          },
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#87ceeb"
                            : state.isFocused
                            ? "#b0e0e6"
                            : "#ffffff",
                          color: state.isSelected ? "#ffffff" : "#1e3a5f",
                          "&:active": {
                            backgroundColor: "#87ceeb",
                          },
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: "#ffffff",
                          zIndex: 9999,
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: "#1e3a5f",
                        }),
                        input: (base) => ({
                          ...base,
                          color: "#1e3a5f",
                        }),
                      }}
                    />
                  )}
                />
                {userDetailsForm.formState.errors.companyType && (
                  <p className="mt-1 text-sm text-red-600">
                    {userDetailsForm.formState.errors.companyType.message}
                  </p>
                )}
              </div>
            </div>
            <PasswordInput
              label="Password"
              icon={FiLock}
              placeholder="Enter password"
              defaultValue={formData.password || ""}
              {...userDetailsForm.register("password", {
                required: false,
                onChange: (e) => {
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                },
              })}
              error={
                userDetailsForm.formState.touchedFields.password ||
                userDetailsForm.formState.isSubmitted
                  ? userDetailsForm.formState.errors.password?.message
                  : ""
              }
            />
            <Button
              type="submit"
              className="w-full text-sm sm:text-base py-2 sm:py-2.5"
              disabled={userDetailsForm.formState.isSubmitting}
            >
              {userDetailsForm.formState.isSubmitting
                ? "Processing..."
                : "Next"}
            </Button>
          </form>
        );

      case SIGNUP_STEPS.ADDRESS_DETAILS:
        return (
          <form
            onSubmit={addressForm.handleSubmit(handleAddressSubmit)}
            className="space-y-3 sm:space-y-4 md:space-y-6"
          >
            <Input
              label="Address 1"
              icon={FiMapPin}
              placeholder="Enter address"
              {...addressForm.register("address1")}
              error={addressForm.formState.errors.address1?.message}
            />
            <Input
              label="Alternate Address"
              icon={FiMapPin}
              placeholder="Enter alternate address (optional)"
              {...addressForm.register("alternateAddress")}
              error={addressForm.formState.errors.alternateAddress?.message}
            />
            <LocationSelector
              countryValue={formData.country || addressForm.watch("country")}
              stateValue={formData.state || addressForm.watch("state")}
              cityValue={formData.city || addressForm.watch("city")}
              onCountryChange={(e) => {
                const value = e.target.value;
                addressForm.setValue("country", value);
                addressForm.setValue("state", "");
                addressForm.setValue("city", "");
                setFormData((prev) => ({
                  ...prev,
                  country: value,
                  state: "",
                  city: "",
                }));
              }}
              onStateChange={(e) => {
                const value = e.target.value;
                addressForm.setValue("state", value);
                addressForm.setValue("city", "");
                setFormData((prev) => ({
                  ...prev,
                  state: value,
                  city: "",
                }));
              }}
              onCityChange={(e) => {
                const value = e.target.value;
                addressForm.setValue("city", value);
                setFormData((prev) => ({
                  ...prev,
                  city: value,
                }));
              }}
              countryError={addressForm.formState.errors.country?.message}
              stateError={addressForm.formState.errors.state?.message}
              cityError={addressForm.formState.errors.city?.message}
            />
            <Input
              label="Pincode"
              icon={FiMapPin}
              placeholder="Enter pincode"
              type="text"
              defaultValue={formData.pincode || ""}
              {...addressForm.register("pincode", {
                onChange: (e) => {
                  setFormData((prev) => ({
                    ...prev,
                    pincode: e.target.value,
                  }));
                },
              })}
              error={addressForm.formState.errors.pincode?.message}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sector
              </label>
              <Controller
                name="sector"
                control={addressForm.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={SECTOR_OPTIONS}
                    placeholder="Select sector"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    onChange={(selected) => {
                      const value = selected?.value || "";
                      field.onChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        sector: value,
                      }));
                    }}
                    value={SECTOR_OPTIONS.find(
                      (opt) => opt.value === (formData.sector || field.value)
                    )}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "#ffffff",
                        borderColor: "#d1d5db",
                        "&:hover": {
                          borderColor: "#10b981",
                        },
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#87ceeb"
                          : state.isFocused
                          ? "#b0e0e6"
                          : "#ffffff",
                        color: state.isSelected ? "#ffffff" : "#1e3a5f",
                        "&:active": {
                          backgroundColor: "#87ceeb",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#ffffff",
                        zIndex: 9999,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#1e3a5f",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "#1e3a5f",
                      }),
                    }}
                  />
                )}
              />
              {addressForm.formState.errors.sector && (
                <p className="mt-1 text-sm text-red-600">
                  {addressForm.formState.errors.sector.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sub Sector
              </label>
              <Controller
                name="subSector"
                control={addressForm.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={SUB_SECTOR_OPTIONS}
                    placeholder="Select sub sector"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    onChange={(selected) => {
                      const value = selected?.value || "";
                      field.onChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        subSector: value,
                      }));
                    }}
                    value={SUB_SECTOR_OPTIONS.find(
                      (opt) => opt.value === (formData.subSector || field.value)
                    )}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "#ffffff",
                        borderColor: "#d1d5db",
                        "&:hover": {
                          borderColor: "#10b981",
                        },
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#87ceeb"
                          : state.isFocused
                          ? "#b0e0e6"
                          : "#ffffff",
                        color: state.isSelected ? "#ffffff" : "#1e3a5f",
                        "&:active": {
                          backgroundColor: "#87ceeb",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#ffffff",
                        zIndex: 9999,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#1e3a5f",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "#1e3a5f",
                      }),
                    }}
                  />
                )}
              />
              {addressForm.formState.errors.subSector && (
                <p className="mt-1 text-sm text-red-600">
                  {addressForm.formState.errors.subSector.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commodities
              </label>
              <Controller
                name="commodities"
                control={addressForm.control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={COMMODITIES_OPTIONS}
                    placeholder="Select commodities"
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    onChange={(selected) => {
                      const value = selected?.value || "";
                      field.onChange(value);
                      setFormData((prev) => ({
                        ...prev,
                        commodities: value,
                      }));
                    }}
                    value={COMMODITIES_OPTIONS.find(
                      (opt) =>
                        opt.value === (formData.commodities || field.value)
                    )}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "#ffffff",
                        borderColor: "#d1d5db",
                        "&:hover": {
                          borderColor: "#10b981",
                        },
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#87ceeb"
                          : state.isFocused
                          ? "#b0e0e6"
                          : "#ffffff",
                        color: state.isSelected ? "#ffffff" : "#1e3a5f",
                        "&:active": {
                          backgroundColor: "#87ceeb",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#ffffff",
                        zIndex: 9999,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#1e3a5f",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "#1e3a5f",
                      }),
                    }}
                  />
                )}
              />
              {addressForm.formState.errors.commodities && (
                <p className="mt-1 text-sm text-red-600">
                  {addressForm.formState.errors.commodities.message}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 order-2 sm:order-1 text-sm sm:text-base py-2 sm:py-2.5"
              >
                Previous
              </Button>
              <Button
                type="submit"
                className="flex-1 order-1 sm:order-2 text-sm sm:text-base py-2 sm:py-2.5"
                disabled={addressForm.formState.isSubmitting}
              >
                {addressForm.formState.isSubmitting ? "Processing..." : "Next"}
              </Button>
            </div>
          </form>
        );

      case SIGNUP_STEPS.DIGITAL_LINKS:
        return (
          <form
            onSubmit={digitalLinksForm.handleSubmit(handleDigitalLinksSubmit)}
            className="space-y-3 sm:space-y-4 md:space-y-6"
          >
            <Input
              label="LinkedIn"
              icon={FiLink}
              placeholder="https://linkedin.com/in/username"
              {...digitalLinksForm.register("linkedin")}
              error={digitalLinksForm.formState.errors.linkedin?.message}
            />
            <Input
              label="Twitter"
              icon={FiLink}
              placeholder="https://twitter.com/username"
              {...digitalLinksForm.register("twitter")}
              error={digitalLinksForm.formState.errors.twitter?.message}
            />
            <Input
              label="Website (Optional)"
              icon={FiLink}
              placeholder="https://yourwebsite.com"
              {...digitalLinksForm.register("website")}
              error={digitalLinksForm.formState.errors.website?.message}
            />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 order-2 sm:order-1 text-sm sm:text-base py-2 sm:py-2.5"
              >
                Previous
              </Button>
              <Button
                type="submit"
                className="flex-1 order-1 sm:order-2 text-sm sm:text-base py-2 sm:py-2.5"
                disabled={digitalLinksForm.formState.isSubmitting}
              >
                {digitalLinksForm.formState.isSubmitting
                  ? "Processing..."
                  : "Next"}
              </Button>
            </div>
          </form>
        );

      case SIGNUP_STEPS.TERMS:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 md:p-6 rounded-lg transition-colors">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3 md:mb-4 text-lg">
                Terms & Conditions
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4 max-h-60 overflow-y-auto scrollbar-hide">
                <p>
                  By proceeding, you agree to our Terms of Service and Privacy
                  Policy. Please read them carefully before continuing.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong className="text-gray-800 dark:text-white">
                      1. Account Responsibility:
                    </strong>{" "}
                    You are responsible for maintaining the confidentiality of
                    your account.
                  </p>
                  <p>
                    <strong className="text-gray-800 dark:text-white">
                      2. Data Usage:
                    </strong>{" "}
                    Your data will be used in accordance with our Privacy
                    Policy.
                  </p>
                  <p>
                    <strong className="text-gray-800 dark:text-white">
                      3. Service Terms:
                    </strong>{" "}
                    You agree to use our service in compliance with all
                    applicable laws.
                  </p>
                </div>
              </div>
              <Checkbox
                label="I agree to the Terms & Conditions"
                name="terms"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) setTermsError("");
                }}
                error={termsError}
                className={{
                  label: "text-sm text-gray-700 dark:text-gray-300",
                }}
              />

              {/* ReCAPTCHA */}
              {RECAPTCHA_SITE_KEY && (
                <div className="mt-4 flex justify-center">
                  <ReCaptcha
                    ref={recaptchaRef}
                    siteKey={RECAPTCHA_SITE_KEY}
                    onVerify={handleCaptchaVerify}
                    onExpired={handleCaptchaExpired}
                    onError={handleCaptchaError}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 order-2 sm:order-1 text-sm sm:text-base py-2 sm:py-2.5"
              >
                Previous
              </Button>
              <Button
                onClick={handleTermsSubmit}
                disabled={
                  !agreedToTerms ||
                  sendOTPMutation.isPending ||
                  signupMutation.isPending
                }
                className="flex-1 order-1 sm:order-2 text-sm sm:text-base py-2 sm:py-2.5"
              >
                {signupMutation.isPending || sendOTPMutation.isPending
                  ? "Processing..."
                  : "Send OTP & Verify"}
              </Button>
            </div>
          </div>
        );

      case SIGNUP_STEPS.OTP_VERIFICATION:
        return <OTPVerification email={email} onSuccess={handleOTPSuccess} />;

      case SIGNUP_STEPS.COMPLETE:
        return (
          <div className="text-center py-6 sm:py-8 md:py-12">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <HiOutlineLightningBolt className="text-2xl sm:text-3xl md:text-4xl text-sky-500 dark:text-sky-400" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Profile Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base">
              Your account has been successfully verified.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-[10px] sm:text-xs md:text-sm mt-2">
              Redirecting to feed...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-6 md:py-12 px-3 sm:px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <HiOutlineLightningBolt className="text-2xl sm:text-3xl md:text-4xl text-sky-500" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Happily Mart
            </h1>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Create Your Account
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 lg:p-8 transition-colors">
          <SignupStepper currentStep={currentStep} steps={steps} />
          <div className="mt-4 sm:mt-6">{renderStep()}</div>
        </div>
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[--primary] dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-medium no-underline transition-colors"
            >
              Click here to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
