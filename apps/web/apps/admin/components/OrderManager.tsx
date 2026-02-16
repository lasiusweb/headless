'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Select,
  Flex,
  Spacer,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { Order } from '../../../api/src/modules/orders/interfaces/order.interface';

// Mock data for demonstration purposes
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD2023050001',
    customerId: 'CUST-001',
    customerType: 'dealer',
    items: [
      {
        id: 'item1',
        productId: 'PRD-001',
        productName: 'Organic Neem Cake Fertilizer',
        sku: 'NEEM-CAKE-ORG-1KG',
        quantity: 5,
        unitPrice: 600,
        discountPercentage: 0,
        taxRate: 18,
        total: 3000,
      },
      {
        id: 'item2',
        productId: 'PRD-002',
        productName: 'Bio-Zyme Growth Enhancer',
        sku: 'BIO-ZYME-500ML',
        quantity: 3,
        unitPrice: 900,
        discountPercentage: 0,
        taxRate: 18,
        total: 2700,
      }
    ],
    status: 'pending_approval',
    pricingTier: 'dealer',
    subtotal: 5700,
    tax: 1026,
    discount: 0,
    shippingCost: 100,
    total: 6826,
    currency: 'INR',
    billingAddress: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    },
    shippingAddress: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    },
    paymentStatus: 'pending',
    notes: 'Urgent delivery required',
    createdAt: new Date('2023-05-15T10:30:00'),
    updatedAt: new Date('2023-05-15T10:30:00'),
  },
  {
    id: '2',
    orderNumber: 'ORD2023050002',
    customerId: 'CUST-002',
    customerType: 'distributor',
    items: [
      {
        id: 'item1',
        productId: 'PRD-003',
        productName: 'Panchagavya Organic Liquid',
        sku: 'PANCH-GAVYA-2L',
        quantity: 10,
        unitPrice: 480,
        discountPercentage: 0,
        taxRate: 18,
        total: 4800,
      }
    ],
    status: 'approved',
    pricingTier: 'distributor',
    subtotal: 4800,
    tax: 864,
    discount: 0,
    shippingCost: 0,
    total: 5664,
    currency: 'INR',
    billingAddress: {
      street: '456 Agriculture Lane',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
    },
    shippingAddress: {
      street: '456 Agriculture Lane',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
    },
    paymentStatus: 'paid',
    createdAt: new Date('2023-05-16T14:20:00'),
    updatedAt: new Date('2023-05-16T16:45:00'),
  },
  {
    id: '3',
    orderNumber: 'ORD2023050003',
    customerId: 'CUST-003',
    customerType: 'retailer',
    items: [
      {
        id: 'item1',
        productId: 'PRD-001',
        productName: 'Organic Neem Cake Fertilizer',
        sku: 'NEEM-CAKE-ORG-1KG',
        quantity: 2,
        unitPrice: 1000,
        discountPercentage: 0,
        taxRate: 18,
        total: 2000,
      }
    ],
    status: 'shipped',
    pricingTier: 'retailer',
    subtotal: 2000,
    tax: 360,
    discount: 0,
    shippingCost: 100,
    total: 2460,
    currency: 'INR',
    billingAddress: {
      street: '789 Farm Street',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      country: 'India',
    },
    shippingAddress: {
      street: '789 Farm Street',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      country: 'India',
    },
    paymentStatus: 'paid',
    shippedAt: new Date('2023-05-17T09:15:00'),
    createdAt: new Date('2023-05-17T08:30:00'),
    updatedAt: new Date('2023-05-17T09:15:00'),
  },
];

const OrderManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    // In a real application, this would fetch from an API
    setOrders(mockOrders);
  }, []);

  const handleReview = (order: Order, action: 'approve' | 'reject') => {
    setSelectedOrder(order);
    setAction(action);
    onOpen();
  };

  const confirmAction = () => {
    if (!selectedOrder || !action) return;

    // In a real application, this would make an API call
    console.log(`${action} order ${selectedOrder.orderNumber}`);
    
    // Update the order status
    const updatedOrders = orders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          status: action === 'approve' ? 'approved' : 'rejected',
          ...(action === 'approve' && { approvedAt: new Date(), approvedBy: 'current-admin-id' }),
          ...(action === 'reject' && { 
            rejectedAt: new Date(), 
            rejectedBy: 'current-admin-id',
            rejectionReason: rejectionReason || 'Not specified'
          })
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    
    toast({
      title: action === 'approve' ? 'Order Approved' : 'Order Rejected',
      description: `Order ${selectedOrder.orderNumber} has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
      status: action === 'approve' ? 'success' : 'error',
      duration: 5000,
      isClosable: true,
    });

    onClose();
    setRejectionReason('');
  };

  const pendingOrders = orders.filter(order => order.status === 'pending_approval');
  const approvedOrders = orders.filter(order => order.status === 'approved');
  const shippedOrders = orders.filter(order => order.status === 'shipped');

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Order Management</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {pendingOrders.length} pending approvals
        </Text>
      </Flex>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Pending Approvals ({pendingOrders.length})</Tab>
          <Tab>Approved Orders ({approvedOrders.length})</Tab>
          <Tab>Shipped Orders ({shippedOrders.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Items</Th>
                    <Th>Total</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td fontWeight="medium">{order.orderNumber}</Td>
                      <Td>{order.customerId}</Td>
                      <Td>{order.items.length} items</Td>
                      <Td>₹{order.total.toLocaleString('en-IN')}</Td>
                      <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <Badge colorScheme="yellow">Pending Approval</Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="green"
                          mr={2}
                          onClick={() => handleReview(order, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleReview(order, 'reject')}
                        >
                          Reject
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Items</Th>
                    <Th>Total</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Payment</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {approvedOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td fontWeight="medium">{order.orderNumber}</Td>
                      <Td>{order.customerId}</Td>
                      <Td>{order.items.length} items</Td>
                      <Td>₹{order.total.toLocaleString('en-IN')}</Td>
                      <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <Badge colorScheme="green">Approved</Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={order.paymentStatus === 'paid' ? 'green' : 'yellow'}>
                          {order.paymentStatus}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Items</Th>
                    <Th>Total</Th>
                    <Th>Shipped Date</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {shippedOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td fontWeight="medium">{order.orderNumber}</Td>
                      <Td>{order.customerId}</Td>
                      <Td>{order.items.length} items</Td>
                      <Td>₹{order.total.toLocaleString('en-IN')}</Td>
                      <Td>{order.shippedAt ? new Date(order.shippedAt!).toLocaleDateString() : 'N/A'}</Td>
                      <Td>
                        <Badge colorScheme="blue">Shipped</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {action === 'approve' ? 'Approve Order' : 'Reject Order'} - {selectedOrder?.orderNumber}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <>
                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Order Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text><strong>Customer:</strong> {selectedOrder.customerId}</Text>
                    <Text><strong>Customer Type:</strong> {selectedOrder.customerType}</Text>
                    <Text><strong>Total:</strong> ₹{selectedOrder.total.toLocaleString('en-IN')}</Text>
                    <Text><strong>Items:</strong> {selectedOrder.items.length}</Text>
                  </CardBody>
                </Card>
                
                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Order Items</Heading>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Product</Th>
                          <Th>SKU</Th>
                          <Th>Qty</Th>
                          <Th>Unit Price</Th>
                          <Th>Total</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedOrder.items.map(item => (
                          <Tr key={item.id}>
                            <Td>{item.productName}</Td>
                            <Td>{item.sku}</Td>
                            <Td>{item.quantity}</Td>
                            <Td>₹{item.unitPrice.toLocaleString('en-IN')}</Td>
                            <Td>₹{item.total.toLocaleString('en-IN')}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
                
                {action === 'reject' && (
                  <Box mt={4}>
                    <label htmlFor="rejection-reason" style={{ display: 'block', marginBottom: '4px' }}>
                      Rejection Reason:
                    </label>
                    <textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                      }}
                      rows={3}
                      placeholder="Provide reason for rejection..."
                    />
                  </Box>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme={action === 'approve' ? 'green' : 'red'} 
              onClick={confirmAction}
            >
              {action === 'approve' ? 'Approve Order' : 'Reject Order'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OrderManager;