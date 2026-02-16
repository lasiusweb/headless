import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class PaymentReconciliationService {
  private readonly logger = new Logger(PaymentReconciliationService.name);

  constructor(private supabaseService: SupabaseService) {}

  async reconcilePayments(startDate?: string, endDate?: string) {
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(); // Last 7 days by default
    const end = endDate || new Date().toISOString();

    // Get all payments in the specified period
    const { data: payments, error: paymentsError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        *,
        order:orders(order_number, total_amount)
      `)
      .gte('created_at', start)
      .lte('created_at', end);

    if (paymentsError) {
      throw new Error(`Error fetching payments: ${paymentsError.message}`);
    }

    // Get payment records from gateway (simulated)
    const gatewayRecords = await this.fetchGatewayRecords(start, end);

    // Compare and reconcile
    const reconciliationResults = await this.compareRecords(payments, gatewayRecords);

    // Create reconciliation report
    const report = {
      period: { start, end },
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      reconciled: reconciliationResults.reconciled,
      unreconciled: reconciliationResults.unreconciled,
      discrepancies: reconciliationResults.discrepancies,
      generatedAt: new Date().toISOString(),
    };

    // Save reconciliation report
    await this.saveReconciliationReport(report);

    return report;
  }

  async fetchGatewayRecords(startDate: string, endDate: string) {
    // In a real implementation, this would fetch records from payment gateways
    // For now, we'll simulate with mock data
    const { data: payments, error } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        id,
        transaction_id,
        amount,
        status,
        payment_method,
        created_at,
        order_id
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      throw new Error(error.message);
    }

    // Simulate gateway records with some potential differences
    return payments.map(payment => ({
      id: payment.id,
      transactionId: payment.transaction_id,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.payment_method,
      createdAt: payment.created_at,
      orderId: payment.order_id,
      // Simulate some potential differences
      gatewayStatus: Math.random() > 0.95 ? 'failed' : payment.status, // 5% chance of status mismatch
      gatewayAmount: Math.random() > 0.98 ? payment.amount + 1 : payment.amount, // 2% chance of amount mismatch
    }));
  }

  async compareRecords(localRecords: any[], gatewayRecords: any[]) {
    const reconciled = [];
    const unreconciled = [];
    const discrepancies = [];

    // Create a map of gateway records for faster lookup
    const gatewayMap = new Map();
    gatewayRecords.forEach(record => {
      gatewayMap.set(record.transactionId, record);
    });

    // Compare each local record with gateway record
    for (const localRecord of localRecords) {
      const gatewayRecord = gatewayMap.get(localRecord.transaction_id);

      if (!gatewayRecord) {
        unreconciled.push({
          source: 'local',
          record: localRecord,
          reason: 'Missing in gateway records',
        });
        continue;
      }

      // Check for discrepancies
      const hasDiscrepancy = 
        localRecord.amount !== gatewayRecord.gatewayAmount ||
        localRecord.status !== gatewayRecord.gatewayStatus;

      if (hasDiscrepancy) {
        discrepancies.push({
          local: localRecord,
          gateway: gatewayRecord,
          differences: {
            amount: localRecord.amount !== gatewayRecord.gatewayAmount,
            status: localRecord.status !== gatewayRecord.gatewayStatus,
          },
        });
      } else {
        reconciled.push({
          local: localRecord,
          gateway: gatewayRecord,
        });
      }
    }

    // Find records that exist in gateway but not in local
    for (const gatewayRecord of gatewayRecords) {
      const localRecord = localRecords.find(lr => lr.transaction_id === gatewayRecord.transactionId);
      if (!localRecord) {
        unreconciled.push({
          source: 'gateway',
          record: gatewayRecord,
          reason: 'Missing in local records',
        });
      }
    }

    return {
      reconciled,
      unreconciled,
      discrepancies,
    };
  }

  async processSettlement() {
    // Get unsettled payments
    const { data: unsettledPayments, error: unsettledError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        *,
        order:orders(order_number, total_amount, user_id)
      `)
      .eq('status', 'completed')
      .eq('settled', false);

    if (unsettledError) {
      throw new Error(`Error fetching unsettled payments: ${unsettledError.message}`);
    }

    const settlements = [];
    const errors = [];

    for (const payment of unsettledPayments) {
      try {
        // Process settlement with payment gateway
        const settlementResult = await this.settlePaymentWithGateway(payment);

        if (settlementResult.success) {
          // Update payment record to mark as settled
          const { error: updateError } = await this.supabaseService.getClient()
            .from('payment_transactions')
            .update({
              settled: true,
              settled_at: new Date().toISOString(),
              settlement_reference: settlementResult.settlementId,
            })
            .eq('id', payment.id);

          if (updateError) {
            errors.push({
              paymentId: payment.id,
              error: `Failed to update settlement status: ${updateError.message}`,
            });
          } else {
            settlements.push({
              paymentId: payment.id,
              orderId: payment.order_id,
              amount: payment.amount,
              settlementId: settlementResult.settlementId,
            });
          }
        } else {
          errors.push({
            paymentId: payment.id,
            error: `Gateway settlement failed: ${settlementResult.error}`,
          });
        }
      } catch (error) {
        errors.push({
          paymentId: payment.id,
          error: `Settlement error: ${error.message}`,
        });
      }
    }

    return {
      settlements,
      errors,
      totalProcessed: settlements.length,
      totalErrors: errors.length,
      processedAt: new Date().toISOString(),
    };
  }

  async settlePaymentWithGateway(payment: any) {
    // In a real implementation, this would call the payment gateway's settlement API
    // For now, simulating the process
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve({
            success: true,
            settlementId: `SETTLEMENT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          });
        } else {
          resolve({
            success: false,
            error: 'Gateway settlement failed',
          });
        }
      }, 100); // Simulate processing time
    });
  }

  async getSettlementReport(filters?: { 
    startDate?: string; 
    endDate?: string; 
    status?: string 
  }) {
    let query = this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        *,
        order:orders(order_number, total_amount, user_id)
      `)
      .eq('settled', true);

    if (filters?.startDate) {
      query = query.gte('settled_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('settled_at', filters.endDate);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Calculate settlement metrics
    const totalSettled = data.reduce((sum, payment) => sum + payment.amount, 0);
    const settlementCount = data.length;

    return {
      settlements: data,
      totalSettled,
      settlementCount,
      period: {
        start: filters?.startDate,
        end: filters?.endDate,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  async getDisputeReport(filters?: { 
    startDate?: string; 
    endDate?: string 
  }) {
    const start = filters?.startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
    const end = filters?.endDate || new Date().toISOString();

    // Get disputed payments
    const { data: disputedPayments, error } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        *,
        order:orders(order_number, total_amount, user_id)
      `)
      .gte('created_at', start)
      .lte('created_at', end)
      .in('status', ['disputed', 'refunded', 'chargeback']);

    if (error) {
      throw new Error(error.message);
    }

    // Calculate dispute metrics
    const totalDisputed = disputedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const disputeCount = disputedPayments.length;
    const disputeRate = disputedPayments.length > 0 
      ? (disputedPayments.length / disputedPayments.length) * 100 // This would be total payments in real implementation
      : 0;

    return {
      disputes: disputedPayments,
      totalDisputed,
      disputeCount,
      disputeRate: parseFloat(disputeRate.toFixed(2)),
      period: { start, end },
      generatedAt: new Date().toISOString(),
    };
  }

  async saveReconciliationReport(report: any) {
    const { error } = await this.supabaseService.getClient()
      .from('reconciliation_reports')
      .insert([
        {
          period_start: report.period.start,
          period_end: report.period.end,
          total_payments: report.totalPayments,
          total_amount: report.totalAmount,
          reconciled_count: report.reconciled.length,
          unreconciled_count: report.unreconciled.length,
          discrepancy_count: report.discrepancies.length,
          report_data: report,
        }
      ]);

    if (error) {
      this.logger.error(`Error saving reconciliation report: ${error.message}`);
    }
  }

  async getReconciliationHistory(filters?: { 
    startDate?: string; 
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabaseService.getClient()
      .from('reconciliation_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async resolveDiscrepancy(discrepancyId: string, resolution: 'accept_local' | 'accept_gateway' | 'manual_adjustment', notes?: string) {
    // In a real implementation, this would resolve the discrepancy based on the resolution type
    // For now, we'll just log the resolution
    this.logger.log(`Resolving discrepancy ${discrepancyId} with resolution: ${resolution}`);
    
    // Update the discrepancy record
    const { error } = await this.supabaseService.getClient()
      .from('payment_discrepancies')
      .update({
        resolved: true,
        resolution_type: resolution,
        resolution_notes: notes,
        resolved_at: new Date().toISOString(),
        resolved_by: 'system', // In real implementation, this would be the user ID
      })
      .eq('id', discrepancyId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      discrepancyId,
      resolution,
      resolvedAt: new Date().toISOString(),
    };
  }
}