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
} from '@chakra-ui/react';

const PosSystemCapabilitiesPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);

  // Mock data for POS capabilities
  const posCapabilities = [
    {
      id: 'offline-mode',
      name: 'Offline Mode',
      description: 'Operate without internet connection for up to 48 hours',
      status: 'enabled' as const,
      details: 'All transactions stored locally and synced when connection is restored',
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      description: 'Real-time stock tracking with low stock alerts',
      status: 'enabled' as const,
      details: 'Automatically updates inventory levels after each sale',
    },
    {
      id: 'payments',
      name: 'Multi-Payment Options',
      description: 'Accept cash, cards, UPI, and credit payments',
      status: 'enabled' as const,
      details: 'Integrated with major payment gateways for seamless transactions',
    },
    {
      id: 'sync',
      name: 'Automatic Sync',
      description: 'Sync data when internet connection is restored',
      status: 'enabled' as const,
      details: 'Background sync ensures all data reaches central system',
    },
    {
      id: 'reports',
      name: 'Sales Reports',
      description: 'Generate detailed sales reports and analytics',
      status: 'enabled' as const,
      details: 'Real-time insights into sales performance and trends',
    },
  ];

  const offlineFeatures = [
    { id: '1', feature: 'Process Sales', available: true },
    { id: '2', feature: 'Process Returns', available: true },
    { id: '3', feature: 'Customer Management', available: true },
    { id: '4', feature: 'Inventory Updates', available: true },
    { id: '5', feature: 'Generate Receipts', available: true },
    { id: '6', feature: 'Apply Discounts', available: true },
    { id: '7', feature: 'Process Refunds', available: false },
    { id: '8', feature: 'Online Payments', available: false },
  ];

  const handleSyncNow = () => {
    toast({
      title: 'Sync Initiated',
      description: 'Starting synchronization of offline data with the main system...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">POS System Capabilities</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          Offline-first retail solution for rural markets
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">POS System Overview</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>
            The KN Biosciences POS system is designed for rural markets with limited internet connectivity.
            It operates in offline-first mode with 48-hour autonomy, ensuring uninterrupted operations
            even in low-connectivity areas.
          </Text>
          <StatGroup>
            <Stat>
              <StatLabel>Offline Autonomy</StatLabel>
              <StatNumber>48 hours</StatNumber>
              <StatHelpText>Continuous operation without internet</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Sync Success Rate</StatLabel>
              <StatNumber>99.8%</StatNumber>
              <StatHelpText>Successful data synchronization</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Transaction Speed</StatLabel>
              <StatNumber>&lt; 3 sec</StatNumber>
              <StatHelpText>Avg. transaction processing time</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Capabilities</Tab>
          <Tab>Offline Features</Tab>
          <Tab>Sync Status</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">POS System Capabilities</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Capability</Th>
                        <Th>Description</Th>
                        <Th>Status</Th>
                        <Th>Details</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {posCapabilities.map((capability) => (
                        <Tr key={capability.id}>
                          <Td fontWeight="bold">{capability.name}</Td>
                          <Td>{capability.description}</Td>
                          <Td>
                            <Badge colorScheme={capability.status === 'enabled' ? 'green' : 'red'}>
                              {capability.status}
                            </Badge>
                          </Td>
                          <Td>{capability.details}</Td>
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
                <Heading size="md">Features Available in Offline Mode</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  The POS system maintains core functionality even when disconnected from the internet.
                  All transactions are stored locally and synchronized when connection is restored.
                </Text>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Feature</Th>
                        <Th>Available Offline</Th>
                        <Th>Notes</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {offlineFeatures.map((feature) => (
                        <Tr key={feature.id}>
                          <Td fontWeight="bold">{feature.feature}</Td>
                          <Td>
                            <Badge colorScheme={feature.available ? 'green' : 'red'}>
                              {feature.available ? 'Yes' : 'No'}
                            </Badge>
                          </Td>
                          <Td>
                            {feature.available 
                              ? 'Fully functional offline' 
                              : 'Requires internet connection'}
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
                <Heading size="md">Sync Status</Heading>
              </CardHeader>
              <CardBody>
                <Flex alignItems="center" mb={4}>
                  <Text mr={4}>Sync Progress:</Text>
                  <Progress value={75} size="md" colorScheme="green" flex={1} />
                  <Text ml={4}>75%</Text>
                </Flex>
                <Text mb={4}>
                  Last sync: Today at 14:30 IST | Next scheduled sync: In 30 mins
                </Text>
                <Button colorScheme="blue" onClick={handleSyncNow}>
                  Sync Now
                </Button>
                
                <Box mt={6}>
                  <Heading size="sm" mb={3}>Recent Sync Activity</Heading>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Entity</Th>
                          <Th>Operation</Th>
                          <Th>Status</Th>
                          <Th>Time</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Transaction</Td>
                          <Td>Created</Td>
                          <Td><Badge colorScheme="green">Success</Badge></Td>
                          <Td>Today, 14:32:15</Td>
                        </Tr>
                        <Tr>
                          <Td>Product</Td>
                          <Td>Updated</Td>
                          <Td><Badge colorScheme="green">Success</Badge></Td>
                          <Td>Today, 14:31:45</Td>
                        </Tr>
                        <Tr>
                          <Td>Customer</Td>
                          <Td>Created</Td>
                          <Td><Badge colorScheme="yellow">Pending</Badge></Td>
                          <Td>Today, 14:30:22</Td>
                        </Tr>
                        <Tr>
                          <Td>Inventory</Td>
                          <Td>Adjusted</Td>
                          <Td><Badge colorScheme="green">Success</Badge></Td>
                          <Td>Today, 14:29:55</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Card>
        <CardHeader>
          <Heading size="md">Rural Market Optimization</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={2}>
            <strong>Designed for Rural Markets:</strong> The POS system is optimized for areas with limited
            internet connectivity and power fluctuations common in rural India.
          </Text>
          <Text mb={2}>
            <strong>Low Resource Usage:</strong> Efficiently uses device resources to ensure smooth operation
            on mid-range hardware commonly available in rural areas.
          </Text>
          <Text>
            <strong>Local Language Support:</strong> Interface supports multiple regional languages
            to assist vendors who may not be comfortable with English.
          </Text>
        </CardBody>
      </Card>
    </Container>
  );
};

export default PosSystemCapabilitiesPage;