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
} from '@chakra-ui/react';

const ShippingCarrierIntegrationPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);

  // Mock data for shipping carriers
  const shippingCarriers = [
    {
      id: 'delhivery',
      name: 'Delhivery',
      status: 'active' as const,
      supportedServices: ['standard', 'express', 'same_day', 'next_day'],
      integrationType: 'API',
      apiKey: '••••••••••••••••',
      trackingUrl: 'https://track.delhivery.com',
      pickupSlots: 'Mon-Sat 10AM-6PM',
      deliverySlots: 'Mon-Sat 9AM-8PM',
    },
    {
      id: 'vrl',
      name: 'VRL Logistics',
      status: 'active' as const,
      supportedServices: ['standard', 'express'],
      integrationType: 'API',
      apiKey: '••••••••••••••••',
      trackingUrl: 'https://vrlgroup.com/tracking',
      pickupSlots: 'Mon-Sat 9AM-5PM',
      deliverySlots: 'Mon-Sat 8AM-7PM',
    },
    {
      id: 'bluedart',
      name: 'Blue Dart',
      status: 'inactive' as const,
      supportedServices: ['standard', 'express', 'overnight'],
      integrationType: 'API',
      apiKey: '••••••••••••••••',
      trackingUrl: 'https://track.bluedart.com',
      pickupSlots: 'Mon-Sat 10AM-7PM',
      deliverySlots: 'Mon-Sat 9AM-8PM',
    },
  ];

  const shippingRates = [
    {
      id: '1',
      carrier: 'delhivery',
      serviceType: 'standard',
      originPincode: '560001',
      destinationPincode: '411001',
      minWeight: 1,
      maxWeight: 10,
      ratePerKg: 15,
      additionalCharges: 20,
      estimatedDays: 3,
    },
    {
      id: '2',
      carrier: 'delhivery',
      serviceType: 'express',
      originPincode: '560001',
      destinationPincode: '411001',
      minWeight: 1,
      maxWeight: 10,
      ratePerKg: 25,
      additionalCharges: 30,
      estimatedDays: 1,
    },
    {
      id: '3',
      carrier: 'vrl',
      serviceType: 'standard',
      originPincode: '560001',
      destinationPincode: '411001',
      minWeight: 1,
      maxWeight: 20,
      ratePerKg: 12,
      additionalCharges: 15,
      estimatedDays: 4,
    },
  ];

  const handleToggleStatus = (carrierId: string) => {
    toast({
      title: 'Carrier Status Updated',
      description: `Status for ${carrierId} has been updated.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Shipping Carrier Integration</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          Integration with Delhivery, VRL, and other carriers
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Carrier Configuration</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>
            KN Biosciences integrates with leading logistics providers to ensure timely and reliable delivery
            of agricultural products across India. Our primary carriers are Delhivery and VRL Logistics.
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Carrier</Th>
                <Th>Status</Th>
                <Th>Services</Th>
                <Th>Integration</Th>
                <Th>Pickup Slots</Th>
                <Th>Delivery Slots</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {shippingCarriers.map((carrier) => (
                <Tr key={carrier.id}>
                  <Td fontWeight="bold">{carrier.name}</Td>
                  <Td>
                    <Badge colorScheme={carrier.status === 'active' ? 'green' : 'red'}>
                      {carrier.status}
                    </Badge>
                  </Td>
                  <Td>
                    {carrier.supportedServices.map(service => (
                      <Badge key={service} colorScheme="blue" mr={1} mb={1} display="inline-block">
                        {service}
                      </Badge>
                    ))}
                  </Td>
                  <Td>{carrier.integrationType}</Td>
                  <Td>{carrier.pickupSlots}</Td>
                  <Td>{carrier.deliverySlots}</Td>
                  <Td>
                    <Button 
                      size="sm" 
                      colorScheme={carrier.status === 'active' ? 'red' : 'green'}
                      onClick={() => handleToggleStatus(carrier.id)}
                    >
                      {carrier.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Delhivery Integration</Tab>
          <Tab>VRL Integration</Tab>
          <Tab>Shipping Rates</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Delhivery Configuration</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Delhivery is integrated as our primary express delivery partner, offering extensive coverage
                  across India with reliable tracking capabilities.
                </Text>
                <TableContainer>
                  <Table variant="simple">
                    <Tbody>
                      <Tr>
                        <Td width="30%"><strong>API Key</strong></Td>
                        <Td>{shippingCarriers[0].apiKey}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Tracking URL</strong></Td>
                        <Td>{shippingCarriers[0].trackingUrl}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Pickup Slots</strong></Td>
                        <Td>{shippingCarriers[0].pickupSlots}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Delivery Slots</strong></Td>
                        <Td>{shippingCarriers[0].deliverySlots}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Integration Status</strong></Td>
                        <Td>
                          <Badge colorScheme="green">Active</Badge>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">VRL Logistics Configuration</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  VRL Logistics is integrated for standard deliveries, particularly effective for shipments
                  to semi-urban and rural areas with their extensive network.
                </Text>
                <TableContainer>
                  <Table variant="simple">
                    <Tbody>
                      <Tr>
                        <Td width="30%"><strong>API Key</strong></Td>
                        <Td>{shippingCarriers[1].apiKey}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Tracking URL</strong></Td>
                        <Td>{shippingCarriers[1].trackingUrl}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Pickup Slots</strong></Td>
                        <Td>{shippingCarriers[1].pickupSlots}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Delivery Slots</strong></Td>
                        <Td>{shippingCarriers[1].deliverySlots}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Integration Status</strong></Td>
                        <Td>
                          <Badge colorScheme="green">Active</Badge>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Shipping Rates</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Standard shipping rates for different carriers and service types. These rates are used
                  to calculate shipping costs during checkout.
                </Text>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Carrier</Th>
                        <Th>Service</Th>
                        <Th>Origin Pincode</Th>
                        <Th>Dest Pincode</Th>
                        <Th>Weight Range</Th>
                        <Th>Rate/Kg</Th>
                        <Th>Additional Charges</Th>
                        <Th>Est. Days</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {shippingRates.map((rate) => (
                        <Tr key={rate.id}>
                          <Td fontWeight="bold">{rate.carrier}</Td>
                          <Td>
                            <Badge colorScheme={
                              rate.serviceType === 'standard' ? 'gray' : 
                              rate.serviceType === 'express' ? 'orange' : 
                              'red'
                            }>
                              {rate.serviceType}
                            </Badge>
                          </Td>
                          <Td>{rate.originPincode}</Td>
                          <Td>{rate.destinationPincode}</Td>
                          <Td>{rate.minWeight}kg - {rate.maxWeight}kg</Td>
                          <Td>₹{rate.ratePerKg}</Td>
                          <Td>₹{rate.additionalCharges}</Td>
                          <Td>{rate.estimatedDays} days</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Card>
        <CardHeader>
          <Heading size="md">Delivery Coverage</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={2}>
            <strong>Delhivery:</strong> Covers 100% of PIN codes in India with express delivery options.
          </Text>
          <Text mb={2}>
            <strong>VRL Logistics:</strong> Extensive coverage in South India and rural areas with cost-effective standard delivery.
          </Text>
          <Text>
            <strong>Combined Network:</strong> Together, our carriers provide comprehensive coverage for all regions
            including remote agricultural areas.
          </Text>
        </CardBody>
      </Card>
    </Container>
  );
};

export default ShippingCarrierIntegrationPage;