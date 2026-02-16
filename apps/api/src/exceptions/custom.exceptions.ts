import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientStockException extends HttpException {
  constructor(productName: string, requested: number, available: number) {
    super(
      `Insufficient stock for ${productName}. Requested: ${requested}, Available: ${available}`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidCouponException extends HttpException {
  constructor(couponCode: string) {
    super(
      `Invalid or expired coupon: ${couponCode}`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class PaymentFailedException extends HttpException {
  constructor(transactionId?: string, gatewayMessage?: string) {
    const message = transactionId 
      ? `Payment failed for transaction ${transactionId}${gatewayMessage ? ': ' + gatewayMessage : ''}`
      : 'Payment failed';
      
    super(message, HttpStatus.PAYMENT_REQUIRED);
  }
}

export class OrderAlreadyProcessedException extends HttpException {
  constructor(orderId: string, currentStatus: string) {
    super(
      `Order ${orderId} is already in ${currentStatus} status and cannot be modified`,
      HttpStatus.CONFLICT
    );
  }
}

export class UnauthorizedResourceAccessException extends HttpException {
  constructor(resourceType: string, resourceId: string) {
    super(
      `You are not authorized to access ${resourceType} with ID ${resourceId}`,
      HttpStatus.FORBIDDEN
    );
  }
}

export class GstValidationFailedException extends HttpException {
  constructor(gstNumber: string) {
    super(
      `GST number validation failed for: ${gstNumber}`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class DealerApplicationPendingException extends HttpException {
  constructor(userId: string) {
    super(
      `You already have a pending dealer application with ID ${userId}`,
      HttpStatus.CONFLICT
    );
  }
}

export class MaxDiscountExceededException extends HttpException {
  constructor(discountValue: number, maxValue: number) {
    super(
      `Discount value ${discountValue} exceeds maximum allowed value of ${maxValue}`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidAddressException extends HttpException {
  constructor(message: string = 'Invalid address provided') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ShippingNotAvailableException extends HttpException {
  constructor(pincode: string, carrier: string) {
    super(
      `Shipping not available for pincode ${pincode} with carrier ${carrier}`,
      HttpStatus.BAD_REQUEST
    );
  }
}