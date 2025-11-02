const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicIndicDigits = '٠١٢٣٤٥٦٧٨٩';

export const normalizeIranNationalIdDigits = (value: string): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = persianDigits.indexOf(digit);
    if (persianIndex >= 0) {
      return String(persianIndex);
    }

    const arabicIndex = arabicIndicDigits.indexOf(digit);
    if (arabicIndex >= 0) {
      return String(arabicIndex);
    }

    return digit;
  });
};

export const isValidIranNationalId = (value: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = normalizeIranNationalIdDigits(value).trim();

  if (!/^\d{10}$/.test(normalized)) {
    return false;
  }

  if (/^(\d)\1{9}$/.test(normalized)) {
    return false;
  }

  const checkDigit = Number(normalized[9]);
  const sum = normalized
    .slice(0, 9)
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (10 - index), 0);

  const remainder = sum % 11;

  if (remainder < 2) {
    return checkDigit === remainder;
  }

  return checkDigit === 11 - remainder;
};
