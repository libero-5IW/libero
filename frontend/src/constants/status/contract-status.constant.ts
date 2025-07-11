export const CONTRACT_STATUS = {
    DRAFT: 'draft',
    AWAITING_SIGNATURE: 'sent',
    SIGNED: 'signed',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
    DECLINED: 'declined'
} as const;
  