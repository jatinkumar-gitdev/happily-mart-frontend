import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const signupUserDetailsSchema = z.object({
  name: z
    .string()
    .refine((val) => val && val.trim().length > 0, {
      message: "Name is required",
    })
    .refine((val) => val && val.trim().length >= 2, {
      message: "Name must be at least 2 characters",
    }),
  designation: z.string().optional().or(z.literal("")),
  customDesignation: z.string().optional().or(z.literal("")),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  alternateEmail: z
    .string()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return z.string().email().safeParse(val.trim()).success;
      },
      { message: "Invalid email address" }
    )
    .optional()
    .or(z.literal("")),
  phone: z.string().refine(
    (val) => {
      if (!val || val.trim() === "") return false;
      // Remove all non-digit characters and check length
      const digits = val.replace(/\D/g, "");
      return digits.length >= 7;
    },
    { message: "Please enter a valid phone number" }
  ),
  countryCode: z.string().optional(),
  alternatePhone: z.string().optional().or(z.literal("")),
  alternateCountryCode: z.string().optional(),
  companyName: z.string().min(2, "Company name is required"),
  gstinNumber: z.string().optional().or(z.literal("")),
  companyType: z.string().optional().or(z.literal("")),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// export const signupCompanySchema = z.object({
//   companyName: z.string().min(2, "Company name is required"),
//   gstinNumber: z.string().optional().or(z.literal("")),
//   companyType: z.string().optional().or(z.literal("")),
//   registrationNumber: z.string().optional().or(z.literal("")),
//   companyStructure: z.string().optional().or(z.literal("")),
// });

export const signupAddressSchema = z.object({
  address1: z.string().min(5, "Address is required"),
  alternateAddress: z.string().optional().or(z.literal("")),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().refine(
    (val) => {
      if (!val || val.trim() === "") return false;
      const digits = val.replace(/\D/g, "");
      return digits.length >= 4 && digits.length <= 10;
    },
    { message: "Please enter a valid pincode (4-10 digits)" }
  ),
  commodities: z.string().optional().or(z.literal("")),
  sector: z.string().optional().or(z.literal("")),
  subSector: z.string().optional().or(z.literal("")),
});

export const signupDigitalLinksSchema = z.object({
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
