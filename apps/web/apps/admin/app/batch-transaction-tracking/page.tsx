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
  Flex,
  Spacer,
  Text,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';

// Mock data for inventory transactions
const mockInventoryTransactions = [
  {
    id: '1',
    inventoryItemId: 'INV-001',
    batchId: 'BAT-001',
    transactionType: 'receipt',
    quantity: 100,
    referenceId: 'PO-2023-001',
    notes: 'Received new shipment',
    processedBy: 'John Doe',
    processedAt: new Date('2023-05-15T10:30:00'),
    createdAt: new Date('2023-05-15T10:30:00'),
  },
  {
    id: '2',
    inventoryItemId: 'INV-002',
    batchId: 'BAT-002',
    transactionType: 'allocation',
    quantity: 50,
    referenceId: 'ORD-2023-001',
    notes: 'Allocated for order fulfillment',
    processedBy: 'Jane Smith',
    processedAt: new Date('2023-05-16T14:20:00'),
    createdAt: new Date('2023-05-16T14:20:00'),
  },
  {
    id: '3',
    inventoryItemId: 'INV-001',
    batchId: 'BAT-001',
    transactionType: 'consumption',
    quantity: 30,
    referenceId: 'ORD-2023-002',
    notes: 'Consumed for order shipment',
    processedBy: 'John Doe',
    processedAt: new Date('2023-05-17T09:15:00'),
    createdAt: new Date('2023-05-17T09:15:00'),
  },
  {
    id: '4',
    inventoryItemId: 'INV-003',
    batchId: 'BAT-003',
    transactionType: 'adjustment',
    quantity: 5,
    referenceId: 'ADJ-2023-001',
    notes: 'Physical count adjustment',
    processedBy: 'Admin User',
    processedAt: new Date('2023-05-18T11:45:00'),
    createdAt: new Date('2023-05-18T11:45:00'),
  },
];

// Mock data for inventory batches
const mockInventoryBatches = [
  {
    id: 'BAT-001',
    inventoryItemId: 'INV-001',
    batchNumber: 'BN-2023-001',
    manufacturingDate: new Date('2023-04-01'),
    expiryDate: new Date('2025-04-01'),
    receivedDate: new Date('2023-05-15'),
    quantity: 100,
    supplierId: 'SUP-001',
    costPerUnit: 250,
    status: 'in-stock' as const,
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
  },
  {
    id: 'BAT-002',
    inventoryItemId: 'INV-002',
    batchNumber: 'BN-2023-002',
    manufacturingDate: new Date('2023-03-15'),
    expiryDate: new Date('2024-03-15'),
    receivedDate: new Date('2023-05-10'),
    quantity: 200,
    supplierId: 'SUP-002',
    costPerUnit: 450,
    status: 'allocated' as const,
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-05-16'),
  },
  {
    id: 'BAT-003',
    inventoryItemId: 'INV-003',
    batchNumber: 'BN-2023-003',
    manufacturingDate: new Date('2023-05-01'),
    expiryDate: new Date('2026-05-01'),
    receivedDate: new Date('2023-05-18'),
    quantity: 150,
    supplierId: 'SUP-001',
    costPerUnit: 180,
    status: 'in-stock' as const,
    createdAt: new Date('2023-05-18'),
    updatedAt: new Date('2023-05-18'),
  },
];

const BatchAndTransactionPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // In a real application, this would fetch from an API
    setTransactions(mockInventoryTransactions);
    setBatches(mockInventoryBatches);
  }, []);

  const expiredBatches = batches.filter(
    batch => batch.expiryDate && new Date(batch.expiryDate) < new Date() && batch.status !== 'expired'
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Batch & Transaction Tracking</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          Track inventory movements and batch information
        </Text>
      </Flex>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Inventory Transactions</Tab>
          <Tab>Batch Tracking</Tab>
          <Tab>Expiring Soon ({expiredBatches.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardBody>
                <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>ID</Th>
                        <Th>Item ID</Th>
                        <Th>Type</Th>
                        <Th>Quantity</Th>
                        <Th>Reference</Th>
                        <Th>Processed By</Th>
                        <Th>Date</Th>
                        <Th>Notes</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {transactions.map((transaction) => (
                        <Tr key={transaction.id}>
                          <Td fontWeight="medium">{transaction.id}</Td>
                          <Td>{transaction.inventoryItemId}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                transaction.transactionType === 'receipt' ? 'green' :
                                transaction.transactionType === 'allocation' ? 'blue' :
                                transaction.transactionType === 'consumption' ? 'orange' :
                                transaction.transactionType === 'adjustment' ? 'purple' :
                                'red'
                              }
                            >
                              {transaction.transactionType}
                            </Badge>
                          </Td>
                          <Td>{transaction.quantity}</Td>
                          <Td>{transaction.referenceId}</Td>
                          <Td>{transaction.processedBy}</Td>
                          <Td>{new Date(transaction.processedAt).toLocaleDateString()}</Td>
                          <Td>{transaction.notes}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardBody>
                <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Batch #</Th>
                        <Th>Item ID</Th>
                        <Th>Manufacturing Date</Th>
                        <Th>Expiry Date</Th>
                        <Th>Received Date</Th>
                        <Th>Quantity</Th>
                        <Th>Supplier</Th>
                        <Th>Status</Th>
                        <Th>Cost/Unit</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {batches.map((batch) => (
                        <Tr 
                          key={batch.id}
                          bg={batch.expiryDate && new Date(batch.expiryDate) < new Date() && batch.status !== 'expired' ? 'rgba(255, 0, 0, 0.1)' : 'transparent'}
                        >
                          <Td fontWeight="medium">{batch.batchNumber}</Td>
                          <Td>{batch.inventoryItemId}</Td>
                          <Td>{batch.manufacturingDate ? new Date(batch.manufacturingDate).toLocaleDateString() : '-'}</Td>
                          <Td>{batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : '-'}</Td>
                          <Td>{new Date(batch.receivedDate).toLocaleDateString()}</Td>
                          <Td>{batch.quantity}</Td>
                          <Td>{batch.supplierId}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                batch.status === 'in-stock' ? 'green' :
                                batch.status === 'allocated' ? 'blue' :
                                batch.status === 'reserved' ? 'yellow' :
                                batch.status === 'expired' ? 'red' : 'gray'
                              }
                            >
                              {batch.status}
                            </Badge>
                          </Td>
                          <Td>₹{batch.costPerUnit.toLocaleString('en-IN')}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardBody>
                <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Batch #</Th>
                        <Th>Item ID</Th>
                        <Th>Expiry Date</Th>
                        <Th>Days Remaining</Th>
                        <Th>Quantity</Th>
                        <Th>Status</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {expiredBatches.map((batch) => {
                        const expiryDate = new Date(batch.expiryDate);
                        const today = new Date();
                        const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <Tr key={batch.id}>
                            <Td fontWeight="medium">{batch.batchNumber}</Td>
                            <Td>{batch.inventoryItemId}</Td>
                            <Td>{expiryDate.toLocaleDateString()}</Td>
                            <Td>
                              <Badge colorScheme={daysRemaining < 0 ? 'red' : daysRemaining < 7 ? 'orange' : 'yellow'}>
                                {daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`}
                              </Badge>
                            </Td>
                            <Td>{batch.quantity}</Td>
                            <Td>
                              <Badge colorScheme="red">Expiring Soon</Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme="blue">Review Required</Badge>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default BatchAndTransactionPage;