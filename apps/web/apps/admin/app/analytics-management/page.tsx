'use client';

import React from 'react';
import { Container, Box, Heading } from '@chakra-ui/react';
import AnalyticsManager from '../components/AnalyticsManager';

const AnalyticsManagementPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="white" borderRadius="md" boxShadow="md" p={6}>
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Analytics & Reporting
        </Heading>
        <AnalyticsManager />
      </Box>
    </Container>
  );
};

export default AnalyticsManagementPage;