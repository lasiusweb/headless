'use client';

import React from 'react';
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
  Text,
  Flex,
  Spacer
} from '@chakra-ui/react';

// Mock data for dealers
const mockDealers = [
  {
    id: '1',
    businessName: 'Agri Solutions Pvt Ltd',
    contactPerson: 'Rajesh Kumar',
    email: 'rajesh@agrisolutions.com',
    phone: '9876543210',
    status: 'active',
    registrationDate: '2023-01-15',
    creditLimit: 500000,
    pricingTier: 'dealer'
  },
  {
    id: '2',
    businessName: 'Krishi Udyog LLP',
    contactPerson: 'Priya Sharma',
    email: 'priya@krishiuudyog.com',
    phone: '8765432109',
    status: 'active',
    registrationDate: '2023-02-20',
    creditLimit: 0,
    pricingTier: 'dealer'
  },
  {
    id: '3',
    businessName: 'Green Farm Supplies',
    contactPerson: 'Suresh Patel',
    email: 'suresh@greenfarms.com',
    phone: '7654321098',
    status: 'inactive',
    registrationDate: '2023-03-10',
    creditLimit: 250000,
    pricingTier: 'distributor'
  },
  {
    id: '4',
    businessName: 'Organic Harvest Co.',
    contactPerson: 'Anita Desai',
    email: 'anita@organicharvest.com',
    phone: '6543210987',
    status: 'active',
    registrationDate: '2023-04-05',
    creditLimit: 750000,
    pricingTier: 'distributor'
  },
];

const AllDealersPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">All Dealers</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {mockDealers.length} total dealers
        </Text>
      </Flex>
      
      <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Business Name</Th>
              <Th>Contact Person</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th>Registration Date</Th>
              <Th>Credit Limit</Th>
              <Th>Pricing Tier</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockDealers.map((dealer) => (
              <Tr key={dealer.id}>
                <Td fontWeight="medium">{dealer.businessName}</Td>
                <Td>{dealer.contactPerson}</Td>
                <Td>{dealer.email}</Td>
                <Td>{dealer.phone}</Td>
                <Td>
                  <Badge
                    colorScheme={dealer.status === 'active' ? 'green' : 'red'}
                  >
                    {dealer.status.charAt(0).toUpperCase() + dealer.status.slice(1)}
                  </Badge>
                </Td>
                <Td>{new Date(dealer.registrationDate).toLocaleDateString()}</Td>
                <Td>₹{dealer.creditLimit.toLocaleString('en-IN')}</Td>
                <Td>
                  <Badge colorScheme={dealer.pricingTier === 'distributor' ? 'purple' : 'blue'}>
                    {dealer.pricingTier}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AllDealersPage;