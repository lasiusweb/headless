'use client';

import React from 'react';
import { Container, Box, Heading } from '@chakra-ui/react';
import ReturnsManager from '../components/ReturnsManager';

const ReturnsManagementPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="white" borderRadius="md" boxShadow="md" p={6}>
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Returns & Refunds Management
        </Heading>
        <ReturnsManager />
      </Box>
    </Container>
  );
};

export default ReturnsManagementPage;