export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  type: 'retailer' | 'dealer' | 'distributor';
  gstin?: string;
  pan?: string;
  creditLimit?: number;
  currentBalance?: number;
  address: Address;
  shippingAddresses: Address[];
  status: 'active' | 'inactive' | 'prospect' | 'blacklisted';
  pricingTier: 'retailer' | 'dealer' | 'distributor';
  assignedAgentId?: string;
  assignedAgentName?: string;
  leadSource: 'organic' | 'referral' | 'advertisement' | 'direct' | 'event';
  firstContactDate: Date;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  preferredCommunication: ('email' | 'phone' | 'sms' | 'whatsapp')[];
  tags: string[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: 'billing' | 'shipping' | 'both';
  isDefault: boolean;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'call' | 'email' | 'meeting' | 'visit' | 'sms' | 'whatsapp' | 'other';
  channel: 'phone' | 'email' | 'in-person' | 'video-call' | 'social-media' | 'other';
  subject: string;
  notes: string;
  outcome: 'interested' | 'not-interested' | 'follow-up-needed' | 'converted' | 'callback-scheduled' | 'other';
  interactionDate: Date;
  duration?: number; // in minutes
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  designation?: string;
  leadSource: 'organic' | 'referral' | 'advertisement' | 'direct' | 'event';
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  assignedToName: string;
  estimatedValue?: number;
  expectedCloseDate?: Date;
  conversionProbability: number; // percentage
  address: Address;
  notes: string[];
  tags: string[];
  firstContactDate: Date;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Opportunity {
  id: string;
  customerId: string;
  leadId?: string;
  title: string;
  description: string;
  stage: 'prospecting' | 'qualification' | 'needs-analysis' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number; // percentage
  estimatedValue: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  owner: string;
  ownerName: string;
  source: 'lead' | 'existing-customer' | 'referral' | 'other';
  productsInterested: string[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  completedDate?: Date;
  relatedTo: 'customer' | 'lead' | 'opportunity' | 'order' | 'other';
  relatedId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'call' | 'direct-mail' | 'social-media' | 'event' | 'other';
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  audience: 'all' | 'prospects' | 'customers' | 'retailers' | 'dealers' | 'distributors' | 'custom';
  customAudience?: string[]; // customer IDs
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  target: number; // number of leads/conversions expected
  achieved: number; // number of leads/conversions achieved
  successRate: number; // percentage
  channels: ('email' | 'sms' | 'whatsapp' | 'call' | 'direct-mail' | 'social-media')[];
  content: string;
  attachments?: string[];
  createdBy: string;
  createdByUsername: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    customerType?: ('retailer' | 'dealer' | 'distributor')[];
    totalSpent?: { min: number; max: number };
    lastOrderDate?: { daysAgo: number };
    orderFrequency?: number; // orders per month
    location?: string[]; // states/regions
    tags?: string[];
  };
  customerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityFeedItem {
  id: string;
  actorId: string;
  actorName: string;
  action: 'created' | 'updated' | 'deleted' | 'contacted' | 'converted' | 'assigned' | 'commented';
  objectType: 'customer' | 'lead' | 'opportunity' | 'task' | 'campaign';
  objectId: string;
  objectName: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}