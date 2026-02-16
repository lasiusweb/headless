import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreatePosTransactionDto } from './dto/create-pos-transaction.dto';
import { UpdatePosTransactionDto } from './dto/update-pos-transaction.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MobilePosService {
  private readonly logger = new Logger(MobilePosService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Create a new POS transaction (sale)
   */
  async createPosTransaction(createPosTransactionDto: CreatePosTransactionDto, userId: string) {
    // Validate the transaction data
    if (!createPosTransactionDto.items || createPosTransactionDto.items.length === 0) {
      throw new BadRequestException('At least one item is required for a POS transaction');
    }

    // Get user profile to determine role and permissions
    const { data: user, error: userError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('id, first_name, last_name, email, role')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new NotFoundException('User not found');
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of createPosTransactionDto.items) {
      // Get product variant details
      const { data: variant, error: variantError } = await this.supabaseService.getClient()
        .from('product_variants')
        .select(`
          *,
          product:products(name, category_id)
        `)
        .eq('id', item.variantId)
        .single();

      if (variantError) {
        throw new BadRequestException(`Product variant not found: ${item.variantId}`);
      }

      // Determine price based on customer type if provided, otherwise use MRP
      let unitPrice = variant.mrp;
      if (createPosTransactionDto.customerType === 'dealer') {
        unitPrice = variant.dealer_price || variant.mrp;
      } else if (createPosTransactionDto.customerType === 'distributor') {
        unitPrice = variant.distributor_price || variant.mrp;
      }

      const totalItemPrice = unitPrice * item.quantity;
      subtotal += totalItemPrice;

      processedItems.push({
        variant_id: item.variantId,
        variant_name: variant.name,
        product_name: variant.product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalItemPrice,
        hsn_code: variant.hsn_code || '',
      });
    }

    // Calculate tax (assuming 18% GST for most products)
    const taxRate = 0.18;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount + (createPosTransactionDto.shippingCost || 0);

    // Generate POS transaction number
    const posTransactionNumber = `POS${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Create the POS transaction record
    const { data: posTransaction, error: transactionError } = await this.supabaseService.getClient()
      .from('pos_transactions')
      .insert([
        {
          transaction_number: posTransactionNumber,
          user_id: userId,
          customer_type: createPosTransactionDto.customerType || 'retail',
          customer_info: createPosTransactionDto.customerInfo || null,
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax_amount: parseFloat(taxAmount.toFixed(2)),
          shipping_cost: parseFloat((createPosTransactionDto.shippingCost || 0).toFixed(2)),
          total_amount: parseFloat(totalAmount.toFixed(2)),
          payment_method: createPosTransactionDto.paymentMethod || 'cash',
          payment_status: 'completed', // POS transactions are typically completed immediately
          status: 'completed', // POS transactions are typically completed immediately
          notes: createPosTransactionDto.notes || '',
          is_online: false, // Initially marked as offline transaction
          sync_status: 'pending', // Will be synced when online
          currency: 'INR',
          created_by: userId,
        }
      ])
      .select()
      .single();

    if (transactionError) {
      throw new Error(transactionError.message);
    }

    // Create POS transaction items
    for (const item of processedItems) {
      const { error: itemError } = await this.supabaseService.getClient()
        .from('pos_transaction_items')
        .insert([
          {
            pos_transaction_id: posTransaction.id,
            variant_id: item.variant_id,
            variant_name: item.variant_name,
            product_name: item.product_name,
            hsn_code: item.hsn_code,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          }
        ]);

      if (itemError) {
        throw new Error(itemError.message);
      }
    }

    // Attempt to sync with inventory if online
    try {
      await this.syncInventoryForPosTransaction(posTransaction.id);
    } catch (inventoryError) {
      // If inventory sync fails, log the error but continue with the transaction
      this.logger.warn(`Failed to sync inventory for POS transaction ${posTransaction.id}: ${inventoryError.message}`);
    }

    // Return the complete POS transaction
    const { data: fullTransaction, error: fullTransactionError } = await this.supabaseService.getClient()
      .from('pos_transactions')
      .select(`
        *,
        user:profiles(first_name, last_name, email),
        items:pos_transaction_items(*)
      `)
      .eq('id', posTransaction.id)
      .single();

    if (fullTransactionError) {
      throw new Error(fullTransactionError.message);
    }

    return fullTransaction;
  }

  /**
   * Get all POS transactions for a specific user
   */
  async getUserPosTransactions(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    searchTerm?: string;
  }) {
    let query = this.supabaseService.getClient()
      .from('pos_transactions')
      .select(`
        *,
        user:profiles(first_name, last_name, email),
        items:pos_transaction_items(*)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.searchTerm) {
      query = query.or(
        `transaction_number.ilike.%${filters.searchTerm}%,customer_info->>name.ilike.%${filters.searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Get POS transaction by ID
   */
  async getPosTransactionById(transactionId: string, userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('pos_transactions')
      .select(`
        *,
        user:profiles(first_name, last_name, email),
        items:pos_transaction_items(*)
      `)
      .eq('id', transactionId)
      .eq('created_by', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found
        throw new NotFoundException('POS transaction not found');
      }
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update POS transaction (for corrections)
   */
  async updatePosTransaction(transactionId: string, updatePosTransactionDto: UpdatePosTransactionDto, userId: string) {
    // First, get the existing transaction to verify ownership and status
    const existingTransaction = await this.getPosTransactionById(transactionId, userId);

    if (existingTransaction.status !== 'completed') {
      throw new BadRequestException('Only completed transactions can be updated');
    }

    // Check if this is a correction transaction (not allowed after a certain period)
    const transactionDate = new Date(existingTransaction.created_at);
    const daysDiff = (new Date().getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) { // Allow corrections only within 7 days
      throw new BadRequestException('Cannot update transactions older than 7 days');
    }

    // Process the update based on the type of update
    if (updatePosTransactionDto.type === 'correction') {
      // For corrections, we create a new transaction with negative amounts
      const correctionTransaction = await this.createCorrectionTransaction(
        existingTransaction,
        updatePosTransactionDto,
        userId
      );
      
      return correctionTransaction;
    } else {
      throw new BadRequestException('Invalid update type');
    }
  }

  /**
   * Process POS transaction sync when device comes back online
   */
  async syncOfflineTransactions(userId: string) {
    // Get all offline transactions that need to be synced
    const { data: offlineTransactions, error: offlineError } = await this.supabaseService.getClient()
      .from('pos_transactions')
      .select(`
        *,
        items:pos_transaction_items(*)
      `)
      .eq('created_by', userId)
      .eq('is_online', false)
      .eq('sync_status', 'pending')
      .order('created_at', { ascending: true });

    if (offlineError) {
      throw new Error(offlineError.message);
    }

    const results = [];
    for (const transaction of offlineTransactions) {
      try {
        // Sync the transaction with central system
        const syncResult = await this.syncSingleTransaction(transaction);
        results.push({
          transactionId: transaction.id,
          success: true,
          syncResult
        });
      } catch (syncError) {
        results.push({
          transactionId: transaction.id,
          success: false,
          error: syncError.message
        });
      }
    }

    return {
      totalTransactions: offlineTransactions.length,
      syncedCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * Get POS dashboard metrics
   */
  async getPosDashboardMetrics(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    const startDate = filters?.startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
    const endDate = filters?.endDate || new Date().toISOString();

    // Get revenue metrics
    const { data: revenueData, error: revenueError } = await this.supabaseService.getClient()
      .from('pos_transactions')
      .select('total_amount, payment_method')
      .eq('created_by', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .in('status', ['completed']);

    if (revenueError) {
      throw new Error(revenueError.message);
    }

    // Calculate metrics
    const totalRevenue = revenueData.reduce((sum, tx) => sum + tx.total_amount, 0);
    const transactionCount = revenueData.length;
    const avgTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    // Revenue by payment method
    const revenueByMethod = revenueData.reduce((acc, tx) => {
      if (!acc[tx.payment_method]) {
        acc[tx.payment_method] = 0;
      }
      acc[tx.payment_method] += tx.total_amount;
      return acc;
    }, {});

    // Top selling products
    const { data: topProducts, error: productsError } = await this.supabaseService.getClient()
      .from('pos_transaction_items')
      .select(`
        product_name,
        SUM(quantity) as total_quantity,
        SUM(total_price) as total_revenue
      `)
      .in('pos_transaction_id', revenueData.map(tx => tx.id))
      .group('product_name')
      .order('total_quantity', { ascending: false })
      .limit(5);

    if (productsError) {
      throw new Error(productsError.message);
    }

    return {
      totalRevenue,
      transactionCount,
      avgTransactionValue,
      revenueByMethod,
      topProducts,
      period: {
        start: startDate,
        end: endDate
      }
    };
  }

  /**
   * Sync inventory for POS transaction
   */
  private async syncInventoryForPosTransaction(transactionId: string) {
    // Get transaction items
    const { data: items, error: itemsError } = await this.supabaseService.getClient()
      .from('pos_transaction_items')
      .select(`
        *,
        transaction:pos_transactions(is_online)
      `)
      .eq('pos_transaction_id', transactionId);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    // For each item, reduce inventory
    for (const item of items) {
      // In a real implementation, this would call the inventory service
      // to reduce the available stock for the sold items
      console.log(`Reducing inventory for variant ${item.variant_id}, quantity: ${item.quantity}`);
      
      // This would typically call inventory service to update stock levels
      // await this.inventoryService.reduceStock(item.variant_id, item.quantity);
    }
  }

  /**
   * Create a correction transaction
   */
  private async createCorrectionTransaction(
    originalTransaction: any,
    updateDto: UpdatePosTransactionDto,
    userId: string
  ) {
    // Create a correction transaction with negative amounts
    const correctionItems = originalTransaction.items.map(item => ({
      variant_id: item.variant_id,
      variant_name: item.variant_name,
      product_name: item.product_name,
      hsn_code: item.hsn_code,
      quantity: -item.quantity, // Negative quantity for correction
      unit_price: item.unit_price,
      total_price: -item.total_price, // Negative total for correction
    }));

    // Calculate correction totals
    const subtotal = correctionItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = subtotal * 0.18; // Assuming 18% tax
    const totalAmount = subtotal + taxAmount;

    // Generate correction transaction number
    const correctionNumber = `CORR${originalTransaction.transaction_number}`;

    // Create the correction transaction
    const { data: correctionTransaction, error: correctionError } = await this.supabaseService.getClient()
      .from('pos_transactions')
      .insert([
        {
          transaction_number: correctionNumber,
          user_id: originalTransaction.user_id,
          customer_type: originalTransaction.customer_type,
          customer_info: originalTransaction.customer_info,
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax_amount: parseFloat(taxAmount.toFixed(2)),
          shipping_cost: 0, // Corrections typically don't have shipping
          total_amount: parseFloat(totalAmount.toFixed(2)),
          payment_method: 'correction',
          payment_status: 'completed',
          status: 'completed',
          notes: `Correction for transaction ${originalTransaction.transaction_number}: ${updateDto.notes || ''}`,
          is_online: originalTransaction.is_online,
          sync_status: originalTransaction.sync_status,
          currency: 'INR',
          created_by: userId,
          parent_transaction_id: originalTransaction.id, // Link to original transaction
          transaction_type: 'correction' // Mark as correction
        }
      ])
      .select()
      .single();

    if (correctionError) {
      throw new Error(correctionError.message);
    }

    // Create correction items
    for (const item of correctionItems) {
      const { error: itemError } = await this.supabaseService.getClient()
        .from('pos_transaction_items')
        .insert([
          {
            pos_transaction_id: correctionTransaction.id,
            variant_id: item.variant_id,
            variant_name: item.variant_name,
            product_name: item.product_name,
            hsn_code: item.hsn_code,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          }
        ]);

      if (itemError) {
        throw new Error(itemError.message);
      }
    }

    return correctionTransaction;
  }

  /**
   * Sync a single transaction with the central system
   */
  private async syncSingleTransaction(transaction: any) {
    // In a real implementation, this would:
    // 1. Verify the transaction data
    // 2. Sync with the central inventory system
    // 3. Update the main orders database if needed
    // 4. Mark the transaction as synced
    
    // For now, we'll just update the sync status
    const { error } = await this.supabaseService.getClient()
      .from('pos_transactions')
      .update({
        is_online: true,
        sync_status: 'synced',
        synced_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    if (error) {
      throw new Error(error.message);
    }

    // Also sync the items
    await this.supabaseService.getClient()
      .from('pos_transaction_items')
      .update({
        synced_at: new Date().toISOString(),
      })
      .eq('pos_transaction_id', transaction.id);

    return { synced: true, transactionId: transaction.id };
  }
}