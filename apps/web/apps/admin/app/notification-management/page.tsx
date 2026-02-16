'use client';

import React from 'react';
import { Container, Box, Heading } from '@chakra-ui/react';
import NotificationManager from '../components/NotificationManager';

const NotificationManagementPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="white" borderRadius="md" boxShadow="md" p={6}>
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Notification Management
        </Heading>
        <NotificationManager />
      </Box>
    </Container>
  );
};

export default NotificationManagementPage;