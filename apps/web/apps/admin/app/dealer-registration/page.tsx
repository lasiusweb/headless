'use client';

import React from 'react';
import { Box, Heading, Container } from '@chakra-ui/react';
import DealerRegistrationForm from '../../components/DealerRegistrationForm';

const DealerRegistrationPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="white" borderRadius="md" boxShadow="md" p={6}>
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Dealer Registration Application
        </Heading>
        <DealerRegistrationForm />
      </Box>
    </Container>
  );
};

export default DealerRegistrationPage;