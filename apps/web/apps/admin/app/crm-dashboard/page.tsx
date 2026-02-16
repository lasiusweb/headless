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
  Grid,
  GridItem,
} from '@chakra-ui/react';

const CrmDashboardPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('monthly');

  // Mock data for CRM dashboard
  const crmMetrics = {
    totalCustomers: 2450,
    newCustomers: 45,
    activeCustomers: 1890,
    customerRetentionRate: 85.5,
    avgOrderFrequency: 2.4,
    customerLifetimeValue: 12500,
    churnRate: 3.2,
    totalLeads: 120,
    qualifiedLeads: 45,
    conversionRate: 68,
    totalOpportunities: 28,
    activeOpportunities: 18,
    opportunityWinRate: 72,
  };

  const topCustomers = [
    { id: '1', name: 'Agri Solutions Pvt Ltd', totalSpent: 2500000, orders: 45, lastOrder: '2023-05-15' },
    { id: '2', name: 'Krishi Udyog LLP', totalSpent: 1800000, orders: 32, lastOrder: '2023-05-18' },
    { id: '3', name: 'Green Farm Supplies', totalSpent: 1200000, orders: 28, lastOrder: '2023-05-10' },
    { id: '4', name: 'Organic Harvest Co.', totalSpent: 950000, orders: 22, lastOrder: '2023-05-20' },
    { id: '5', name: 'Farmers Cooperative', totalSpent: 750000, orders: 18, lastOrder: '2023-05-12' },
  ];

  const recentActivities = [
    { id: '1', customer: 'Agri Solutions Pvt Ltd', action: 'New order placed', date: '2023-05-20', agent: 'Rajesh Kumar' },
    { id: '2', customer: 'Krishi Udyog LLP', action: 'Contract renewed', date: '2023-05-19', agent: 'Priya Sharma' },
    { id: '3', customer: 'New Lead', action: 'Lead qualified', date: '2023-05-18', agent: 'Suresh Patel' },
    { id: '4', customer: 'Green Farm Supplies', action: 'Follow-up call completed', date: '2023-05-17', agent: 'Anita Desai' },
    { id: '5', customer: 'Organic Harvest Co.', action: 'Payment received', date: '2023-05-16', agent: 'Vijay Singh' },
  ];

  const handleExportReport = () => {
    toast({
      title: 'Report Export Started',
      description: 'Your CRM report is being prepared for download.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">CRM Dashboard</Heading>
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
          <Heading size="md">CRM Performance Metrics</Heading>
        </CardHeader>
        <CardBody>
          <StatGroup>
            <Stat>
              <StatLabel>Total Customers</StatLabel>
              <StatNumber>{crmMetrics.totalCustomers.toLocaleString('en-IN')}</StatNumber>
              <StatHelpText>+{crmMetrics.newCustomers} new this month</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Active Customers</StatLabel>
              <StatNumber>{crmMetrics.activeCustomers.toLocaleString('en-IN')}</StatNumber>
              <StatHelpText>{crmMetrics.customerRetentionRate}% retention</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Lead Conversion</StatLabel>
              <StatNumber>{crmMetrics.conversionRate}%</StatNumber>
              <StatHelpText>{crmMetrics.qualifiedLeads}/{crmMetrics.totalLeads} qualified</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Opportunity Win Rate</StatLabel>
              <StatNumber>{crmMetrics.opportunityWinRate}%</StatNumber>
              <StatHelpText>{crmMetrics.activeOpportunities} active</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Grid templateColumns="repeat(12, 1fr)" gap={6} mb={6}>
        <GridItem colSpan={{ base: 12, md: 8 }}>
          <Card>
            <CardHeader>
              <Flex justifyContent="space-between" alignItems="center">
                <Heading size="md">Top Customers</Heading>
                <Button colorScheme="blue" size="sm" onClick={handleExportReport}>
                  Export
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Customer</Th>
                      <Th>Total Spent</Th>
                      <Th>Orders</Th>
                      <Th>Last Order</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {topCustomers.map((customer) => (
                      <Tr key={customer.id}>
                        <Td fontWeight="bold">{customer.name}</Td>
                        <Td>₹{customer.totalSpent.toLocaleString('en-IN')}</Td>
                        <Td>{customer.orders}</Td>
                        <Td>{new Date(customer.lastOrder).toLocaleDateString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem colSpan={{ base: 12, md: 4 }}>
          <Card>
            <CardHeader>
              <Heading size="md">Customer Segments</Heading>
            </CardHeader>
            <CardBody>
              <Flex direction="column" gap={4}>
                <Box>
                  <Flex justifyContent="space-between" mb={1}>
                    <Text fontWeight="medium">Dealers</Text>
                    <Text fontWeight="bold">1,200</Text>
                  </Flex>
                  <Progress value={49} max={100} colorScheme="blue" size="sm" />
                </Box>
                <Box>
                  <Flex justifyContent="space-between" mb={1}>
                    <Text fontWeight="medium">Distributors</Text>
                    <Text fontWeight="bold">650</Text>
                  </Flex>
                  <Progress value={26.5} max={100} colorScheme="purple" size="sm" />
                </Box>
                <Box>
                  <Flex justifyContent="space-between" mb={1}>
                    <Text fontWeight="medium">Retailers</Text>
                    <Text fontWeight="bold">600</Text>
                  </Flex>
                  <Progress value={24.5} max={100} colorScheme="green" size="sm" />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Recent Activities</Tab>
          <Tab>Lead Pipeline</Tab>
          <Tab>Opportunity Tracking</Tab>
          <Tab>Customer Interactions</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Recent Customer Activities</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Customer</Th>
                        <Th>Action</Th>
                        <Th>Date</Th>
                        <Th>Agent</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentActivities.map((activity) => (
                        <Tr key={activity.id}>
                          <Td fontWeight="bold">{activity.customer}</Td>
                          <Td>
                            <Badge colorScheme="blue">
                              {activity.action}
                            </Badge>
                          </Td>
                          <Td>{new Date(activity.date).toLocaleDateString()}</Td>
                          <Td>{activity.agent}</Td>
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
                <Heading size="md">Lead Pipeline</Heading>
              </CardHeader>
              <CardBody>
                <Flex justifyContent="space-around" flexWrap="wrap">
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">New</Text>
                    <Text fontSize="2xl" color="yellow.500">25</Text>
                    <Text fontSize="sm">Leads</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Contacted</Text>
                    <Text fontSize="2xl" color="blue.500">35</Text>
                    <Text fontSize="sm">Leads</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Qualified</Text>
                    <Text fontSize="2xl" color="green.500">45</Text>
                    <Text fontSize="sm">Leads</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Converted</Text>
                    <Text fontSize="2xl" color="teal.500">31</Text>
                    <Text fontSize="sm">Leads</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Lost</Text>
                    <Text fontSize="2xl" color="red.500">14</Text>
                    <Text fontSize="sm">Leads</Text>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Opportunity Tracking</Heading>
              </CardHeader>
              <CardBody>
                <Flex justifyContent="space-around" flexWrap="wrap">
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Prospecting</Text>
                    <Text fontSize="2xl" color="gray.500">5</Text>
                    <Text fontSize="sm">Opportunities</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Qualification</Text>
                    <Text fontSize="2xl" color="yellow.500">4</Text>
                    <Text fontSize="sm">Opportunities</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Needs Analysis</Text>
                    <Text fontSize="2xl" color="blue.500">3</Text>
                    <Text fontSize="sm">Opportunities</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Proposal</Text>
                    <Text fontSize="2xl" color="purple.500">4</Text>
                    <Text fontSize="sm">Opportunities</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Negotiation</Text>
                    <Text fontSize="2xl" color="orange.500">2</Text>
                    <Text fontSize="sm">Opportunities</Text>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Customer Interaction Channels</Heading>
              </CardHeader>
              <CardBody>
                <Flex justifyContent="space-around" flexWrap="wrap">
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Calls</Text>
                    <Text fontSize="2xl" color="blue.500">124</Text>
                    <Text fontSize="sm">This Month</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Emails</Text>
                    <Text fontSize="2xl" color="green.500">89</Text>
                    <Text fontSize="sm">This Month</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Meetings</Text>
                    <Text fontSize="2xl" color="purple.500">32</Text>
                    <Text fontSize="sm">This Month</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">Visits</Text>
                    <Text fontSize="2xl" color="teal.500">18</Text>
                    <Text fontSize="sm">This Month</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="20%">
                    <Text fontWeight="bold">SMS/WhatsApp</Text>
                    <Text fontSize="2xl" color="yellow.500">67</Text>
                    <Text fontSize="sm">This Month</Text>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Card>
        <CardHeader>
          <Heading size="md">Customer Retention Insights</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>
            Based on customer interaction patterns and purchase history, our predictive analytics show:
          </Text>
          <Flex justifyContent="space-around" flexWrap="wrap">
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Likely to Churn</Text>
              <Text fontSize="2xl" color="red.500">42</Text>
              <Text fontSize="sm">Customers</Text>
            </Box>
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">High Engagement</Text>
              <Text fontSize="2xl" color="green.500">320</Text>
              <Text fontSize="sm">Customers</Text>
            </Box>
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Renewal Due</Text>
              <Text fontSize="2xl" color="blue.500">87</Text>
              <Text fontSize="sm">Contracts</Text>
            </Box>
            <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="22%">
              <Text fontWeight="bold">Upsell Potential</Text>
              <Text fontSize="2xl" color="purple.500">156</Text>
              <Text fontSize="sm">Customers</Text>
            </Box>
          </Flex>
        </CardBody>
      </Card>
    </Container>
  );
};

export default CrmDashboardPage;