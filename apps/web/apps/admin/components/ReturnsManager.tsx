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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Textarea,
} from '@chakra-ui/react';

// Mock data for demonstration
const mockReturnRequests = [
  {
    id: '1',
    returnNumber: 'RET2023050001',
    orderId: 'ORD2023050001',
    orderNumber: 'ORD2023050001',
    customerId: 'CUST-001',
    customerName: 'Agri Solutions Pvt Ltd',
    customerEmail: 'contact@agrisolutions.com',
    customerPhone: '9876543210',
    items: [
      {
        id: 'item1',
        productId: 'PRD-001',
        productName: 'Organic Neem Cake Fertilizer',
        sku: 'NEEM-CAKE-ORG-1KG',
        quantity: 2,
        unitPrice: 600,
        totalAmount: 1200,
        condition: 'unused' as const,
      },
    ],
    reason: {
      id: 'reason-1',
      category: 'wrong_product' as const,
      description: 'Wrong product received',
    },
    status: 'pending' as const,
    refundMethod: 'original' as const,
    refundAmount: 1200,
    requestedAt: new Date('2023-05-20T10:30:00'),
    createdAt: new Date('2023-05-20T10:30:00'),
    updatedAt: new Date('2023-05-20T10:30:00'),
  },
  {
    id: '2',
    returnNumber: 'RET2023050002',
    orderId: 'ORD2023050002',
    orderNumber: 'ORD2023050002',
    customerId: 'CUST-002',
    customerName: 'Krishi Udyog LLP',
    customerEmail: 'info@krishiuudyog.com',
    customerPhone: '8765432109',
    items: [
      {
        id: 'item1',
        productId: 'PRD-002',
        productName: 'Bio-Zyme Growth Enhancer',
        sku: 'BIO-ZYME-500ML',
        quantity: 1,
        unitPrice: 900,
        totalAmount: 900,
        condition: 'damaged' as const,
      },
    ],
    reason: {
      id: 'reason-2',
      category: 'damaged' as const,
      description: 'Product damaged during shipping',
    },
    status: 'approved' as const,
    refundMethod: 'original' as const,
    refundAmount: 900,
    requestedAt: new Date('2023-05-19T14:20:00'),
    approvedAt: new Date('2023-05-19T16:00:00'),
    createdAt: new Date('2023-05-19T14:20:00'),
    updatedAt: new Date('2023-05-19T16:00:00'),
  },
  {
    id: '3',
    returnNumber: 'RET2023050003',
    orderId: 'ORD2023050003',
    orderNumber: 'ORD2023050003',
    customerId: 'CUST-003',
    customerName: 'Green Farm Supplies',
    customerEmail: 'contact@greenfarms.com',
    customerPhone: '7654321098',
    items: [
      {
        id: 'item1',
        productId: 'PRD-003',
        productName: 'Panchagavya Organic Liquid',
        sku: 'PANCH-GAVYA-2L',
        quantity: 1,
        unitPrice: 480,
        totalAmount: 480,
        condition: 'expired' as const,
      },
    ],
    reason: {
      id: 'reason-4',
      category: 'expired' as const,
      description: 'Product expired or near expiry',
    },
    status: 'refunded' as const,
    refundMethod: 'original' as const,
    refundAmount: 480,
    requestedAt: new Date('2023-05-18T09:15:00'),
    approvedAt: new Date('2023-05-18T10:00:00'),
    refundedAt: new Date('2023-05-19T11:00:00'),
    createdAt: new Date('2023-05-18T09:15:00'),
    updatedAt: new Date('2023-05-19T11:00:00'),
  },
];

const ReturnsManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    // In a real application, this would fetch from an API
    setReturnRequests(mockReturnRequests);
  }, []);

  const handleViewReturn = (returnRequest: any) => {
    setSelectedReturn(returnRequest);
    onOpen();
  };

  const handleApproveReturn = (returnId: string) => {
    setReturnRequests(returnRequests.map(r => 
      r.id === returnId ? { ...r, status: 'approved' as const, approvedAt: new Date() } : r
    ));
    
    toast({
      title: 'Return Approved',
      description: 'Return request has been approved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    onClose();
  };

  const handleRejectReturn = (returnId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setReturnRequests(returnRequests.map(r => 
      r.id === returnId ? { ...r, status: 'rejected' as const, rejectedAt: new Date(), rejectionReason } : r
    ));
    
    toast({
      title: 'Return Rejected',
      description: 'Return request has been rejected.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    onClose();
  };

  const pendingReturns = returnRequests.filter(r => r.status === 'pending');
  const approvedReturns = returnRequests.filter(r => r.status === 'approved');
  const refundedReturns = returnRequests.filter(r => r.status === 'refunded');

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Returns & Refunds Management</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {returnRequests.length} total, {pendingReturns.length} pending
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Returns Overview</Heading>
        </CardHeader>
        <CardBody>
          <StatGroup>
            <Stat>
              <StatLabel>Total Returns</StatLabel>
              <StatNumber>{returnRequests.length}</StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Pending Approval</StatLabel>
              <StatNumber>{pendingReturns.length}</StatNumber>
              <StatHelpText>Requires action</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Refunded</StatLabel>
              <StatNumber>{refundedReturns.length}</StatNumber>
              <StatHelpText>Completed</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Total Refund Amount</StatLabel>
              <StatNumber>₹{returnRequests.filter(r => r.status === 'refunded').reduce((sum, r) => sum + r.refundAmount, 0).toLocaleString('en-IN')}</StatNumber>
              <StatHelpText>Processed refunds</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>All Returns</Tab>
          <Tab>Pending ({pendingReturns.length})</Tab>
          <Tab>Approved ({approvedReturns.length})</Tab>
          <Tab>Refunded ({refundedReturns.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Return #</Th>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Items</Th>
                    <Th>Reason</Th>
                    <Th>Refund Amount</Th>
                    <Th>Status</Th>
                    <Th>Requested At</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {returnRequests.map((returnRequest) => (
                    <Tr key={returnRequest.id}>
                      <Td fontWeight="medium">{returnRequest.returnNumber}</Td>
                      <Td>{returnRequest.orderNumber}</Td>
                      <Td>
                        <Text fontWeight="medium">{returnRequest.customerName}</Text>
                        <Text fontSize="sm" color="gray.500">{returnRequest.customerEmail}</Text>
                      </Td>
                      <Td>{returnRequest.items.length} item(s)</Td>
                      <Td>{returnRequest.reason.description}</Td>
                      <Td>₹{returnRequest.refundAmount.toLocaleString('en-IN')}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            returnRequest.status === 'pending' ? 'yellow' :
                            returnRequest.status === 'approved' ? 'blue' :
                            returnRequest.status === 'refunded' ? 'green' :
                            returnRequest.status === 'rejected' ? 'red' : 'gray'
                          }
                        >
                          {returnRequest.status}
                        </Badge>
                      </Td>
                      <Td>{new Date(returnRequest.requestedAt).toLocaleDateString()}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleViewReturn(returnRequest)}
                        >
                          View
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
                    <Th>Return #</Th>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Reason</Th>
                    <Th>Refund Amount</Th>
                    <Th>Requested At</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingReturns.map((returnRequest) => (
                    <Tr key={returnRequest.id}>
                      <Td fontWeight="medium">{returnRequest.returnNumber}</Td>
                      <Td>{returnRequest.orderNumber}</Td>
                      <Td>{returnRequest.customerName}</Td>
                      <Td>{returnRequest.reason.description}</Td>
                      <Td>₹{returnRequest.refundAmount.toLocaleString('en-IN')}</Td>
                      <Td>{new Date(returnRequest.requestedAt).toLocaleDateString()}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          mr={2}
                          onClick={() => handleViewReturn(returnRequest)}
                        >
                          Review
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
                    <Th>Return #</Th>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Refund Amount</Th>
                    <Th>Approved At</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {approvedReturns.map((returnRequest) => (
                    <Tr key={returnRequest.id}>
                      <Td fontWeight="medium">{returnRequest.returnNumber}</Td>
                      <Td>{returnRequest.orderNumber}</Td>
                      <Td>{returnRequest.customerName}</Td>
                      <Td>₹{returnRequest.refundAmount.toLocaleString('en-IN')}</Td>
                      <Td>{returnRequest.approvedAt ? new Date(returnRequest.approvedAt).toLocaleDateString() : 'N/A'}</Td>
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
                    <Th>Return #</Th>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Refund Amount</Th>
                    <Th>Refunded At</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {refundedReturns.map((returnRequest) => (
                    <Tr key={returnRequest.id}>
                      <Td fontWeight="medium">{returnRequest.returnNumber}</Td>
                      <Td>{returnRequest.orderNumber}</Td>
                      <Td>{returnRequest.customerName}</Td>
                      <Td>₹{returnRequest.refundAmount.toLocaleString('en-IN')}</Td>
                      <Td>{returnRequest.refundedAt ? new Date(returnRequest.refundedAt).toLocaleDateString() : 'N/A'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Return Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {selectedReturn && (
            <>
              <ModalHeader>Return Request Details: {selectedReturn.returnNumber}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Customer Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text><strong>Name:</strong> {selectedReturn.customerName}</Text>
                    <Text><strong>Email:</strong> {selectedReturn.customerEmail}</Text>
                    <Text><strong>Phone:</strong> {selectedReturn.customerPhone}</Text>
                    <Text><strong>Order:</strong> {selectedReturn.orderNumber}</Text>
                  </CardBody>
                </Card>

                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Return Items</Heading>
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
                          <Th>Condition</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedReturn.items.map((item: any) => (
                          <Tr key={item.id}>
                            <Td>{item.productName}</Td>
                            <Td>{item.sku}</Td>
                            <Td>{item.quantity}</Td>
                            <Td>₹{item.unitPrice.toLocaleString('en-IN')}</Td>
                            <Td>₹{item.totalAmount.toLocaleString('en-IN')}</Td>
                            <Td>
                              <Badge colorScheme={
                                item.condition === 'unused' ? 'green' :
                                item.condition === 'damaged' ? 'red' :
                                item.condition === 'defective' ? 'orange' :
                                item.condition === 'expired' ? 'purple' : 'gray'
                              }>
                                {item.condition}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>

                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Return Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text><strong>Reason:</strong> {selectedReturn.reason.description}</Text>
                    <Text><strong>Refund Method:</strong> {selectedReturn.refundMethod}</Text>
                    <Text><strong>Refund Amount:</strong> ₹{selectedReturn.refundAmount.toLocaleString('en-IN')}</Text>
                    <Text><strong>Status:</strong> 
                      <Badge ml={2} colorScheme={
                        selectedReturn.status === 'pending' ? 'yellow' :
                        selectedReturn.status === 'approved' ? 'blue' :
                        selectedReturn.status === 'refunded' ? 'green' :
                        selectedReturn.status === 'rejected' ? 'red' : 'gray'
                      }>
                        {selectedReturn.status}
                      </Badge>
                    </Text>
                    <Text><strong>Requested At:</strong> {new Date(selectedReturn.requestedAt).toLocaleString()}</Text>
                    {selectedReturn.approvedAt && (
                      <Text><strong>Approved At:</strong> {new Date(selectedReturn.approvedAt).toLocaleString()}</Text>
                    )}
                    {selectedReturn.refundedAt && (
                      <Text><strong>Refunded At:</strong> {new Date(selectedReturn.refundedAt).toLocaleString()}</Text>
                    )}
                    {selectedReturn.rejectionReason && (
                      <Text><strong>Rejection Reason:</strong> {selectedReturn.rejectionReason}</Text>
                    )}
                  </CardBody>
                </Card>

                {selectedReturn.status === 'pending' && (
                  <Card>
                    <CardHeader>
                      <Heading size="sm">Action Required</Heading>
                    </CardHeader>
                    <CardBody>
                      <FormControl mb={4}>
                        <FormLabel>Rejection Reason (if rejecting)</FormLabel>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          rows={3}
                        />
                      </FormControl>
                    </CardBody>
                  </Card>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Close
                </Button>
                {selectedReturn.status === 'pending' && (
                  <>
                    <Button
                      colorScheme="red"
                      mr={3}
                      onClick={() => handleRejectReturn(selectedReturn.id)}
                    >
                      Reject
                    </Button>
                    <Button
                      colorScheme="green"
                      onClick={() => handleApproveReturn(selectedReturn.id)}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReturnsManager;