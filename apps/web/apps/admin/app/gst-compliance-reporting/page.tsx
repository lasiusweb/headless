'use client';

import React, { useState } from 'react';
import {
  Container,
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
  Flex,
  Spacer,
  Text,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Select,
} from '@chakra-ui/react';

const GstComplianceReportingPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);

  // Mock data for GST reports
  const gstReports = [
    {
      id: '1',
      period: '2023-05',
      totalInvoices: 125,
      totalTaxableValue: 2500000,
      totalCgst: 225000,
      totalSgst: 225000,
      totalIgst: 15000,
      totalGst: 465000,
      filingStatus: 'submitted' as const,
      submittedAt: new Date('2023-06-15'),
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2023-06-15'),
    },
    {
      id: '2',
      period: '2023-04',
      totalInvoices: 110,
      totalTaxableValue: 2200000,
      totalCgst: 198000,
      totalSgst: 198000,
      totalIgst: 12000,
      totalGst: 408000,
      filingStatus: 'verified' as const,
      submittedAt: new Date('2023-05-15'),
      verifiedAt: new Date('2023-05-20'),
      createdAt: new Date('2023-05-01'),
      updatedAt: new Date('2023-05-20'),
    },
    {
      id: '3',
      period: '2023-03',
      totalInvoices: 95,
      totalTaxableValue: 1900000,
      totalCgst: 171000,
      totalSgst: 171000,
      totalIgst: 18000,
      totalGst: 360000,
      filingStatus: 'verified' as const,
      submittedAt: new Date('2023-04-15'),
      verifiedAt: new Date('2023-04-18'),
      createdAt: new Date('2023-04-01'),
      updatedAt: new Date('2023-04-18'),
    },
  ];

  const [startDate, setStartDate] = useState('2023-05-01');
  const [endDate, setEndDate] = useState('2023-05-31');
  const [stateCode, setStateCode] = useState('KA');

  const handleGenerateReport = () => {
    toast({
      title: 'GST Report Generation Initiated',
      description: `Generating GST report for ${stateCode} from ${startDate} to ${endDate}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpdateStatus = (reportId: string, status: 'pending' | 'submitted' | 'verified') => {
    toast({
      title: 'GST Report Status Updated',
      description: `Report status updated to ${status}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex alignItems="center" mb={6}>
        <Heading as="h1" size="lg">GST Compliance Reporting</Heading>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          GST-compliant invoice generation and reporting
        </Text>
      </Flex>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">GST Report Generation</Heading>
        </CardHeader>
        <CardBody>
          <Flex gap={4} mb={4}>
            <FormControl>
              <FormLabel>Start Date</FormLabel>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>End Date</FormLabel>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>State Code</FormLabel>
              <Select 
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
              >
                <option value="KA">KA - Karnataka</option>
                <option value="MH">MH - Maharashtra</option>
                <option value="TN">TN - Tamil Nadu</option>
                <option value="AP">AP - Andhra Pradesh</option>
                <option value="UP">UP - Uttar Pradesh</option>
                <option value="GJ">GJ - Gujarat</option>
              </Select>
            </FormControl>
            <Button 
              colorScheme="blue" 
              alignSelf="flex-end"
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
          </Flex>
          <Text>
            Generate GST-compliant reports for specific periods and states. Reports include CGST, SGST, and IGST breakdowns.
          </Text>
        </CardBody>
      </Card>

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Monthly Reports</Tab>
          <Tab>GST Breakdown</Tab>
          <Tab>Filing Status</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Monthly GST Reports</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Period</Th>
                        <Th>Invoices</Th>
                        <Th>Taxable Value</Th>
                        <Th>CGST</Th>
                        <Th>SGST</Th>
                        <Th>IGST</Th>
                        <Th>Total GST</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {gstReports.map((report) => (
                        <Tr key={report.id}>
                          <Td fontWeight="bold">{report.period}</Td>
                          <Td>{report.totalInvoices}</Td>
                          <Td>₹{report.totalTaxableValue.toLocaleString('en-IN')}</Td>
                          <Td>₹{report.totalCgst.toLocaleString('en-IN')}</Td>
                          <Td>₹{report.totalSgst.toLocaleString('en-IN')}</Td>
                          <Td>₹{report.totalIgst.toLocaleString('en-IN')}</Td>
                          <Td>₹{report.totalGst.toLocaleString('en-IN')}</Td>
                          <Td>
                            <Badge 
                              colorScheme={
                                report.filingStatus === 'pending' ? 'yellow' : 
                                report.filingStatus === 'submitted' ? 'blue' : 'green'
                              }
                            >
                              {report.filingStatus}
                            </Badge>
                          </Td>
                          <Td>
                            <Button 
                              size="sm" 
                              colorScheme="blue"
                              mr={2}
                              onClick={() => handleUpdateStatus(report.id, 'submitted')}
                              disabled={report.filingStatus !== 'pending'}
                            >
                              Submit
                            </Button>
                            <Button 
                              size="sm" 
                              colorScheme="green"
                              onClick={() => handleUpdateStatus(report.id, 'verified')}
                              disabled={report.filingStatus !== 'submitted'}
                            >
                              Verify
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
                <Heading size="md">GST Tax Breakdown</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Detailed breakdown of CGST, SGST, and IGST collected during the selected period.
                </Text>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Tax Type</Th>
                        <Th>Rate</Th>
                        <Th>Base Amount</Th>
                        <Th>Tax Amount</Th>
                        <Th>Percentage of Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="bold">CGST</Td>
                        <Td>9%</Td>
                        <Td>₹2,500,000</Td>
                        <Td>₹225,000</Td>
                        <Td>48.4%</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">SGST</Td>
                        <Td>9%</Td>
                        <Td>₹2,500,000</Td>
                        <Td>₹225,000</Td>
                        <Td>48.4%</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">IGST</Td>
                        <Td>18%</Td>
                        <Td>₹1,000,000</Td>
                        <Td>₹15,000</Td>
                        <Td>3.2%</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold">Total</Td>
                        <Td>-</Td>
                        <Td>₹6,000,000</Td>
                        <Td>₹465,000</Td>
                        <Td>100%</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Filing Status</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Track the status of GST returns filing for each period.
                </Text>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Period</Th>
                        <Th>Filing Status</Th>
                        <Th>Submitted Date</Th>
                        <Th>Verified Date</Th>
                        <Th>Due Date</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {gstReports.map((report) => (
                        <Tr key={report.id}>
                          <Td fontWeight="bold">{report.period}</Td>
                          <Td>
                            <Badge 
                              colorScheme={
                                report.filingStatus === 'pending' ? 'yellow' : 
                                report.filingStatus === 'submitted' ? 'blue' : 'green'
                              }
                            >
                              {report.filingStatus}
                            </Badge>
                          </Td>
                          <Td>{report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'N/A'}</Td>
                          <Td>{report.verifiedAt ? new Date(report.verifiedAt).toLocaleDateString() : 'N/A'}</Td>
                          <Td>{new Date(new Date(report.period + '-01').setMonth(new Date(report.period + '-01').getMonth() + 1)).toLocaleDateString()}</Td>
                          <Td>
                            <Button 
                              size="sm" 
                              colorScheme="blue"
                              onClick={() => handleUpdateStatus(report.id, 'submitted')}
                              disabled={report.filingStatus !== 'pending'}
                            >
                              Submit
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

      <Card>
        <CardHeader>
          <Heading size="md">GST Compliance Overview</Heading>
        </CardHeader>
        <CardBody>
          <Text mb={2}>
            <strong>Compliance Standards:</strong> All invoices generated comply with GST regulations 
            including proper HSN codes, tax breakdowns, and digital signatures.
          </Text>
          <Text mb={2}>
            <strong>Reporting:</strong> Monthly GST reports are automatically generated with CGST, 
            SGST, and IGST breakdowns for easy filing.
          </Text>
          <Text>
            <strong>Due Dates:</strong> GSTR-1 must be filed by the 11th of the following month, 
            and GSTR-3B by the 20th of the following month.
          </Text>
        </CardBody>
      </Card>
    </Container>
  );
};

export default GstComplianceReportingPage;