import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { CrmService } from './crm.service';
import { 
  CreateCustomerDto, 
  UpdateCustomerDto, 
  CreateCustomerInteractionDto, 
  CreateLeadDto, 
  CreateOpportunityDto, 
  CreateTaskDto, 
  CreateCampaignDto 
} from './dto/crm.dto';
import { 
  Customer, 
  CustomerInteraction, 
  Lead, 
  Opportunity, 
  Task, 
  Campaign, 
  CustomerSegment, 
  ActivityFeedItem 
} from './interfaces/crm.interface';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('customers')
  createCustomer(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.crmService.createCustomer(createCustomerDto);
  }

  @Put('customers/:id')
  updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ): Promise<Customer> {
    return this.crmService.updateCustomer(id, updateCustomerDto);
  }

  @Get('customers/:id')
  getCustomerById(@Param('id') id: string): Promise<Customer> {
    return this.crmService.getCustomerById(id);
  }

  @Get('customers')
  getAllCustomers(): Promise<Customer[]> {
    return this.crmService.getAllCustomers();
  }

  @Post('interactions')
  createCustomerInteraction(@Body() createCustomerInteractionDto: CreateCustomerInteractionDto): Promise<CustomerInteraction> {
    return this.crmService.createCustomerInteraction(createCustomerInteractionDto);
  }

  @Get('interactions/:customerId')
  getCustomerInteractions(@Param('customerId') customerId: string): Promise<CustomerInteraction[]> {
    return this.crmService.getCustomerInteractions(customerId);
  }

  @Post('leads')
  createLead(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return this.crmService.createLead(createLeadDto);
  }

  @Get('leads/agent/:agentId')
  getLeadsByAgent(@Param('agentId') agentId: string): Promise<Lead[]> {
    return this.crmService.getLeadsByAgent(agentId);
  }

  @Post('opportunities')
  createOpportunity(@Body() createOpportunityDto: CreateOpportunityDto): Promise<Opportunity> {
    return this.crmService.createOpportunity(createOpportunityDto);
  }

  @Get('opportunities/owner/:ownerId')
  getOpportunitiesByOwner(@Param('ownerId') ownerId: string): Promise<Opportunity[]> {
    return this.crmService.getOpportunitiesByOwner(ownerId);
  }

  @Post('tasks')
  createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.crmService.createTask(createTaskDto);
  }

  @Get('tasks/assignee/:assigneeId')
  getTasksByAssignee(@Param('assigneeId') assigneeId: string): Promise<Task[]> {
    return this.crmService.getTasksByAssignee(assigneeId);
  }

  @Get('tasks/related/:relatedTo/:relatedId')
  getTasksByRelatedEntity(
    @Param('relatedTo') relatedTo: 'customer' | 'lead' | 'opportunity' | 'order' | 'other',
    @Param('relatedId') relatedId: string
  ): Promise<Task[]> {
    return this.crmService.getTasksByRelatedEntity(relatedTo, relatedId);
  }

  @Post('campaigns')
  createCampaign(@Body() createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    return this.crmService.createCampaign(createCampaignDto);
  }

  @Get('campaigns/active')
  getActiveCampaigns(): Promise<Campaign[]> {
    return this.crmService.getActiveCampaigns();
  }

  @Get('campaigns/completed')
  getCompletedCampaigns(): Promise<Campaign[]> {
    return this.crmService.getCompletedCampaigns();
  }

  @Get('segments')
  getCustomerSegments(): Promise<CustomerSegment[]> {
    return this.crmService.getCustomerSegments();
  }

  @Get('activity-feed')
  getActivityFeed(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ): Promise<ActivityFeedItem[]> {
    return this.crmService.getActivityFeed(limit, offset);
  }

  @Get('activity-feed/customer/:customerId')
  getRecentActivities(
    @Param('customerId') customerId: string,
    @Query('limit') limit: number = 10
  ): Promise<ActivityFeedItem[]> {
    return this.crmService.getRecentActivities(customerId, limit);
  }

  @Post('leads/:leadId/convert-to-customer')
  convertLeadToCustomer(@Param('leadId') leadId: string): Promise<Customer> {
    return this.crmService.convertLeadToCustomer(leadId);
  }
}