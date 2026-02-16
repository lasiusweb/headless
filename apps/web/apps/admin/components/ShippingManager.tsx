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
} from '@chakra-ui/react';
import { ShippingOrder } from '../../../api/src/modules/shipping/interfaces/shipping.interface';

// Mock data for demonstration purposes
const mockShippingOrders: ShippingOrder[] = [
  {
    id: '1',
    orderId: 'ORD2023050001',
    customerId: 'CUST-001',
    shippingAddress: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      contactName: 'Rajesh Kumar',
      contactPhone: '9876543210',
    },
    billingAddress: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      contactName: 'Rajesh Kumar',
      contactPhone: '9876543210',
    },
    items: [
      {
        id: 'item1',
        productId: 'PRD-001',
        productName: 'Organic Neem Cake Fertilizer',
        quantity: 5,
        weight: 5,
        dimensions: { length: 30, width: 20, height: 10 },
      },
      {
        id: 'item2',
        productId: 'PRD-002',
        productName: 'Bio-Zyme Growth Enhancer',
        quantity: 3,
        weight: 3,
        dimensions: { length: 25, width: 15, height: 10 },
      }
    ],
    carrier: 'delhivery',
    serviceType: 'express',
    weight: 8,
    dimensions: { length: 30, width: 20, height: 10 },
    declaredValue: 6826,
    status: 'in_transit',
    trackingNumber: 'DL1234567890',
    labelUrl: 'https://example.com/labels/DL1234567890.pdf',
    shippingCost: 150,
    estimatedDeliveryDate: new Date('2023-05-18'),
    createdAt: new Date('2023-05-15T12:00:00'),
    updatedAt: new Date('2023-05-16T10:30:00'),
  },
  {
    id: '2',
    orderId: 'ORD2023050002',
    customerId: 'CUST-002',
    shippingAddress: {
      street: '456 Agriculture Lane',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
      contactName: 'Priya Sharma',
      contactPhone: '8765432109',
    },
    billingAddress: {
      street: '456 Agriculture Lane',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
      contactName: 'Priya Sharma',
      contactPhone: '8765432109',
    },
    items: [
      {
        id: 'item1',
        productId: 'PRD-003',
        productName: 'Panchagavya Organic Liquid',
        quantity: 10,
        weight: 20,
        dimensions: { length: 40, width: 30, height: 20 },
      }
    ],
    carrier: 'vrl',
    serviceType: 'standard',
    weight: 20,
    dimensions: { length: 40, width: 30, height: 20 },
    declaredValue: 5664,
    status: 'delivered',
    trackingNumber: 'VRL0987654321',
    labelUrl: 'https://example.com/labels/VRL0987654321.pdf',
    shippingCost: 300,
    estimatedDeliveryDate: new Date('2023-05-17'),
    actualDeliveryDate: new Date('2023-05-17T14:20:00'),
    createdAt: new Date('2023-05-16T09:15:00'),
    updatedAt: new Date('2023-05-17T14:20:00'),
  },
  {
    id: '3',
    orderId: 'ORD2023050003',
    customerId: 'CUST-003',
    shippingAddress: {
      street: '789 Farm Street',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      country: 'India',
      contactName: 'Suresh Patel',
      contactPhone: '7654321098',
    },
    billingAddress: {
      street: '789 Farm Street',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      country: 'India',
      contactName: 'Suresh Patel',
      contactPhone: '7654321098',
    },
    items: [
      {
        id: 'item1',
        productId: 'PRD-001',
        productName: 'Organic Neem Cake Fertilizer',
        quantity: 2,
        weight: 2,
        dimensions: { length: 30, width: 20, height: 10 },
      }
    ],
    carrier: 'delhivery',
    serviceType: 'standard',
    weight: 2,
    dimensions: { length: 30, width: 20, height: 10 },
    declaredValue: 2460,
    status: 'out_for_delivery',
    trackingNumber: 'DL1122334455',
    labelUrl: 'https://example.com/labels/DL1122334455.pdf',
    shippingCost: 100,
    estimatedDeliveryDate: new Date('2023-05-18'),
    createdAt: new Date('2023-05-17T08:30:00'),
    updatedAt: new Date('2023-05-18T09:15:00'),
  },
];

const ShippingManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [shippingOrders, setShippingOrders] = useState<ShippingOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ShippingOrder | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    // In a real application, this would fetch from an API
    setShippingOrders(mockShippingOrders);
  }, []);

  const handleUpdateStatus = (order: ShippingOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    onOpen();
  };

  const confirmStatusUpdate = () => {
    if (!selectedOrder) return;

    // In a real application, this would make an API call
    console.log(`Updating status for order ${selectedOrder.id} to ${newStatus}`);
    
    // Update the shipping order status
    const updatedOrders = shippingOrders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          status: newStatus as any,
          updatedAt: new Date(),
        };
      }
      return order;
    });

    setShippingOrders(updatedOrders);
    
    toast({
      title: 'Shipping Status Updated',
      description: `Shipping order for ${selectedOrder.orderId} has been updated to ${newStatus}.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    onClose();
  };

  const pendingShipments = shippingOrders.filter(order => order.status === 'pending' || order.status === 'label_generated');
  const inTransitShipments = shippingOrders.filter(order => order.status === 'in_transit' || order.status === 'out_for_delivery');
  const deliveredShipments = shippingOrders.filter(order => order.status === 'delivered');

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Shipping Management</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {pendingShipments.length} pending, {inTransitShipments.length} in transit
        </Text>
      </Flex>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>All Shipments</Tab>
          <Tab>Pending ({pendingShipments.length})</Tab>
          <Tab>In Transit ({inTransitShipments.length})</Tab>
          <Tab>Delivered ({deliveredShipments.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Carrier</Th>
                    <Th>Service</Th>
                    <Th>Tracking #</Th>
                    <Th>Weight</Th>
                    <Th>Status</Th>
                    <Th>Est. Delivery</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {shippingOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td fontWeight="medium">{order.orderId}</Td>
                      <Td>{order.customerId}</Td>
                      <Td>
                        <Badge colorScheme={order.carrier === 'delhivery' ? 'blue' : 'green'}>
                          {order.carrier}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={
                          order.serviceType === 'express' ? 'orange' : 
                          order.serviceType === 'standard' ? 'gray' : 
                          'red'
                        }>
                          {order.serviceType}
                        </Badge>
                      </Td>
                      <Td>{order.trackingNumber}</Td>
                      <Td>{order.weight} kg</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            order.status === 'delivered' ? 'green' :
                            order.status === 'in_transit' ? 'blue' :
                            order.status === 'out_for_delivery' ? 'yellow' :
                            order.status === 'pending' ? 'gray' : 'red'
                          }
                        >
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </Td>
                      <Td>{order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleUpdateStatus(order)}
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
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Carrier</Th>
                    <Th>Tracking #</Th>
                    <Th>Weight</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingShipments.map((order) => (
                    <Tr key={order.id}>
                      <Td fontWeight="medium">{order.orderId}</Td>
                      <Td>{order.customerId}</Td>
                      <Td>
                        <Badge colorScheme={order.carrier === 'delhivery' ? 'blue' : 'green'}>
                          {order.carrier}
                        </Badge>
                      </Td>
                      <Td>{order.trackingNumber}</Td>
                      <Td>{order.weight} kg</Td>
                      <Td>
                        <Badge colorScheme={order.status === 'pending' ? 'gray' : 'yellow'}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </Td>
                      <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleUpdateStatus(order)}
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
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Carrier</Th>
                    <Th>Tracking #</Th>
                    <Th>Weight</Th>
                    <Th>Status</Th>
                    <Th>Est. Delivery</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {inTransitShipments.map((order) => (
                    <Tr key={order.id}>
                      <Td fontWeight="medium">{order.orderId}</Td>
                      <Td>{order.customerId}</Td>
                      <Td>
                        <Badge colorScheme={order.carrier === 'delhivery' ? 'blue' : 'green'}>
                          {order.carrier}
                        </Badge>
                      </Td>
                      <Td>{order.trackingNumber}</Td>
                      <Td>{order.weight} kg</Td>
                      <Td>
                        <Badge colorScheme={order.status === 'in_transit' ? 'blue' : 'yellow'}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </Td>
                      <Td>{order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleUpdateStatus(order)}
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
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Customer</Th>
                    <Th>Carrier</Th>
                    <Th>Tracking #</Th>
                    <Th>Weight</Th>
                    <Th>Actual Delivery</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {deliveredShipments.map((order) => (
                    <Tr key={order.id}>
                      <Td fontWeight="medium">{order.orderId}</Td>
                      <Td>{order.customerId}</Td>
                      <Td>
                        <Badge colorScheme={order.carrier === 'delhivery' ? 'blue' : 'green'}>
                          {order.carrier}
                        </Badge>
                      </Td>
                      <Td>{order.trackingNumber}</Td>
                      <Td>{order.weight} kg</Td>
                      <Td>{order.actualDeliveryDate ? new Date(order.actualDeliveryDate).toLocaleDateString() : 'N/A'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Update Status Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Shipping Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <>
                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Shipping Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text><strong>Order:</strong> {selectedOrder.orderId}</Text>
                    <Text><strong>Customer:</strong> {selectedOrder.customerId}</Text>
                    <Text><strong>Carrier:</strong> {selectedOrder.carrier}</Text>
                    <Text><strong>Tracking #:</strong> {selectedOrder.trackingNumber}</Text>
                    <Text><strong>Current Status:</strong> {selectedOrder.status}</Text>
                  </CardBody>
                </Card>
                
                <FormControl mb={4}>
                  <FormLabel>New Status</FormLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="label_generated">Label Generated</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="returned">Returned</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={confirmStatusUpdate}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ShippingManager;