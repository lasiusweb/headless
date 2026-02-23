import { Injectable } from '@nestjs/common';
import { DealerApplication } from './interfaces/dealer-application.interface';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class DealersService {
  private dealers: DealerApplication[] = [];

  constructor(private pricingService: PricingService) {}

  create(createDealerDto: CreateDealerDto): DealerApplication {
    const newDealer: DealerApplication = {
      id: Math.random().toString(36).substring(7),
      ...createDealerDto,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
    };
    
    this.dealers.push(newDealer);
    return newDealer;
  }

  findAll(): DealerApplication[] {
    return this.dealers;
  }

  findOne(id: string): DealerApplication {
    return this.dealers.find(dealer => dealer.id === id);
  }

  findByStatus(status: string): DealerApplication[] {
    return this.dealers.filter(dealer => dealer.status === status);
  }

  update(id: string, updateDealerDto: UpdateDealerDto): DealerApplication {
    const index = this.dealers.findIndex(dealer => dealer.id === id);
    if (index === -1) {
      throw new Error(`Dealer with ID ${id} not found`);
    }

    this.dealers[index] = {
      ...this.dealers[index],
      ...updateDealerDto,
      updatedAt: new Date(),
    };

    return this.dealers[index];
  }

  approve(id: string, adminId: string): DealerApplication {
    const index = this.dealers.findIndex(dealer => dealer.id === id);
    if (index === -1) {
      throw new Error(`Dealer with ID ${id} not found`);
    }

    this.dealers[index] = {
      ...this.dealers[index],
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: adminId,
      updatedAt: new Date(),
    };

    // Assign appropriate pricing tier after approval
    const pricingTier = this.pricingService.assignPricingTier(this.dealers[index]);
    this.pricingService.updateDealerPricing(id, pricingTier);

    // In a real application, this would trigger an email notification
    this.sendApprovalNotification(this.dealers[index]);
    
    return this.dealers[index];
  }

  reject(id: string, adminId: string, reason?: string): DealerApplication {
    const index = this.dealers.findIndex(dealer => dealer.id === id);
    if (index === -1) {
      throw new Error(`Dealer with ID ${id} not found`);
    }

    this.dealers[index] = {
      ...this.dealers[index],
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: adminId,
      rejectionReason: reason || null,
      updatedAt: new Date(),
    };

    // In a real application, this would trigger an email notification
    this.sendRejectionNotification(this.dealers[index]);

    return this.dealers[index];
  }

  remove(id: string): boolean {
    const index = this.dealers.findIndex(dealer => dealer.id === id);
    if (index === -1) {
      throw new Error(`Dealer with ID ${id} not found`);
    }

    this.dealers.splice(index, 1);
    return true;
  }

  private sendApprovalNotification(dealer: DealerApplication) {
    // In a real application, this would send an email to the dealer
    console.log(`Sending approval notification to ${dealer.contactPerson.email}`);
    // Email service call would go here
  }

  private sendRejectionNotification(dealer: DealerApplication) {
    // In a real application, this would send an email to the dealer
    console.log(`Sending rejection notification to ${dealer.contactPerson.email} with reason: ${dealer.rejectionReason}`);
    // Email service call would go here
  }
}