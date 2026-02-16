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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';

// Mock data for demonstration
const mockInventoryItems = [
  {
    id: '1',
    productId: 'PRD-001',
    productName: 'Organic Neem Cake Fertilizer',
    sku: 'NEEM-CAKE-ORG-1KG',
    hsnCode: '31010010',
    category: 'Fertilizers',
    brand: 'KN Biosciences',
    unitOfMeasure: 'kg',
    costPrice: 400,
    sellingPrice: 600,
    taxRate: 18,
    totalStock: 500,
    availableStock: 320,
    reservedStock: 80,
    committedStock: 100,
    reorderLevel: 100,
    maxStockLevel: 1000,
    location: 'Warehouse A',
    binLocation: 'A-01-05',
    supplierId: 'SUP-001',
    supplierName: 'Organic Supplies Co.',
    lastRestockedAt: new Date('2023-05-15'),
    status: 'active' as const,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-05-20'),
  },
  {
    id: '2',
    productId: 'PRD-002',
    productName: 'Bio-Zyme Growth Enhancer',
    sku: 'BIO-ZYME-500ML',
    hsnCode: '38089090',
    category: 'Growth Enhancers',
    brand: 'KN Biosciences',
    unitOfMeasure: 'ml',
    costPrice: 600,
    sellingPrice: 900,
    taxRate: 18,
    totalStock: 300,
    availableStock: 120,
    reservedStock: 30,
    committedStock: 150,
    reorderLevel: 50,
    maxStockLevel: 500,
    location: 'Warehouse B',
    binLocation: 'B-02-03',
    supplierId: 'SUP-002',
    supplierName: 'BioTech Industries',
    lastRestockedAt: new Date('2023-05-10'),
    status: 'active' as const,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-05-21'),
  },
  {
    id: '3',
    productId: 'PRD-003',
    productName: 'Panchagavya Organic Liquid',
    sku: 'PANCH-GAVYA-2L',
    hsnCode: '31010090',
    category: 'Organic Liquids',
    brand: 'KN Biosciences',
    unitOfMeasure: 'L',
    costPrice: 300,
    sellingPrice: 480,
    taxRate: 18,
    totalStock: 200,
    availableStock: 45,
    reservedStock: 15,
    committedStock: 140,
    reorderLevel: 30,
    maxStockLevel: 400,
    location: 'Warehouse C',
    binLocation: 'C-01-02',
    supplierId: 'SUP-001',
    supplierName: 'Organic Supplies Co.',
    lastRestockedAt: new Date('2023-05-05'),
    status: 'active' as const,
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-05-22'),
  },
];

const mockInventoryBatches = [
  {
    id: '1',
    inventoryItemId: '1',
    batchNumber: 'BN-2023-001',
    manufacturingDate: new Date('2023-04-01'),
    expiryDate: new Date('2025-04-01'),
    receivedDate: new Date('2023-05-15'),
    quantity: 500,
    costPerUnit: 400,
    sellingPricePerUnit: 600,
    status: 'active' as const,
    notes: 'First batch of the year',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
  },
  {
    id: '2',
    inventoryItemId: '2',
    batchNumber: 'BN-2023-002',
    manufacturingDate: new Date('2023-03-15'),
    expiryDate: new Date('2024-03-15'),
    receivedDate: new Date('2023-05-10'),
    quantity: 300,
    costPerUnit: 600,
    sellingPricePerUnit: 900,
    status: 'active' as const,
    notes: 'Expiring soon - priority sale',
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-05-10'),
  },
  {
    id: '3',
    inventoryItemId: '3',
    batchNumber: 'BN-2023-003',
    manufacturingDate: new Date('2023-05-01'),
    expiryDate: new Date('2026-05-01'),
    receivedDate: new Date('2023-05-18'),
    quantity: 200,
    costPerUnit: 300,
    sellingPricePerUnit: 480,
    status: 'active' as const,
    notes: 'Fresh batch',
    createdAt: new Date('2023-05-18'),
    updatedAt: new Date('2023-05-18'),
  },
];

const mockExpiryAlerts = [
  {
    id: '1',
    inventoryItemId: '2',
    batchId: '2',
    productName: 'Bio-Zyme Growth Enhancer',
    batchNumber: 'BN-2023-002',
    expiryDate: new Date('2024-03-15'),
    daysUntilExpiry: 25,
    alertLevel: 'critical' as const,
    status: 'active' as const,
    createdAt: new Date('2023-05-10'),
  },
];

const InventoryManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [inventoryBatches, setInventoryBatches] = useState<any[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  useEffect(() => {
    // In a real application, this would fetch from an API
    setInventoryItems(mockInventoryItems);
    setInventoryBatches(mockInventoryBatches);
    setExpiryAlerts(mockExpiryAlerts);
  }, []);

  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    onOpen();
  };

  const handleViewBatch = (batch: any) => {
    setSelectedBatch(batch);
    onOpen();
  };

  const handleResolveAlert = (alertId: string) => {
    setExpiryAlerts(expiryAlerts.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
    ));
    
    toast({
      title: 'Alert Resolved',
      description: 'Expiry alert has been resolved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const lowStockItems = inventoryItems.filter(item => item.availableStock <= item.reorderLevel);
  const activeAlerts = expiryAlerts.filter(alert => alert.status === 'active');

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Inventory Management</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {inventoryItems.length} items, {lowStockItems.length} low stock, {activeAlerts.length} expiry alerts
        </Text>
      </Flex>

      {activeAlerts.length > 0 && (
        <Alert status="warning" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Expiry Alerts</AlertTitle>
          <AlertDescription>
            {activeAlerts.length} product(s) are expiring soon. Please take action.
          </AlertDescription>
        </Alert>
      )}

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Inventory Overview</Heading>
        </CardHeader>
        <CardBody>
          <StatGroup>
            <Stat>
              <StatLabel>Total Items</StatLabel>
              <StatNumber>{inventoryItems.length}</StatNumber>
              <StatHelpText>Active products</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Low Stock Items</StatLabel>
              <StatNumber>{lowStockItems.length}</StatNumber>
              <StatHelpText>Below reorder level</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Expiry Alerts</StatLabel>
              <StatNumber>{activeAlerts.length}</StatNumber>
              <StatHelpText>Products expiring soon</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Total Inventory Value</StatLabel>
              <StatNumber>₹{(inventoryItems.reduce((sum, item) => sum + (item.totalStock * item.costPrice), 0)).toLocaleString('en-IN')}</StatNumber>
              <StatHelpText>At cost price</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>All Items</Tab>
          <Tab>Low Stock ({lowStockItems.length})</Tab>
          <Tab>Batches</Tab>
          <Tab>Expiry Alerts ({activeAlerts.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Product</Th>
                    <Th>SKU</Th>
                    <Th>Category</Th>
                    <Th>Total Stock</Th>
                    <Th>Available</Th>
                    <Th>Reserved</Th>
                    <Th>Reorder Level</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {inventoryItems.map((item) => (
                    <Tr 
                      key={item.id}
                      bg={item.availableStock <= item.reorderLevel ? 'rgba(255, 0, 0, 0.1)' : 'transparent'}
                    >
                      <Td fontWeight="medium">{item.productName}</Td>
                      <Td>{item.sku}</Td>
                      <Td>{item.category}</Td>
                      <Td>{item.totalStock} {item.unitOfMeasure}</Td>
                      <Td>{item.availableStock} {item.unitOfMeasure}</Td>
                      <Td>{item.reservedStock} {item.unitOfMeasure}</Td>
                      <Td>{item.reorderLevel} {item.unitOfMeasure}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            item.availableStock <= item.reorderLevel ? 'red' :
                            item.availableStock <= item.reorderLevel * 1.5 ? 'yellow' : 'green'
                          }
                        >
                          {item.availableStock <= item.reorderLevel ? 'Low Stock' : 
                           item.availableStock <= item.reorderLevel * 1.5 ? 'Medium' : 'In Stock'}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleViewItem(item)}
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
                    <Th>Product</Th>
                    <Th>SKU</Th>
                    <Th>Available Stock</Th>
                    <Th>Reorder Level</Th>
                    <Th>Location</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {lowStockItems.map((item) => (
                    <Tr key={item.id}>
                      <Td fontWeight="medium">{item.productName}</Td>
                      <Td>{item.sku}</Td>
                      <Td>{item.availableStock} {item.unitOfMeasure}</Td>
                      <Td>{item.reorderLevel} {item.unitOfMeasure}</Td>
                      <Td>{item.location} {item.binLocation ? `(${item.binLocation})` : ''}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleViewItem(item)}
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
                    <Th>Batch #</Th>
                    <Th>Product</Th>
                    <Th>Manufacturing Date</Th>
                    <Th>Expiry Date</Th>
                    <Th>Quantity</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {inventoryBatches.map((batch) => (
                    <Tr 
                      key={batch.id}
                      bg={batch.expiryDate && new Date(batch.expiryDate) < new Date() && batch.status !== 'expired' ? 'rgba(255, 0, 0, 0.1)' : 'transparent'}
                    >
                      <Td fontWeight="medium">{batch.batchNumber}</Td>
                      <Td>{inventoryItems.find(item => item.id === batch.inventoryItemId)?.productName || 'Unknown'}</Td>
                      <Td>{batch.manufacturingDate ? new Date(batch.manufacturingDate).toLocaleDateString() : 'N/A'}</Td>
                      <Td>
                        {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'N/A'}
                        {batch.expiryDate && new Date(batch.expiryDate) < new Date() && (
                          <Badge ml={2} colorScheme="red">Expired</Badge>
                        )}
                      </Td>
                      <Td>{batch.quantity}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            batch.status === 'active' ? 'green' :
                            batch.status === 'expired' ? 'red' :
                            batch.status === 'quarantined' ? 'yellow' : 'gray'
                          }
                        >
                          {batch.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleViewBatch(batch)}
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
            {activeAlerts.length === 0 ? (
              <Card>
                <CardBody>
                  <Text textAlign="center" py={10}>
                    No active expiry alerts. All products are within safe expiry dates.
                  </Text>
                </CardBody>
              </Card>
            ) : (
              <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Product</Th>
                      <Th>Batch #</Th>
                      <Th>Expiry Date</Th>
                      <Th>Days Until Expiry</Th>
                      <Th>Alert Level</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {activeAlerts.map((alert) => (
                      <Tr key={alert.id}>
                        <Td fontWeight="medium">{alert.productName}</Td>
                        <Td>{alert.batchNumber}</Td>
                        <Td>{new Date(alert.expiryDate).toLocaleDateString()}</Td>
                        <Td>
                          <Badge colorScheme={alert.daysUntilExpiry < 30 ? 'red' : 'yellow'}>
                            {alert.daysUntilExpiry} days
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={alert.alertLevel === 'critical' ? 'red' : 'yellow'}>
                            {alert.alertLevel}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Item/Batch Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {selectedItem ? (
            <>
              <ModalHeader>Inventory Item Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Card mb={4}>
                  <CardBody>
                    <Text><strong>Product:</strong> {selectedItem.productName}</Text>
                    <Text><strong>SKU:</strong> {selectedItem.sku}</Text>
                    <Text><strong>HSN Code:</strong> {selectedItem.hsnCode}</Text>
                    <Text><strong>Category:</strong> {selectedItem.category}</Text>
                    <Text><strong>Brand:</strong> {selectedItem.brand}</Text>
                    <Text><strong>Unit of Measure:</strong> {selectedItem.unitOfMeasure}</Text>
                    <Text><strong>Cost Price:</strong> ₹{selectedItem.costPrice}</Text>
                    <Text><strong>Selling Price:</strong> ₹{selectedItem.sellingPrice}</Text>
                    <Text><strong>Tax Rate:</strong> {selectedItem.taxRate}%</Text>
                  </CardBody>
                </Card>
                
                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Stock Levels</Heading>
                  </CardHeader>
                  <CardBody>
                    <Flex justifyContent="space-around" mb={4}>
                      <Box textAlign="center">
                        <Text fontWeight="bold">Total Stock</Text>
                        <Text fontSize="2xl">{selectedItem.totalStock}</Text>
                        <Text fontSize="sm">{selectedItem.unitOfMeasure}</Text>
                      </Box>
                      <Box textAlign="center">
                        <Text fontWeight="bold">Available</Text>
                        <Text fontSize="2xl" color="green.500">{selectedItem.availableStock}</Text>
                        <Text fontSize="sm">{selectedItem.unitOfMeasure}</Text>
                      </Box>
                      <Box textAlign="center">
                        <Text fontWeight="bold">Reserved</Text>
                        <Text fontSize="2xl" color="yellow.500">{selectedItem.reservedStock}</Text>
                        <Text fontSize="sm">{selectedItem.unitOfMeasure}</Text>
                      </Box>
                      <Box textAlign="center">
                        <Text fontWeight="bold">Committed</Text>
                        <Text fontSize="2xl" color="blue.500">{selectedItem.committedStock}</Text>
                        <Text fontSize="sm">{selectedItem.unitOfMeasure}</Text>
                      </Box>
                    </Flex>
                    
                    <Box>
                      <Text><strong>Reorder Level:</strong> {selectedItem.reorderLevel} {selectedItem.unitOfMeasure}</Text>
                      <Text><strong>Max Stock Level:</strong> {selectedItem.maxStockLevel || 'N/A'} {selectedItem.unitOfMeasure}</Text>
                      <Text><strong>Location:</strong> {selectedItem.location} {selectedItem.binLocation ? `(${selectedItem.binLocation})` : ''}</Text>
                      <Text><strong>Supplier:</strong> {selectedItem.supplierName}</Text>
                      <Text><strong>Last Restocked:</strong> {selectedItem.lastRestockedAt ? new Date(selectedItem.lastRestockedAt).toLocaleDateString() : 'Never'}</Text>
                      <Text><strong>Status:</strong> 
                        <Badge ml={2} colorScheme={selectedItem.status === 'active' ? 'green' : 'red'}>
                          {selectedItem.status}
                        </Badge>
                      </Text>
                    </Box>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Heading size="sm">Stock Level Indicator</Heading>
                  </CardHeader>
                  <CardBody>
                    <Flex alignItems="center" mb={2}>
                      <Text width="120px">Stock Level:</Text>
                      <Progress 
                        value={(selectedItem.availableStock / (selectedItem.maxStockLevel || selectedItem.reorderLevel * 2)) * 100} 
                        max={100} 
                        colorScheme={selectedItem.availableStock <= selectedItem.reorderLevel ? 'red' : selectedItem.availableStock <= selectedItem.reorderLevel * 1.5 ? 'yellow' : 'green'} 
                        flex={1} 
                        mx={4} 
                      />
                      <Text width="50px">{Math.round((selectedItem.availableStock / (selectedItem.maxStockLevel || selectedItem.reorderLevel * 2)) * 100)}%</Text>
                    </Flex>
                  </CardBody>
                </Card>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme="blue">Edit Item</Button>
              </ModalFooter>
            </>
          ) : selectedBatch ? (
            <>
              <ModalHeader>Batch Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Card mb={4}>
                  <CardBody>
                    <Text><strong>Batch Number:</strong> {selectedBatch.batchNumber}</Text>
                    <Text><strong>Product:</strong> {inventoryItems.find(item => item.id === selectedBatch.inventoryItemId)?.productName || 'Unknown'}</Text>
                    <Text><strong>Manufacturing Date:</strong> {selectedBatch.manufacturingDate ? new Date(selectedBatch.manufacturingDate).toLocaleDateString() : 'N/A'}</Text>
                    <Text><strong>Expiry Date:</strong> {selectedBatch.expiryDate ? new Date(selectedBatch.expiryDate).toLocaleDateString() : 'N/A'}</Text>
                    <Text><strong>Received Date:</strong> {new Date(selectedBatch.receivedDate).toLocaleDateString()}</Text>
                    <Text><strong>Quantity:</strong> {selectedBatch.quantity}</Text>
                    <Text><strong>Cost Per Unit:</strong> ₹{selectedBatch.costPerUnit}</Text>
                    <Text><strong>Selling Price Per Unit:</strong> ₹{selectedBatch.sellingPricePerUnit}</Text>
                    <Text><strong>Status:</strong> 
                      <Badge ml={2} colorScheme={
                        selectedBatch.status === 'active' ? 'green' :
                        selectedBatch.status === 'expired' ? 'red' :
                        selectedBatch.status === 'quarantined' ? 'yellow' : 'gray'
                      }>
                        {selectedBatch.status}
                      </Badge>
                    </Text>
                    <Text><strong>Notes:</strong> {selectedBatch.notes || 'N/A'}</Text>
                  </CardBody>
                </Card>
                
                {selectedBatch.expiryDate && (
                  <Card>
                    <CardHeader>
                      <Heading size="sm">Expiry Information</Heading>
                    </CardHeader>
                    <CardBody>
                      {(() => {
                        const now = new Date();
                        const expiryDate = new Date(selectedBatch.expiryDate);
                        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <>
                            <Text><strong>Days Until Expiry:</strong> 
                              <Badge ml={2} colorScheme={daysUntilExpiry < 30 ? 'red' : daysUntilExpiry < 60 ? 'yellow' : 'green'}>
                                {daysUntilExpiry} days
                              </Badge>
                            </Text>
                            <Text><strong>Expiry Status:</strong> 
                              <Badge ml={2} colorScheme={
                                daysUntilExpiry < 0 ? 'red' :
                                daysUntilExpiry < 30 ? 'red' :
                                daysUntilExpiry < 60 ? 'yellow' : 'green'
                              }>
                                {daysUntilExpiry < 0 ? 'Expired' :
                                 daysUntilExpiry < 30 ? 'Critical' :
                                 daysUntilExpiry < 60 ? 'Warning' : 'Safe'}
                              </Badge>
                            </Text>
                          </>
                        );
                      })()}
                    </CardBody>
                  </Card>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme="blue">Edit Batch</Button>
              </ModalFooter>
            </>
          ) : null}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InventoryManager;