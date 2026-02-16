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
} from '@chakra-ui/react';
import { PricingRule } from '../../../api/src/modules/pricing/interfaces/pricing.interface';

// Mock data for demonstration purposes
const mockPricingRules: PricingRule[] = [
  {
    id: '1',
    productId: 'PRD-001',
    userType: 'dealer',
    discountPercentage: 40,
    minQuantity: 10,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    productId: 'PRD-001',
    userType: 'distributor',
    discountPercentage: 55,
    minQuantity: 50,
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
  },
  {
    id: '3',
    productId: 'PRD-002',
    userType: 'dealer',
    discountPercentage: 35,
    minQuantity: 20,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-02-10'),
  },
];

const PricingRulesManager: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    userType: 'dealer' as 'retailer' | 'dealer' | 'distributor',
    discountPercentage: 0,
    minQuantity: 1,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    // In a real application, this would fetch from an API
    setPricingRules(mockPricingRules);
  }, []);

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      productId: rule.productId,
      userType: rule.userType,
      discountPercentage: rule.discountPercentage,
      minQuantity: rule.minQuantity || 1,
      startDate: rule.startDate ? rule.startDate.toISOString().split('T')[0] : '',
      endDate: rule.endDate ? rule.endDate.toISOString().split('T')[0] : '',
    });
    onOpen();
  };

  const handleAddNew = () => {
    setEditingRule(null);
    setFormData({
      productId: '',
      userType: 'dealer',
      discountPercentage: 0,
      minQuantity: 1,
      startDate: '',
      endDate: '',
    });
    onOpen();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discountPercentage' || name === 'minQuantity' 
        ? Number(value) 
        : name === 'startDate' || name === 'endDate'
        ? value
        : value
    }));
  };

  const handleSubmit = () => {
    // In a real application, this would make an API call
    if (editingRule) {
      // Update existing rule
      const updatedRules = pricingRules.map(rule => 
        rule.id === editingRule.id ? { ...rule, ...formData } as PricingRule : rule
      );
      setPricingRules(updatedRules);
      toast({
        title: 'Pricing Rule Updated',
        description: `Pricing rule for ${formData.productId} has been updated.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      // Create new rule
      const newRule: PricingRule = {
        id: Math.random().toString(36).substring(7),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PricingRule;
      
      setPricingRules([...pricingRules, newRule]);
      toast({
        title: 'Pricing Rule Created',
        description: `New pricing rule for ${formData.productId} has been created.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
    
    onClose();
  };

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Pricing Rules Management</Heading>
        <Spacer />
        <Button colorScheme="blue" onClick={handleAddNew}>
          Add New Rule
        </Button>
      </Flex>

      <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Product ID</Th>
              <Th>User Type</Th>
              <Th>Discount %</Th>
              <Th>Min Quantity</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Created At</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pricingRules.map((rule) => (
              <Tr key={rule.id}>
                <Td fontWeight="medium">{rule.productId}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      rule.userType === 'dealer' ? 'blue' :
                      rule.userType === 'distributor' ? 'purple' : 'green'
                    }
                  >
                    {rule.userType}
                  </Badge>
                </Td>
                <Td>{rule.discountPercentage}%</Td>
                <Td>{rule.minQuantity || '-'}</Td>
                <Td>{rule.startDate ? new Date(rule.startDate).toLocaleDateString() : '-'}</Td>
                <Td>{rule.endDate ? new Date(rule.endDate).toLocaleDateString() : '-'}</Td>
                <Td>{new Date(rule.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <Button size="sm" colorScheme="yellow" onClick={() => handleEdit(rule)}>
                    Edit
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Modal for adding/editing pricing rules */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingRule ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Product ID</FormLabel>
              <Input
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                placeholder="Enter product ID"
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>User Type</FormLabel>
              <Select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
              >
                <option value="retailer">Retailer</option>
                <option value="dealer">Dealer</option>
                <option value="distributor">Distributor</option>
              </Select>
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Discount Percentage</FormLabel>
              <Input
                name="discountPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={handleChange}
                placeholder="Enter discount percentage"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Minimum Quantity (Optional)</FormLabel>
              <Input
                name="minQuantity"
                type="number"
                min="1"
                value={formData.minQuantity}
                onChange={handleChange}
                placeholder="Enter minimum quantity for discount"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Start Date (Optional)</FormLabel>
              <Input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>End Date (Optional)</FormLabel>
              <Input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PricingRulesManager;