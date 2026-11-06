const fixedHolidays = [
  [1, 1], // Confraternização Universal
  [1, 25], // Aniversário de São Paulo
  [4, 21], // Tiradentes
  [5, 1], // Dia do Trabalho
  [7, 9], // Data Magna do Estado de São Paulo
  [9, 7], // Independência do Brasil
  [10, 12], // Nossa Senhora Aparecida
  [11, 2], // Finados
  [11, 15], // Proclamação da República
  [11, 20], // Dia Nacional de Zumbi e da Consciência Negra
  [12, 25], // Natal
] as const;

// Cálculo gregoriano de Oudin com divisão inteira.
// Referência: https://aa.usno.navy.mil/faq/easter
function easterDate(year: number) {
  const century = Math.trunc(year / 100);
  const lunarCycle = year % 19;
  const leapCenturies = Math.trunc(century / 4);
  const lunarCorrection = Math.trunc((century - 17) / 25);
  const fullMoon =
    (century -
      leapCenturies -
      Math.trunc((century - lunarCorrection) / 3) +
      19 * lunarCycle +
      15) %
    30;
  const lateMoon = Math.trunc(fullMoon / 28);
  const adjustedMoon =
    fullMoon -
    lateMoon *
      (1 -
        lateMoon *
          Math.trunc(29 / (fullMoon + 1)) *
          Math.trunc((21 - lunarCycle) / 11));
  const weekday =
    (year + Math.trunc(year / 4) + adjustedMoon + 2 - century + leapCenturies) %
    7;
  const offset = adjustedMoon - weekday;
  const month = 3 + Math.trunc((offset + 40) / 44);
  const day = offset + 28 - 31 * Math.trunc(month / 4);
  return { month, day };
}

export function saoPauloHolidays(year: number) {
  const { month, day } = easterDate(year);
  return new Set([
    ...fixedHolidays.map(([month, day]) => Date.UTC(year, month - 1, day)),
    Date.UTC(year, month - 1, day - 2), // Sexta-feira da Paixão
    Date.UTC(year, month - 1, day + 60), // Corpus Christi
  ]);
}
