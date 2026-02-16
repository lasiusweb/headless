'use client';

import React, { useState } from 'react';
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

const AdvancedAnalyticsPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('monthly');

  // Mock data for advanced analytics
  const salesTrends = [
    { month: 'Jan 2023', revenue: 2200000, orders: 1100 },
    { month: 'Feb 2023', revenue: 2350000, orders: 1150 },
    { month: 'Mar 2023', revenue: 2400000, orders: 1200 },
    { month: 'Apr 2023', revenue: 2450000, orders: 1225 },
    { month: 'May 2023', revenue: 2500000, orders: 1250 },
  ];

  const customerInsights = [
    { segment: 'Dealers', count: 1200, avgOrderValue: 8500, retention: 85.5 },
    { segment: 'Distributors', count: 650, avgOrderValue: 15000, retention: 92.3 },
    { segment: 'Retailers', count: 600, avgOrderValue: 3200, retention: 72.1 },
  ];

  const inventoryMetrics = [
    { category: 'Fertilizers', turnoverRate: 12.5, stockValue: 1500000 },
    { category: 'Growth Enhancers', turnoverRate: 8.2, stockValue: 1000000 },
    { category: 'Organic Liquids', turnoverRate: 6.8, stockValue: 500000 },
  ];

  const handleExportReport = () => {
    toast({
      title: 'Report Export Started',
      description: 'Your report is being prepared for download.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Advanced Analytics</Heading>
        <Spacer />
        <FormControl width="200px">
          <FormLabel>Date Range</FormLabel>
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </FormControl>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Business Performance Overview</Heading>
        </CardHeader>
        <CardBody>
          <StatGroup>
            <Stat>
              <StatLabel>Revenue Growth</StatLabel>
              <StatNumber>+12.5%</StatNumber>
              <StatHelpText>YoY increase</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Order Volume</StatLabel>
              <StatNumber>+8.3%</StatNumber>
              <StatHelpText>MoM increase</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Customer Retention</StatLabel>
              <StatNumber>85.2%</StatNumber>
              <StatHelpText>Overall rate</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Inventory Turnover</StatLabel>
              <StatNumber>4.2x</StatNumber>
              <StatHelpText>Annual rate</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Sales Trends</Tab>
          <Tab>Customer Insights</Tab>
          <Tab>Inventory Metrics</Tab>
          <Tab>Financial Performance</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading size="md">Sales Trends Over Time</Heading>
                  <Button colorScheme="blue" onClick={handleExportReport}>
                    Export Report
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Month</Th>
                        <Th>Revenue</Th>
                        <Th>Orders</Th>
                        <Th>Avg. Order Value</Th>
                        <Th>Growth</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {salesTrends.map((month, index) => (
                        <Tr key={month.month}>
                          <Td fontWeight="bold">{month.month}</Td>
                          <Td>₹{month.revenue.toLocaleString('en-IN')}</Td>
                          <Td>{month.orders}</Td>
                          <Td>₹{(month.revenue / month.orders).toLocaleString('en-IN')}</Td>
                          <Td>
                            <Progress 
                              value={index === 0 ? 0 : ((month.revenue - salesTrends[index-1].revenue) / salesTrends[index-1].revenue) * 100 + 50} 
                              max={100} 
                              colorScheme="green" 
                              size="sm" 
                              width="100px" 
                            />
                            <Text fontSize="xs" textAlign="right">
                              {index === 0 ? '0%' : `+${(((month.revenue - salesTrends[index-1].revenue) / salesTrends[index-1].revenue) * 100).toFixed(1)}%`}
                            </Text>
                          </Td>
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
              <CardHeader>
                <Heading size="md">Customer Segmentation Analysis</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Segment</Th>
                        <Th>Customer Count</Th>
                        <Th>Avg. Order Value</Th>
                        <Th>Retention Rate</Th>
                        <Th>Share of Revenue</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {customerInsights.map((segment) => (
                        <Tr key={segment.segment}>
                          <Td fontWeight="bold">{segment.segment}</Td>
                          <Td>{segment.count}</Td>
                          <Td>₹{segment.avgOrderValue.toLocaleString('en-IN')}</Td>
                          <Td>
                            <Progress 
                              value={segment.retention} 
                              max={100} 
                              colorScheme="blue" 
                              size="sm" 
                              width="100px" 
                            />
                            <Text fontSize="xs" textAlign="right">{segment.retention}%</Text>
                          </Td>
                          <Td>
                            <Progress 
                              value={segment.segment === 'Dealers' ? 48 : segment.segment === 'Distributors' ? 32 : 20} 
                              max={100} 
                              colorScheme="purple" 
                              size="sm" 
                              width="100px" 
                            />
                            <Text fontSize="xs" textAlign="right">
                              {segment.segment === 'Dealers' ? '48%' : segment.segment === 'Distributors' ? '32%' : '20%'}
                            </Text>
                          </Td>
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
              <CardHeader>
                <Heading size="md">Inventory Performance Metrics</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Category</Th>
                        <Th>Turnover Rate</Th>
                        <Th>Stock Value</Th>
                        <Th>Days of Supply</Th>
                        <Th>Fast Moving?</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {inventoryMetrics.map((category) => (
                        <Tr key={category.category}>
                          <Td fontWeight="bold">{category.category}</Td>
                          <Td>{category.turnoverRate}x/year</Td>
                          <Td>₹{category.stockValue.toLocaleString('en-IN')}</Td>
                          <Td>{Math.round(365 / category.turnoverRate)}</Td>
                          <Td>
                            <Badge colorScheme={category.turnoverRate > 10 ? 'green' : category.turnoverRate > 5 ? 'yellow' : 'red'}>
                              {category.turnoverRate > 10 ? 'Fast Moving' : category.turnoverRate > 5 ? 'Moderate' : 'Slow Moving'}
                            </Badge>
                          </Td>
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
              <CardHeader>
                <Heading size="md">Financial Performance Indicators</Heading>
              </CardHeader>
              <CardBody>
                <StatGroup>
                  <Stat>
                    <StatLabel>Gross Profit Margin</StatLabel>
                    <StatNumber>28%</StatNumber>
                    <StatHelpText>Industry average: 25%</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Net Profit Margin</StatLabel>
                    <StatNumber>18%</StatNumber>
                    <StatHelpText>Target: 20%</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Operating Expenses</StatLabel>
                    <StatNumber>₹1,200,000</StatNumber>
                    <StatHelpText>48% of revenue</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Cash Flow</StatLabel>
                    <StatNumber>₹500,000</StatNumber>
                    <StatHelpText>Positive monthly</StatHelpText>
                  </Stat>
                </StatGroup>
                
                <Box mt={6}>
                  <Heading size="sm" mb={3}>Expense Breakdown</Heading>
                  <Flex>
                    <Box flex="1" textAlign="center" p={2}>
                      <Text fontWeight="bold">COGS</Text>
                      <Text>62%</Text>
                    </Box>
                    <Box flex="1" textAlign="center" p={2}>
                      <Text fontWeight="bold">Operations</Text>
                      <Text>28%</Text>
                    </Box>
                    <Box flex="1" textAlign="center" p={2}>
                      <Text fontWeight="bold">Marketing</Text>
                      <Text>7%</Text>
                    </Box>
                    <Box flex="1" textAlign="center" p={2}>
                      <Text fontWeight="bold">Other</Text>
                      <Text>3%</Text>
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
          <Heading size="md">Predictive Insights</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>
            Based on historical data and market trends, our predictive analytics engine forecasts:
          </Text>
          <Flex justifyContent="space-around" flexWrap="wrap">
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Revenue Growth</Text>
              <Text fontSize="2xl" color="green.500">+15%</Text>
              <Text fontSize="sm">Next Quarter</Text>
            </Box>
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Customer Acquisition</Text>
              <Text fontSize="2xl" color="blue.500">+22%</Text>
              <Text fontSize="sm">Next Quarter</Text>
            </Box>
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Inventory Turnover</Text>
              <Text fontSize="2xl" color="purple.500">4.8x</Text>
              <Text fontSize="sm">Annual Target</Text>
            </Box>
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Market Expansion</Text>
              <Text fontSize="2xl" color="teal.500">3 New States</Text>
              <Text fontSize="sm">By Year End</Text>
            </Box>
          </Flex>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AdvancedAnalyticsPage;