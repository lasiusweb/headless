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
  Flex,
  Spacer,
  Text,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  useToast,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

// Mock data for POS transaction analytics
const mockPosTransactions = [
  {
    id: '1',
    sessionId: 'SES-001',
    transactionType: 'sale' as const,
    items: [
      {
        id: 'item1',
        productId: 'PRD-001',
        productName: 'Organic Neem Cake Fertilizer',
        sku: 'NEEM-CAKE-ORG-1KG',
        hsnCode: '31010010',
        quantity: 2,
        unitPrice: 600,
        discountPercentage: 0,
        taxRate: 18,
        total: 1416,
      },
      {
        id: 'item2',
        productId: 'PRD-002',
        productName: 'Bio-Zyme Growth Enhancer',
        sku: 'BIO-ZYME-500ML',
        hsnCode: '38089090',
        quantity: 1,
        unitPrice: 900,
        discountPercentage: 0,
        taxRate: 18,
        total: 1062,
      }
    ],
    subtotal: 2400,
    tax: 432,
    discount: 0,
    total: 2478,
    paymentMethod: 'cash' as const,
    paymentStatus: 'completed' as const,
    customerId: 'CUST-001',
    customerName: 'Rajesh Kumar',
    customerPhone: '9876543210',
    notes: 'Regular customer',
    createdAt: new Date('2023-05-20T10:15:00'),
    updatedAt: new Date('2023-05-20T10:15:00'),
    syncedAt: new Date('2023-05-20T10:30:00'),
    isOffline: false,
  },
  {
    id: '2',
    sessionId: 'SES-002',
    transactionType: 'sale',
    items: [
      {
        id: 'item1',
        productId: 'PRD-003',
        productName: 'Panchagavya Organic Liquid',
        sku: 'PANCH-GAVYA-2L',
        hsnCode: '31010090',
        quantity: 1,
        unitPrice: 480,
        discountPercentage: 0,
        taxRate: 18,
        total: 566.4,
      }
    ],
    subtotal: 480,
    tax: 86.4,
    discount: 0,
    total: 566.4,
    paymentMethod: 'upi' as const,
    paymentStatus: 'completed' as const,
    customerId: 'CUST-002',
    customerName: 'Priya Sharma',
    customerPhone: '8765432109',
    notes: 'First time customer',
    createdAt: new Date('2023-05-20T11:30:00'),
    updatedAt: new Date('2023-05-20T11:30:00'),
    syncedAt: new Date('2023-05-20T11:45:00'),
    isOffline: false,
  },
  {
    id: '3',
    sessionId: 'SES-003',
    transactionType: 'sale',
    items: [
      {
        id: 'item1',
        productId: 'PRD-001',
        productName: 'Organic Neem Cake Fertilizer',
        sku: 'NEEM-CAKE-ORG-1KG',
        hsnCode: '31010010',
        quantity: 5,
        unitPrice: 600,
        discountPercentage: 10, // Special discount for bulk purchase
        taxRate: 18,
        total: 3186,
      }
    ],
    subtotal: 3000,
    tax: 540,
    discount: 300,
    total: 3240,
    paymentMethod: 'card' as const,
    paymentStatus: 'completed' as const,
    customerId: 'CUST-003',
    customerName: 'Krishi Solutions',
    customerPhone: '7654321098',
    notes: 'Bulk order with special discount',
    createdAt: new Date('2023-05-20T14:20:00'),
    updatedAt: new Date('2023-05-20T14:20:00'),
    syncedAt: new Date('2023-05-20T14:35:00'),
    isOffline: false,
  },
];

const mockTopSellingProducts = [
  { id: 'PRD-001', name: 'Organic Neem Cake Fertilizer', sku: 'NEEM-CAKE-ORG-1KG', hsnCode: '31010010', unitsSold: 150, revenue: 90000 },
  { id: 'PRD-002', name: 'Bio-Zyme Growth Enhancer', sku: 'BIO-ZYME-500ML', hsnCode: '38089090', unitsSold: 95, revenue: 85500 },
  { id: 'PRD-003', name: 'Panchagavya Organic Liquid', sku: 'PANCH-GAVYA-2L', hsnCode: '31010090', unitsSold: 78, revenue: 37440 },
  { id: 'PRD-004', name: 'Panchakavya Herbal Spray', sku: 'PANCH-KAVYA-500ML', hsnCode: '38089090', unitsSold: 65, revenue: 31200 },
  { id: 'PRD-005', name: 'Organic Compost Manure', sku: 'COMPOST-ORG-5KG', hsnCode: '31010090', unitsSold: 52, revenue: 20800 },
];

const PosTransactionAnalytics: React.FC = () => {
  const toast = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('today');
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState({
    cash: 0,
    card: 0,
    upi: 0,
    credit: 0,
  });
  const [transactionTypeBreakdown, setTransactionTypeBreakdown] = useState({
    sale: 0,
    return: 0,
    refund: 0,
  });

  useEffect(() => {
    // In a real application, this would fetch from an API
    setTransactions(mockPosTransactions);
    setTopSellingProducts(mockTopSellingProducts);
    
    // Calculate payment method breakdown
    const paymentBreakdown = transactions.reduce((acc, transaction) => {
      acc[transaction.paymentMethod] = (acc[transaction.paymentMethod] || 0) + 1;
      return acc;
    }, { cash: 0, card: 0, upi: 0, credit: 0 });
    
    setPaymentMethodBreakdown(paymentBreakdown);
    
    // Calculate transaction type breakdown
    const typeBreakdown = transactions.reduce((acc, transaction) => {
      acc[transaction.transactionType] = (acc[transaction.transactionType] || 0) + 1;
      return acc;
    }, { sale: 0, return: 0, refund: 0 });
    
    setTransactionTypeBreakdown(typeBreakdown);
  }, [dateRange]);

  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalTransactions = transactions.length;
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const successfulTransactions = transactions.filter(t => t.paymentStatus === 'completed').length;
  const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">POS Transaction Analytics</Heading>
        <Spacer />
        <FormControl width="200px">
          <FormLabel>Date Range</FormLabel>
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </Select>
        </FormControl>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">POS Performance Overview</Heading>
        </CardHeader>
        <CardBody>
          <StatGroup>
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber>₹{totalRevenue.toLocaleString('en-IN')}</StatNumber>
              <StatHelpText>From {totalTransactions} transactions</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Avg. Transaction Value</StatLabel>
              <StatNumber>₹{avgTransactionValue.toFixed(2)}</StatNumber>
              <StatHelpText>Per transaction</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Success Rate</StatLabel>
              <StatNumber>{successRate.toFixed(1)}%</StatNumber>
              <StatHelpText>Payment success rate</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Top Selling Product</StatLabel>
              <StatNumber>{topSellingProducts[0]?.name || 'N/A'}</StatNumber>
              <StatHelpText>{topSellingProducts[0]?.unitsSold || 0} units sold</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Tabs mb={6}>
        <TabList>
          <Tab>Transaction Details</Tab>
          <Tab>Top Selling Products</Tab>
          <Tab>Payment Methods</Tab>
          <Tab>Performance Metrics</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Transaction ID</Th>
                    <Th>Customer</Th>
                    <Th>Items</Th>
                    <Th>Total</Th>
                    <Th>Payment Method</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {transactions.map((transaction) => (
                    <Tr key={transaction.id}>
                      <Td fontWeight="medium">{transaction.id}</Td>
                      <Td>
                        <Text fontWeight="medium">{transaction.customerName}</Text>
                        <Text fontSize="sm" color="gray.500">{transaction.customerPhone}</Text>
                      </Td>
                      <Td>
                        {transaction.items.map((item: any) => (
                          <Text key={item.id} fontSize="sm">
                            {item.quantity}x {item.productName}
                          </Text>
                        ))}
                      </Td>
                      <Td>₹{transaction.total.toLocaleString('en-IN')}</Td>
                      <Td>
                        <Badge colorScheme={
                          transaction.paymentMethod === 'cash' ? 'yellow' :
                          transaction.paymentMethod === 'card' ? 'blue' :
                          transaction.paymentMethod === 'upi' ? 'green' : 'purple'
                        }>
                          {transaction.paymentMethod}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={transaction.paymentStatus === 'completed' ? 'green' : 'red'}>
                          {transaction.paymentStatus}
                        </Badge>
                      </Td>
                      <Td>{new Date(transaction.createdAt).toLocaleString()}</Td>
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
                    <Th>Product</Th>
                    <Th>HSN Code</Th>
                    <Th>Units Sold</Th>
                    <Th>Revenue</Th>
                    <Th>Share of Sales</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {topSellingProducts.map((product, index) => (
                    <Tr key={product.id}>
                      <Td fontWeight="medium">{product.name}</Td>
                      <Td>{product.hsnCode}</Td>
                      <Td>{product.unitsSold}</Td>
                      <Td>₹{product.revenue.toLocaleString('en-IN')}</Td>
                      <Td>
                        <Flex alignItems="center">
                          <Progress 
                            value={(product.revenue / totalRevenue) * 100} 
                            max={100} 
                            colorScheme="green" 
                            size="sm" 
                            flex={1} 
                            mr={2} 
                          />
                          <Text fontSize="xs" minWidth="40px" textAlign="right">
                            {((product.revenue / totalRevenue) * 100).toFixed(1)}%
                          </Text>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardBody>
                <Flex justifyContent="space-around" flexWrap="wrap">
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Cash</Text>
                    <Text fontSize="2xl" color="yellow.500">{paymentMethodBreakdown.cash}</Text>
                    <Text fontSize="sm">Transactions</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Card</Text>
                    <Text fontSize="2xl" color="blue.500">{paymentMethodBreakdown.card}</Text>
                    <Text fontSize="sm">Transactions</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">UPI</Text>
                    <Text fontSize="2xl" color="green.500">{paymentMethodBreakdown.upi}</Text>
                    <Text fontSize="sm">Transactions</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Credit</Text>
                    <Text fontSize="2xl" color="purple.500">{paymentMethodBreakdown.credit}</Text>
                    <Text fontSize="sm">Transactions</Text>
                  </Box>
                </Flex>
                
                <Box mt={6}>
                  <Heading size="sm" mb={3}>Payment Method Distribution</Heading>
                  <Flex>
                    <Box flex="1" textAlign="center" p={2} borderRight="1px" borderColor="gray.200">
                      <Text fontWeight="bold">Cash</Text>
                      <Text fontSize="lg">{paymentMethodBreakdown.cash > 0 ? Math.round((paymentMethodBreakdown.cash / totalTransactions) * 100) : 0}%</Text>
                      <Progress 
                        value={paymentMethodBreakdown.cash > 0 ? (paymentMethodBreakdown.cash / totalTransactions) * 100 : 0} 
                        max={100} 
                        colorScheme="yellow" 
                        size="sm" 
                        mt={2} 
                      />
                    </Box>
                    <Box flex="1" textAlign="center" p={2} borderRight="1px" borderColor="gray.200">
                      <Text fontWeight="bold">Card</Text>
                      <Text fontSize="lg">{paymentMethodBreakdown.card > 0 ? Math.round((paymentMethodBreakdown.card / totalTransactions) * 100) : 0}%</Text>
                      <Progress 
                        value={paymentMethodBreakdown.card > 0 ? (paymentMethodBreakdown.card / totalTransactions) * 100 : 0} 
                        max={100} 
                        colorScheme="blue" 
                        size="sm" 
                        mt={2} 
                      />
                    </Box>
                    <Box flex="1" textAlign="center" p={2} borderRight="1px" borderColor="gray.200">
                      <Text fontWeight="bold">UPI</Text>
                      <Text fontSize="lg">{paymentMethodBreakdown.upi > 0 ? Math.round((paymentMethodBreakdown.upi / totalTransactions) * 100) : 0}%</Text>
                      <Progress 
                        value={paymentMethodBreakdown.upi > 0 ? (paymentMethodBreakdown.upi / totalTransactions) * 100 : 0} 
                        max={100} 
                        colorScheme="green" 
                        size="sm" 
                        mt={2} 
                      />
                    </Box>
                    <Box flex="1" textAlign="center" p={2}>
                      <Text fontWeight="bold">Credit</Text>
                      <Text fontSize="lg">{paymentMethodBreakdown.credit > 0 ? Math.round((paymentMethodBreakdown.credit / totalTransactions) * 100) : 0}%</Text>
                      <Progress 
                        value={paymentMethodBreakdown.credit > 0 ? (paymentMethodBreakdown.credit / totalTransactions) * 100 : 0} 
                        max={100} 
                        colorScheme="purple" 
                        size="sm" 
                        mt={2} 
                      />
                    </Box>
                  </Flex>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardBody>
                <Flex justifyContent="space-around" flexWrap="wrap">
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
                    <Text fontWeight="bold">Total Transactions</Text>
                    <Text fontSize="2xl" color="blue.500">{totalTransactions}</Text>
                    <Text fontSize="sm">This period</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
                    <Text fontWeight="bold">Successful Payments</Text>
                    <Text fontSize="2xl" color="green.500">{successfulTransactions}</Text>
                    <Text fontSize="sm">Completed successfully</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
                    <Text fontWeight="bold">Success Rate</Text>
                    <Text fontSize="2xl" color="teal.500">{successRate.toFixed(1)}%</Text>
                    <Text fontSize="sm">Payment success rate</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
                    <Text fontWeight="bold">Avg. Transaction Value</Text>
                    <Text fontSize="2xl" color="purple.500">₹{avgTransactionValue.toFixed(2)}</Text>
                    <Text fontSize="sm">Per transaction</Text>
                  </Box>
                </Flex>
                
                <Box mt={6}>
                  <Heading size="sm" mb={3}>Transaction Type Distribution</Heading>
                  <Flex>
                    <Box flex="1" textAlign="center" p={2} borderRight="1px" borderColor="gray.200">
                      <Text fontWeight="bold">Sales</Text>
                      <Text fontSize="lg">{transactionTypeBreakdown.sale > 0 ? Math.round((transactionTypeBreakdown.sale / totalTransactions) * 100) : 0}%</Text>
                      <Progress 
                        value={transactionTypeBreakdown.sale > 0 ? (transactionTypeBreakdown.sale / totalTransactions) * 100 : 0} 
                        max={100} 
                        colorScheme="green" 
                        size="sm" 
                        mt={2} 
                      />
                    </Box>
                    <Box flex="1" textAlign="center" p={2} borderRight="1px" borderColor="gray.200">
                      <Text fontWeight="bold">Returns</Text>
                      <Text fontSize="lg">{transactionTypeBreakdown.return > 0 ? Math.round((transactionTypeBreakdown.return / totalTransactions) * 100) : 0}%</Text>
                      <Progress 
                        value={transactionTypeBreakdown.return > 0 ? (transactionTypeBreakdown.return / totalTransactions) * 100 : 0} 
                        max={100} 
                        colorScheme="yellow" 
                        size="sm" 
                        mt={2} 
                      />
                    </Box>
                    <Box flex="1" textAlign="center" p={2}>
                      <Text fontWeight="bold">Refunds</Text>
                      <Text fontSize="lg">{transactionTypeBreakdown.refund > 0 ? Math.round((transactionTypeBreakdown.refund / totalTransactions) * 100) : 0}%</Text>
                      <Progress 
                        value={transactionTypeBreakdown.refund > 0 ? (transactionTypeBreakdown.refund / totalTransactions) * 100 : 0} 
                        max={100} 
                        colorScheme="red" 
                        size="sm" 
                        mt={2} 
                      />
                    </Box>
                  </Flex>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Card>
        <CardHeader>
          <Heading size="md">Offline Capability Insights</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>
            POS devices operate in offline-first mode with 48-hour autonomy in low-connectivity rural areas.
            Transactions are stored locally and automatically synced when connectivity is restored.
          </Text>
          <Flex justifyContent="space-around" flexWrap="wrap">
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Offline Transactions</Text>
              <Text fontSize="2xl" color="orange.500">12</Text>
              <Text fontSize="sm">Awaiting sync</Text>
            </Box>
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Last Sync</Text>
              <Text fontSize="2xl" color="blue.500">2 hours ago</Text>
              <Text fontSize="sm">To main system</Text>
            </Box>
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Sync Success Rate</Text>
              <Text fontSize="2xl" color="green.500">99.8%</Text>
              <Text fontSize="sm">Successful transfers</Text>
            </Box>
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Data Retention</Text>
              <Text fontSize="2xl" color="purple.500">7 days</Text>
              <Text fontSize="sm">Local storage</Text>
            </Box>
          </Flex>
        </CardBody>
      </Card>
    </Container>
  );
};

export default PosTransactionAnalytics;