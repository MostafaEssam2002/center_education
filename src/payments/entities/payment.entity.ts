export class Payment {
    id: number;
    userId: number;
    courseId: number;
    enrollmentRequestId: number;
    amountCents: number;
    status: 'PENDING' | 'PAID' | 'FAILED';
    paymobOrderId?: number;
    transactionId?: number;
    createdAt: Date;
}
