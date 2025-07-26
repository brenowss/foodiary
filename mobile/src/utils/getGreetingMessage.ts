export function getGreetingMessage(): { message: string; emoji: string } {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return { message: 'Bom dia', emoji: '🌅' };
  } else if (currentHour >= 12 && currentHour < 14) {
    return { message: 'Hora do almoço', emoji: '🍽️' };
  } else if (currentHour >= 14 && currentHour < 18) {
    return { message: 'Boa tarde', emoji: '☀️' };
  } else if (currentHour >= 18 && currentHour < 22) {
    return { message: 'Hora do jantar', emoji: '🍽️' };
  } else {
    return { message: 'Boa noite', emoji: '🌙' };
  }
}
