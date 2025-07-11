export function translateStatus(status: string): string {
  switch (status) {
    case 'draft':
      return 'Brouillon';
    case 'sent':
      return 'Envoyé';
    case 'signed':
      return 'Signé';
    case 'expired':
      return 'Expiré';
    case 'cancelled':
      return 'Annulé';
    case 'paid':
      return 'Payé';
    case 'overdue':
      return 'En retard';
    case 'accepted':
      return 'Accepté';
    case 'refused':
      return 'Refusé';
    default:
      return status;
  }
}
