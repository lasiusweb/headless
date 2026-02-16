// services/crmService.ts
import { 
  Customer, 
  CustomerInteraction, 
  Lead, 
  Opportunity, 
  Task, 
  Campaign, 
  CustomerSegment, 
  ActivityFeedItem 
} from '../api/src/modules/crm/interfaces/crm.interface';
import { 
  CreateCustomerDto, 
  UpdateCustomerDto, 
  CreateCustomerInteractionDto, 
  CreateLeadDto, 
  CreateOpportunityDto, 
  CreateTaskDto, 
  CreateCampaignDto 
} from '../api/src/modules/crm/dto/crm.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the CRM API
 */
export class CrmService {
  /**
   * Creates a new customer
   */
  static async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/crm/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a customer
   */
  static async updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/crm/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a customer by ID
   */
  static async getCustomerById(id: string): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/crm/customers/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets all customers
   */
  static async getAllCustomers(): Promise<Customer[]> {
    const response = await fetch(`${API_BASE_URL}/crm/customers`);

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a customer interaction
   */
  static async createCustomerInteraction(data: CreateCustomerInteractionDto): Promise<CustomerInteraction> {
    const response = await fetch(`${API_BASE_URL}/crm/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create customer interaction: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets customer interactions
   */
  static async getCustomerInteractions(customerId: string): Promise<CustomerInteraction[]> {
    const response = await fetch(`${API_BASE_URL}/crm/interactions/${customerId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch customer interactions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a lead
   */
  static async createLead(data: CreateLeadDto): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/crm/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create lead: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets leads by agent
   */
  static async getLeadsByAgent(agentId: string): Promise<Lead[]> {
    const response = await fetch(`${API_BASE_URL}/crm/leads/agent/${agentId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch leads for agent: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates an opportunity
   */
  static async createOpportunity(data: CreateOpportunityDto): Promise<Opportunity> {
    const response = await fetch(`${API_BASE_URL}/crm/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create opportunity: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets opportunities by owner
   */
  static async getOpportunitiesByOwner(ownerId: string): Promise<Opportunity[]> {
    const response = await fetch(`${API_BASE_URL}/crm/opportunities/owner/${ownerId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch opportunities for owner: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a task
   */
  static async createTask(data: CreateTaskDto): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/crm/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets tasks by assignee
   */
  static async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/crm/tasks/assignee/${assigneeId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks for assignee: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets tasks by related entity
   */
  static async getTasksByRelatedEntity(relatedTo: 'customer' | 'lead' | 'opportunity' | 'order' | 'other', relatedId: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/crm/tasks/related/${relatedTo}/${relatedId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks for related entity: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a campaign
   */
  static async createCampaign(data: CreateCampaignDto): Promise<Campaign> {
    const response = await fetch(`${API_BASE_URL}/crm/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create campaign: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets active campaigns
   */
  static async getActiveCampaigns(): Promise<Campaign[]> {
    const response = await fetch(`${API_BASE_URL}/crm/campaigns/active`);

    if (!response.ok) {
      throw new Error(`Failed to fetch active campaigns: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets completed campaigns
   */
  static async getCompletedCampaigns(): Promise<Campaign[]> {
    const response = await fetch(`${API_BASE_URL}/crm/campaigns/completed`);

    if (!response.ok) {
      throw new Error(`Failed to fetch completed campaigns: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets customer segments
   */
  static async getCustomerSegments(): Promise<CustomerSegment[]> {
    const response = await fetch(`${API_BASE_URL}/crm/segments`);

    if (!response.ok) {
      throw new Error(`Failed to fetch customer segments: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets activity feed
   */
  static async getActivityFeed(limit: number = 50, offset: number = 0): Promise<ActivityFeedItem[]> {
    const response = await fetch(`${API_BASE_URL}/crm/activity-feed?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch activity feed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets recent activities for a customer
   */
  static async getRecentActivities(customerId: string, limit: number = 10): Promise<ActivityFeedItem[]> {
    const response = await fetch(`${API_BASE_URL}/crm/activity-feed/customer/${customerId}?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch recent activities for customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Converts a lead to a customer
   */
  static async convertLeadToCustomer(leadId: string): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/crm/leads/${leadId}/convert-to-customer`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to convert lead to customer: ${response.statusText}`);
    }

    return response.json();
  }
}