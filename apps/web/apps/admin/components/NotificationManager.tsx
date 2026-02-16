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
  Switch,
  Textarea,
} from '@chakra-ui/react';

// Mock data for demonstration
const mockNotifications = [
  {
    id: '1',
    type: 'email' as const,
    category: 'order' as const,
    priority: 'high' as const,
    recipientType: 'customer' as const,
    recipientId: 'CUST-001',
    recipientEmail: 'customer@example.com',
    subject: 'Order Confirmation - ORD2023050001',
    message: 'Your order has been confirmed.',
    status: 'delivered' as const,
    sentAt: new Date('2023-05-20T10:30:00'),
    deliveredAt: new Date('2023-05-20T10:30:05'),
    readAt: new Date('2023-05-20T11:00:00'),
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date('2023-05-20T10:30:00'),
    updatedAt: new Date('2023-05-20T11:00:00'),
  },
  {
    id: '2',
    type: 'email' as const,
    category: 'shipping' as const,
    priority: 'high' as const,
    recipientType: 'customer' as const,
    recipientId: 'CUST-002',
    recipientEmail: 'customer2@example.com',
    subject: 'Your Order Has Been Shipped',
    message: 'Your order has been shipped with tracking number DL123456.',
    status: 'delivered' as const,
    sentAt: new Date('2023-05-20T14:20:00'),
    deliveredAt: new Date('2023-05-20T14:20:05'),
    readAt: null,
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date('2023-05-20T14:20:00'),
    updatedAt: new Date('2023-05-20T14:20:05'),
  },
  {
    id: '3',
    type: 'email' as const,
    category: 'inventory' as const,
    priority: 'urgent' as const,
    recipientType: 'admin' as const,
    recipientEmail: 'admin@knbiosciences.in',
    subject: 'Low Stock Alert - Organic Neem Cake Fertilizer',
    message: 'Stock has fallen below reorder level.',
    status: 'delivered' as const,
    sentAt: new Date('2023-05-21T09:00:00'),
    deliveredAt: new Date('2023-05-21T09:00:05'),
    readAt: new Date('2023-05-21T09:15:00'),
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date('2023-05-21T09:00:00'),
    updatedAt: new Date('2023-05-21T09:15:00'),
  },
  {
    id: '4',
    type: 'sms' as const,
    category: 'payment' as const,
    priority: 'high' as const,
    recipientType: 'customer' as const,
    recipientId: 'CUST-003',
    recipientPhone: '9876543210',
    subject: 'Payment Received',
    message: 'Your payment of Rs. 2500 has been received for order ORD2023050003.',
    status: 'failed' as const,
    failedReason: 'Invalid phone number',
    retryCount: 3,
    maxRetries: 3,
    createdAt: new Date('2023-05-21T11:30:00'),
    updatedAt: new Date('2023-05-21T11:35:00'),
  },
];

const mockNotificationTemplates = [
  {
    id: 'tpl-order-confirmed',
    name: 'Order Confirmation',
    type: 'email' as const,
    category: 'order' as const,
    subject: 'Order Confirmation - {{orderNumber}}',
    body: 'Dear {{customerName}},\n\nYour order {{orderNumber}} has been confirmed.\n\nOrder Total: Rs.{{orderTotal}}\n\nThank you for shopping with KN Biosciences!',
    variables: ['customerName', 'orderNumber', 'orderTotal'],
    isActive: true,
    language: 'en',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: 'tpl-order-shipped',
    name: 'Order Shipped',
    type: 'email' as const,
    category: 'shipping' as const,
    subject: 'Your Order {{orderNumber}} Has Been Shipped',
    body: 'Dear {{customerName}},\n\nGreat news! Your order {{orderNumber}} has been shipped.\n\nTracking Number: {{trackingNumber}}\n\nExpected Delivery: {{expectedDelivery}}',
    variables: ['customerName', 'orderNumber', 'trackingNumber', 'expectedDelivery'],
    isActive: true,
    language: 'en',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: 'tpl-low-stock-alert',
    name: 'Low Stock Alert',
    type: 'email' as const,
    category: 'inventory' as const,
    subject: 'Low Stock Alert - {{productName}}',
    body: 'Alert: {{productName}} (SKU: {{sku}}) has fallen below reorder level.\n\nCurrent Stock: {{currentStock}}\nReorder Level: {{reorderLevel}}\n\nPlease restock soon.',
    variables: ['productName', 'sku', 'currentStock', 'reorderLevel'],
    isActive: true,
    language: 'en',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
];

const NotificationManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [newNotification, setNewNotification] = useState({
    type: 'email',
    category: 'order',
    priority: 'medium',
    recipientType: 'customer',
    recipientEmail: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    // In a real application, this would fetch from an API
    setNotifications(mockNotifications);
    setTemplates(mockNotificationTemplates);
  }, []);

  const handleViewNotification = (notification: any) => {
    setSelectedNotification(notification);
    onOpen();
  };

  const handleViewTemplate = (template: any) => {
    setSelectedTemplate(template);
    onOpen();
  };

  const handleCreateNotification = () => {
    // In a real application, this would make an API call
    console.log('Creating new notification:', newNotification);
    
    toast({
      title: 'Notification Created',
      description: `Notification has been created and queued for delivery.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    onClose();
  };

  const deliveredNotifications = notifications.filter(n => n.status === 'delivered');
  const failedNotifications = notifications.filter(n => n.status === 'failed');
  const pendingNotifications = notifications.filter(n => n.status === 'pending' || n.status === 'queued');

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Notification Management</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {notifications.length} total, {deliveredNotifications.length} delivered, {failedNotifications.length} failed
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Notification Overview</Heading>
        </CardHeader>
        <CardBody>
          <StatGroup>
            <Stat>
              <StatLabel>Total Notifications</StatLabel>
              <StatNumber>{notifications.length}</StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Delivered</StatLabel>
              <StatNumber>{deliveredNotifications.length}</StatNumber>
              <StatHelpText>{notifications.length > 0 ? Math.round((deliveredNotifications.length / notifications.length) * 100) : 0}% delivery rate</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Failed</StatLabel>
              <StatNumber>{failedNotifications.length}</StatNumber>
              <StatHelpText>Requires attention</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Pending</StatLabel>
              <StatNumber>{pendingNotifications.length}</StatNumber>
              <StatHelpText>Awaiting delivery</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>All Notifications</Tab>
          <Tab>Templates</Tab>
          <Tab>Delivery Stats</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Notification History</Heading>
              <Button colorScheme="blue" onClick={onOpen}>
                Create New Notification
              </Button>
            </Flex>
            
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Type</Th>
                    <Th>Category</Th>
                    <Th>Priority</Th>
                    <Th>Recipient</Th>
                    <Th>Subject</Th>
                    <Th>Status</Th>
                    <Th>Sent At</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {notifications.map((notification) => (
                    <Tr key={notification.id}>
                      <Td>
                        <Badge colorScheme={
                          notification.type === 'email' ? 'blue' :
                          notification.type === 'sms' ? 'green' :
                          notification.type === 'whatsapp' ? 'purple' :
                          notification.type === 'push' ? 'orange' : 'gray'
                        }>
                          {notification.type}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={
                          notification.category === 'order' ? 'blue' :
                          notification.category === 'payment' ? 'green' :
                          notification.category === 'shipping' ? 'purple' :
                          notification.category === 'inventory' ? 'yellow' :
                          notification.category === 'alert' ? 'red' : 'gray'
                        }>
                          {notification.category}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={
                          notification.priority === 'low' ? 'gray' :
                          notification.priority === 'medium' ? 'blue' :
                          notification.priority === 'high' ? 'orange' : 'red'
                        }>
                          {notification.priority}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{notification.recipientEmail || notification.recipientPhone || notification.recipientId}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" noOfLines={1}>{notification.subject}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={
                          notification.status === 'delivered' ? 'green' :
                          notification.status === 'sent' ? 'blue' :
                          notification.status === 'failed' ? 'red' : 'yellow'
                        }>
                          {notification.status}
                        </Badge>
                      </Td>
                      <Td>{notification.sentAt ? new Date(notification.sentAt).toLocaleString() : 'N/A'}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleViewNotification(notification)}
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
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Notification Templates</Heading>
              <Button colorScheme="blue">Create New Template</Button>
            </Flex>
            
            <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Template Name</Th>
                    <Th>Type</Th>
                    <Th>Category</Th>
                    <Th>Variables</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {templates.map((template) => (
                    <Tr key={template.id}>
                      <Td fontWeight="medium">{template.name}</Td>
                      <Td>
                        <Badge colorScheme={
                          template.type === 'email' ? 'blue' :
                          template.type === 'sms' ? 'green' :
                          template.type === 'whatsapp' ? 'purple' :
                          template.type === 'push' ? 'orange' : 'gray'
                        }>
                          {template.type}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={
                          template.category === 'order' ? 'blue' :
                          template.category === 'payment' ? 'green' :
                          template.category === 'shipping' ? 'purple' :
                          template.category === 'inventory' ? 'yellow' :
                          template.category === 'alert' ? 'red' : 'gray'
                        }>
                          {template.category}
                        </Badge>
                      </Td>
                      <Td>
                        <Flex gap={1} flexWrap="wrap">
                          {template.variables.map((variable: string) => (
                            <Badge key={variable} colorScheme="gray" fontSize="xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </Flex>
                      </Td>
                      <Td>
                        <Badge colorScheme={template.isActive ? 'green' : 'red'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleViewTemplate(template)}
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
            <Card>
              <CardHeader>
                <Heading size="md">Delivery Statistics</Heading>
              </CardHeader>
              <CardBody>
                <Flex justifyContent="space-around" flexWrap="wrap" mb={6}>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="18%">
                    <Text fontWeight="bold">Email</Text>
                    <Text fontSize="2xl" color="blue.500">{notifications.filter(n => n.type === 'email').length}</Text>
                    <Text fontSize="sm">Sent</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="18%">
                    <Text fontWeight="bold">SMS</Text>
                    <Text fontSize="2xl" color="green.500">{notifications.filter(n => n.type === 'sms').length}</Text>
                    <Text fontSize="sm">Sent</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="18%">
                    <Text fontWeight="bold">WhatsApp</Text>
                    <Text fontSize="2xl" color="purple.500">{notifications.filter(n => n.type === 'whatsapp').length}</Text>
                    <Text fontSize="sm">Sent</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="18%">
                    <Text fontWeight="bold">Push</Text>
                    <Text fontSize="2xl" color="orange.500">{notifications.filter(n => n.type === 'push').length}</Text>
                    <Text fontSize="sm">Sent</Text>
                  </Box>
                  <Box textAlign="center" p={4} borderWidth={1} borderRadius="md" width="18%">
                    <Text fontWeight="bold">In-App</Text>
                    <Text fontSize="2xl" color="gray.500">{notifications.filter(n => n.type === 'in-app').length}</Text>
                    <Text fontSize="sm">Sent</Text>
                  </Box>
                </Flex>

                <Box>
                  <Heading size="sm" mb={3}>Delivery Rate by Category</Heading>
                  {['order', 'payment', 'shipping', 'inventory', 'alert'].map((category) => {
                    const categoryNotifications = notifications.filter(n => n.category === category);
                    const deliveredCount = categoryNotifications.filter(n => n.status === 'delivered').length;
                    const deliveryRate = categoryNotifications.length > 0 ? (deliveredCount / categoryNotifications.length) * 100 : 0;
                    
                    return (
                      <Flex key={category} alignItems="center" mb={2}>
                        <Text width="120px" textTransform="capitalize">{category}</Text>
                        <Progress 
                          value={deliveryRate} 
                          max={100} 
                          colorScheme={deliveryRate >= 90 ? 'green' : deliveryRate >= 70 ? 'yellow' : 'red'} 
                          flex={1} 
                          mx={4} 
                        />
                        <Text width="60px" textAlign="right">{deliveryRate.toFixed(0)}%</Text>
                      </Flex>
                    );
                  })}
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Notification/Template Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {!selectedTemplate ? (
            <>
              <ModalHeader>Create New Notification</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl mb={4}>
                  <FormLabel>Notification Type</FormLabel>
                  <Select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="push">Push Notification</option>
                    <option value="in-app">In-App</option>
                  </Select>
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={newNotification.category}
                    onChange={(e) => setNewNotification({...newNotification, category: e.target.value})}
                  >
                    <option value="order">Order</option>
                    <option value="payment">Payment</option>
                    <option value="shipping">Shipping</option>
                    <option value="inventory">Inventory</option>
                    <option value="promotion">Promotion</option>
                    <option value="system">System</option>
                    <option value="alert">Alert</option>
                  </Select>
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={newNotification.priority}
                    onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Recipient Type</FormLabel>
                  <Select
                    value={newNotification.recipientType}
                    onChange={(e) => setNewNotification({...newNotification, recipientType: e.target.value})}
                  >
                    <option value="customer">Customer</option>
                    <option value="dealer">Dealer</option>
                    <option value="distributor">Distributor</option>
                    <option value="admin">Admin</option>
                    <option value="all">All</option>
                  </Select>
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Recipient Email</FormLabel>
                  <Input
                    type="email"
                    value={newNotification.recipientEmail}
                    onChange={(e) => setNewNotification({...newNotification, recipientEmail: e.target.value})}
                    placeholder="Enter recipient email"
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    value={newNotification.subject}
                    onChange={(e) => setNewNotification({...newNotification, subject: e.target.value})}
                    placeholder="Enter notification subject"
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    placeholder="Enter notification message"
                    rows={5}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleCreateNotification}>
                  Send Notification
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>Template Details: {selectedTemplate.name}</ModalHeader>
              <ModalCloseButton onClick={() => setSelectedTemplate(null)} />
              <ModalBody>
                <Card mb={4}>
                  <CardBody>
                    <Text><strong>Type:</strong> 
                      <Badge ml={2} colorScheme={
                        selectedTemplate.type === 'email' ? 'blue' :
                        selectedTemplate.type === 'sms' ? 'green' :
                        selectedTemplate.type === 'whatsapp' ? 'purple' :
                        selectedTemplate.type === 'push' ? 'orange' : 'gray'
                      }>
                        {selectedTemplate.type}
                      </Badge>
                    </Text>
                    <Text><strong>Category:</strong> 
                      <Badge ml={2} colorScheme={
                        selectedTemplate.category === 'order' ? 'blue' :
                        selectedTemplate.category === 'payment' ? 'green' :
                        selectedTemplate.category === 'shipping' ? 'purple' :
                        selectedTemplate.category === 'inventory' ? 'yellow' :
                        selectedTemplate.category === 'alert' ? 'red' : 'gray'
                      }>
                        {selectedTemplate.category}
                      </Badge>
                    </Text>
                    <Text><strong>Language:</strong> {selectedTemplate.language}</Text>
                    <Text><strong>Status:</strong> 
                      <Badge ml={2} colorScheme={selectedTemplate.isActive ? 'green' : 'red'}>
                        {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Text>
                  </CardBody>
                </Card>
                
                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Subject Template</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text fontFamily="mono" bg="gray.100" p={2} borderRadius="md">
                      {selectedTemplate.subject}
                    </Text>
                  </CardBody>
                </Card>
                
                <Card mb={4}>
                  <CardHeader>
                    <Heading size="sm">Message Template</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text fontFamily="mono" bg="gray.100" p={2} borderRadius="md" whiteSpace="pre-wrap">
                      {selectedTemplate.body}
                    </Text>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Heading size="sm">Available Variables</Heading>
                  </CardHeader>
                  <CardBody>
                    <Flex gap={2} flexWrap="wrap">
                      {selectedTemplate.variables.map((variable: string) => (
                        <Badge key={variable} colorScheme="blue" fontSize="sm" p={2}>
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </Flex>
                  </CardBody>
                </Card>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={() => setSelectedTemplate(null)}>
                  Close
                </Button>
                <Button colorScheme="blue">Edit Template</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default NotificationManager;