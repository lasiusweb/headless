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
  Flex,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { DealerApplication } from '../schemas/dealerApplication';

// Mock data for demonstration purposes
const mockApplications: DealerApplication[] = [
  {
    id: '1',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15'),
    status: 'pending',
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    businessName: 'Agri Solutions Pvt Ltd',
    gstNumber: '12ABCDE1234PZ',
    panNumber: 'ABCDE1234P',
    incorporationDate: '2020-01-15',
    businessType: 'pvt-ltd',
    address: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    },
    contactPerson: {
      name: 'Rajesh Kumar',
      email: 'rajesh@agrisolutions.com',
      phone: '9876543210',
    },
    bankDetails: {
      accountNumber: '1234567890',
      ifscCode: 'HDFC0000123',
      bankName: 'HDFC Bank',
      branchName: 'MG Road Branch',
    },
    supportingDocuments: {
      gstCertificateUrl: 'https://example.com/gst-certificate.pdf',
      incorporationCertificateUrl: 'https://example.com/incorporation-cert.pdf',
      bankStatementUrl: 'https://example.com/bank-statement.pdf',
      cancelledChequeUrl: 'https://example.com/cancelled-cheque.pdf',
    },
    creditLimitRequired: true,
    creditLimitAmount: 500000,
    termsAccepted: true,
  },
  {
    id: '2',
    createdAt: new Date('2023-05-16'),
    updatedAt: new Date('2023-05-16'),
    status: 'pending',
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    businessName: 'Krishi Udyog LLP',
    gstNumber: '27ABCDE1234PZ',
    panNumber: 'ABCDE5678Q',
    incorporationDate: '2019-03-22',
    businessType: 'llp',
    address: {
      street: '456 Agriculture Lane',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
    },
    contactPerson: {
      name: 'Priya Sharma',
      email: 'priya@krishiuudyog.com',
      phone: '8765432109',
    },
    bankDetails: {
      accountNumber: '0987654321',
      ifscCode: 'ICIC0001234',
      bankName: 'ICICI Bank',
      branchName: 'Pune Branch',
    },
    supportingDocuments: {
      gstCertificateUrl: 'https://example.com/gst-certificate2.pdf',
      incorporationCertificateUrl: 'https://example.com/incorporation-cert2.pdf',
      bankStatementUrl: 'https://example.com/bank-statement2.pdf',
      cancelledChequeUrl: 'https://example.com/cancelled-cheque2.pdf',
    },
    creditLimitRequired: false,
    creditLimitAmount: undefined,
    termsAccepted: true,
  },
];

const PendingDealerApplications: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [applications, setApplications] = useState<DealerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<DealerApplication | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    // In a real application, this would fetch from an API
    setApplications(mockApplications);
  }, []);

  const handleReview = (application: DealerApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setAction(action);
    onOpen();
  };

  const confirmAction = () => {
    if (!selectedApplication || !action) return;

    // In a real application, this would make an API call
    console.log(`${action} application for ${selectedApplication.businessName}`);
    
    // Update the application status
    const updatedApplications = applications.map(app => {
      if (app.id === selectedApplication.id) {
        return {
          ...app,
          status: action === 'approve' ? 'approved' : 'rejected',
          ...(action === 'approve' && { approvedAt: new Date(), approvedBy: 'current-admin-id' }),
          ...(action === 'reject' && { 
            rejectedAt: new Date(), 
            rejectedBy: 'current-admin-id',
            rejectionReason: rejectionReason || 'Not specified'
          })
        };
      }
      return app;
    });

    setApplications(updatedApplications);
    
    toast({
      title: action === 'approve' ? 'Application Approved' : 'Application Rejected',
      description: `Dealer application for ${selectedApplication.businessName} has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
      status: action === 'approve' ? 'success' : 'error',
      duration: 5000,
      isClosable: true,
    });

    onClose();
    setRejectionReason('');
  };

  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <Heading size="lg">Pending Dealer Applications</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          {applications.filter(a => a.status === 'pending').length} pending applications
        </Text>
      </Flex>

      <TableContainer bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Business Name</Th>
              <Th>Contact Person</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th>Date Applied</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {applications
              .filter(app => app.status === 'pending')
              .map((application) => (
                <Tr key={application.id}>
                  <Td fontWeight="medium">{application.businessName}</Td>
                  <Td>{application.contactPerson.name}</Td>
                  <Td>{application.contactPerson.email}</Td>
                  <Td>{application.contactPerson.phone}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        application.status === 'approved' ? 'green' :
                        application.status === 'rejected' ? 'red' :
                        application.status === 'under_review' ? 'yellow' : 'orange'
                      }
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </Td>
                  <Td>{new Date(application.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="green"
                      mr={2}
                      onClick={() => handleReview(application, 'approve')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleReview(application, 'reject')}
                    >
                      Reject
                    </Button>
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {action === 'approve' ? 'Approve Dealer Application' : 'Reject Dealer Application'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedApplication && (
              <>
                <Text mb={2}>
                  Are you sure you want to{' '}
                  <strong>
                    {action === 'approve' ? 'approve' : 'reject'} 
                  </strong>{' '}
                  the dealer application for{' '}
                  <strong>{selectedApplication.businessName}</strong>?
                </Text>
                
                {action === 'reject' && (
                  <Box mt={4}>
                    <label htmlFor="rejection-reason" style={{ display: 'block', marginBottom: '4px' }}>
                      Rejection Reason (optional):
                    </label>
                    <textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                      }}
                      rows={3}
                      placeholder="Provide reason for rejection..."
                    />
                  </Box>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme={action === 'approve' ? 'green' : 'red'} 
              onClick={confirmAction}
            >
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PendingDealerApplications;