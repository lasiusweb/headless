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
import { Invoice } from '../../../api/src/modules/invoices/interfaces/invoice.interface';

// Mock data for demonstration purposes
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV2023050001',
    orderId: 'ORD2023050001',
    customerId: 'CUST-001',
    customerType: 'dealer',
    customerInfo: {
      name: 'Agri Solutions Pvt Ltd',
      email: 'contact@agrisolutions.com',
      phone: '9876543210',
      gstin: '12ABCDE1234PZ',
    },
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
    items: [
      {
        id: 'item1',
        productId: 'PRD-001',
        productName: 'Organic Neem Cake Fertilizer',
        sku: 'NEEM-CAKE-ORG-1KG',
        hsnCode: '31010010',
        quantity: 5,
        unitPrice: 600,
        discountPercentage: 0,
        taxableValue: 3000,
        gstRate: 18,
        gstAmount: 540,
        total: 3540,
      },
      {
        id: 'item2',
        productId: 'PRD-002',
        productName: 'Bio-Zyme Growth Enhancer',
        sku: 'BIO-ZYME-500ML',
        hsnCode: '38089090',
        quantity: 3,
        unitPrice: 900,
        discountPercentage: 0,
        taxableValue: 2700,
        gstRate: 18,
        gstAmount: 486,
        total: 3186,
      }
    ],
    subtotal: 5700,
    cgst: 513, // 9% of taxable value for intra-state
    sgst: 513, // 9% of taxable value for intra-state
    igst: 0,   // 0 for intra-state
    taxAmount: 1026,
    discount: 0,
    shippingCost: 100,
    total: 6826,
    currency: 'INR',
    gstin: '12ABCDE1234PZ',
    supplyPlace: 'KA',
    invoiceDate: new Date('2023-05-15'),
    dueDate: new Date('2023-06-15'),
    status: 'generated',
    generatedBy: 'system',
    createdAt: new Date('2023-05-15T12:00:00'),
    updatedAt: new Date('2023-05-15T12:00:00'),
  },
  {
    id: '2',
    invoiceNumber: 'INV2023050002',
    orderId: 'ORD2023050002',
    customerId: 'CUST-002',
    customerType: 'distributor',
    customerInfo: {
      name: 'Krishi Udyog LLP',
      email: 'info@krishiuudyog.com',
      phone: '8765432109',
      gstin: '27ABCDE1234PZ',
    },
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
    items: [
      {
        id: 'item1',
        productId: 'PRD-003',
        productName: 'Panchagavya Organic Liquid',
        sku: 'PANCH-GAVYA-2L',
        hsnCode: '31010090',
        quantity: 10,
        unitPrice: 480,
        discountPercentage: 0,
        taxableValue: 4800,
        gstRate: 18,
        gstAmount: 864,
        total: 5664,
      }
    ],
    subtotal: 4800,
    cgst: 432, // 9% of taxable value for intra-state
    sgst: 432, // 9% of taxable value for intra-state
    igst: 0,   // 0 for intra-state
    taxAmount: 864,
    discount: 0,
    shippingCost: 0,
    total: 5664,
    currency: 'INR',
    gstin: '27ABCDE1234PZ',
    supplyPlace: 'MH',
    invoiceDate: new Date('2023-05-16'),
    dueDate: new Date('2023-06-16'),
    status: 'sent',
    sentAt: new Date('2023-05-16T14:30:00'),
    generatedBy: 'system',
    createdAt: new Date('2023-05-16T10:00:00'),
    updatedAt: new Date('2023-05-16T14:30:00'),
  },
  {
    id: '3',
    invoiceNumber: 'INV2023050003',
    orderId: 'ORD2023050003',
    customerId: 'CUST-003',
    customerType: 'retailer',
    customerInfo: {
      name: 'Green Farm Supplies',
      email: 'contact@greenfarms.com',
      phone: '7654321098',
      gstin: '12ABCDE5678QZ',
    },
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
    items: [
      {
        id: 'item1',
        productId: 'PRD-001',
        productName: 'Organic Neem Cake Fertilizer',
        sku: 'NEEM-CAKE-ORG-1KG',
        hsnCode: '31010010',
        quantity: 2,
        unitPrice: 1000,
        discountPercentage: 0,
        taxableValue: 2000,
        gstRate: 18,
        gstAmount: 360,
        total: 2360,
      }
    ],
    subtotal: 2000,
    cgst: 180, // 9% of taxable value for intra-state
    sgst: 180, // 9% of taxable value for intra-state
    igst: 0,   // 0 for intra-state
    taxAmount: 360,
    discount: 0,
    shippingCost: 100,
    total: 2460,
    currency: 'INR',
    gstin: '12ABCDE5678QZ',
    supplyPlace: 'TS',
    invoiceDate: new Date('2023-05-17'),
    dueDate: new Date('2023-06-17'),
    status: 'paid',
    paidAt: new Date('2023-05-18T09:15:00'),
    generatedBy: 'system',
    createdAt: new Date('2023-05-17T08:30:00'),
    updatedAt: new Date('2023-05-18T09:15:00'),
  },
];

const InvoiceManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    // In a real application, this would fetch from an API
    setInvoices(mockInvoices);
  }, []);

  const handleUpdateStatus = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setNewStatus(invoice.status);
    onOpen();
  };

  const confirmStatusUpdate = () => {
    if (!selectedInvoice) return;

    // In a real application, this would make an API call
    console.log(`Updating status for invoice ${selectedInvoice.id} to ${newStatus}`);
    
    // Update the invoice status
    const updatedInvoices = invoices.map(invoice => {
      if (invoice.id === selectedInvoice.id) {
        return {
          ...invoice,
          status: newStatus as any,
          updatedAt: new Date(),
        };
      }
      return invoice;
    });

    setInvoices(updatedInvoices);
    
    toast({
      title: 'Invoice Status Updated',
      description: `Invoice ${selectedInvoice.invoiceNumber} has been updated to ${newStatus}.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    onClose();
  };

  const generatedInvoices = invoices.filter(inv => inv.status === 'generated');
  const sentInvoices = invoices.filter(inv => inv.status === 'sent');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Invoice Management</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {invoices.length} invoices, {paidInvoices.length} paid
        </Text>
      </Flex>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>All Invoices</Tab>
          <Tab>Generated ({generatedInvoices.length})</Tab>
          <Tab>Sent ({sentInvoices.length})</Tab>
          <Tab>Paid ({paidInvoices.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Invoice #</Th>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Amount</Th>
                    <Th>GST</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Due Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {invoices.map((invoice) => (
                    <Tr key={invoice.id}>
                      <Td fontWeight="medium">{invoice.invoiceNumber}</Td>
                      <Td>{invoice.orderId}</Td>
                      <Td>{invoice.customerInfo.name}</Td>
                      <Td>₹{invoice.total.toLocaleString('en-IN')}</Td>
                      <Td>₹{invoice.taxAmount.toLocaleString('en-IN')}</Td>
                      <Td>{new Date(invoice.invoiceDate).toLocaleDateString()}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            invoice.status === 'paid' ? 'green' :
                            invoice.status === 'sent' ? 'blue' :
                            invoice.status === 'generated' ? 'yellow' :
                            'gray'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </Td>
                      <Td>{new Date(invoice.dueDate).toLocaleDateString()}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleUpdateStatus(invoice)}
                        >
                          Update
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
                    <Th>Invoice #</Th>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Amount</Th>
                    <Th>Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {generatedInvoices.map((invoice) => (
                    <Tr key={invoice.id}>
                      <Td fontWeight="medium">{invoice.invoiceNumber}</Td>
                      <Td>{invoice.orderId}</Td>
                      <Td>{invoice.customerInfo.name}</Td>
                      <Td>₹{invoice.total.toLocaleString('en-IN')}</Td>
                      <Td>{new Date(invoice.invoiceDate).toLocaleDateString()}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleUpdateStatus(invoice)}
                        >
                          Update
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
                    <Th>Invoice #</Th>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Amount</Th>
                    <Th>Sent Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sentInvoices.map((invoice) => (
                    <Tr key={invoice.id}>
                      <Td fontWeight="medium">{invoice.invoiceNumber}</Td>
                      <Td>{invoice.orderId}</Td>
                      <Td>{invoice.customerInfo.name}</Td>
                      <Td>₹{invoice.total.toLocaleString('en-IN')}</Td>
                      <Td>{invoice.sentAt ? new Date(invoice.sentAt).toLocaleDateString() : 'N/A'}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleUpdateStatus(invoice)}
                        >
                          Update
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
                    <Th>Invoice #</Th>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Amount</Th>
                    <Th>Paid Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paidInvoices.map((invoice) => (
                    <Tr key={invoice.id}>
                      <Td fontWeight="medium">{invoice.invoiceNumber}</Td>
                      <Td>{invoice.orderId}</Td>
                      <Td>{invoice.customerInfo.name}</Td>
                      <Td>₹{invoice.total.toLocaleString('en-IN')}</Td>
                      <Td>{invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'N/A'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Update Status Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Invoice Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedInvoice && (
              <>
                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Invoice Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text><strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}</Text>
                    <Text><strong>Order #:</strong> {selectedInvoice.orderId}</Text>
                    <Text><strong>Customer:</strong> {selectedInvoice.customerInfo.name}</Text>
                    <Text><strong>Total Amount:</strong> ₹{selectedInvoice.total.toLocaleString('en-IN')}</Text>
                    <Text><strong>Current Status:</strong> {selectedInvoice.status}</Text>
                  </CardBody>
                </Card>
                
                <FormControl mb={4}>
                  <FormLabel>New Status</FormLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="generated">Generated</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={confirmStatusUpdate}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InvoiceManager;