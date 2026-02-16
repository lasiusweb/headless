'use client';

import React from 'react';
import { Container, Box, Heading } from '@chakra-ui/react';
import PaymentManager from '../components/PaymentManager';

const PaymentManagementPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="white" borderRadius="md" boxShadow="md" p={6}>
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Payment Management
        </Heading>
        <PaymentManager />
      </Box>
    </Container>
  );
};

export default PaymentManagementPage;