'use client';

import React from 'react';
import { 
  Container, 
  Box, 
  Heading, 
  Grid, 
  GridItem, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  StatArrow, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Button,
  Text,
  SimpleGrid
} from '@chakra-ui/react';
import Link from 'next/link';

const DealersOverviewPage: React.FC = () => {
  // Mock data for dealer statistics
  const dealerStats = [
    { label: 'Total Dealers', value: 142, change: '+12%' },
    { label: 'Active Dealers', value: 128, change: '+8%' },
    { label: 'Pending Approvals', value: 8, change: '-3' },
    { label: 'Rejected Applications', value: 6, change: '+2' },
  ];

  // Mock data for recent dealer activities
  const recentActivities = [
    { id: 1, dealer: 'Agri Solutions Pvt Ltd', activity: 'Application Submitted', date: '2023-05-15', status: 'pending' },
    { id: 2, dealer: 'Krishi Udyog LLP', activity: 'Application Submitted', date: '2023-05-16', status: 'pending' },
    { id: 3, dealer: 'Green Farm Supplies', activity: 'Approved', date: '2023-05-14', status: 'approved' },
    { id: 4, dealer: 'Organic Harvest Co.', activity: 'Rejected', date: '2023-05-12', status: 'rejected' },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="lg" mb={6} textAlign="left">
        Dealer Management
      </Heading>
      
      {/* Dealer Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {dealerStats.map((stat, index) => (
          <Stat 
            key={index}
            px={{ base: 2, md: 4 }} 
            py={4} 
            shadow="md" 
            border="1px" 
            borderColor="gray.200" 
            borderRadius="md"
          >
            <StatLabel>{stat.label}</StatLabel>
            <StatNumber>{stat.value}</StatNumber>
            <StatHelpText>
              <StatArrow type={stat.change.startsWith('+') ? 'increase' : 'decrease'} />
              {stat.change}
            </StatHelpText>
          </Stat>
        ))}
      </SimpleGrid>

      {/* Quick Actions */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Quick Actions</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={4}>
            <GridItem>
              <Link href="/admin/dealer-registration">
                <Button width="100%" colorScheme="blue">
                  Register New Dealer
                </Button>
              </Link>
            </GridItem>
            <GridItem>
              <Link href="/admin/dealer-approval">
                <Button width="100%" colorScheme="green">
                  Review Applications
                </Button>
              </Link>
            </GridItem>
            <GridItem>
              <Link href="/admin/dealers/list">
                <Button width="100%" colorScheme="purple">
                  View All Dealers
                </Button>
              </Link>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <Heading size="md">Recent Dealer Activities</Heading>
        </CardHeader>
        <CardBody>
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>Dealer</th>
                  <th style={{ textAlign: 'left', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>Activity</th>
                  <th style={{ textAlign: 'left', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                  <th style={{ textAlign: 'left', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map(activity => (
                  <tr key={activity.id}>
                    <td style={{ paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                      {activity.dealer}
                    </td>
                    <td style={{ paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                      {activity.activity}
                    </td>
                    <td style={{ paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                    <td style={{ paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                      <span 
                        style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          backgroundColor: 
                            activity.status === 'approved' ? '#c6f6d5' : 
                            activity.status === 'rejected' ? '#fed7d7' : 
                            '#ffebcc',
                          color: 
                            activity.status === 'approved' ? '#22543d' : 
                            activity.status === 'rejected' ? '#742a2a' : 
                            '#744210'
                        }}
                      >
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </CardBody>
        <CardFooter>
          <Link href="/admin/dealer-approval">
            <Button variant="outline" colorScheme="blue">
              View All Applications
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </Container>
  );
};

export default DealersOverviewPage;