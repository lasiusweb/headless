'use client';

import React from 'react';
import { Container, Box, Heading } from '@chakra-ui/react';
import ShippingManager from '../components/ShippingManager';

const ShippingManagementPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="white" borderRadius="md" boxShadow="md" p={6}>
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Shipping Management
        </Heading>
        <ShippingManager />
      </Box>
    </Container>
  );
};

export default ShippingManagementPage;