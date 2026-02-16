import { z } from 'zod';

// Define the schema for the dealer registration form
export const dealerRegistrationSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name must be at most 100 characters'),
  gstNumber: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format')
    .toUpperCase(),
  panNumber: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format')
    .toUpperCase(),
  incorporationDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  businessType: z.enum(['proprietorship', 'partnership', 'pvt-ltd', 'public-ltd', 'llp', 'trust', 'ngo'], {
    errorMap: () => ({ message: 'Please select a business type' }),
  }),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode format'),
    country: z.string().min(2, 'Country must be at least 2 characters'),
  }),
  contactPerson: z.object({
    name: z.string().min(2, 'Contact person name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^(\+91[\-\s]?)?[0-9]{10}$/, 'Invalid phone number format'),
  }),
  bankDetails: z.object({
    accountNumber: z.string().min(6, 'Account number must be at least 6 digits').max(18, 'Account number must be at most 18 digits'),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
    bankName: z.string().min(2, 'Bank name must be at least 2 characters'),
    branchName: z.string().min(2, 'Branch name must be at least 2 characters'),
  }),
  supportingDocuments: z.object({
    gstCertificate: z.instanceof(File).nullable(),
    incorporationCertificate: z.instanceof(File).nullable(),
    bankStatement: z.instanceof(File).nullable(),
    cancelledCheque: z.instanceof(File).nullable(),
  }).refine(
    (data) => data.gstCertificate !== null,
    { message: 'GST Certificate is required', path: ['gstCertificate'] }
  ).refine(
    (data) => data.incorporationCertificate !== null,
    { message: 'Incorporation Certificate is required', path: ['incorporationCertificate'] }
  ).refine(
    (data) => data.bankStatement !== null,
    { message: 'Bank Statement is required', path: ['bankStatement'] }
  ).refine(
    (data) => data.cancelledCheque !== null,
    { message: 'Cancelled Cheque is required', path: ['cancelledCheque'] }
  ),
  creditLimitRequired: z.boolean(),
  creditLimitAmount: z.number().positive('Credit limit amount must be greater than 0').optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Define the type for the form data
export type DealerRegistrationData = z.infer<typeof dealerRegistrationSchema>;