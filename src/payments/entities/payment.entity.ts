export class Payment {
    id: number;
    userId: number;
    courseId: number;
    enrollmentRequestId?: number | null;
    amountCents: number;
    status: 'PENDING' | 'PAID' | 'FAILED';
    paymobOrderId?: number;
    transactionId?: number;
    createdAt: Date;
}
