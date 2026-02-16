import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  Customer, 
  CustomerInteraction, 
  Lead, 
  Opportunity, 
  Task, 
  Campaign, 
  CustomerSegment,
  ActivityFeedItem,
  Address
} from './interfaces/crm.interface';
import { 
  CreateCustomerDto, 
  UpdateCustomerDto, 
  CreateCustomerInteractionDto, 
  CreateLeadDto, 
  CreateOpportunityDto, 
  CreateTaskDto, 
  CreateCampaignDto 
} from './dto/crm.dto';
import { OrdersService } from '../orders/orders.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);
  private customers: Customer[] = [];
  private interactions: CustomerInteraction[] = [];
  private leads: Lead[] = [];
  private opportunities: Opportunity[] = [];
  private tasks: Task[] = [];
  private campaigns: Campaign[] = [];
  private customerSegments: CustomerSegment[] = [];
  private activityFeed: ActivityFeedItem[] = [];

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private customersService: CustomersService,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Create the customer
    const customer: Customer = {
      id: Math.random().toString(36).substring(7),
      ...createCustomerDto,
      status: createCustomerDto.status || 'prospect',
      pricingTier: createCustomerDto.pricingTier || createCustomerDto.type,
      totalOrders: 0,
      totalSpent: 0,
      tags: createCustomerDto.tags || [],
      notes: createCustomerDto.notes ? [createCustomerDto.notes] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customers.push(customer);

    // Add to activity feed
    this.addActivityFeedItem({
      id: Math.random().toString(36).substring(7),
      actorId: createCustomerDto.assignedAgentId || 'system',
      actorName: 'System', // In a real app, this would be the user's name
      action: 'created',
      objectType: 'customer',
      objectId: customer.id,
      objectName: customer.name,
      description: `Customer ${customer.name} was created`,
      timestamp: new Date(),
    });

    this.logger.log(`Customer created: ${customer.id} - ${customer.name}`);

    return customer;
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Customer with ID ${id} not found`);
    }

    const oldCustomer = { ...this.customers[index] };
    this.customers[index] = {
      ...this.customers[index],
      ...updateCustomerDto,
      updatedAt: new Date(),
    };

    // Add to activity feed
    this.addActivityFeedItem({
      id: Math.random().toString(36).substring(7),
      actorId: 'system', // In a real app, this would be the user's ID
      actorName: 'System', // In a real app, this would be the user's name
      action: 'updated',
      objectType: 'customer',
      objectId: id,
      objectName: this.customers[index].name,
      description: `Customer ${this.customers[index].name} was updated`,
      timestamp: new Date(),
      metadata: {
        oldValues: oldCustomer,
        newValues: this.customers[index],
      },
    });

    this.logger.log(`Customer updated: ${id} - ${this.customers[index].name}`);

    return this.customers[index];
  }

  async getCustomerById(id: string): Promise<Customer> {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return [...this.customers];
  }

  async createCustomerInteraction(createCustomerInteractionDto: CreateCustomerInteractionDto): Promise<CustomerInteraction> {
    const interaction: CustomerInteraction = {
      id: Math.random().toString(36).substring(7),
      ...createCustomerInteractionDto,
      interactionDate: new Date(createCustomerInteractionDto.interactionDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.interactions.push(interaction);

    // Update customer's last contact date
    const customerIndex = this.customers.findIndex(c => c.id === createCustomerInteractionDto.customerId);
    if (customerIndex !== -1) {
      this.customers[customerIndex] = {
        ...this.customers[customerIndex],
        lastContactDate: new Date(),
        nextFollowUpDate: createCustomerInteractionDto.outcome === 'follow-up-needed' 
          ? new Date(new Date().setDate(new Date().getDate() + 7)) 
          : this.customers[customerIndex].nextFollowUpDate,
        updatedAt: new Date(),
      };
    }

    // Add to activity feed
    this.addActivityFeedItem({
      id: Math.random().toString(36).substring(7),
      actorId: createCustomerInteractionDto.createdBy,
      actorName: 'System', // In a real app, this would be the user's name
      action: 'contacted',
      objectType: 'customer',
      objectId: createCustomerInteractionDto.customerId,
      objectName: this.customers[customerIndex]?.name || 'Unknown',
      description: `Interaction recorded for customer ${this.customers[customerIndex]?.name || 'Unknown'}`,
      timestamp: new Date(),
    });

    this.logger.log(`Customer interaction created: ${interaction.id} for customer ${createCustomerInteractionDto.customerId}`);

    return interaction;
  }

  async createLead(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead: Lead = {
      id: Math.random().toString(36).substring(7),
      firstName: createLeadDto.firstName,
      lastName: createLeadDto.lastName,
      email: createLeadDto.email,
      phone: createLeadDto.phone,
      company: createLeadDto.company,
      designation: createLeadDto.designation,
      leadSource: createLeadDto.leadSource,
      status: createLeadDto.status,
      priority: createLeadDto.priority,
      assignedTo: createLeadDto.assignedTo,
      assignedToName: 'Agent Name', // In a real app, this would be fetched from user service
      estimatedValue: createLeadDto.estimatedValue,
      expectedCloseDate: createLeadDto.expectedCloseDate ? new Date(createLeadDto.expectedCloseDate) : undefined,
      conversionProbability: createLeadDto.conversionProbability,
      address: {
        id: Math.random().toString(36).substring(7),
        ...createLeadDto.address,
      },
      notes: createLeadDto.notes ? [createLeadDto.notes] : [],
      tags: createLeadDto.tags || [],
      firstContactDate: new Date(createLeadDto.firstContactDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.leads.push(lead);

    // Add to activity feed
    this.addActivityFeedItem({
      id: Math.random().toString(36).substring(7),
      actorId: createLeadDto.assignedTo,
      actorName: 'Agent Name', // In a real app, this would be the user's name
      action: 'created',
      objectType: 'lead',
      objectId: lead.id,
      objectName: `${lead.firstName} ${lead.lastName}`,
      description: `Lead ${lead.firstName} ${lead.lastName} was created`,
      timestamp: new Date(),
    });

    this.logger.log(`Lead created: ${lead.id} - ${lead.firstName} ${lead.lastName}`);

    return lead;
  }

  async createOpportunity(createOpportunityDto: CreateOpportunityDto): Promise<Opportunity> {
    const opportunity: Opportunity = {
      id: Math.random().toString(36).substring(7),
      ...createOpportunityDto,
      expectedCloseDate: createOpportunityDto.expectedCloseDate ? new Date(createOpportunityDto.expectedCloseDate) : undefined,
      productsInterested: createOpportunityDto.productsInterested || [],
      notes: createOpportunityDto.notes ? [createOpportunityDto.notes] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.opportunities.push(opportunity);

    // Add to activity feed
    this.addActivityFeedItem({
      id: Math.random().toString(36).substring(7),
      actorId: createOpportunityDto.owner,
      actorName: 'Agent Name', // In a real app, this would be the user's name
      action: 'created',
      objectType: 'opportunity',
      objectId: opportunity.id,
      objectName: opportunity.title,
      description: `Opportunity ${opportunity.title} was created`,
      timestamp: new Date(),
    });

    this.logger.log(`Opportunity created: ${opportunity.id} - ${opportunity.title}`);

    return opportunity;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task: Task = {
      id: Math.random().toString(36).substring(7),
      ...createTaskDto,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.push(task);

    // Add to activity feed
    this.addActivityFeedItem({
      id: Math.random().toString(36).substring(7),
      actorId: 'system', // In a real app, this would be the creator's ID
      actorName: 'System', // In a real app, this would be the creator's name
      action: 'created',
      objectType: 'task',
      objectId: task.id,
      objectName: task.title,
      description: `Task ${task.title} was created`,
      timestamp: new Date(),
    });

    this.logger.log(`Task created: ${task.id} - ${task.title}`);

    return task;
  }

  async createCampaign(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaign: Campaign = {
      id: Math.random().toString(36).substring(7),
      ...createCampaignDto,
      startDate: new Date(createCampaignDto.startDate),
      endDate: new Date(createCampaignDto.endDate),
      spent: 0, // Initially no money spent
      target: createCampaignDto.target,
      achieved: 0, // Initially nothing achieved
      successRate: 0, // Initially 0%
      channels: createCampaignDto.channels || [createCampaignDto.type],
      attachments: [],
      createdBy: createCampaignDto.createdBy,
      createdByUsername: 'Admin', // In a real app, this would be the user's name
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.campaigns.push(campaign);

    // Add to activity feed
    this.addActivityFeedItem({
      id: Math.random().toString(36).substring(7),
      actorId: createCampaignDto.createdBy,
      actorName: 'Admin', // In a real app, this would be the user's name
      action: 'created',
      objectType: 'campaign',
      objectId: campaign.id,
      objectName: campaign.name,
      description: `Campaign ${campaign.name} was created`,
      timestamp: new Date(),
    });

    this.logger.log(`Campaign created: ${campaign.id} - ${campaign.name}`);

    return campaign;
  }

  async getCustomerInteractions(customerId: string): Promise<CustomerInteraction[]> {
    return this.interactions.filter(i => i.customerId === customerId);
  }

  async getLeadsByAgent(agentId: string): Promise<Lead[]> {
    return this.leads.filter(l => l.assignedTo === agentId);
  }

  async getOpportunitiesByOwner(ownerId: string): Promise<Opportunity[]> {
    return this.opportunities.filter(o => o.owner === ownerId);
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return this.tasks.filter(t => t.assignedTo === assigneeId);
  }

  async getTasksByRelatedEntity(relatedTo: 'customer' | 'lead' | 'opportunity' | 'order' | 'other', relatedId: string): Promise<Task[]> {
    return this.tasks.filter(t => t.relatedTo === relatedTo && t.relatedId === relatedId);
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    const now = new Date();
    return this.campaigns.filter(c => 
      c.status === 'in-progress' || 
      (c.status === 'scheduled' && new Date(c.startDate) <= now && new Date(c.endDate) >= now)
    );
  }

  async getCompletedCampaigns(): Promise<Campaign[]> {
    return this.campaigns.filter(c => c.status === 'completed');
  }

  async getCustomerSegments(): Promise<CustomerSegment[]> {
    // In a real implementation, this would calculate segments based on customer data
    // For now, we'll return mock segments
    return [
      {
        id: 'seg-1',
        name: 'High-Value Dealers',
        description: 'Dealers with annual spend > ₹50L',
        criteria: {
          customerType: ['dealer'],
          totalSpent: { min: 5000000, max: Infinity },
        },
        customerCount: 15,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15'),
      },
      {
        id: 'seg-2',
        name: 'Frequent Buyers',
        description: 'Customers with >10 orders in last 6 months',
        criteria: {
          orderFrequency: 10,
          lastOrderDate: { daysAgo: 180 },
        },
        customerCount: 42,
        createdAt: new Date('2023-02-20'),
        updatedAt: new Date('2023-02-20'),
      },
      {
        id: 'seg-3',
        name: 'New Prospects',
        description: 'Prospects created in last 30 days',
        criteria: {
          lastOrderDate: { daysAgo: 30 },
        },
        customerCount: 28,
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2023-03-10'),
      },
    ];
  }

  async getActivityFeed(limit: number = 50, offset: number = 0): Promise<ActivityFeedItem[]> {
    return this.activityFeed
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  async getRecentActivities(customerId: string, limit: number = 10): Promise<ActivityFeedItem[]> {
    return this.activityFeed
      .filter(activity => 
        (activity.objectType === 'customer' && activity.objectId === customerId) ||
        (activity.objectType === 'opportunity' && this.opportunities.some(o => o.id === activity.objectId && o.customerId === customerId)) ||
        (activity.objectType === 'interaction' && this.interactions.some(i => i.id === activity.objectId && i.customerId === customerId))
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private addActivityFeedItem(activity: ActivityFeedItem): void {
    this.activityFeed.push(activity);
  }

  async convertLeadToCustomer(leadId: string): Promise<Customer> {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }

    // Create a customer from the lead
    const customer: Customer = {
      id: Math.random().toString(36).substring(7),
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      phone: lead.phone,
      type: 'prospect', // Default to prospect, can be updated later
      address: {
        id: Math.random().toString(36).substring(7),
        ...lead.address,
        type: 'both',
        isDefault: true,
      },
      shippingAddresses: [],
      status: 'active',
      pricingTier: 'retailer', // Default pricing tier
      leadSource: lead.leadSource,
      firstContactDate: lead.firstContactDate,
      totalOrders: 0,
      totalSpent: 0,
      preferredCommunication: ['email', 'phone'],
      tags: lead.tags,
      notes: [`Converted from lead: ${lead.firstName} ${lead.lastName} at ${lead.company}`],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customers.push(customer);

    // Update lead status to converted
    const leadIndex = this.leads.findIndex(l => l.id === leadId);
    if (leadIndex !== -1) {
      this.leads[leadIndex] = {
        ...this.leads[leadIndex],
        status: 'converted',
        updatedAt: new Date(),
      };
    }

    // Add to activity feed
    this.addActivityFeedItem({
      id: Math.random().toString(36).substring(7),
      actorId: 'system',
      actorName: 'System',
      action: 'converted',
      objectType: 'lead',
      objectId: leadId,
      objectName: `${lead.firstName} ${lead.lastName}`,
      description: `Lead ${lead.firstName} ${lead.lastName} was converted to customer ${customer.name}`,
      timestamp: new Date(),
    });

    this.addActivityFeedItem({
      id: Math.random().toString(36).substring(7),
      actorId: 'system',
      actorName: 'System',
      action: 'created',
      objectType: 'customer',
      objectId: customer.id,
      objectName: customer.name,
      description: `Customer ${customer.name} was created from lead ${lead.firstName} ${lead.lastName}`,
      timestamp: new Date(),
    });

    this.logger.log(`Lead ${leadId} converted to customer ${customer.id} - ${customer.name}`);

    return customer;
  }
}