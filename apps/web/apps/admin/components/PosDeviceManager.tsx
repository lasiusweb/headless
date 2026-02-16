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
} from '@chakra-ui/react';

// Mock data for demonstration purposes
const mockPosDevices = [
  {
    id: '1',
    name: 'POS Terminal 1',
    deviceId: 'POS-DEV-001',
    location: 'Bangalore Store',
    status: 'active' as const,
    lastSyncAt: new Date('2023-05-20T10:30:00'),
    batteryLevel: 85,
    storageUsed: 2.4,
    storageTotal: 32,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-05-20T10:30:00'),
  },
  {
    id: '2',
    name: 'POS Terminal 2',
    deviceId: 'POS-DEV-002',
    location: 'Mysore Outlet',
    status: 'active' as const,
    lastSyncAt: new Date('2023-05-20T09:15:00'),
    batteryLevel: 45,
    storageUsed: 1.8,
    storageTotal: 32,
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-05-20T09:15:00'),
  },
  {
    id: '3',
    name: 'POS Tablet 1',
    deviceId: 'POS-TAB-001',
    location: 'Mobile Sales Unit',
    status: 'maintenance' as const,
    lastSyncAt: new Date('2023-05-18T14:20:00'),
    batteryLevel: 100,
    storageUsed: 0.9,
    storageTotal: 64,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-05-18T14:20:00'),
  },
];

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
    paymentMethod: 'upi',
    paymentStatus: 'completed',
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
    paymentMethod: 'card',
    paymentStatus: 'completed',
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

const mockSyncLogs = [
  {
    id: '1',
    entityType: 'transaction' as const,
    entityId: 'TXN-001',
    action: 'created' as const,
    status: 'synced' as const,
    syncedAt: new Date('2023-05-20T10:30:00'),
    createdAt: new Date('2023-05-20T10:25:00'),
    updatedAt: new Date('2023-05-20T10:30:00'),
  },
  {
    id: '2',
    entityType: 'product' as const,
    entityId: 'PRD-001',
    action: 'updated' as const,
    status: 'synced' as const,
    syncedAt: new Date('2023-05-20T11:45:00'),
    createdAt: new Date('2023-05-20T11:40:00'),
    updatedAt: new Date('2023-05-20T11:45:00'),
  },
  {
    id: '3',
    entityType: 'customer' as const,
    entityId: 'CUST-001',
    action: 'created' as const,
    status: 'pending' as const,
    createdAt: new Date('2023-05-20T14:20:00'),
    updatedAt: new Date('2023-05-20T14:20:00'),
  },
];

const PosDeviceManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [posDevices, setPosDevices] = useState<any[]>([]);
  const [posTransactions, setPosTransactions] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [newDevice, setNewDevice] = useState({
    name: '',
    deviceId: '',
    location: '',
  });

  useEffect(() => {
    // In a real application, this would fetch from an API
    setPosDevices(mockPosDevices);
    setPosTransactions(mockPosTransactions);
    setSyncLogs(mockSyncLogs);
  }, []);

  const handleRegisterDevice = () => {
    // In a real application, this would make an API call
    console.log('Registering new device:', newDevice);
    
    toast({
      title: 'POS Device Registered',
      description: `POS device ${newDevice.name} has been registered successfully.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    onClose();
  };

  const handleViewDevice = (device: any) => {
    setSelectedDevice(device);
    onOpen();
  };

  const pendingSyncs = syncLogs.filter(log => log.status === 'pending');
  const syncedItems = syncLogs.filter(log => log.status === 'synced');

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">POS Device Management</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {posDevices.length} devices, {pendingSyncs.length} pending syncs
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">POS Device Overview</Heading>
        </CardHeader>
        <CardBody>
          <StatGroup>
            <Stat>
              <StatLabel>Active Devices</StatLabel>
              <StatNumber>{posDevices.filter(d => d.status === 'active').length}</StatNumber>
              <StatHelpText>Currently operational</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Devices in Maintenance</StatLabel>
              <StatNumber>{posDevices.filter(d => d.status === 'maintenance').length}</StatNumber>
              <StatHelpText>Under repair/service</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Sync Success Rate</StatLabel>
              <StatNumber>{syncedItems.length > 0 ? Math.round((syncedItems.length / (syncedItems.length + pendingSyncs.length)) * 100) : 100}%</StatNumber>
              <StatHelpText>Successful data syncs</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Offline Transactions</StatLabel>
              <StatNumber>{posTransactions.filter(t => t.isOffline).length}</StatNumber>
              <StatHelpText>Waiting for sync</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>All Devices</Tab>
          <Tab>Active ({posDevices.filter(d => d.status === 'active').length})</Tab>
          <Tab>Maintenance ({posDevices.filter(d => d.status === 'maintenance').length})</Tab>
          <Tab>Sync Logs</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Device Name</Th>
                    <Th>Device ID</Th>
                    <Th>Location</Th>
                    <Th>Status</Th>
                    <Th>Battery</Th>
                    <Th>Storage</Th>
                    <Th>Last Sync</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {posDevices.map((device) => (
                    <Tr key={device.id}>
                      <Td fontWeight="medium">{device.name}</Td>
                      <Td>{device.deviceId}</Td>
                      <Td>{device.location}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            device.status === 'active' ? 'green' :
                            device.status === 'inactive' ? 'red' : 'yellow'
                          }
                        >
                          {device.status}
                        </Badge>
                      </Td>
                      <Td>
                        {device.batteryLevel}% 
                        {device.batteryLevel < 20 && <Badge ml={2} colorScheme="red">Low</Badge>}
                      </Td>
                      <Td>{device.storageUsed}GB / {device.storageTotal}GB</Td>
                      <Td>{device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleDateString() : 'Never'}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleViewDevice(device)}
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
                    <Th>Device Name</Th>
                    <Th>Device ID</Th>
                    <Th>Location</Th>
                    <Th>Battery</Th>
                    <Th>Storage</Th>
                    <Th>Last Sync</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {posDevices.filter(d => d.status === 'active').map((device) => (
                    <Tr key={device.id}>
                      <Td fontWeight="medium">{device.name}</Td>
                      <Td>{device.deviceId}</Td>
                      <Td>{device.location}</Td>
                      <Td>
                        {device.batteryLevel}% 
                        {device.batteryLevel < 20 && <Badge ml={2} colorScheme="red">Low</Badge>}
                      </Td>
                      <Td>{device.storageUsed}GB / {device.storageTotal}GB</Td>
                      <Td>{device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleDateString() : 'Never'}</Td>
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
                    <Th>Device Name</Th>
                    <Th>Device ID</Th>
                    <Th>Location</Th>
                    <Th>Status</Th>
                    <Th>Last Sync</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {posDevices.filter(d => d.status === 'maintenance').map((device) => (
                    <Tr key={device.id}>
                      <Td fontWeight="medium">{device.name}</Td>
                      <Td>{device.deviceId}</Td>
                      <Td>{device.location}</Td>
                      <Td>
                        <Badge colorScheme="yellow">{device.status}</Badge>
                      </Td>
                      <Td>{device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleDateString() : 'Never'}</Td>
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
                    <Th>Entity</Th>
                    <Th>Entity ID</Th>
                    <Th>Action</Th>
                    <Th>Status</Th>
                    <Th>Created At</Th>
                    <Th>Synced At</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {syncLogs.map((log) => (
                    <Tr key={log.id}>
                      <Td fontWeight="medium">
                        <Badge colorScheme={
                          log.entityType === 'transaction' ? 'blue' : 
                          log.entityType === 'product' ? 'green' : 
                          log.entityType === 'customer' ? 'purple' : 'yellow'
                        }>
                          {log.entityType}
                        </Badge>
                      </Td>
                      <Td>{log.entityId}</Td>
                      <Td>
                        <Badge colorScheme={
                          log.action === 'created' ? 'green' : 
                          log.action === 'updated' ? 'blue' : 'red'
                        }>
                          {log.action}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={log.status === 'synced' ? 'green' : 'yellow'}
                        >
                          {log.status}
                        </Badge>
                      </Td>
                      <Td>{new Date(log.createdAt).toLocaleDateString()}</Td>
                      <Td>{log.syncedAt ? new Date(log.syncedAt).toLocaleDateString() : 'N/A'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Device Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          {selectedDevice ? (
            <>
              <ModalHeader>POS Device Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Card mb={4}>
                  <CardBody>
                    <Text><strong>Name:</strong> {selectedDevice.name}</Text>
                    <Text><strong>Device ID:</strong> {selectedDevice.deviceId}</Text>
                    <Text><strong>Location:</strong> {selectedDevice.location}</Text>
                    <Text><strong>Status:</strong> 
                      <Badge ml={2} colorScheme={
                        selectedDevice.status === 'active' ? 'green' :
                        selectedDevice.status === 'inactive' ? 'red' : 'yellow'
                      }>
                        {selectedDevice.status}
                      </Badge>
                    </Text>
                    <Text><strong>Battery Level:</strong> {selectedDevice.batteryLevel}%</Text>
                    <Text><strong>Storage Used:</strong> {selectedDevice.storageUsed}GB / {selectedDevice.storageTotal}GB</Text>
                    <Text><strong>Last Sync:</strong> {selectedDevice.lastSyncAt ? new Date(selectedDevice.lastSyncAt).toLocaleString() : 'Never'}</Text>
                    <Text><strong>Registered:</strong> {new Date(selectedDevice.createdAt).toLocaleString()}</Text>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Heading size="sm">Device Health</Heading>
                  </CardHeader>
                  <CardBody>
                    <Flex alignItems="center" mb={2}>
                      <Text width="120px">Battery:</Text>
                      <Progress 
                        value={selectedDevice.batteryLevel} 
                        max={100} 
                        colorScheme={selectedDevice.batteryLevel < 20 ? 'red' : 'green'} 
                        flex={1} 
                        mx={4} 
                      />
                      <Text width="50px">{selectedDevice.batteryLevel}%</Text>
                    </Flex>
                    
                    <Flex alignItems="center" mb={2}>
                      <Text width="120px">Storage:</Text>
                      <Progress 
                        value={(selectedDevice.storageUsed / selectedDevice.storageTotal) * 100} 
                        max={100} 
                        colorScheme={(selectedDevice.storageUsed / selectedDevice.storageTotal) > 0.8 ? 'red' : 'green'} 
                        flex={1} 
                        mx={4} 
                      />
                      <Text width="80px">{selectedDevice.storageUsed}GB/{selectedDevice.storageTotal}GB</Text>
                    </Flex>
                  </CardBody>
                </Card>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme="blue">Update Device</Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>Register New POS Device</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl mb={4}>
                  <FormLabel>Device Name</FormLabel>
                  <Input
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                    placeholder="Enter device name"
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Device ID</FormLabel>
                  <Input
                    value={newDevice.deviceId}
                    onChange={(e) => setNewDevice({...newDevice, deviceId: e.target.value})}
                    placeholder="Enter unique device ID"
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
                    placeholder="Enter device location"
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleRegisterDevice}>
                  Register Device
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PosDeviceManager;