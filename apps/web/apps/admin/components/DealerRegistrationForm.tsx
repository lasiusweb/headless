'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Stack,
  Heading,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dealerRegistrationSchema, DealerRegistrationData } from '../schemas/dealerRegistration';

const DealerRegistrationForm: React.FC = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DealerRegistrationData>({
    resolver: zodResolver(dealerRegistrationSchema),
    defaultValues: {
      businessName: '',
      gstNumber: '',
      panNumber: '',
      incorporationDate: '',
      businessType: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      contactPerson: {
        name: '',
        email: '',
        phone: '',
      },
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
      },
      supportingDocuments: {
        gstCertificate: null,
        incorporationCertificate: null,
        bankStatement: null,
        cancelledCheque: null,
      },
      creditLimitRequired: false,
      creditLimitAmount: undefined,
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: DealerRegistrationData) => {
    setIsLoading(true);
    try {
      // In a real application, this would be an API call to submit the dealer registration
      console.log('Dealer Registration Data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Registration submitted.',
        description: 'Your dealer registration has been submitted successfully. Our team will review it shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      reset();
    } catch (error) {
      toast({
        title: 'Registration failed.',
        description: 'There was an error submitting your registration. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="6xl" mx="auto" px={6} py={12}>
      <Heading as="h1" size="lg" mb={6}>
        Dealer Registration Application
      </Heading>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={6} align="stretch">
          {/* Business Information */}
          <Box bg="gray.50" p={6} borderRadius="md">
            <Heading as="h2" size="md" mb={4}>
              Business Information
            </Heading>
            
            <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
              <FormControl isInvalid={!!errors.businessName} flex={1}>
                <FormLabel htmlFor="businessName">Business Name *</FormLabel>
                <Controller
                  name="businessName"
                  control={control}
                  render={({ field }) => (
                    <Input id="businessName" {...field} />
                  )}
                />
                {errors.businessName && (
                  <Box color="red.500" fontSize="sm">
                    {errors.businessName.message}
                  </Box>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.gstNumber} flex={1}>
                <FormLabel htmlFor="gstNumber">GST Number *</FormLabel>
                <Controller
                  name="gstNumber"
                  control={control}
                  render={({ field }) => (
                    <Input id="gstNumber" {...field} />
                  )}
                />
                {errors.gstNumber && (
                  <Box color="red.500" fontSize="sm">
                    {errors.gstNumber.message}
                  </Box>
                )}
              </FormControl>
            </Stack>
            
            <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
              <FormControl isInvalid={!!errors.panNumber} flex={1}>
                <FormLabel htmlFor="panNumber">PAN Number *</FormLabel>
                <Controller
                  name="panNumber"
                  control={control}
                  render={({ field }) => (
                    <Input id="panNumber" {...field} />
                  )}
                />
                {errors.panNumber && (
                  <Box color="red.500" fontSize="sm">
                    {errors.panNumber.message}
                  </Box>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.incorporationDate} flex={1}>
                <FormLabel htmlFor="incorporationDate">Incorporation Date *</FormLabel>
                <Controller
                  name="incorporationDate"
                  control={control}
                  render={({ field }) => (
                    <Input id="incorporationDate" type="date" {...field} />
                  )}
                />
                {errors.incorporationDate && (
                  <Box color="red.500" fontSize="sm">
                    {errors.incorporationDate.message}
                  </Box>
                )}
              </FormControl>
            </Stack>
            
            <FormControl isInvalid={!!errors.businessType} mt={4}>
              <FormLabel htmlFor="businessType">Business Type *</FormLabel>
              <Controller
                name="businessType"
                control={control}
                render={({ field }) => (
                  <Select id="businessType" {...field}>
                    <option value="">Select Business Type</option>
                    <option value="proprietorship">Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="pvt-ltd">Private Limited</option>
                    <option value="public-ltd">Public Limited</option>
                    <option value="llp">LLP</option>
                    <option value="trust">Trust</option>
                    <option value="ngo">NGO</option>
                  </Select>
                )}
              />
              {errors.businessType && (
                <Box color="red.500" fontSize="sm">
                  {errors.businessType.message}
                </Box>
              )}
            </FormControl>
          </Box>
          
          {/* Address Information */}
          <Box bg="gray.50" p={6} borderRadius="md">
            <Heading as="h2" size="md" mb={4}>
              Address Information
            </Heading>
            
            <FormControl isInvalid={!!errors.address?.street} mb={4}>
              <FormLabel htmlFor="address.street">Street Address *</FormLabel>
              <Controller
                name="address.street"
                control={control}
                render={({ field }) => (
                  <Input id="address.street" {...field} />
                )}
              />
              {errors.address?.street && (
                <Box color="red.500" fontSize="sm">
                  {errors.address.street.message}
                </Box>
              )}
            </FormControl>
            
            <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
              <FormControl isInvalid={!!errors.address?.city} flex={1}>
                <FormLabel htmlFor="address.city">City *</FormLabel>
                <Controller
                  name="address.city"
                  control={control}
                  render={({ field }) => (
                    <Input id="address.city" {...field} />
                  )}
                />
                {errors.address?.city && (
                  <Box color="red.500" fontSize="sm">
                    {errors.address.city.message}
                  </Box>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.address?.state} flex={1}>
                <FormLabel htmlFor="address.state">State *</FormLabel>
                <Controller
                  name="address.state"
                  control={control}
                  render={({ field }) => (
                    <Input id="address.state" {...field} />
                  )}
                />
                {errors.address?.state && (
                  <Box color="red.500" fontSize="sm">
                    {errors.address.state.message}
                  </Box>
                )}
              </FormControl>
            </Stack>
            
            <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
              <FormControl isInvalid={!!errors.address?.pincode} flex={1}>
                <FormLabel htmlFor="address.pincode">Pincode *</FormLabel>
                <Controller
                  name="address.pincode"
                  control={control}
                  render={({ field }) => (
                    <Input id="address.pincode" {...field} />
                  )}
                />
                {errors.address?.pincode && (
                  <Box color="red.500" fontSize="sm">
                    {errors.address.pincode.message}
                  </Box>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.address?.country} flex={1}>
                <FormLabel htmlFor="address.country">Country *</FormLabel>
                <Controller
                  name="address.country"
                  control={control}
                  render={({ field }) => (
                    <Input id="address.country" {...field} readOnly />
                  )}
                />
                {errors.address?.country && (
                  <Box color="red.500" fontSize="sm">
                    {errors.address.country.message}
                  </Box>
                )}
              </FormControl>
            </Stack>
          </Box>
          
          {/* Contact Person Information */}
          <Box bg="gray.50" p={6} borderRadius="md">
            <Heading as="h2" size="md" mb={4}>
              Contact Person Information
            </Heading>
            
            <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
              <FormControl isInvalid={!!errors.contactPerson?.name} flex={1}>
                <FormLabel htmlFor="contactPerson.name">Full Name *</FormLabel>
                <Controller
                  name="contactPerson.name"
                  control={control}
                  render={({ field }) => (
                    <Input id="contactPerson.name" {...field} />
                  )}
                />
                {errors.contactPerson?.name && (
                  <Box color="red.500" fontSize="sm">
                    {errors.contactPerson.name.message}
                  </Box>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.contactPerson?.email} flex={1}>
                <FormLabel htmlFor="contactPerson.email">Email *</FormLabel>
                <Controller
                  name="contactPerson.email"
                  control={control}
                  render={({ field }) => (
                    <Input id="contactPerson.email" type="email" {...field} />
                  )}
                />
                {errors.contactPerson?.email && (
                  <Box color="red.500" fontSize="sm">
                    {errors.contactPerson.email.message}
                  </Box>
                )}
              </FormControl>
            </Stack>
            
            <FormControl isInvalid={!!errors.contactPerson?.phone} mt={4}>
              <FormLabel htmlFor="contactPerson.phone">Phone Number *</FormLabel>
              <Controller
                name="contactPerson.phone"
                control={control}
                render={({ field }) => (
                  <Input id="contactPerson.phone" {...field} />
                )}
              />
              {errors.contactPerson?.phone && (
                <Box color="red.500" fontSize="sm">
                  {errors.contactPerson.phone.message}
                </Box>
              )}
            </FormControl>
          </Box>

          {/* Bank Details */}
          <Box bg="gray.50" p={6} borderRadius="md">
            <Heading as="h2" size="md" mb={4}>
              Bank Details
            </Heading>
              
              <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
                <FormControl isInvalid={!!errors.bankDetails?.accountNumber} flex={1}>
                  <FormLabel htmlFor="bankDetails.accountNumber">Account Number *</FormLabel>
                  <Controller
                    name="bankDetails.accountNumber"
                    control={control}
                    render={({ field }) => (
                      <Input id="bankDetails.accountNumber" {...field} />
                    )}
                  />
                  {errors.bankDetails?.accountNumber && (
                    <Box color="red.500" fontSize="sm">
                      {errors.bankDetails.accountNumber.message}
                    </Box>
                  )}
                </FormControl>
                
                <FormControl isInvalid={!!errors.bankDetails?.ifscCode} flex={1}>
                  <FormLabel htmlFor="bankDetails.ifscCode">IFSC Code *</FormLabel>
                  <Controller
                    name="bankDetails.ifscCode"
                    control={control}
                    render={({ field }) => (
                      <Input id="bankDetails.ifscCode" {...field} />
                    )}
                  />
                  {errors.bankDetails?.ifscCode && (
                    <Box color="red.500" fontSize="sm">
                      {errors.bankDetails.ifscCode.message}
                    </Box>
                  )}
                </FormControl>
              </Stack>
              
              <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
                <FormControl isInvalid={!!errors.bankDetails?.bankName} flex={1}>
                  <FormLabel htmlFor="bankDetails.bankName">Bank Name *</FormLabel>
                  <Controller
                    name="bankDetails.bankName"
                    control={control}
                    render={({ field }) => (
                      <Input id="bankDetails.bankName" {...field} />
                    )}
                  />
                  {errors.bankDetails?.bankName && (
                    <Box color="red.500" fontSize="sm">
                      {errors.bankDetails.bankName.message}
                    </Box>
                  )}
                </FormControl>
                
                <FormControl isInvalid={!!errors.bankDetails?.branchName} flex={1}>
                  <FormLabel htmlFor="bankDetails.branchName">Branch Name *</FormLabel>
                  <Controller
                    name="bankDetails.branchName"
                    control={control}
                    render={({ field }) => (
                      <Input id="bankDetails.branchName" {...field} />
                    )}
                  />
                  {errors.bankDetails?.branchName && (
                    <Box color="red.500" fontSize="sm">
                      {errors.bankDetails.branchName.message}
                    </Box>
                  )}
                </FormControl>
              </Stack>
            </Box>
            
            {/* Supporting Documents */}
            <Box bg="gray.50" p={6} borderRadius="md">
              <Heading as="h2" size="md" mb={4}>
                Supporting Documents
              </Heading>
              
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.supportingDocuments?.gstCertificate}>
                  <FormLabel htmlFor="supportingDocuments.gstCertificate">GST Certificate *</FormLabel>
                  <Controller
                    name="supportingDocuments.gstCertificate"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        id="supportingDocuments.gstCertificate"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                        {...field}
                      />
                    )}
                  />
                  {errors.supportingDocuments?.gstCertificate && (
                    <Box color="red.500" fontSize="sm">
                      {errors.supportingDocuments.gstCertificate.message}
                    </Box>
                  )}
                </FormControl>
                
                <FormControl isInvalid={!!errors.supportingDocuments?.incorporationCertificate}>
                  <FormLabel htmlFor="supportingDocuments.incorporationCertificate">
                    Incorporation Certificate *
                  </FormLabel>
                  <Controller
                    name="supportingDocuments.incorporationCertificate"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        id="supportingDocuments.incorporationCertificate"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                        {...field}
                      />
                    )}
                  />
                  {errors.supportingDocuments?.incorporationCertificate && (
                    <Box color="red.500" fontSize="sm">
                      {errors.supportingDocuments.incorporationCertificate.message}
                    </Box>
                  )}
                </FormControl>
                
                <FormControl isInvalid={!!errors.supportingDocuments?.bankStatement}>
                  <FormLabel htmlFor="supportingDocuments.bankStatement">
                    Latest Bank Statement (Last 6 Months) *
                  </FormLabel>
                  <Controller
                    name="supportingDocuments.bankStatement"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        id="supportingDocuments.bankStatement"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                        {...field}
                      />
                    )}
                  />
                  {errors.supportingDocuments?.bankStatement && (
                    <Box color="red.500" fontSize="sm">
                      {errors.supportingDocuments.bankStatement.message}
                    </Box>
                  )}
                </FormControl>
                
                <FormControl isInvalid={!!errors.supportingDocuments?.cancelledCheque}>
                  <FormLabel htmlFor="supportingDocuments.cancelledCheque">
                    Cancelled Cheque *
                  </FormLabel>
                  <Controller
                    name="supportingDocuments.cancelledCheque"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        id="supportingDocuments.cancelledCheque"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                        {...field}
                      />
                    )}
                  />
                  {errors.supportingDocuments?.cancelledCheque && (
                    <Box color="red.500" fontSize="sm">
                      {errors.supportingDocuments.cancelledCheque.message}
                    </Box>
                  )}
                </FormControl>
              </Stack>
            </Box>
            
            {/* Credit Limit Request */}
            <Box bg="gray.50" p={6} borderRadius="md">
              <Heading as="h2" size="md" mb={4}>
                Credit Limit Request
              </Heading>
              
              <FormControl mb={4}>
                <Controller
                  name="creditLimitRequired"
                  control={control}
                  render={({ field }) => (
                    <HStack>
                      <input
                        type="checkbox"
                        id="creditLimitRequired"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <FormLabel htmlFor="creditLimitRequired" mb={0}>
                        Request Credit Limit
                      </FormLabel>
                    </HStack>
                  )}
                />
              </FormControl>
              
              {control._formValues.creditLimitRequired && (
                <FormControl isInvalid={!!errors.creditLimitAmount}>
                  <FormLabel htmlFor="creditLimitAmount">Credit Limit Amount (INR)</FormLabel>
                  <Controller
                    name="creditLimitAmount"
                    control={control}
                    render={({ field }) => (
                      <Input id="creditLimitAmount" type="number" {...field} />
                    )}
                  />
                  {errors.creditLimitAmount && (
                    <Box color="red.500" fontSize="sm">
                      {errors.creditLimitAmount.message}
                    </Box>
                  )}
                </FormControl>
              )}
            </Box>
            
            {/* Terms and Conditions */}
            <Box bg="gray.50" p={6} borderRadius="md">
              <FormControl isInvalid={!!errors.termsAccepted}>
                <Controller
                  name="termsAccepted"
                  control={control}
                  render={({ field }) => (
                    <HStack>
                      <input
                        type="checkbox"
                        id="termsAccepted"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <FormLabel htmlFor="termsAccepted" mb={0}>
                        I agree to the <a href="#" style={{ color: '#3182ce' }}>Terms and Conditions</a> *
                      </FormLabel>
                    </HStack>
                  )}
                />
                {errors.termsAccepted && (
                  <Box color="red.500" fontSize="sm">
                    {errors.termsAccepted.message}
                  </Box>
                )}
              </FormControl>
            </Box>
            
            {/* Submit Button */}
            <HStack justify="flex-end" pt={4}>
              <Button type="submit" colorScheme="blue" isLoading={isLoading} loadingText="Submitting">
                Submit Registration
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
    );
  };
  
  export default DealerRegistrationForm;