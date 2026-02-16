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

const PaymentGatewayIntegrationPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);

  // Mock data for payment gateways
  const paymentGateways = [
    {
      id: 'easebuzz',
      name: 'Easebuzz',
      status: 'active' as const,
      supportedMethods: ['card', 'net_banking', 'upi', 'wallet'],
      fees: '2.4% + GST',
      settlementTime: 'T+1',
      supportedCountries: ['India'],
      apiKey: '••••••••••••••••',
      secretKey: '••••••••••••••••',
    },
    {
      id: 'payu',
      name: 'PayU',
      status: 'active' as const,
      supportedMethods: ['card', 'net_banking', 'upi', 'wallet', 'emi'],
      fees: '2.2% + GST',
      settlementTime: 'T+2',
      supportedCountries: ['India'],
      apiKey: '••••••••••••••••',
      secretKey: '••••••••••••••••',
    },
  ];

  const handleToggleStatus = (gatewayId: string) => {
    toast({
      title: 'Gateway Status Updated',
      description: `Status for ${gatewayId} has been updated.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Payment Gateway Integration</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          Secure payment processing for all transactions
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Payment Gateway Configuration</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={4}>
            KN Biosciences supports multiple payment gateways to ensure secure and reliable payment processing for all transactions.
            Both Easebuzz and PayU are integrated to provide redundancy and optimal payment experiences.
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Gateway</Th>
                <Th>Status</Th>
                <Th>Supported Methods</Th>
                <Th>Fees</Th>
                <Th>Settlement Time</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paymentGateways.map((gateway) => (
                <Tr key={gateway.id}>
                  <Td fontWeight="bold">{gateway.name}</Td>
                  <Td>
                    <Badge colorScheme={gateway.status === 'active' ? 'green' : 'red'}>
                      {gateway.status}
                    </Badge>
                  </Td>
                  <Td>
                    {gateway.supportedMethods.map(method => (
                      <Badge key={method} colorScheme="blue" mr={1} mb={1} display="inline-block">
                        {method}
                      </Badge>
                    ))}
                  </Td>
                  <Td>{gateway.fees}</Td>
                  <Td>{gateway.settlementTime}</Td>
                  <Td>
                    <Button 
                      size="sm" 
                      colorScheme={gateway.status === 'active' ? 'red' : 'green'}
                      onClick={() => handleToggleStatus(gateway.id)}
                    >
                      {gateway.status === 'active' ? 'Disable' : 'Enable'}
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
          <Tab>Easebuzz Integration</Tab>
          <Tab>PayU Integration</Tab>
          <Tab>Webhook Configuration</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Easebuzz Configuration</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Easebuzz is integrated as one of our primary payment gateways. It supports multiple payment methods
                  and offers competitive rates for Indian merchants.
                </Text>
                <TableContainer>
                  <Table variant="simple">
                    <Tbody>
                      <Tr>
                        <Td width="30%"><strong>Merchant Key</strong></Td>
                        <Td>{paymentGateways[0].apiKey}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Salt</strong></Td>
                        <Td>{paymentGateways[0].secretKey}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Environment</strong></Td>
                        <Td>Production</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Webhook URL</strong></Td>
                        <Td>https://api.knbiosciences.in/payments/webhook/easebuzz</Td>
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
                <Heading size="md">PayU Configuration</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  PayU is integrated as our secondary payment gateway to ensure redundancy and provide additional
                  payment options to customers.
                </Text>
                <TableContainer>
                  <Table variant="simple">
                    <Tbody>
                      <Tr>
                        <Td width="30%"><strong>Merchant Key</strong></Td>
                        <Td>{paymentGateways[1].apiKey}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Salt</strong></Td>
                        <Td>{paymentGateways[1].secretKey}</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Environment</strong></Td>
                        <Td>Production</Td>
                      </Tr>
                      <Tr>
                        <Td><strong>Webhook URL</strong></Td>
                        <Td>https://api.knbiosciences.in/payments/webhook/payu</Td>
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
                <Heading size="md">Webhook Configuration</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Webhooks are used to receive real-time notifications about payment status changes.
                  These endpoints are secured with authentication to prevent unauthorized access.
                </Text>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Gateway</Th>
                        <Th>Webhook URL</Th>
                        <Th>Status</Th>
                        <Th>Last Response</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="bold">Easebuzz</Td>
                        <Td>https://api.knbiosciences.in/payments/webhook/easebuzz</Td>
                        <Td>
                          <Badge colorScheme="green">Active</Badge>
                        </Td>
                        <Td>2023-05-20 14:30:22</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">PayU</Td>
                        <Td>https://api.knbiosciences.in/payments/webhook/payu</Td>
                        <Td>
                          <Badge colorScheme="green">Active</Badge>
                        </Td>
                        <Td>2023-05-20 14:32:15</Td>
                      </Tr>
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
          <Heading size="md">Payment Security</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={2}>
            <strong>PCI DSS Compliance:</strong> Our payment processing is compliant with PCI DSS standards to ensure
            secure handling of cardholder data.
          </Text>
          <Text mb={2}>
            <strong>Encryption:</strong> All payment data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.
          </Text>
          <Text>
            <strong>Tokenization:</strong> Sensitive payment information is tokenized to prevent storing actual card details
            in our systems.
          </Text>
        </CardBody>
      </Card>
    </Container>
  );
};

export default PaymentGatewayIntegrationPage;