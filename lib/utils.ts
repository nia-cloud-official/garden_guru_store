export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function generateOrderId(): string {
  const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `GG-${randomStr}`;
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\s+/g, '');
}

export function validateZimbabwePhone(phone: string): boolean {
  const cleanedPhone = cleanPhone(phone);
  return /^(\+?2637[0-9]{8}|07[0-9]{8})$/.test(cleanedPhone);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
