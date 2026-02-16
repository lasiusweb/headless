import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  ReturnRequest, 
  ReturnItem, 
  ReturnReason, 
  Refund, 
  Exchange, 
  ExchangeItem,
  ReturnPolicy,
  ReturnAnalytics
} from './interfaces/returns.interface';
import { 
  CreateReturnRequestDto, 
  UpdateReturnRequestDto, 
  CreateRefundDto, 
  UpdateRefundDto, 
  CreateExchangeDto,
  CreateReturnReasonDto,
  UpdateReturnReasonDto,
  CreateReturnPolicyDto,
  UpdateReturnPolicyDto
} from './dto/returns.dto';
import { OrdersService } from '../orders/orders.service';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReturnsService {
  private readonly logger = new Logger(ReturnsService.name);
  private returnRequests: ReturnRequest[] = [];
  private returnReasons: ReturnReason[] = [];
  private refunds: Refund[] = [];
  private exchanges: Exchange[] = [];
  private returnPolicies: ReturnPolicy[] = [];
  private returnAnalytics: ReturnAnalytics[] = [];

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private inventoryService: InventoryService,
    private notificationsService: NotificationsService,
  ) {
    this.initializeDefaultReturnReasons();
    this.initializeDefaultReturnPolicy();
  }

  private initializeDefaultReturnReasons(): void {
    this.returnReasons = [
      {
        id: 'reason-1',
        category: 'wrong_product',
        description: 'Wrong product received',
        isActive: true,
        requiresImage: false,
        autoApprove: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'reason-2',
        category: 'damaged',
        description: 'Product damaged during shipping',
        isActive: true,
        requiresImage: true,
        autoApprove: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'reason-3',
        category: 'defective',
        description: 'Product is defective or not working',
        isActive: true,
        requiresImage: true,
        autoApprove: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'reason-4',
        category: 'expired',
        description: 'Product expired or near expiry',
        isActive: true,
        requiresImage: true,
        autoApprove: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'reason-5',
        category: 'not_as_described',
        description: 'Product not as described on website',
        isActive: true,
        requiresImage: true,
        autoApprove: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'reason-6',
        category: 'changed_mind',
        description: 'Changed mind / No longer needed',
        isActive: true,
        requiresImage: false,
        autoApprove: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'reason-7',
        category: 'other',
        description: 'Other reason',
        isActive: true,
        requiresImage: false,
        autoApprove: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private initializeDefaultReturnPolicy(): void {
    this.returnPolicies = [
      {
        id: 'policy-1',
        name: 'Standard Return Policy',
        description: 'Standard return policy for most products',
        returnWindow: 30,
        eligibleProductCategories: ['Fertilizers', 'Growth Enhancers', 'Organic Liquids'],
        excludedProductCategories: ['Clearance', 'Final Sale'],
        conditions: [
          'Product must be in original packaging',
          'Product must be unused',
          'Return request must be made within 30 days of delivery',
        ],
        refundMethods: ['original', 'store_credit', 'exchange'],
        whoPaysShipping: 'depends',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async createReturnRequest(createReturnRequestDto: CreateReturnRequestDto): Promise<ReturnRequest> {
    // Generate return number
    const returnNumber = `RET${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Calculate refund amount
    const refundAmount = createReturnRequestDto.items.reduce((sum, item) => sum + item.totalAmount, 0);

    // Get return reason
    const returnReason = this.returnReasons.find(r => r.id === createReturnRequestDto.reasonId);
    if (!returnReason) {
      throw new Error(`Return reason with ID ${createReturnRequestDto.reasonId} not found`);
    }

    const returnRequest: ReturnRequest = {
      id: Math.random().toString(36).substring(7),
      returnNumber,
      ...createReturnRequestDto,
      reason: returnReason,
      status: returnReason.autoApprove ? 'approved' : 'pending',
      refundAmount,
      requestedAt: new Date(),
      approvedAt: returnReason.autoApprove ? new Date() : undefined,
      approvedBy: returnReason.autoApprove ? 'system' : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.returnRequests.push(returnRequest);

    // Send notification to customer
    await this.notificationsService.createNotification({
      type: 'email',
      category: 'order',
      priority: 'high',
      recipientType: 'customer',
      recipientId: createReturnRequestDto.customerId,
      recipientEmail: createReturnRequestDto.customerEmail,
      subject: `Return Request Created - ${returnNumber}`,
      message: `Dear ${createReturnRequestDto.customerName},\n\nYour return request ${returnNumber} has been ${returnRequest.status}.\n\nWe will process your return shortly.\n\nThank you,\nKN Biosciences`,
      metadata: { returnRequestId: returnRequest.id, orderId: createReturnRequestDto.orderId },
    });

    // Send notification to admin if manual approval required
    if (!returnReason.autoApprove) {
      await this.notificationsService.createNotification({
        type: 'email',
        category: 'alert',
        priority: 'medium',
        recipientType: 'admin',
        recipientEmail: 'admin@knbiosciences.in',
        subject: `Return Request Pending Approval - ${returnNumber}`,
        message: `A return request ${returnNumber} requires manual approval.\n\nCustomer: ${createReturnRequestDto.customerName}\nOrder: ${createReturnRequestDto.orderNumber}\nReason: ${returnReason.description}\n\nPlease review and approve/reject.`,
        metadata: { returnRequestId: returnRequest.id, orderId: createReturnRequestDto.orderId },
      });
    }

    this.logger.log(`Return request created: ${returnRequest.id} - ${returnNumber}`);

    return returnRequest;
  }

  async updateReturnRequest(id: string, updateReturnRequestDto: UpdateReturnRequestDto): Promise<ReturnRequest> {
    const index = this.returnRequests.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Return request with ID ${id} not found`);
    }

    const oldRequest = { ...this.returnRequests[index] };
    this.returnRequests[index] = {
      ...this.returnRequests[index],
      ...updateReturnRequestDto,
      approvedAt: updateReturnRequestDto.status === 'approved' && !oldRequest.approvedAt ? new Date() : oldRequest.approvedAt,
      rejectedAt: updateReturnRequestDto.status === 'rejected' && !oldRequest.rejectedAt ? new Date() : oldRequest.rejectedAt,
      receivedAt: updateReturnRequestDto.status === 'received' && !oldRequest.receivedAt ? new Date() : oldRequest.receivedAt,
      refundedAt: updateReturnRequestDto.status === 'refunded' && !oldRequest.refundedAt ? new Date() : oldRequest.refundedAt,
      updatedAt: new Date(),
    };

    // Send notification based on status change
    const newStatus = updateReturnRequestDto.status || oldRequest.status;
    if (newStatus !== oldRequest.status) {
      await this.sendReturnStatusNotification(this.returnRequests[index], oldRequest.status, newStatus);
    }

    this.logger.log(`Return request updated: ${id} - Status: ${this.returnRequests[index].status}`);

    return this.returnRequests[index];
  }

  private async sendReturnStatusNotification(returnRequest: ReturnRequest, oldStatus: string, newStatus: string): Promise<void> {
    const statusMessages: Record<string, { subject: string; message: string }> = {
      approved: {
        subject: `Return Request Approved - ${returnRequest.returnNumber}`,
        message: `Dear ${returnRequest.customerName},\n\nYour return request ${returnRequest.returnNumber} has been approved.\n\nRefund Amount: ₹${returnRequest.refundAmount}\n\nWe will process your refund shortly.`,
      },
      rejected: {
        subject: `Return Request Update - ${returnRequest.returnNumber}`,
        message: `Dear ${returnRequest.customerName},\n\nYour return request ${returnRequest.returnNumber} has been reviewed.\n\nUnfortunately, we cannot approve your return at this time.\n\nReason: ${returnRequest.rejectionReason || 'Please contact support for more information.'}`,
      },
      received: {
        subject: `Return Received - ${returnRequest.returnNumber}`,
        message: `Dear ${returnRequest.customerName},\n\nWe have received your returned items for request ${returnRequest.returnNumber}.\n\nYour refund will be processed within 3-5 business days.`,
      },
      refunded: {
        subject: `Refund Processed - ${returnRequest.returnNumber}`,
        message: `Dear ${returnRequest.customerName},\n\nYour refund of ₹${returnRequest.refundAmount} for return request ${returnRequest.returnNumber} has been processed.\n\nThe amount will be credited to your original payment method within 5-7 business days.`,
      },
    };

    const notification = statusMessages[newStatus];
    if (notification) {
      await this.notificationsService.createNotification({
        type: 'email',
        category: 'order',
        priority: 'high',
        recipientType: 'customer',
        recipientId: returnRequest.customerId,
        recipientEmail: returnRequest.customerEmail,
        subject: notification.subject,
        message: notification.message,
        metadata: { returnRequestId: returnRequest.id, orderId: returnRequest.orderId },
      });
    }
  }

  async getReturnRequestById(id: string): Promise<ReturnRequest> {
    const request = this.returnRequests.find(r => r.id === id);
    if (!request) {
      throw new Error(`Return request with ID ${id} not found`);
    }
    return request;
  }

  async getReturnRequestsByOrder(orderId: string): Promise<ReturnRequest[]> {
    return this.returnRequests.filter(r => r.orderId === orderId);
  }

  async getReturnRequestsByCustomer(customerId: string): Promise<ReturnRequest[]> {
    return this.returnRequests.filter(r => r.customerId === customerId);
  }

  async getReturnRequestsByStatus(status: string): Promise<ReturnRequest[]> {
    return this.returnRequests.filter(r => r.status === status);
  }

  async createRefund(createRefundDto: CreateRefundDto): Promise<Refund> {
    // Generate refund number
    const refundNumber = `REF${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const refund: Refund = {
      id: Math.random().toString(36).substring(7),
      refundNumber,
      ...createRefundDto,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.refunds.push(refund);

    // Update return request status
    const returnRequestIndex = this.returnRequests.findIndex(r => r.id === createRefundDto.returnRequestId);
    if (returnRequestIndex !== -1) {
      this.returnRequests[returnRequestIndex] = {
        ...this.returnRequests[returnRequestIndex],
        status: 'refunded',
        refundedAt: new Date(),
        refundedBy: createRefundDto.processedBy,
        updatedAt: new Date(),
      };
    }

    this.logger.log(`Refund created: ${refund.id} - ${refundNumber}`);

    return refund;
  }

  async updateRefund(id: string, updateRefundDto: UpdateRefundDto): Promise<Refund> {
    const index = this.refunds.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Refund with ID ${id} not found`);
    }

    this.refunds[index] = {
      ...this.refunds[index],
      ...updateRefundDto,
      completedAt: updateRefundDto.status === 'completed' && !this.refunds[index].completedAt ? new Date() : this.refunds[index].completedAt,
      updatedAt: new Date(),
    };

    this.logger.log(`Refund updated: ${id} - Status: ${this.refunds[index].status}`);

    return this.refunds[index];
  }

  async createExchange(createExchangeDto: CreateExchangeDto): Promise<Exchange> {
    // Generate exchange number
    const exchangeNumber = `EXC${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const exchange: Exchange = {
      id: Math.random().toString(36).substring(7),
      exchangeNumber,
      ...createExchangeDto,
      status: 'pending',
      paymentStatus: createExchangeDto.priceDifference > 0 ? 'pending' : createExchangeDto.priceDifference < 0 ? 'refunded' : 'paid',
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.exchanges.push(exchange);

    this.logger.log(`Exchange created: ${exchange.id} - ${exchangeNumber}`);

    return exchange;
  }

  async getReturnReasons(): Promise<ReturnReason[]> {
    return this.returnReasons.filter(r => r.isActive);
  }

  async createReturnReason(createReturnReasonDto: CreateReturnReasonDto): Promise<ReturnReason> {
    const reason: ReturnReason = {
      id: Math.random().toString(36).substring(7),
      ...createReturnReasonDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.returnReasons.push(reason);

    this.logger.log(`Return reason created: ${reason.id}`);

    return reason;
  }

  async getReturnPolicies(): Promise<ReturnPolicy[]> {
    return this.returnPolicies.filter(p => p.isActive);
  }

  async createReturnPolicy(createReturnPolicyDto: CreateReturnPolicyDto): Promise<ReturnPolicy> {
    const policy: ReturnPolicy = {
      id: Math.random().toString(36).substring(7),
      ...createReturnPolicyDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.returnPolicies.push(policy);

    this.logger.log(`Return policy created: ${policy.id}`);

    return policy;
  }

  async getReturnAnalytics(period: string): Promise<ReturnAnalytics> {
    // Find existing analytics or create new
    let analytics = this.returnAnalytics.find(a => a.period === period);

    if (!analytics) {
      // Calculate analytics from return requests
      const periodReturns = this.returnRequests.filter(r => {
        const returnMonth = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`;
        return returnMonth === period;
      });

      const totalReturns = periodReturns.length;
      const totalRefunds = this.refunds.filter(r => {
        const refundMonth = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`;
        return refundMonth === period;
      }).length;
      const totalExchanges = this.exchanges.filter(e => {
        const exchangeMonth = `${e.createdAt.getFullYear()}-${String(e.createdAt.getMonth() + 1).padStart(2, '0')}`;
        return exchangeMonth === period;
      }).length;

      analytics = {
        id: Math.random().toString(36).substring(7),
        period,
        totalReturns,
        totalRefunds,
        totalExchanges,
        returnRate: 0, // Would need order data to calculate
        averageRefundAmount: totalRefunds > 0 ? this.refunds.reduce((sum, r) => sum + r.amount, 0) / totalRefunds : 0,
        averageProcessingTime: 0, // Would need to calculate from timestamps
        byReason: {
          wrong_product: periodReturns.filter(r => r.reason.category === 'wrong_product').length,
          damaged: periodReturns.filter(r => r.reason.category === 'damaged').length,
          defective: periodReturns.filter(r => r.reason.category === 'defective').length,
          expired: periodReturns.filter(r => r.reason.category === 'expired').length,
          not_as_described: periodReturns.filter(r => r.reason.category === 'not_as_described').length,
          changed_mind: periodReturns.filter(r => r.reason.category === 'changed_mind').length,
          other: periodReturns.filter(r => r.reason.category === 'other').length,
        },
        byStatus: {
          pending: periodReturns.filter(r => r.status === 'pending').length,
          approved: periodReturns.filter(r => r.status === 'approved').length,
          rejected: periodReturns.filter(r => r.status === 'rejected').length,
          refunded: periodReturns.filter(r => r.status === 'refunded').length,
          cancelled: periodReturns.filter(r => r.status === 'cancelled').length,
        },
        topReturnedProducts: [], // Would need to aggregate from return items
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.returnAnalytics.push(analytics);
    }

    return analytics;
  }
}