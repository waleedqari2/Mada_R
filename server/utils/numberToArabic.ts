/**
 * Convert numbers to Arabic words
 * Example: 150 → "مئة وخمسون ريال سعودي فقط لا غير"
 */

const ones = [
  '',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
];

const tens = [
  '',
  'عشرة',
  'عشرون',
  'ثلاثون',
  'أربعون',
  'خمسون',
  'ستون',
  'سبعون',
  'ثمانون',
  'تسعون',
];

const hundreds = [
  '',
  'مئة',
  'مئتان',
  'ثلاثمئة',
  'أربعمئة',
  'خمسمئة',
  'ستمئة',
  'سبعمئة',
  'ثمانمئة',
  'تسعمئة',
];

const teens = [
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
];

function convertHundreds(num: number): string {
  if (num === 0) return '';

  const hundred = Math.floor(num / 100);
  const remainder = num % 100;

  let result = hundreds[hundred];

  if (remainder === 0) {
    return result;
  }

  if (result) result += ' و';

  if (remainder < 10) {
    result += ones[remainder];
  } else if (remainder < 20) {
    result += teens[remainder - 10];
  } else {
    const ten = Math.floor(remainder / 10);
    const one = remainder % 10;
    result += tens[ten];
    if (one > 0) {
      result += ' و' + ones[one];
    }
  }

  return result;
}

function convertThousands(num: number): string {
  if (num === 0) return 'صفر';

  const thousand = Math.floor(num / 1000);
  const remainder = num % 1000;

  let result = '';

  if (thousand > 0) {
    if (thousand === 1) {
      result = 'ألف';
    } else if (thousand === 2) {
      result = 'ألفان';
    } else if (thousand < 10) {
      result = ones[thousand] + ' آلاف';
    } else {
      result = convertHundreds(thousand) + ' ألف';
    }
  }

  if (remainder > 0) {
    if (result) result += ' و';
    result += convertHundreds(remainder);
  }

  return result;
}

function convertMillions(num: number): string {
  const million = Math.floor(num / 1000000);
  const remainder = num % 1000000;

  let result = '';

  if (million > 0) {
    if (million === 1) {
      result = 'مليون';
    } else if (million === 2) {
      result = 'مليونان';
    } else if (million < 10) {
      result = ones[million] + ' ملايين';
    } else {
      result = convertThousands(million) + ' مليون';
    }
  }

  if (remainder > 0) {
    if (result) result += ' و';
    result += convertThousands(remainder);
  }

  return result;
}

export function numberToArabicWords(num: number): string {
  if (num === 0) return 'صفر ريال سعودي فقط لا غير';

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = '';

  if (integerPart >= 1000000) {
    result = convertMillions(integerPart);
  } else if (integerPart >= 1000) {
    result = convertThousands(integerPart);
  } else {
    result = convertHundreds(integerPart);
  }

  result += ' ريال سعودي';

  if (decimalPart > 0) {
    result += ' و' + convertHundreds(decimalPart) + ' هللة';
  }

  result += ' فقط لا غير';

  return result;
}
