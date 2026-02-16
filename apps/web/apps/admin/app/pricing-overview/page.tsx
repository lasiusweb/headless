'use client';

import React, { useState, useEffect } from 'react';
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
  Flex,
  Spacer,
  Text,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';

// Mock data for product prices
const mockProductPrices = [
  {
    productId: 'PRD-001',
    productName: 'Organic Neem Cake Fertilizer',
    basePrice: 1000,
    retailerPrice: 1000,
    dealerPrice: 600,
    distributorPrice: 450,
  },
  {
    productId: 'PRD-002',
    productName: 'Bio-Zyme Growth Enhancer',
    basePrice: 1500,
    retailerPrice: 1500,
    dealerPrice: 900,
    distributorPrice: 675,
  },
  {
    productId: 'PRD-003',
    productName: 'Panchagavya Organic Liquid',
    basePrice: 800,
    retailerPrice: 800,
    dealerPrice: 480,
    distributorPrice: 360,
  },
];

const PricingOverviewPage: React.FC = () => {
  const [productPrices, setProductPrices] = useState<any[]>([]);

  useEffect(() => {
    // In a real application, this would fetch from an API
    setProductPrices(mockProductPrices);
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Pricing Overview</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          Showing prices for different user types
        </Text>
      </Flex>

      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Pricing Tiers</Heading>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>User Type</Th>
                  <Th>Discount</Th>
                  <Th>Description</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>
                    <Badge colorScheme="green">Retailer</Badge>
                  </Td>
                  <Td>0%</Td>
                  <Td>Standard retail price</Td>
                </Tr>
                <Tr>
                  <Td>
                    <Badge colorScheme="blue">Dealer</Badge>
                  </Td>
                  <Td>40% off MRP</Td>
                  <Td>For registered dealers</Td>
                </Tr>
                <Tr>
                  <Td>
                    <Badge colorScheme="purple">Distributor</Badge>
                  </Td>
                  <Td>55% off MRP</Td>
                  <Td>For bulk distributors</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading size="md">Product Pricing by Tier</Heading>
        </CardHeader>
        <CardBody>
          <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Product</Th>
                  <Th>MRP (Retailer)</Th>
                  <Th>Dealer Price</Th>
                  <Th>Distributor Price</Th>
                  <Th>Savings (Dealer)</Th>
                  <Th>Savings (Distributor)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {productPrices.map((product) => (
                  <Tr key={product.productId}>
                    <Td fontWeight="medium">{product.productName}</Td>
                    <Td>₹{product.basePrice.toLocaleString('en-IN')}</Td>
                    <Td>₹{product.dealerPrice.toLocaleString('en-IN')}</Td>
                    <Td>₹{product.distributorPrice.toLocaleString('en-IN')}</Td>
                    <Td>₹{(product.basePrice - product.dealerPrice).toLocaleString('en-IN')}</Td>
                    <Td>₹{(product.basePrice - product.distributorPrice).toLocaleString('en-IN')}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Container>
  );
};

export default PricingOverviewPage;