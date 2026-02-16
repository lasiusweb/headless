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
import { PaymentIntent, RefundRequest } from '../../../api/src/modules/payments/interfaces/payment.interface';

// Mock data for demonstration purposes
const mockPaymentIntents: PaymentIntent[] = [
  {
    id: '1',
    orderId: 'ORD2023050001',
    customerId: 'CUST-001',
    amount: 6826,
    currency: 'INR',
    status: 'completed',
    paymentMethod: 'card',
    gateway: 'easebuzz',
    gatewayTransactionId: 'TXN001',
    gatewayOrderId: 'EZBZ1234567890',
    createdAt: new Date('2023-05-15T11:00:00'),
    updatedAt: new Date('2023-05-15T11:05:00'),
  },
  {
    id: '2',
    orderId: 'ORD2023050002',
    customerId: 'CUST-002',
    amount: 5664,
    currency: 'INR',
    status: 'completed',
    paymentMethod: 'upi',
    gateway: 'payu',
    gatewayTransactionId: 'TXN002',
    gatewayOrderId: 'PAYU0987654321',
    createdAt: new Date('2023-05-16T15:30:00'),
    updatedAt: new Date('2023-05-16T15:35:00'),
  },
  {
    id: '3',
    orderId: 'ORD2023050003',
    customerId: 'CUST-003',
    amount: 2460,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'net_banking',
    gateway: 'easebuzz',
    gatewayTransactionId: 'TXN003',
    gatewayOrderId: 'EZBZ1122334455',
    failureReason: 'Insufficient funds',
    createdAt: new Date('2023-05-17T09:45:00'),
    updatedAt: new Date('2023-05-17T09:45:00'),
  },
];

const mockRefundRequests: RefundRequest[] = [
  {
    id: '1',
    paymentIntentId: '1',
    orderId: 'ORD2023050001',
    amount: 6826,
    reason: 'Product not as described',
    status: 'processed',
    gatewayRefundId: 'REF001',
    processedAt: new Date('2023-05-18T10:00:00'),
    createdAt: new Date('2023-05-17T14:00:00'),
    updatedAt: new Date('2023-05-18T10:00:00'),
  },
  {
    id: '2',
    paymentIntentId: '2',
    orderId: 'ORD2023050002',
    amount: 5664,
    reason: 'Duplicate order',
    status: 'requested',
    createdAt: new Date('2023-05-19T11:30:00'),
    updatedAt: new Date('2023-05-19T11:30:00'),
  },
];

const PaymentManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentIntent | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    // In a real application, this would fetch from an API
    setPaymentIntents(mockPaymentIntents);
    setRefundRequests(mockRefundRequests);
  }, []);

  const handleInitiateRefund = (payment: PaymentIntent) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount);
    onOpen();
  };

  const confirmRefund = () => {
    if (!selectedPayment) return;

    // In a real application, this would make an API call
    console.log(`Initiating refund for payment ${selectedPayment.id}, amount: ${refundAmount}`);
    
    // Create a new refund request
    const newRefund: RefundRequest = {
      id: Math.random().toString(36).substring(7),
      paymentIntentId: selectedPayment.id,
      orderId: selectedPayment.orderId,
      amount: refundAmount,
      reason: refundReason,
      status: 'requested',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setRefundRequests([...refundRequests, newRefund]);
    
    toast({
      title: 'Refund Request Initiated',
      description: `Refund request for ₹${refundAmount} has been initiated for order ${selectedPayment.orderId}.`,
      status: 'info',
      duration: 5000,
      isClosable: true,
    });

    onClose();
    setRefundAmount(0);
    setRefundReason('');
  };

  const successfulPayments = paymentIntents.filter(p => p.status === 'completed');
  const failedPayments = paymentIntents.filter(p => p.status === 'failed');
  const pendingRefunds = refundRequests.filter(r => r.status === 'requested');

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Payment Management</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {successfulPayments.length} successful, {failedPayments.length} failed
        </Text>
      </Flex>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>All Payments</Tab>
          <Tab>Successful ({successfulPayments.length})</Tab>
          <Tab>Failed ({failedPayments.length})</Tab>
          <Tab>Refunds ({pendingRefunds.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Amount</Th>
                    <Th>Gateway</Th>
                    <Th>Method</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paymentIntents.map((payment) => (
                    <Tr key={payment.id}>
                      <Td fontWeight="medium">{payment.orderId}</Td>
                      <Td>{payment.customerId}</Td>
                      <Td>₹{payment.amount.toLocaleString('en-IN')}</Td>
                      <Td>
                        <Badge colorScheme={payment.gateway === 'easebuzz' ? 'blue' : 'green'}>
                          {payment.gateway}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme="gray">
                          {payment.paymentMethod}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            payment.status === 'completed' ? 'green' :
                            payment.status === 'failed' ? 'red' :
                            payment.status === 'processing' ? 'yellow' : 'gray'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </Td>
                      <Td>{new Date(payment.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        {payment.status === 'completed' && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleInitiateRefund(payment)}
                          >
                            Refund
                          </Button>
                        )}
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
                    <Th>Amount</Th>
                    <Th>Gateway</Th>
                    <Th>Transaction ID</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {successfulPayments.map((payment) => (
                    <Tr key={payment.id}>
                      <Td fontWeight="medium">{payment.orderId}</Td>
                      <Td>{payment.customerId}</Td>
                      <Td>₹{payment.amount.toLocaleString('en-IN')}</Td>
                      <Td>
                        <Badge colorScheme={payment.gateway === 'easebuzz' ? 'blue' : 'green'}>
                          {payment.gateway}
                        </Badge>
                      </Td>
                      <Td>{payment.gatewayTransactionId}</Td>
                      <Td>{new Date(payment.createdAt).toLocaleDateString()}</Td>
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
                    <Th>Amount</Th>
                    <Th>Gateway</Th>
                    <Th>Failure Reason</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {failedPayments.map((payment) => (
                    <Tr key={payment.id}>
                      <Td fontWeight="medium">{payment.orderId}</Td>
                      <Td>{payment.customerId}</Td>
                      <Td>₹{payment.amount.toLocaleString('en-IN')}</Td>
                      <Td>
                        <Badge colorScheme={payment.gateway === 'easebuzz' ? 'blue' : 'green'}>
                          {payment.gateway}
                        </Badge>
                      </Td>
                      <Td>{payment.failureReason || 'Unknown'}</Td>
                      <Td>{new Date(payment.createdAt).toLocaleDateString()}</Td>
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
                    <Th>Amount</Th>
                    <Th>Reason</Th>
                    <Th>Status</Th>
                    <Th>Date Requested</Th>
                    <Th>Processed At</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {refundRequests.map((refund) => (
                    <Tr key={refund.id}>
                      <Td fontWeight="medium">{refund.orderId}</Td>
                      <Td>₹{refund.amount.toLocaleString('en-IN')}</Td>
                      <Td>{refund.reason}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            refund.status === 'processed' ? 'green' :
                            refund.status === 'requested' ? 'yellow' : 'red'
                          }
                        >
                          {refund.status}
                        </Badge>
                      </Td>
                      <Td>{new Date(refund.createdAt).toLocaleDateString()}</Td>
                      <Td>{refund.processedAt ? new Date(refund.processedAt).toLocaleDateString() : 'N/A'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Refund Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Initiate Refund</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPayment && (
              <>
                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Payment Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text><strong>Order:</strong> {selectedPayment.orderId}</Text>
                    <Text><strong>Customer:</strong> {selectedPayment.customerId}</Text>
                    <Text><strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString('en-IN')}</Text>
                    <Text><strong>Gateway:</strong> {selectedPayment.gateway}</Text>
                    <Text><strong>Status:</strong> {selectedPayment.status}</Text>
                  </CardBody>
                </Card>
                
                <FormControl mb={4}>
                  <FormLabel>Refund Amount</FormLabel>
                  <Input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    min={1}
                    max={selectedPayment.amount}
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Refund Reason</FormLabel>
                  <Input
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Enter reason for refund..."
                  />
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={confirmRefund}
              isDisabled={!refundReason.trim() || refundAmount <= 0}
            >
              Initiate Refund
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PaymentManager;