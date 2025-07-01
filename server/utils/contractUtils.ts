/**
 * Calcule le statut de paiement d'un contrat
 * @param paymentDay Jour de paiement (1-31)
 * @param startDate Date de début du contrat
 * @returns Statut de paiement avec jours de retard et alerte
 */
export const getPaymentStatus = (
  paymentDay: number | null,
  startDate: string
): { status: string; days: number; alert: boolean } => {
  if (!paymentDay) {
    return { status: 'non défini', days: 0, alert: false };
  }

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Créer la date de paiement pour ce mois
  const paymentDate = new Date(currentYear, currentMonth, paymentDay);
  
  // Si le jour de paiement est déjà passé ce mois-ci
  if (currentDay > paymentDay) {
    const daysLate = currentDay - paymentDay;
    return {
      status: daysLate > 0 ? 'en retard' : 'à échéance',
      days: daysLate,
      alert: daysLate > 0
    };
  }

  // Si le jour de paiement est aujourd'hui ou dans le futur
  return {
    status: currentDay === paymentDay ? 'à échéance' : 'à venir',
    days: 0,
    alert: false
  };
};
