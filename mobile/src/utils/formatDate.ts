export function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  };

  const formattedDate = new Intl.DateTimeFormat('pt-BR', options)
    .format(date)
    .toUpperCase();

  if (isToday) {
    return `HOJE, ${formattedDate.split(', ')[1]}`;
  }

  if (isYesterday) {
    return `ONTEM, ${formattedDate.split(', ')[1]}`;
  }

  if (isTomorrow) {
    return `AMANHÃ, ${formattedDate.split(', ')[1]}`;
  }

  return formattedDate;
}
