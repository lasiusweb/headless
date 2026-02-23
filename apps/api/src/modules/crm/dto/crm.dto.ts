import { IsString, IsEmail, IsPhoneNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min, Max, Length, IsISO8601, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @Length(5, 200)
  street: string;

  @IsString()
  @Length(2, 50)
  city: string;

  @IsString()
  @Length(2, 50)
  state: string;

  @IsString()
  @Length(6, 6)
  pincode: string;  // Indian pincode format

  @IsString()
  @Length(2, 50)
  country: string;

  @IsString()
  @IsEnum(['billing', 'shipping', 'both'])
  type: 'billing' | 'shipping' | 'both';

  @IsBoolean()
  isDefault: boolean;
}

export class CreateCustomerDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('IN')  // Indian phone number format
  phone: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  alternatePhone?: string;

  @IsEnum(['retailer', 'dealer', 'distributor'])
  type: 'retailer' | 'dealer' | 'distributor';

  @IsOptional()
  @IsString()
  @Length(15, 15)
  gstin?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  pan?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  shippingAddresses?: AddressDto[];

  @IsOptional()
  @IsEnum(['active', 'inactive', 'prospect', 'blacklisted'])
  status?: 'active' | 'inactive' | 'prospect' | 'blacklisted';

  @IsOptional()
  @IsEnum(['retailer', 'dealer', 'distributor'])
  pricingTier?: 'retailer' | 'dealer' | 'distributor';

  @IsOptional()
  @IsString()
  assignedAgentId?: string;

  @IsEnum(['organic', 'referral', 'advertisement', 'direct', 'event'])
  leadSource: 'organic' | 'referral' | 'advertisement' | 'direct' | 'event';

  @IsISO8601()
  firstContactDate: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCommunication?: ('email' | 'phone' | 'sms' | 'whatsapp')[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  alternatePhone?: string;

  @IsOptional()
  @IsEnum(['retailer', 'dealer', 'distributor'])
  type?: 'retailer' | 'dealer' | 'distributor';

  @IsOptional()
  @IsString()
  @Length(15, 15)
  gstin?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  pan?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  shippingAddresses?: AddressDto[];

  @IsOptional()
  @IsEnum(['active', 'inactive', 'prospect', 'blacklisted'])
  status?: 'active' | 'inactive' | 'prospect' | 'blacklisted';

  @IsOptional()
  @IsEnum(['retailer', 'dealer', 'distributor'])
  pricingTier?: 'retailer' | 'dealer' | 'distributor';

  @IsOptional()
  @IsString()
  assignedAgentId?: string;

  @IsOptional()
  @IsEnum(['organic', 'referral', 'advertisement', 'direct', 'event'])
  leadSource?: 'organic' | 'referral' | 'advertisement' | 'direct' | 'event';

  @IsOptional()
  @IsISO8601()
  firstContactDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCommunication?: ('email' | 'phone' | 'sms' | 'whatsapp')[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCustomerInteractionDto {
  @IsString()
  customerId: string;

  @IsEnum(['call', 'email', 'meeting', 'visit', 'sms', 'whatsapp', 'other'])
  type: 'call' | 'email' | 'meeting' | 'visit' | 'sms' | 'whatsapp' | 'other';

  @IsEnum(['phone', 'email', 'in-person', 'video-call', 'social-media', 'other'])
  channel: 'phone' | 'email' | 'in-person' | 'video-call' | 'social-media' | 'other';

  @IsString()
  @Length(5, 200)
  subject: string;

  @IsString()
  notes: string;

  @IsEnum(['interested', 'not-interested', 'follow-up-needed', 'converted', 'callback-scheduled', 'other'])
  outcome: 'interested' | 'not-interested' | 'follow-up-needed' | 'converted' | 'callback-scheduled' | 'other';

  @IsISO8601()
  interactionDate: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number; // in minutes

  @IsString()
  createdBy: string;
}

export class CreateLeadDto {
  @IsString()
  @Length(1, 50)
  firstName: string;

  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsEnum(['organic', 'referral', 'advertisement', 'direct', 'event'])
  leadSource: 'organic' | 'referral' | 'advertisement' | 'direct' | 'event';

  @IsEnum(['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'])
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';

  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority: 'low' | 'medium' | 'high' | 'critical';

  @IsString()
  assignedTo: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @IsOptional()
  @IsISO8601()
  expectedCloseDate?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  conversionProbability: number; // percentage

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsISO8601()
  firstContactDate: string;
}

export class CreateOpportunityDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsString()
  @Length(5, 200)
  title: string;

  @IsString()
  description: string;

  @IsEnum(['prospecting', 'qualification', 'needs-analysis', 'proposal', 'negotiation', 'closed-won', 'closed-lost'])
  stage: 'prospecting' | 'qualification' | 'needs-analysis' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

  @IsNumber()
  @Min(0)
  @Max(100)
  probability: number; // percentage

  @IsNumber()
  @Min(0)
  estimatedValue: number;

  @IsOptional()
  @IsISO8601()
  expectedCloseDate?: string;

  @IsString()
  owner: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsEnum(['lead', 'existing-customer', 'referral', 'other'])
  source: 'lead' | 'existing-customer' | 'referral' | 'other';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productsInterested?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTaskDto {
  @IsString()
  @Length(5, 200)
  title: string;

  @IsString()
  description: string;

  @IsString()
  assignedTo: string;

  @IsOptional()
  @IsString()
  assignedToName?: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority: 'low' | 'medium' | 'high' | 'critical';

  @IsEnum(['pending', 'in-progress', 'completed', 'cancelled'])
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';

  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @IsEnum(['customer', 'lead', 'opportunity', 'order', 'other'])
  relatedTo: 'customer' | 'lead' | 'opportunity' | 'order' | 'other';

  @IsString()
  relatedId: string;
}

export class CreateCampaignDto {
  @IsString()
  @Length(5, 200)
  name: string;

  @IsEnum(['email', 'sms', 'whatsapp', 'call', 'direct-mail', 'social-media', 'event', 'other'])
  type: 'email' | 'sms' | 'whatsapp' | 'call' | 'direct-mail' | 'social-media' | 'event' | 'other';

  @IsEnum(['draft', 'scheduled', 'in-progress', 'completed', 'cancelled'])
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

  @IsEnum(['all', 'prospects', 'customers', 'retailers', 'dealers', 'distributors', 'custom'])
  audience: 'all' | 'prospects' | 'customers' | 'retailers' | 'dealers' | 'distributors' | 'custom';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customAudience?: string[]; // customer IDs

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsNumber()
  @Min(0)
  target: number; // number of leads/conversions expected

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: ('email' | 'sms' | 'whatsapp' | 'call' | 'direct-mail' | 'social-media')[];

  @IsString()
  createdBy: string;
}