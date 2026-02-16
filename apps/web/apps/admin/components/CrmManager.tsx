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
const mockCustomers = [
  {
    id: '1',
    name: 'Agri Solutions Pvt Ltd',
    email: 'contact@agrisolutions.com',
    phone: '9876543210',
    type: 'dealer' as const,
    status: 'active' as const,
    totalOrders: 45,
    totalSpent: 2500000,
    lastOrderDate: new Date('2023-05-15'),
    assignedAgentName: 'Rajesh Kumar',
    leadSource: 'referral' as const,
    tags: ['Priority', 'Bulk Buyer'],
    createdAt: new Date('2022-03-10'),
  },
  {
    id: '2',
    name: 'Krishi Udyog LLP',
    email: 'info@krishiuudyog.com',
    phone: '8765432109',
    type: 'distributor' as const,
    status: 'active' as const,
    totalOrders: 32,
    totalSpent: 1800000,
    lastOrderDate: new Date('2023-05-18'),
    assignedAgentName: 'Priya Sharma',
    leadSource: 'direct' as const,
    tags: ['High Value'],
    createdAt: new Date('2022-05-22'),
  },
  {
    id: '3',
    name: 'Green Farm Supplies',
    email: 'contact@greenfarms.com',
    phone: '7654321098',
    type: 'retailer' as const,
    status: 'prospect' as const,
    totalOrders: 0,
    totalSpent: 0,
    lastOrderDate: null,
    assignedAgentName: 'Suresh Patel',
    leadSource: 'advertisement' as const,
    tags: ['New Lead'],
    createdAt: new Date('2023-01-15'),
  },
];

const mockLeads = [
  {
    id: '1',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh@example.com',
    phone: '9876543210',
    company: 'Agri Solutions',
    status: 'qualified' as const,
    priority: 'high' as const,
    estimatedValue: 500000,
    conversionProbability: 75,
    assignedToName: 'Priya Sharma',
    createdAt: new Date('2023-05-10'),
  },
  {
    id: '2',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@example.com',
    phone: '8765432109',
    company: 'Krishi Enterprises',
    status: 'new' as const,
    priority: 'medium' as const,
    estimatedValue: 300000,
    conversionProbability: 40,
    assignedToName: 'Rajesh Kumar',
    createdAt: new Date('2023-05-15'),
  },
];

const mockOpportunities = [
  {
    id: '1',
    title: 'Large Order for Neem Cake Fertilizer',
    customerId: '1',
    customerName: 'Agri Solutions Pvt Ltd',
    stage: 'proposal' as const,
    probability: 65,
    estimatedValue: 750000,
    expectedCloseDate: new Date('2023-06-30'),
    ownerName: 'Rajesh Kumar',
    createdAt: new Date('2023-05-12'),
  },
  {
    id: '2',
    title: 'Distributor Agreement',
    customerId: '2',
    customerName: 'Krishi Udyog LLP',
    stage: 'negotiation' as const,
    probability: 80,
    estimatedValue: 1200000,
    expectedCloseDate: new Date('2023-07-15'),
    ownerName: 'Priya Sharma',
    createdAt: new Date('2023-05-18'),
  },
];

const CrmManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [entityType, setEntityType] = useState<'customer' | 'lead' | 'opportunity'>('customer');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'retailer',
  });

  useEffect(() => {
    // In a real application, this would fetch from an API
    setCustomers(mockCustomers);
    setLeads(mockLeads);
    setOpportunities(mockOpportunities);
  }, []);

  const handleCreateCustomer = () => {
    // In a real application, this would make an API call
    console.log('Creating new customer:', newCustomer);
    
    toast({
      title: 'Customer Created',
      description: `Customer ${newCustomer.name} has been created successfully.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    onClose();
  };

  const handleViewEntity = (entity: any, type: 'customer' | 'lead' | 'opportunity') => {
    setSelectedEntity(entity);
    setEntityType(type);
    onOpen();
  };

  const activeCustomers = customers.filter(c => c.status === 'active');
  const newLeads = leads.filter(l => l.status === 'new');
  const qualifiedLeads = leads.filter(l => l.status === 'qualified');
  const activeOpportunities = opportunities.filter(o => o.stage !== 'closed-won' && o.stage !== 'closed-lost');

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">CRM Management</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {activeCustomers.length} active customers, {newLeads.length} new leads
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">CRM Overview</Heading>
        </CardHeader>
        <CardBody>
          <StatGroup>
            <Stat>
              <StatLabel>Total Customers</StatLabel>
              <StatNumber>{customers.length}</StatNumber>
              <StatHelpText>Registered customers</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Active Leads</StatLabel>
              <StatNumber>{newLeads.length + qualifiedLeads.length}</StatNumber>
              <StatHelpText>New and qualified leads</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Active Opportunities</StatLabel>
              <StatNumber>{activeOpportunities.length}</StatNumber>
              <StatHelpText>Deals in progress</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Conversion Rate</StatLabel>
              <StatNumber>68%</StatNumber>
              <StatHelpText>Lead to customer</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Customers</Tab>
          <Tab>Leads</Tab>
          <Tab>Opportunities</Tab>
          <Tab>Campaigns</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Customer Management</Heading>
              <Button colorScheme="blue" onClick={onOpen}>
                Add New Customer
              </Button>
            </Flex>
            
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th>Total Spent</Th>
                    <Th>Assigned Agent</Th>
                    <Th>Tags</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {customers.map((customer) => (
                    <Tr key={customer.id}>
                      <Td fontWeight="medium">{customer.name}</Td>
                      <Td>{customer.email}</Td>
                      <Td>{customer.phone}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            customer.type === 'retailer' ? 'green' :
                            customer.type === 'dealer' ? 'blue' : 'purple'
                          }
                        >
                          {customer.type}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            customer.status === 'active' ? 'green' :
                            customer.status === 'inactive' ? 'red' :
                            customer.status === 'prospect' ? 'yellow' : 'gray'
                          }
                        >
                          {customer.status}
                        </Badge>
                      </Td>
                      <Td>₹{customer.totalSpent.toLocaleString('en-IN')}</Td>
                      <Td>{customer.assignedAgentName}</Td>
                      <Td>
                        {customer.tags.map((tag: string) => (
                          <Badge key={tag} colorScheme="gray" mr={1} mb={1} display="inline-block">
                            {tag}
                          </Badge>
                        ))}
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          mr={2}
                          onClick={() => handleViewEntity(customer, 'customer')}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleViewEntity(customer, 'customer')}
                        >
                          Contact
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Lead Management</Heading>
              <Button colorScheme="blue">Add New Lead</Button>
            </Flex>
            
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Company</Th>
                    <Th>Status</Th>
                    <Th>Priority</Th>
                    <Th>Estimated Value</Th>
                    <Th>Conversion Prob.</Th>
                    <Th>Assigned To</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {leads.map((lead) => (
                    <Tr key={lead.id}>
                      <Td fontWeight="medium">{lead.firstName} {lead.lastName}</Td>
                      <Td>{lead.email}</Td>
                      <Td>{lead.company}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            lead.status === 'new' ? 'yellow' :
                            lead.status === 'contacted' ? 'blue' :
                            lead.status === 'qualified' ? 'green' :
                            lead.status === 'converted' ? 'teal' : 'red'
                          }
                        >
                          {lead.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            lead.priority === 'low' ? 'gray' :
                            lead.priority === 'medium' ? 'yellow' : 'red'
                          }
                        >
                          {lead.priority}
                        </Badge>
                      </Td>
                      <Td>₹{lead.estimatedValue.toLocaleString('en-IN')}</Td>
                      <Td>
                        <Progress 
                          value={lead.conversionProbability} 
                          max={100} 
                          colorScheme="green" 
                          size="sm" 
                          width="100px" 
                        />
                        <Text fontSize="xs" textAlign="right">{lead.conversionProbability}%</Text>
                      </Td>
                      <Td>{lead.assignedToName}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          mr={2}
                          onClick={() => handleViewEntity(lead, 'lead')}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleViewEntity(lead, 'lead')}
                        >
                          Contact
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Opportunity Management</Heading>
              <Button colorScheme="blue">Add New Opportunity</Button>
            </Flex>
            
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Title</Th>
                    <Th>Customer</Th>
                    <Th>Stage</Th>
                    <Th>Probability</Th>
                    <Th>Estimated Value</Th>
                    <Th>Expected Close</Th>
                    <Th>Owner</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {opportunities.map((opportunity) => (
                    <Tr key={opportunity.id}>
                      <Td fontWeight="medium">{opportunity.title}</Td>
                      <Td>{opportunity.customerName}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            opportunity.stage === 'prospecting' ? 'gray' :
                            opportunity.stage === 'qualification' ? 'yellow' :
                            opportunity.stage === 'needs-analysis' ? 'blue' :
                            opportunity.stage === 'proposal' ? 'purple' :
                            opportunity.stage === 'negotiation' ? 'orange' : 'green'
                          }
                        >
                          {opportunity.stage}
                        </Badge>
                      </Td>
                      <Td>
                        <Progress 
                          value={opportunity.probability} 
                          max={100} 
                          colorScheme="green" 
                          size="sm" 
                          width="100px" 
                        />
                        <Text fontSize="xs" textAlign="right">{opportunity.probability}%</Text>
                      </Td>
                      <Td>₹{opportunity.estimatedValue.toLocaleString('en-IN')}</Td>
                      <Td>{opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString() : 'N/A'}</Td>
                      <Td>{opportunity.ownerName}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          mr={2}
                          onClick={() => handleViewEntity(opportunity, 'opportunity')}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleViewEntity(opportunity, 'opportunity')}
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
            <Card>
              <CardBody>
                <Text textAlign="center" py={10}>
                  Campaign management would be displayed here.
                  This includes creating marketing campaigns, tracking their performance,
                  and analyzing ROI.
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Customer Details/Create Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          {!selectedEntity ? (
            <>
              <ModalHeader>Create New Customer</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl mb={4}>
                  <FormLabel>Customer Name</FormLabel>
                  <Input
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    placeholder="Enter customer name"
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="Enter customer email"
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    placeholder="Enter customer phone"
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Customer Type</FormLabel>
                  <Select
                    value={newCustomer.type}
                    onChange={(e) => setNewCustomer({...newCustomer, type: e.target.value})}
                  >
                    <option value="retailer">Retailer</option>
                    <option value="dealer">Dealer</option>
                    <option value="distributor">Distributor</option>
                  </Select>
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleCreateCustomer}>
                  Create Customer
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>
                {entityType === 'customer' && 'Customer Details'}
                {entityType === 'lead' && 'Lead Details'}
                {entityType === 'opportunity' && 'Opportunity Details'}
              </ModalHeader>
              <ModalCloseButton onClick={() => setSelectedEntity(null)} />
              <ModalBody>
                <Card mb={4}>
                  <CardBody>
                    {entityType === 'customer' && (
                      <>
                        <Text><strong>Name:</strong> {selectedEntity.name}</Text>
                        <Text><strong>Email:</strong> {selectedEntity.email}</Text>
                        <Text><strong>Phone:</strong> {selectedEntity.phone}</Text>
                        <Text><strong>Type:</strong> 
                          <Badge ml={2} colorScheme={
                            selectedEntity.type === 'retailer' ? 'green' :
                            selectedEntity.type === 'dealer' ? 'blue' : 'purple'
                          }>
                            {selectedEntity.type}
                          </Badge>
                        </Text>
                        <Text><strong>Status:</strong> 
                          <Badge ml={2} colorScheme={
                            selectedEntity.status === 'active' ? 'green' :
                            selectedEntity.status === 'inactive' ? 'red' :
                            selectedEntity.status === 'prospect' ? 'yellow' : 'gray'
                          }>
                            {selectedEntity.status}
                          </Badge>
                        </Text>
                        <Text><strong>Total Spent:</strong> ₹{selectedEntity.totalSpent.toLocaleString('en-IN')}</Text>
                        <Text><strong>Assigned Agent:</strong> {selectedEntity.assignedAgentName}</Text>
                        <Text><strong>Lead Source:</strong> {selectedEntity.leadSource}</Text>
                        <Text><strong>Created:</strong> {new Date(selectedEntity.createdAt).toLocaleDateString()}</Text>
                      </>
                    )}
                    
                    {entityType === 'lead' && (
                      <>
                        <Text><strong>Name:</strong> {selectedEntity.firstName} {selectedEntity.lastName}</Text>
                        <Text><strong>Email:</strong> {selectedEntity.email}</Text>
                        <Text><strong>Company:</strong> {selectedEntity.company}</Text>
                        <Text><strong>Status:</strong> 
                          <Badge ml={2} colorScheme={
                            selectedEntity.status === 'new' ? 'yellow' :
                            selectedEntity.status === 'contacted' ? 'blue' :
                            selectedEntity.status === 'qualified' ? 'green' :
                            selectedEntity.status === 'converted' ? 'teal' : 'red'
                          }>
                            {selectedEntity.status}
                          </Badge>
                        </Text>
                        <Text><strong>Priority:</strong> 
                          <Badge ml={2} colorScheme={
                            selectedEntity.priority === 'low' ? 'gray' :
                            selectedEntity.priority === 'medium' ? 'yellow' : 'red'
                          }>
                            {selectedEntity.priority}
                          </Badge>
                        </Text>
                        <Text><strong>Estimated Value:</strong> ₹{selectedEntity.estimatedValue.toLocaleString('en-IN')}</Text>
                        <Text><strong>Conversion Probability:</strong> {selectedEntity.conversionProbability}%</Text>
                        <Text><strong>Assigned To:</strong> {selectedEntity.assignedToName}</Text>
                        <Text><strong>Created:</strong> {new Date(selectedEntity.createdAt).toLocaleDateString()}</Text>
                      </>
                    )}
                    
                    {entityType === 'opportunity' && (
                      <>
                        <Text><strong>Title:</strong> {selectedEntity.title}</Text>
                        <Text><strong>Customer:</strong> {selectedEntity.customerName}</Text>
                        <Text><strong>Stage:</strong> 
                          <Badge ml={2} colorScheme={
                            selectedEntity.stage === 'prospecting' ? 'gray' :
                            selectedEntity.stage === 'qualification' ? 'yellow' :
                            selectedEntity.stage === 'needs-analysis' ? 'blue' :
                            selectedEntity.stage === 'proposal' ? 'purple' :
                            selectedEntity.stage === 'negotiation' ? 'orange' : 'green'
                          }>
                            {selectedEntity.stage}
                          </Badge>
                        </Text>
                        <Text><strong>Probability:</strong> {selectedEntity.probability}%</Text>
                        <Text><strong>Estimated Value:</strong> ₹{selectedEntity.estimatedValue.toLocaleString('en-IN')}</Text>
                        <Text><strong>Expected Close:</strong> {selectedEntity.expectedCloseDate ? new Date(selectedEntity.expectedCloseDate).toLocaleDateString() : 'N/A'}</Text>
                        <Text><strong>Owner:</strong> {selectedEntity.ownerName}</Text>
                        <Text><strong>Created:</strong> {new Date(selectedEntity.createdAt).toLocaleDateString()}</Text>
                      </>
                    )}
                  </CardBody>
                </Card>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={() => setSelectedEntity(null)}>
                  Close
                </Button>
                <Button colorScheme="blue">Edit</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CrmManager;