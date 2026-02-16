import { z } from 'zod';

// Define the schema for dealer application status
export const dealerApplicationStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'under_review'
]);

// Define the schema for dealer application
export const dealerApplicationSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: dealerApplicationStatusSchema,
  approvedAt: z.date().nullable(),
  approvedBy: z.string().uuid().nullable(),
  rejectedAt: z.date().nullable(),
  rejectedBy: z.string().uuid().nullable(),
  rejectionReason: z.string().nullable(),
  
  // Business Information
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
  
  // Address Information
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode format'),
    country: z.string().min(2, 'Country must be at least 2 characters'),
  }),
  
  // Contact Person Information
  contactPerson: z.object({
    name: z.string().min(2, 'Contact person name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^(\+91[\-\s]?)?[0-9]{10}$/, 'Invalid phone number format'),
  }),
  
  // Bank Details
  bankDetails: z.object({
    accountNumber: z.string().min(6, 'Account number must be at least 6 digits').max(18, 'Account number must be at most 18 digits'),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
    bankName: z.string().min(2, 'Bank name must be at least 2 characters'),
    branchName: z.string().min(2, 'Branch name must be at least 2 characters'),
  }),
  
  // Supporting Documents (stored as file paths/URLs after upload)
  supportingDocuments: z.object({
    gstCertificateUrl: z.string().url('GST Certificate must be a valid URL'),
    incorporationCertificateUrl: z.string().url('Incorporation Certificate must be a valid URL'),
    bankStatementUrl: z.string().url('Bank Statement must be a valid URL'),
    cancelledChequeUrl: z.string().url('Cancelled Cheque must be a valid URL'),
  }),
  
  // Credit Limit Request
  creditLimitRequired: z.boolean(),
  creditLimitAmount: z.number().positive('Credit limit amount must be greater than 0').optional(),
  
  // Terms and Conditions
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Define the type for dealer application
export type DealerApplication = z.infer<typeof dealerApplicationSchema>;

// Define the schema for approving/rejecting applications
export const dealerApprovalActionSchema = z.object({
  applicationId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});