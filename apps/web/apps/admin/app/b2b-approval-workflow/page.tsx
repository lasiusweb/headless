'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
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
  Flex,
  Spacer,
  Text,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';

// Mock data for B2B orders requiring approval
const mockB2BOrders = [
  {
    id: '1',
    orderNumber: 'ORD2023050001',
    customerId: 'CUST-001',
    customerName: 'Agri Solutions Pvt Ltd',
    customerType: 'dealer',
    items: [
      {
        id: 'item1',
        productId: 'PRD-001',
        productName: 'Organic Neem Cake Fertilizer',
        sku: 'NEEM-CAKE-ORG-1KG',
        quantity: 5,
        unitPrice: 600,
        total: 3000,
      },
      {
        id: 'item2',
        productId: 'PRD-002',
        productName: 'Bio-Zyme Growth Enhancer',
        sku: 'BIO-ZYME-500ML',
        quantity: 3,
        unitPrice: 900,
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
    requestedBy: 'Rajesh Kumar',
    requestedByEmail: 'rajesh@agrisolutions.com',
    requestedAt: new Date('2023-05-15T10:30:00'),
    createdAt: new Date('2023-05-15T10:30:00'),
    updatedAt: new Date('2023-05-15T10:30:00'),
  },
  {
    id: '2',
    orderNumber: 'ORD2023050002',
    customerId: 'CUST-002',
    customerName: 'Krishi Udyog LLP',
    customerType: 'distributor',
    items: [
      {
        id: 'item1',
        productId: 'PRD-003',
        productName: 'Panchagavya Organic Liquid',
        sku: 'PANCH-GAVYA-2L',
        quantity: 10,
        unitPrice: 480,
        total: 4800,
      }
    ],
    status: 'pending_approval',
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
    paymentStatus: 'pending',
    requestedBy: 'Priya Sharma',
    requestedByEmail: 'priya@krishiuudyog.com',
    requestedAt: new Date('2023-05-16T14:20:00'),
    createdAt: new Date('2023-05-16T14:20:00'),
    updatedAt: new Date('2023-05-16T14:20:00'),
  },
];

const B2BApprovalWorkflow: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    // In a real application, this would fetch from an API
    setOrders(mockB2BOrders);
  }, []);

  const handleReview = (order: any, action: 'approve' | 'reject') => {
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

  const pendingOrders = orders.filter((order: any) => order.status === 'pending_approval');

  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">B2B Order Approval Workflow</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {pendingOrders.length} pending approvals
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Approval Process Overview</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>
            The B2B approval workflow ensures that orders from dealers and distributors are reviewed before processing.
            Orders from retailers are auto-approved, while dealer and distributor orders require manual approval.
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>User Type</Th>
                <Th>Approval Requirement</Th>
                <Th>Discount Applied</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td><Badge colorScheme="green">Retailer</Badge></Td>
                <Td>Auto-approved</Td>
                <Td>0% (MRP)</Td>
              </Tr>
              <Tr>
                <Td><Badge colorScheme="blue">Dealer</Badge></Td>
                <Td>Manual approval required</Td>
                <Td>40% off MRP</Td>
              </Tr>
              <Tr>
                <Td><Badge colorScheme="purple">Distributor</Badge></Td>
                <Td>Manual approval required</Td>
                <Td>55% off MRP</Td>
              </Tr>
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading size="md">Pending B2B Orders</Heading>
        </CardHeader>
        <CardBody>
          <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Order #</Th>
                  <Th>Customer</Th>
                  <Th>Contact</Th>
                  <Th>Items</Th>
                  <Th>Total</Th>
                  <Th>Requested At</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pendingOrders.map((order) => (
                  <Tr key={order.id}>
                    <Td fontWeight="medium">{order.orderNumber}</Td>
                    <Td>
                      <Text fontWeight="bold">{order.customerName}</Text>
                      <Text fontSize="sm" color="gray.500">{order.customerId}</Text>
                    </Td>
                    <Td>
                      <Text>{order.requestedBy}</Text>
                      <Text fontSize="sm" color="gray.500">{order.requestedByEmail}</Text>
                    </Td>
                    <Td>{order.items.length} items</Td>
                    <Td>₹{order.total.toLocaleString('en-IN')}</Td>
                    <Td>{new Date(order.requestedAt).toLocaleDateString()}</Td>
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
        </CardBody>
      </Card>

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
                    <Heading size="sm">Customer Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text><strong>Name:</strong> {selectedOrder.customerName}</Text>
                    <Text><strong>Customer ID:</strong> {selectedOrder.customerId}</Text>
                    <Text><strong>Contact:</strong> {selectedOrder.requestedBy} ({selectedOrder.requestedByEmail})</Text>
                    <Text><strong>Type:</strong> 
                      <Badge ml={2} colorScheme={selectedOrder.customerType === 'dealer' ? 'blue' : 'purple'}>
                        {selectedOrder.customerType}
                      </Badge>
                    </Text>
                  </CardBody>
                </Card>
                
                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Order Summary</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text><strong>Total:</strong> ₹{selectedOrder.total.toLocaleString('en-IN')}</Text>
                    <Text><strong>Items:</strong> {selectedOrder.items.length}</Text>
                    <Text><strong>Discount Applied:</strong> 
                      {selectedOrder.customerType === 'dealer' ? '40% off MRP' : 
                       selectedOrder.customerType === 'distributor' ? '55% off MRP' : '0%'}
                    </Text>
                    <Text><strong>Requested At:</strong> {new Date(selectedOrder.requestedAt).toLocaleString()}</Text>
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
                        {selectedOrder.items.map((item: any) => (
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
                    <FormControl>
                      <FormLabel>Rejection Reason</FormLabel>
                      <Input
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide reason for rejection..."
                      />
                    </FormControl>
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
    </Container>
  );
};

export default B2BApprovalWorkflow;