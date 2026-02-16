export interface DealerApplication {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  approvedAt: Date | null;
  approvedBy: string | null;
  rejectedAt: Date | null;
  rejectedBy: string | null;
  rejectionReason: string | null;

  // Business Information
  businessName: string;
  gstNumber: string;
  panNumber: string;
  incorporationDate: string;
  businessType: 'proprietorship' | 'partnership' | 'pvt-ltd' | 'public-ltd' | 'llp' | 'trust' | 'ngo';

  // Address Information
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  // Contact Person Information
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };

  // Bank Details
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
  };

  // Supporting Documents (stored as file paths/URLs after upload)
  supportingDocuments: {
    gstCertificateUrl: string;
    incorporationCertificateUrl: string;
    bankStatementUrl: string;
    cancelledChequeUrl: string;
  };

  // Credit Limit Request
  creditLimitRequired: boolean;
  creditLimitAmount?: number;

  // Terms and Conditions
  termsAccepted: boolean;
}