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
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';

// Mock data for demonstration purposes
const mockSalesAnalytics = {
  id: '1',
  period: '2023-05',
  totalRevenue: 2500000,
  totalOrders: 1250,
  avgOrderValue: 2000,
  newCustomers: 45,
  returningCustomers: 890,
  topSellingProducts: [
    {
      productId: 'PRD-001',
      productName: 'Organic Neem Cake Fertilizer',
      sku: 'NEEM-CAKE-ORG-1KG',
      quantitySold: 1250,
      revenue: 750000,
      percentageOfTotal: 30,
    },
    {
      productId: 'PRD-002',
      productName: 'Bio-Zyme Growth Enhancer',
      sku: 'BIO-ZYME-500ML',
      quantitySold: 850,
      revenue: 637500,
      percentageOfTotal: 25.5,
    },
    {
      productId: 'PRD-003',
      productName: 'Panchagavya Organic Liquid',
      sku: 'PANCH-GAVYA-2L',
      quantitySold: 650,
      revenue: 455000,
      percentageOfTotal: 18.2,
    },
  ],
  revenueByCategory: [
    {
      categoryId: 'CAT-001',
      categoryName: 'Fertilizers',
      revenue: 1200000,
      percentageOfTotal: 48,
    },
    {
      categoryId: 'CAT-002',
      categoryName: 'Growth Enhancers',
      revenue: 800000,
      percentageOfTotal: 32,
    },
    {
      categoryId: 'CAT-003',
      categoryName: 'Organic Liquids',
      revenue: 500000,
      percentageOfTotal: 20,
    },
  ],
  revenueByRegion: [
    {
      region: 'Karnataka',
      revenue: 1000000,
      percentageOfTotal: 40,
    },
    {
      region: 'Maharashtra',
      revenue: 750000,
      percentageOfTotal: 30,
    },
    {
      region: 'Tamil Nadu',
      revenue: 500000,
      percentageOfTotal: 20,
    },
    {
      region: 'Andhra Pradesh',
      revenue: 250000,
      percentageOfTotal: 10,
    },
  ],
  createdAt: new Date('2023-06-01'),
  updatedAt: new Date('2023-06-01'),
};

const mockReports = [
  {
    id: '1',
    title: 'Monthly Sales Report',
    type: 'sales' as const,
    description: 'Detailed sales report for the month',
    status: 'active' as const,
    lastGeneratedAt: new Date('2023-05-31'),
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-05-31'),
  },
  {
    id: '2',
    title: 'Customer Analytics Report',
    type: 'customer' as const,
    description: 'Customer behavior and retention analysis',
    status: 'scheduled' as const,
    lastGeneratedAt: new Date('2023-05-30'),
    nextScheduledAt: new Date('2023-06-01'),
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-05-30'),
  },
  {
    id: '3',
    title: 'Inventory Turnover Report',
    type: 'inventory' as const,
    description: 'Analysis of inventory movement and turnover',
    status: 'inactive' as const,
    lastGeneratedAt: new Date('2023-05-25'),
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-05-25'),
  },
];

const AnalyticsManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [salesAnalytics, setSalesAnalytics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [newReport, setNewReport] = useState({
    title: '',
    type: 'sales',
    description: '',
  });

  useEffect(() => {
    // In a real application, this would fetch from an API
    setSalesAnalytics(mockSalesAnalytics);
    setReports(mockReports);
  }, []);

  const handleCreateReport = () => {
    // In a real application, this would make an API call
    console.log('Creating new report:', newReport);
    
    toast({
      title: 'Report Created',
      description: `Report "${newReport.title}" has been created successfully.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    onClose();
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    onOpen();
  };

  const handleGenerateReport = (reportId: string) => {
    // In a real application, this would make an API call
    toast({
      title: 'Report Generation Started',
      description: `Generating report with ID ${reportId}. This may take a few moments.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Analytics & Reporting</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {reports.length} reports configured
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Business Overview</Heading>
        </CardHeader>
        <CardBody>
          <StatGroup>
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber>₹{salesAnalytics?.totalRevenue.toLocaleString('en-IN') || '0'}</StatNumber>
              <StatHelpText>Monthly</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Total Orders</StatLabel>
              <StatNumber>{salesAnalytics?.totalOrders || 0}</StatNumber>
              <StatHelpText>Monthly</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Avg. Order Value</StatLabel>
              <StatNumber>₹{salesAnalytics?.avgOrderValue.toLocaleString('en-IN') || '0'}</StatNumber>
              <StatHelpText>Monthly</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>New Customers</StatLabel>
              <StatNumber>{salesAnalytics?.newCustomers || 0}</StatNumber>
              <StatHelpText>Monthly</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Sales Analytics</Tab>
          <Tab>Customer Insights</Tab>
          <Tab>Inventory Analysis</Tab>
          <Tab>Reports</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card mb={6}>
              <CardHeader>
                <Heading size="md">Top Selling Products</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Product</Th>
                        <Th>SKU</Th>
                        <Th>Quantity Sold</Th>
                        <Th>Revenue</Th>
                        <Th>% of Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {salesAnalytics?.topSellingProducts.map((product: any) => (
                        <Tr key={product.productId}>
                          <Td fontWeight="bold">{product.productName}</Td>
                          <Td>{product.sku}</Td>
                          <Td>{product.quantitySold}</Td>
                          <Td>₹{product.revenue.toLocaleString('en-IN')}</Td>
                          <Td>
                            <Progress 
                              value={product.percentageOfTotal} 
                              max={100} 
                              colorScheme="green" 
                              size="sm" 
                              width="100px" 
                            />
                            <Text fontSize="xs" textAlign="right">{product.percentageOfTotal}%</Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>

            <Card mb={6}>
              <CardHeader>
                <Heading size="md">Revenue by Category</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Category</Th>
                        <Th>Revenue</Th>
                        <Th>% of Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {salesAnalytics?.revenueByCategory.map((category: any) => (
                        <Tr key={category.categoryId}>
                          <Td fontWeight="bold">{category.categoryName}</Td>
                          <Td>₹{category.revenue.toLocaleString('en-IN')}</Td>
                          <Td>
                            <Progress 
                              value={category.percentageOfTotal} 
                              max={100} 
                              colorScheme="blue" 
                              size="sm" 
                              width="100px" 
                            />
                            <Text fontSize="xs" textAlign="right">{category.percentageOfTotal}%</Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Revenue by Region</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Region</Th>
                        <Th>Revenue</Th>
                        <Th>% of Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {salesAnalytics?.revenueByRegion.map((region: any) => (
                        <Tr key={region.region}>
                          <Td fontWeight="bold">{region.region}</Td>
                          <Td>₹{region.revenue.toLocaleString('en-IN')}</Td>
                          <Td>
                            <Progress 
                              value={region.percentageOfTotal} 
                              max={100} 
                              colorScheme="purple" 
                              size="sm" 
                              width="100px" 
                            />
                            <Text fontSize="xs" textAlign="right">{region.percentageOfTotal}%</Text>
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
              <CardBody>
                <Text textAlign="center" py={10}>
                  Customer insights and behavior analysis would be displayed here.
                  This includes customer acquisition, retention rates, lifetime value,
                  and segmentation analysis.
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardBody>
                <Text textAlign="center" py={10}>
                  Inventory analysis would be displayed here.
                  This includes stock levels, turnover rates, low stock alerts,
                  and demand forecasting.
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Scheduled Reports</Heading>
              <Button colorScheme="blue" onClick={onOpen}>
                Create New Report
              </Button>
            </Flex>
            
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Title</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th>Last Generated</Th>
                    <Th>Next Scheduled</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {reports.map((report) => (
                    <Tr key={report.id}>
                      <Td fontWeight="medium">{report.title}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            report.type === 'sales' ? 'blue' :
                            report.type === 'customer' ? 'green' :
                            report.type === 'inventory' ? 'purple' :
                            report.type === 'financial' ? 'yellow' : 'gray'
                          }
                        >
                          {report.type}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            report.status === 'active' ? 'green' :
                            report.status === 'scheduled' ? 'blue' : 'red'
                          }
                        >
                          {report.status}
                        </Badge>
                      </Td>
                      <Td>{report.lastGeneratedAt ? new Date(report.lastGeneratedAt).toLocaleDateString() : 'N/A'}</Td>
                      <Td>{report.nextScheduledAt ? new Date(report.nextScheduledAt).toLocaleDateString() : 'N/A'}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          mr={2}
                          onClick={() => handleViewReport(report)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleGenerateReport(report.id)}
                        >
                          Generate
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Report Details/Create Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          {!selectedReport ? (
            <>
              <ModalHeader>Create New Report</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl mb={4}>
                  <FormLabel>Report Title</FormLabel>
                  <Input
                    value={newReport.title}
                    onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                    placeholder="Enter report title"
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Report Type</FormLabel>
                  <Select
                    value={newReport.type}
                    onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                  >
                    <option value="sales">Sales Analytics</option>
                    <option value="customer">Customer Insights</option>
                    <option value="inventory">Inventory Analysis</option>
                    <option value="financial">Financial Report</option>
                    <option value="custom">Custom Report</option>
                  </Select>
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Description</FormLabel>
                  <Input
                    value={newReport.description}
                    onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                    placeholder="Enter report description"
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleCreateReport}>
                  Create Report
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>Report Details: {selectedReport.title}</ModalHeader>
              <ModalCloseButton onClick={() => setSelectedReport(null)} />
              <ModalBody>
                <Card mb={4}>
                  <CardBody>
                    <Text><strong>Type:</strong> 
                      <Badge ml={2} colorScheme={
                        selectedReport.type === 'sales' ? 'blue' :
                        selectedReport.type === 'customer' ? 'green' :
                        selectedReport.type === 'inventory' ? 'purple' :
                        selectedReport.type === 'financial' ? 'yellow' : 'gray'
                      }>
                        {selectedReport.type}
                      </Badge>
                    </Text>
                    <Text><strong>Status:</strong> 
                      <Badge ml={2} colorScheme={
                        selectedReport.status === 'active' ? 'green' :
                        selectedReport.status === 'scheduled' ? 'blue' : 'red'
                      }>
                        {selectedReport.status}
                      </Badge>
                    </Text>
                    <Text><strong>Description:</strong> {selectedReport.description}</Text>
                    <Text><strong>Created:</strong> {new Date(selectedReport.createdAt).toLocaleDateString()}</Text>
                    <Text><strong>Last Updated:</strong> {new Date(selectedReport.updatedAt).toLocaleDateString()}</Text>
                    <Text><strong>Last Generated:</strong> {selectedReport.lastGeneratedAt ? new Date(selectedReport.lastGeneratedAt).toLocaleDateString() : 'Never'}</Text>
                    <Text><strong>Next Scheduled:</strong> {selectedReport.nextScheduledAt ? new Date(selectedReport.nextScheduledAt).toLocaleDateString() : 'N/A'}</Text>
                  </CardBody>
                </Card>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
                <Button colorScheme="blue">Edit Report</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AnalyticsManager;