'use client';

import React, { useState, useEffect } from 'react';
import {
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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Select,
  Flex,
  Spacer,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Progress,
} from '@chakra-ui/react';

// Mock data for demonstration
const mockLoyaltyProfiles = [
  {
    id: '1',
    customerId: 'CUST-001',
    customerName: 'Agri Solutions Pvt Ltd',
    pointsBalance: 12500,
    tier: 'gold' as const,
    tierName: 'Gold',
    totalPointsEarned: 15000,
    totalPointsRedeemed: 2500,
    lastActivityDate: new Date('2023-05-15'),
    enrollmentDate: new Date('2022-03-10'),
    status: 'active' as const,
  },
  {
    id: '2',
    customerId: 'CUST-002',
    customerName: 'Krishi Udyog LLP',
    pointsBalance: 8750,
    tier: 'silver' as const,
    tierName: 'Silver',
    totalPointsEarned: 10000,
    totalPointsRedeemed: 1250,
    lastActivityDate: new Date('2023-05-18'),
    enrollmentDate: new Date('2022-05-22'),
    status: 'active' as const,
  },
  {
    id: '3',
    customerId: 'CUST-003',
    customerName: 'Green Farm Supplies',
    pointsBalance: 450,
    tier: 'bronze' as const,
    tierName: 'Bronze',
    totalPointsEarned: 500,
    totalPointsRedeemed: 50,
    lastActivityDate: new Date('2023-05-20'),
    enrollmentDate: new Date('2023-01-15'),
    status: 'active' as const,
  },
];

const mockLoyaltyTransactions = [
  {
    id: '1',
    customerId: 'CUST-001',
    customerName: 'Agri Solutions Pvt Ltd',
    transactionType: 'earn' as const,
    points: 500,
    description: 'Purchase of Organic Neem Cake Fertilizer',
    orderId: 'ORD-001',
    status: 'completed' as const,
    createdAt: new Date('2023-05-15T10:30:00'),
  },
  {
    id: '2',
    customerId: 'CUST-001',
    customerName: 'Agri Solutions Pvt Ltd',
    transactionType: 'redeem' as const,
    points: 2000,
    description: 'Redeemed for 20% discount coupon',
    orderId: 'N/A',
    status: 'completed' as const,
    createdAt: new Date('2023-05-10T14:20:00'),
  },
  {
    id: '3',
    customerId: 'CUST-002',
    customerName: 'Krishi Udyog LLP',
    transactionType: 'earn' as const,
    points: 750,
    description: 'Purchase of Bio-Zyme Growth Enhancer',
    orderId: 'ORD-002',
    status: 'completed' as const,
    createdAt: new Date('2023-05-18T09:15:00'),
  },
];

const mockLoyaltyRewards = [
  {
    id: '1',
    name: '20% Discount Coupon',
    description: '20% discount on next purchase',
    pointsRequired: 2000,
    rewardType: 'discount' as const,
    discountPercentage: 20,
    validityPeriod: 30, // days
    isActive: true,
    timesRedeemed: 45,
  },
  {
    id: '2',
    name: 'Free Product Sample',
    description: 'Free sample of new product',
    pointsRequired: 1500,
    rewardType: 'free-product' as const,
    freeProductId: 'PRD-001',
    validityPeriod: 60,
    isActive: true,
    timesRedeemed: 23,
  },
  {
    id: '3',
    name: '₹500 Gift Card',
    description: '₹500 gift card for future purchases',
    pointsRequired: 5000,
    rewardType: 'gift-card' as const,
    giftCardValue: 500,
    validityPeriod: 90,
    isActive: true,
    timesRedeemed: 12,
  },
];

const mockLoyaltyCampaigns = [
  {
    id: '1',
    name: 'Summer Harvest Bonus',
    description: 'Earn 2x points on all organic products',
    campaignType: 'points-multiplier' as const,
    multiplier: 2,
    startDate: new Date('2023-05-01'),
    endDate: new Date('2023-06-30'),
    isActive: true,
    participantsCount: 125,
  },
  {
    id: '2',
    name: 'Referral Program',
    description: 'Earn 500 points for each successful referral',
    campaignType: 'referral' as const,
    bonusPoints: 500,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    isActive: true,
    participantsCount: 89,
  },
];

const LoyaltyProgramManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [loyaltyProfiles, setLoyaltyProfiles] = useState<any[]>([]);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<any[]>([]);
  const [loyaltyRewards, setLoyaltyRewards] = useState<any[]>([]);
  const [loyaltyCampaigns, setLoyaltyCampaigns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [entityType, setEntityType] = useState<'profile' | 'transaction' | 'reward' | 'campaign'>('profile');

  useEffect(() => {
    // In a real application, this would fetch from an API
    setLoyaltyProfiles(mockLoyaltyProfiles);
    setLoyaltyTransactions(mockLoyaltyTransactions);
    setLoyaltyRewards(mockLoyaltyRewards);
    setLoyaltyCampaigns(mockLoyaltyCampaigns);
  }, []);

  const handleViewEntity = (entity: any, type: 'profile' | 'transaction' | 'reward' | 'campaign') => {
    setSelectedEntity(entity);
    setEntityType(type);
    onOpen();
  };

  const totalMembers = loyaltyProfiles.length;
  const activeMembers = loyaltyProfiles.filter(p => p.status === 'active').length;
  const totalPointsIssued = loyaltyTransactions
    .filter(t => t.transactionType === 'earn' || t.transactionType === 'bonus')
    .reduce((sum, t) => sum + t.points, 0);
  const totalPointsRedeemed = loyaltyTransactions
    .filter(t => t.transactionType === 'redeem')
    .reduce((sum, t) => sum + t.points, 0);
  const redemptionRate = totalPointsRedeemed / (totalPointsIssued || 1) * 100;

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Loyalty Program Management</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {activeMembers} active members, {redemptionRate.toFixed(1)}% redemption rate
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Loyalty Program Overview</Heading>
        </CardHeader>
        <CardBody>
          <StatGroup>
            <Stat>
              <StatLabel>Total Members</StatLabel>
              <StatNumber>{totalMembers}</StatNumber>
              <StatHelpText>Enrolled customers</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Active Members</StatLabel>
              <StatNumber>{activeMembers}</StatNumber>
              <StatHelpText>Currently active</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Total Points Issued</StatLabel>
              <StatNumber>{totalPointsIssued.toLocaleString('en-IN')}</StatNumber>
              <StatHelpText>Points earned by customers</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Redemption Rate</StatLabel>
              <StatNumber>{redemptionRate.toFixed(1)}%</StatNumber>
              <StatHelpText>Points redeemed vs earned</StatHelpText>
            </Stat>
          </StatGroup>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Member Profiles</Tab>
          <Tab>Transactions</Tab>
          <Tab>Rewards</Tab>
          <Tab>Campaigns</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading size="md">Loyalty Member Profiles</Heading>
                  <Button colorScheme="blue">Add New Member</Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Customer</Th>
                        <Th>Points Balance</Th>
                        <Th>Tier</Th>
                        <Th>Total Earned</Th>
                        <Th>Total Redeemed</Th>
                        <Th>Enrollment Date</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loyaltyProfiles.map((profile) => (
                        <Tr key={profile.id}>
                          <Td fontWeight="medium">{profile.customerName}</Td>
                          <Td>
                            <Badge colorScheme="green">{profile.pointsBalance} pts</Badge>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                profile.tier === 'bronze' ? 'yellow' :
                                profile.tier === 'silver' ? 'gray' :
                                profile.tier === 'gold' ? 'yellow' : 'orange'
                              }
                            >
                              {profile.tierName}
                            </Badge>
                          </Td>
                          <Td>{profile.totalPointsEarned} pts</Td>
                          <Td>{profile.totalPointsRedeemed} pts</Td>
                          <Td>{new Date(profile.enrollmentDate).toLocaleDateString()}</Td>
                          <Td>
                            <Badge
                              colorScheme={profile.status === 'active' ? 'green' : 'red'}
                            >
                              {profile.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleViewEntity(profile, 'profile')}
                            >
                              View
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Loyalty Transactions</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Customer</Th>
                        <Th>Type</Th>
                        <Th>Points</Th>
                        <Th>Description</Th>
                        <Th>Order ID</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loyaltyTransactions.map((transaction) => (
                        <Tr key={transaction.id}>
                          <Td fontWeight="medium">{transaction.customerName}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                transaction.transactionType === 'earn' ? 'green' :
                                transaction.transactionType === 'redeem' ? 'red' :
                                transaction.transactionType === 'bonus' ? 'blue' : 'gray'
                              }
                            >
                              {transaction.transactionType}
                            </Badge>
                          </Td>
                          <Td>
                            {transaction.transactionType === 'redeem' ? '-' : '+'}{transaction.points} pts
                          </Td>
                          <Td>{transaction.description}</Td>
                          <Td>{transaction.orderId}</Td>
                          <Td>{new Date(transaction.createdAt).toLocaleDateString()}</Td>
                          <Td>
                            <Badge colorScheme={transaction.status === 'completed' ? 'green' : 'yellow'}>
                              {transaction.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading size="md">Loyalty Rewards</Heading>
                  <Button colorScheme="blue">Create New Reward</Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Reward Name</Th>
                        <Th>Description</Th>
                        <Th>Points Required</Th>
                        <Th>Type</Th>
                        <Th>Validity (Days)</Th>
                        <Th>Times Redeemed</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loyaltyRewards.map((reward) => (
                        <Tr key={reward.id}>
                          <Td fontWeight="medium">{reward.name}</Td>
                          <Td>{reward.description}</Td>
                          <Td>
                            <Badge colorScheme="purple">{reward.pointsRequired} pts</Badge>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                reward.rewardType === 'discount' ? 'blue' :
                                reward.rewardType === 'free-product' ? 'green' :
                                reward.rewardType === 'gift-card' ? 'yellow' :
                                reward.rewardType === 'exclusive-access' ? 'teal' : 'orange'
                              }
                            >
                              {reward.rewardType}
                            </Badge>
                          </Td>
                          <Td>{reward.validityPeriod} days</Td>
                          <Td>{reward.timesRedeemed}</Td>
                          <Td>
                            <Badge colorScheme={reward.isActive ? 'green' : 'red'}>
                              {reward.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleViewEntity(reward, 'reward')}
                            >
                              View
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading size="md">Loyalty Campaigns</Heading>
                  <Button colorScheme="blue">Create New Campaign</Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Campaign Name</Th>
                        <Th>Description</Th>
                        <Th>Type</Th>
                        <Th>Duration</Th>
                        <Th>Participants</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loyaltyCampaigns.map((campaign) => (
                        <Tr key={campaign.id}>
                          <Td fontWeight="medium">{campaign.name}</Td>
                          <Td>{campaign.description}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                campaign.campaignType === 'points-multiplier' ? 'blue' :
                                campaign.campaignType === 'bonus-points' ? 'green' :
                                campaign.campaignType === 'double-dip' ? 'purple' :
                                campaign.campaignType === 'referral' ? 'yellow' : 'orange'
                              }
                            >
                              {campaign.campaignType}
                            </Badge>
                          </Td>
                          <Td>
                            {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                          </Td>
                          <Td>{campaign.participantsCount}</Td>
                          <Td>
                            <Badge colorScheme={campaign.isActive ? 'green' : 'red'}>
                              {campaign.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleViewEntity(campaign, 'campaign')}
                            >
                              View
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Entity Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {entityType === 'profile' && 'Customer Loyalty Profile'}
            {entityType === 'transaction' && 'Transaction Details'}
            {entityType === 'reward' && 'Reward Details'}
            {entityType === 'campaign' && 'Campaign Details'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEntity && (
              <Card>
                <CardBody>
                  {entityType === 'profile' && (
                    <>
                      <Text><strong>Customer:</strong> {selectedEntity.customerName}</Text>
                      <Text><strong>Customer ID:</strong> {selectedEntity.customerId}</Text>
                      <Text><strong>Points Balance:</strong> <Badge colorScheme="green">{selectedEntity.pointsBalance} pts</Badge></Text>
                      <Text><strong>Tier:</strong> 
                        <Badge ml={2} colorScheme={
                          selectedEntity.tier === 'bronze' ? 'yellow' :
                          selectedEntity.tier === 'silver' ? 'gray' :
                          selectedEntity.tier === 'gold' ? 'yellow' : 'orange'
                        }>
                          {selectedEntity.tierName}
                        </Badge>
                      </Text>
                      <Text><strong>Total Earned:</strong> {selectedEntity.totalPointsEarned} pts</Text>
                      <Text><strong>Total Redeemed:</strong> {selectedEntity.totalPointsRedeemed} pts</Text>
                      <Text><strong>Enrollment Date:</strong> {new Date(selectedEntity.enrollmentDate).toLocaleDateString()}</Text>
                      <Text><strong>Last Activity:</strong> {new Date(selectedEntity.lastActivityDate).toLocaleDateString()}</Text>
                      <Text><strong>Status:</strong> 
                        <Badge ml={2} colorScheme={selectedEntity.status === 'active' ? 'green' : 'red'}>
                          {selectedEntity.status}
                        </Badge>
                      </Text>
                      
                      <Box mt={4}>
                        <Heading size="sm" mb={2}>Tier Benefits</Heading>
                        <ul>
                          <li>2% discount on all purchases</li>
                          <li>Birthday special offer</li>
                          <li>Priority customer support</li>
                        </ul>
                      </Box>
                    </>
                  )}
                  
                  {entityType === 'transaction' && (
                    <>
                      <Text><strong>Customer:</strong> {selectedEntity.customerName}</Text>
                      <Text><strong>Transaction Type:</strong> 
                        <Badge ml={2} colorScheme={
                          selectedEntity.transactionType === 'earn' ? 'green' :
                          selectedEntity.transactionType === 'redeem' ? 'red' :
                          selectedEntity.transactionType === 'bonus' ? 'blue' : 'gray'
                        }>
                          {selectedEntity.transactionType}
                        </Badge>
                      </Text>
                      <Text><strong>Points:</strong> {selectedEntity.transactionType === 'redeem' ? '-' : '+'}{selectedEntity.points} pts</Text>
                      <Text><strong>Description:</strong> {selectedEntity.description}</Text>
                      <Text><strong>Order ID:</strong> {selectedEntity.orderId}</Text>
                      <Text><strong>Date:</strong> {new Date(selectedEntity.createdAt).toLocaleString()}</Text>
                      <Text><strong>Status:</strong> 
                        <Badge ml={2} colorScheme={selectedEntity.status === 'completed' ? 'green' : 'yellow'}>
                          {selectedEntity.status}
                        </Badge>
                      </Text>
                    </>
                  )}
                  
                  {entityType === 'reward' && (
                    <>
                      <Text><strong>Name:</strong> {selectedEntity.name}</Text>
                      <Text><strong>Description:</strong> {selectedEntity.description}</Text>
                      <Text><strong>Points Required:</strong> <Badge colorScheme="purple">{selectedEntity.pointsRequired} pts</Badge></Text>
                      <Text><strong>Reward Type:</strong> 
                        <Badge ml={2} colorScheme={
                          selectedEntity.rewardType === 'discount' ? 'blue' :
                          selectedEntity.rewardType === 'free-product' ? 'green' :
                          selectedEntity.rewardType === 'gift-card' ? 'yellow' :
                          selectedEntity.rewardType === 'exclusive-access' ? 'teal' : 'orange'
                        }>
                          {selectedEntity.rewardType}
                        </Badge>
                      </Text>
                      {selectedEntity.discountPercentage && (
                        <Text><strong>Discount:</strong> {selectedEntity.discountPercentage}%</Text>
                      )}
                      {selectedEntity.giftCardValue && (
                        <Text><strong>Gift Card Value:</strong> ₹{selectedEntity.giftCardValue}</Text>
                      )}
                      <Text><strong>Validity Period:</strong> {selectedEntity.validityPeriod} days</Text>
                      <Text><strong>Times Redeemed:</strong> {selectedEntity.timesRedeemed}</Text>
                      <Text><strong>Status:</strong> 
                        <Badge ml={2} colorScheme={selectedEntity.isActive ? 'green' : 'red'}>
                          {selectedEntity.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Text>
                    </>
                  )}
                  
                  {entityType === 'campaign' && (
                    <>
                      <Text><strong>Name:</strong> {selectedEntity.name}</Text>
                      <Text><strong>Description:</strong> {selectedEntity.description}</Text>
                      <Text><strong>Campaign Type:</strong> 
                        <Badge ml={2} colorScheme={
                          selectedEntity.campaignType === 'points-multiplier' ? 'blue' :
                          selectedEntity.campaignType === 'bonus-points' ? 'green' :
                          selectedEntity.campaignType === 'double-dip' ? 'purple' :
                          selectedEntity.campaignType === 'referral' ? 'yellow' : 'orange'
                        }>
                          {selectedEntity.campaignType}
                        </Badge>
                      </Text>
                      {selectedEntity.multiplier && (
                        <Text><strong>Multiplier:</strong> {selectedEntity.multiplier}x</Text>
                      )}
                      {selectedEntity.bonusPoints && (
                        <Text><strong>Bonus Points:</strong> {selectedEntity.bonusPoints}</Text>
                      )}
                      <Text><strong>Duration:</strong> {new Date(selectedEntity.startDate).toLocaleDateString()} - {new Date(selectedEntity.endDate).toLocaleDateString()}</Text>
                      <Text><strong>Participants:</strong> {selectedEntity.participantsCount}</Text>
                      <Text><strong>Status:</strong> 
                        <Badge ml={2} colorScheme={selectedEntity.isActive ? 'green' : 'red'}>
                          {selectedEntity.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Text>
                    </>
                  )}
                </CardBody>
              </Card>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="blue">Edit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LoyaltyProgramManager;