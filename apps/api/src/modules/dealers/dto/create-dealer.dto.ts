import { IsString, IsEmail, IsPhoneNumber, IsDate, IsEnum, IsBoolean, IsNumber, Min, MaxLength, ValidateNested, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  @MaxLength(200)
  street: string;

  @IsString()
  @MaxLength(50)
  city: string;

  @IsString()
  @MaxLength(50)
  state: string;

  @IsString()
  pincode: string;  // Should be validated as 6-digit number

  @IsString()
  @MaxLength(50)
  country: string;
}

export class ContactPersonDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('IN')  // Indian phone number format
  phone: string;
}

export class BankDetailsDto {
  @IsString()
  accountNumber: string;

  @IsString()
  ifscCode: string;

  @IsString()
  @MaxLength(100)
  bankName: string;

  @IsString()
  @MaxLength(100)
  branchName: string;
}

export class SupportingDocumentsDto {
  @IsString()
  gstCertificateUrl: string;

  @IsString()
  incorporationCertificateUrl: string;

  @IsString()
  bankStatementUrl: string;

  @IsString()
  cancelledChequeUrl: string;
}

export class CreateDealerDto {
  @IsString()
  @MaxLength(100)
  businessName: string;

  @IsString()
  gstNumber: string;  // Should be validated as GST format

  @IsString()
  panNumber: string;  // Should be validated as PAN format

  @IsString()
  incorporationDate: string;  // ISO date string

  @IsEnum(['proprietorship', 'partnership', 'pvt-ltd', 'public-ltd', 'llp', 'trust', 'ngo'])
  businessType: 'proprietorship' | 'partnership' | 'pvt-ltd' | 'public-ltd' | 'llp' | 'trust' | 'ngo';

  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address: AddressDto;

  @ValidateNested()
  @Type(() => ContactPersonDto)
  @IsObject()
  contactPerson: ContactPersonDto;

  @ValidateNested()
  @Type(() => BankDetailsDto)
  @IsObject()
  bankDetails: BankDetailsDto;

  @ValidateNested()
  @Type(() => SupportingDocumentsDto)
  @IsObject()
  supportingDocuments: SupportingDocumentsDto;

  @IsBoolean()
  creditLimitRequired: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimitAmount?: number;

  @IsBoolean()
  termsAccepted: boolean;
}