import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { InventoryService } from '../inventory/inventory.service';
import { PricingService } from '../pricing/pricing.service';
import { CreateOrderDto, ApproveOrderDto, RejectOrderDto, ShipOrderDto } from './dto/order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let inventoryService: InventoryService;
  let pricingService: PricingService;

  const mockInventoryService = {
    createStockReservation: jest.fn(),
  };

  const mockPricingService = {
    getUserPricingTier: jest.fn(),
    calculatePrice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
        {
          provide: PricingService,
          useValue: mockPricingService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    inventoryService = module.get<InventoryService>(InventoryService);
    pricingService = module.get<PricingService>(PricingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order with auto-approval for retailers', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 'customer-123',
        customerType: 'retailer',
        items: [
          { productId: 'product-1', quantity: 2, discountPercentage: 0, taxRate: 18 },
        ],
        billingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        shippingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
      };

      mockPricingService.getUserPricingTier.mockResolvedValue({
        userId: 'customer-123',
        userType: 'retailer',
        effectiveDate: new Date(),
      });

      mockPricingService.calculatePrice.mockResolvedValue(100);

      const result = await service.createOrder(createOrderDto);

      expect(result).toBeDefined();
      expect(result.status).toBe('approved'); // Retailers auto-approved
      expect(result.customerId).toBe('customer-123');
      expect(mockInventoryService.createStockReservation).toHaveBeenCalled();
    });

    it('should create an order with pending approval for dealers', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 'dealer-123',
        customerType: 'dealer',
        items: [
          { productId: 'product-1', quantity: 5, discountPercentage: 0, taxRate: 18 },
        ],
        billingAddress: {
          street: '456 Market St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
        },
        shippingAddress: {
          street: '456 Market St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
        },
      };

      mockPricingService.getUserPricingTier.mockResolvedValue({
        userId: 'dealer-123',
        userType: 'dealer',
        effectiveDate: new Date(),
      });

      mockPricingService.calculatePrice.mockResolvedValue(80); // Dealer price

      const result = await service.createOrder(createOrderDto);

      expect(result).toBeDefined();
      expect(result.status).toBe('pending_approval'); // Dealers need approval
      expect(result.customerId).toBe('dealer-123');
      expect(mockInventoryService.createStockReservation).not.toHaveBeenCalled();
    });

    it('should calculate correct pricing with tax and shipping', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 'customer-123',
        customerType: 'retailer',
        items: [
          { productId: 'product-1', quantity: 2, discountPercentage: 0, taxRate: 18 },
        ],
        billingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        shippingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
      };

      mockPricingService.getUserPricingTier.mockResolvedValue({
        userId: 'customer-123',
        userType: 'retailer',
        effectiveDate: new Date(),
      });

      mockPricingService.calculatePrice.mockResolvedValue(100);

      const result = await service.createOrder(createOrderDto);

      expect(result.subtotal).toBe(200); // 2 * 100
      expect(result.tax).toBe(36); // 18% of 200
      expect(result.shippingCost).toBe(0); // Free shipping over ₹5000
      expect(result.total).toBe(236); // 200 + 36
    });
  });

  describe('approveOrder', () => {
    it('should approve a pending order and reserve stock', async () => {
      // First create an order to get it in the system
      const createOrderDto: CreateOrderDto = {
        customerId: 'dealer-123',
        customerType: 'dealer',
        items: [
          { productId: 'product-1', quantity: 5, discountPercentage: 0, taxRate: 18 },
        ],
        billingAddress: {
          street: '456 Market St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
        },
        shippingAddress: {
          street: '456 Market St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
        },
      };

      mockPricingService.getUserPricingTier.mockResolvedValue({
        userId: 'dealer-123',
        userType: 'dealer',
        effectiveDate: new Date(),
      });

      mockPricingService.calculatePrice.mockResolvedValue(80);

      const order = await service.createOrder(createOrderDto);

      // Now approve the order
      const approveOrderDto: ApproveOrderDto = {
        approverId: 'admin-123',
      };

      const approvedOrder = await service.approveOrder(order.id, approveOrderDto);

      expect(approvedOrder.status).toBe('approved');
      expect(approvedOrder.approvedBy).toBe('admin-123');
      expect(mockInventoryService.createStockReservation).toHaveBeenCalled();
    });

    it('should throw error when approving non-pending order', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 'retailer-123',
        customerType: 'retailer',
        items: [
          { productId: 'product-1', quantity: 2, discountPercentage: 0, taxRate: 18 },
        ],
        billingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        shippingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
      };

      mockPricingService.getUserPricingTier.mockResolvedValue({
        userId: 'retailer-123',
        userType: 'retailer',
        effectiveDate: new Date(),
      });

      mockPricingService.calculatePrice.mockResolvedValue(100);

      const order = await service.createOrder(createOrderDto);

      // Try to approve an already approved order
      const approveOrderDto: ApproveOrderDto = {
        approverId: 'admin-123',
      };

      await expect(service.approveOrder(order.id, approveOrderDto))
        .rejects
        .toThrow('is not in pending approval status');
    });
  });

  describe('rejectOrder', () => {
    it('should reject a pending order', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 'dealer-123',
        customerType: 'dealer',
        items: [
          { productId: 'product-1', quantity: 5, discountPercentage: 0, taxRate: 18 },
        ],
        billingAddress: {
          street: '456 Market St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
        },
        shippingAddress: {
          street: '456 Market St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
        },
      };

      mockPricingService.getUserPricingTier.mockResolvedValue({
        userId: 'dealer-123',
        userType: 'dealer',
        effectiveDate: new Date(),
      });

      mockPricingService.calculatePrice.mockResolvedValue(80);

      const order = await service.createOrder(createOrderDto);

      const rejectOrderDto: RejectOrderDto = {
        approverId: 'admin-123',
        reason: 'Insufficient stock',
      };

      const rejectedOrder = await service.rejectOrder(order.id, rejectOrderDto);

      expect(rejectedOrder.status).toBe('rejected');
      expect(rejectedOrder.rejectedBy).toBe('admin-123');
      expect(rejectedOrder.rejectionReason).toBe('Insufficient stock');
    });
  });

  describe('shipOrder', () => {
    it('should ship an approved order', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 'retailer-123',
        customerType: 'retailer',
        items: [
          { productId: 'product-1', quantity: 2, discountPercentage: 0, taxRate: 18 },
        ],
        billingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        shippingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
      };

      mockPricingService.getUserPricingTier.mockResolvedValue({
        userId: 'retailer-123',
        userType: 'retailer',
        effectiveDate: new Date(),
      });

      mockPricingService.calculatePrice.mockResolvedValue(100);

      const order = await service.createOrder(createOrderDto);

      const shipOrderDto: ShipOrderDto = {
        trackingNumber: 'TRACK123456',
        carrier: 'Delhivery',
      };

      const fulfillment = await service.shipOrder(order.id, shipOrderDto);

      expect(fulfillment).toBeDefined();
      expect(fulfillment.trackingNumber).toBe('TRACK123456');
      expect(fulfillment.carrier).toBe('Delhivery');
    });

    it('should throw error when shipping non-approved order', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 'dealer-123',
        customerType: 'dealer',
        items: [
          { productId: 'product-1', quantity: 5, discountPercentage: 0, taxRate: 18 },
        ],
        billingAddress: {
          street: '456 Market St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
        },
        shippingAddress: {
          street: '456 Market St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
        },
      };

      mockPricingService.getUserPricingTier.mockResolvedValue({
        userId: 'dealer-123',
        userType: 'dealer',
        effectiveDate: new Date(),
      });

      mockPricingService.calculatePrice.mockResolvedValue(80);

      const order = await service.createOrder(createOrderDto);

      const shipOrderDto: ShipOrderDto = {
        trackingNumber: 'TRACK123456',
        carrier: 'Delhivery',
      };

      await expect(service.shipOrder(order.id, shipOrderDto))
        .rejects
        .toThrow('is not in an approved or processing status');
    });
  });

  describe('getOrdersByCustomer', () => {
    it('should return all orders for a customer', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 'customer-123',
        customerType: 'retailer',
        items: [
          { productId: 'product-1', quantity: 2, discountPercentage: 0, taxRate: 18 },
        ],
        billingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        shippingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
      };

      mockPricingService.getUserPricingTier.mockResolvedValue({
        userId: 'customer-123',
        userType: 'retailer',
        effectiveDate: new Date(),
      });

      mockPricingService.calculatePrice.mockResolvedValue(100);

      await service.createOrder(createOrderDto);
      await service.createOrder(createOrderDto);

      const orders = await service.getOrdersByCustomer('customer-123');

      expect(orders.length).toBe(2);
    });
  });

  describe('getOrdersByStatus', () => {
    it('should return orders filtered by status', async () => {
      const retailerOrderDto: CreateOrderDto = {
        customerId: 'retailer-123',
        customerType: 'retailer',
        items: [{ productId: 'product-1', quantity: 2, discountPercentage: 0, taxRate: 18 }],
        billingAddress: { street: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
        shippingAddress: { street: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
      };

      const dealerOrderDto: CreateOrderDto = {
        customerId: 'dealer-123',
        customerType: 'dealer',
        items: [{ productId: 'product-1', quantity: 5, discountPercentage: 0, taxRate: 18 }],
        billingAddress: { street: '456 Market St', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
        shippingAddress: { street: '456 Market St', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
      };

      mockPricingService.getUserPricingTier
        .mockResolvedValueOnce({ userId: 'retailer-123', userType: 'retailer', effectiveDate: new Date() })
        .mockResolvedValueOnce({ userId: 'dealer-123', userType: 'dealer', effectiveDate: new Date() });

      mockPricingService.calculatePrice.mockResolvedValue(100);

      await service.createOrder(retailerOrderDto);
      await service.createOrder(dealerOrderDto);

      const approvedOrders = await service.getOrdersByStatus('approved');
      const pendingOrders = await service.getOrdersByStatus('pending_approval');

      expect(approvedOrders.length).toBe(1);
      expect(pendingOrders.length).toBe(1);
    });
  });

  describe('getPendingApprovals', () => {
    it('should return all orders pending approval', async () => {
      const dealerOrderDto: CreateOrderDto = {
        customerId: 'dealer-123',
        customerType: 'dealer',
        items: [{ productId: 'product-1', quantity: 5, discountPercentage: 0, taxRate: 18 }],
        billingAddress: { street: '456 Market St', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
        shippingAddress: { street: '456 Market St', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
      };

      mockPricingService.getUserPricingTier.mockResolvedValue({
        userId: 'dealer-123',
        userType: 'dealer',
        effectiveDate: new Date(),
      });

      mockPricingService.calculatePrice.mockResolvedValue(80);

      await service.createOrder(dealerOrderDto);

      const pendingApprovals = await service.getPendingApprovals();

      expect(pendingApprovals.length).toBe(1);
      expect(pendingApprovals[0].status).toBe('pending_approval');
    });
  });
});
