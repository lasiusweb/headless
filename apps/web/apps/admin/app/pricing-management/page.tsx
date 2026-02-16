'use client';

import React from 'react';
import { Container, Box, Heading } from '@chakra-ui/react';
import PricingRulesManager from '../components/PricingRulesManager';

const PricingManagementPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="white" borderRadius="md" boxShadow="md" p={6}>
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Pricing Rules Management
        </Heading>
        <PricingRulesManager />
      </Box>
    </Container>
  );
};

export default PricingManagementPage;