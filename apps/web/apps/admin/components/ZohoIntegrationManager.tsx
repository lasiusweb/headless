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
  Switch,
} from '@chakra-ui/react';

// Mock data for demonstration purposes
const mockSyncLogs = [
  {
    id: '1',
    entity: 'contact',
    entityId: 'CUST-001',
    action: 'created' as const,
    status: 'synced' as const,
    syncedAt: new Date('2023-05-15T10:30:00'),
    createdAt: new Date('2023-05-15T10:25:00'),
    updatedAt: new Date('2023-05-15T10:30:00'),
  },
  {
    id: '2',
    entity: 'invoice',
    entityId: 'INV-001',
    action: 'created' as const,
    status: 'synced' as const,
    syncedAt: new Date('2023-05-15T11:45:00'),
    createdAt: new Date('2023-05-15T11:40:00'),
    updatedAt: new Date('2023-05-15T11:45:00'),
  },
  {
    id: '3',
    entity: 'item',
    entityId: 'ITEM-001',
    action: 'updated' as const,
    status: 'failed' as const,
    errorMessage: 'Invalid HSN code format',
    createdAt: new Date('2023-05-15T14:20:00'),
    updatedAt: new Date('2023-05-15T14:20:00'),
  },
];

const ZohoIntegrationManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState({ isConnected: false });
  const [activeTab, setActiveTab] = useState(0);
  const [syncEntity, setSyncEntity] = useState('');
  const [entityId, setEntityId] = useState('');
  const [syncAction, setSyncAction] = useState('created');

  useEffect(() => {
    // In a real application, this would fetch from an API
    setSyncLogs(mockSyncLogs);
    // Simulate connection status
    setConnectionStatus({ isConnected: true });
  }, []);

  const handleManualSync = () => {
    // In a real application, this would make an API call
    console.log(`Manually syncing ${syncEntity} ${entityId} with action ${syncAction}`);
    
    toast({
      title: 'Manual Sync Initiated',
      description: `Syncing ${syncEntity} ${entityId} with action ${syncAction}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    onClose();
  };

  const handleConnectZoho = () => {
    // In a real application, this would redirect to Zoho OAuth
    toast({
      title: 'Zoho Connection',
      description: 'Redirecting to Zoho for authentication',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const successfulSyncs = syncLogs.filter(log => log.status === 'synced');
  const failedSyncs = syncLogs.filter(log => log.status === 'failed');

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Zoho Integration</Heading>
        <Spacer />
        <Badge colorScheme={connectionStatus.isConnected ? 'green' : 'red'}>
          {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Connection Status</Heading>
        </CardHeader>
        <CardBody>
          <Flex justifyContent="space-between" alignItems="center">
            <Text>
              {connectionStatus.isConnected 
                ? 'Connected to Zoho CRM and Books' 
                : 'Not connected to Zoho. Please authenticate.'}
            </Text>
            <Button 
              colorScheme={connectionStatus.isConnected ? 'red' : 'green'} 
              onClick={handleConnectZoho}
            >
              {connectionStatus.isConnected ? 'Disconnect' : 'Connect to Zoho'}
            </Button>
          </Flex>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>All Sync Logs</Tab>
          <Tab>Successful ({successfulSyncs.length})</Tab>
          <Tab>Failed ({failedSyncs.length})</Tab>
          <Tab>Manual Sync</Tab>
        </TabList>
        <TabPanels>
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
                          log.entity === 'contact' ? 'blue' : 
                          log.entity === 'item' ? 'green' : 
                          log.entity === 'invoice' ? 'purple' : 'yellow'
                        }>
                          {log.entity}
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
                          colorScheme={log.status === 'synced' ? 'green' : 'red'}
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
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Entity</Th>
                    <Th>Entity ID</Th>
                    <Th>Action</Th>
                    <Th>Synced At</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {successfulSyncs.map((log) => (
                    <Tr key={log.id}>
                      <Td fontWeight="medium">
                        <Badge colorScheme={
                          log.entity === 'contact' ? 'blue' : 
                          log.entity === 'item' ? 'green' : 
                          log.entity === 'invoice' ? 'purple' : 'yellow'
                        }>
                          {log.entity}
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
                      <Td>{new Date(log.syncedAt).toLocaleDateString()}</Td>
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
                    <Th>Error</Th>
                    <Th>Created At</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {failedSyncs.map((log) => (
                    <Tr key={log.id}>
                      <Td fontWeight="medium">
                        <Badge colorScheme={
                          log.entity === 'contact' ? 'blue' : 
                          log.entity === 'item' ? 'green' : 
                          log.entity === 'invoice' ? 'purple' : 'yellow'
                        }>
                          {log.entity}
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
                      <Td color="red.500">{log.errorMessage}</Td>
                      <Td>{new Date(log.createdAt).toLocaleDateString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardBody>
                <Text mb={4}>Manually sync specific entities with Zoho CRM and Books.</Text>
                
                <Flex gap={4} mb={4}>
                  <FormControl>
                    <FormLabel>Entity Type</FormLabel>
                    <Select 
                      value={syncEntity}
                      onChange={(e) => setSyncEntity(e.target.value)}
                    >
                      <option value="">Select Entity</option>
                      <option value="contact">Contact</option>
                      <option value="item">Item</option>
                      <option value="invoice">Invoice</option>
                      <option value="order">Order</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Entity ID</FormLabel>
                    <Input 
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                      placeholder="Enter entity ID"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Action</FormLabel>
                    <Select 
                      value={syncAction}
                      onChange={(e) => setSyncAction(e.target.value)}
                    >
                      <option value="created">Created</option>
                      <option value="updated">Updated</option>
                      <option value="deleted">Deleted</option>
                    </Select>
                  </FormControl>
                </Flex>
                
                <Button 
                  colorScheme="blue" 
                  onClick={handleManualSync}
                  isDisabled={!syncEntity || !entityId}
                >
                  Sync Now
                </Button>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Card>
        <CardHeader>
          <Heading size="md">Sync Configuration</Heading>
        </CardHeader>
        <CardBody>
          <Flex flexDirection="column" gap={4}>
            <Flex justifyContent="space-between" alignItems="center">
              <Text>Sync Contacts to Zoho CRM</Text>
              <Switch colorScheme="green" defaultChecked />
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
              <Text>Sync Products/Items to Zoho Books</Text>
              <Switch colorScheme="green" defaultChecked />
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
              <Text>Sync Invoices to Zoho Books</Text>
              <Switch colorScheme="green" defaultChecked />
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
              <Text>Sync Orders to Zoho Books as Invoices</Text>
              <Switch colorScheme="green" defaultChecked />
            </Flex>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default ZohoIntegrationManager;