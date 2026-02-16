'use client';

import React from 'react';
import { Container, Box, Heading } from '@chakra-ui/react';
import PendingDealerApplications from '../components/PendingDealerApplications';

const DealerApprovalPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="white" borderRadius="md" boxShadow="md" p={6}>
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Dealer Approval Dashboard
        </Heading>
        <PendingDealerApplications />
      </Box>
    </Container>
  );
};

export default DealerApprovalPage;