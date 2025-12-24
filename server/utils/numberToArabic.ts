/**
 * Convert numbers to Arabic text
 * Supports numbers up to 999,999,999,999,999
 */

const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];

const scales = [
  { value: 1000000000000, singular: 'تريليون', dual: 'تريليونان', plural: 'تريليون' },
  { value: 1000000000, singular: 'مليار', dual: 'ملياران', plural: 'مليار' },
  { value: 1000000, singular: 'مليون', dual: 'مليونان', plural: 'مليون' },
  { value: 1000, singular: 'ألف', dual: 'ألفان', plural: 'ألف' },
];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  
  const result: string[] = [];
  
  // Hundreds
  const h = Math.floor(num / 100);
  if (h > 0) {
    result.push(hundreds[h]);
  }
  
  const remainder = num % 100;
  
  // Tens and ones
  if (remainder >= 11 && remainder <= 19) {
    result.push(teens[remainder - 10]);
  } else {
    const t = Math.floor(remainder / 10);
    const o = remainder % 10;
    
    if (o > 0) {
      result.push(ones[o]);
    }
    
    if (t > 0) {
      result.push(tens[t]);
    }
  }
  
  return result.filter(Boolean).join(' و');
}

function getScaleText(scale: typeof scales[0], count: number): string {
  if (count === 1) {
    return scale.singular;
  } else if (count === 2) {
    return scale.dual;
  } else {
    return scale.plural;
  }
}

export function numberToArabic(num: number): string {
  if (num === 0) return 'صفر';
  if (num < 0) return 'سالب ' + numberToArabic(-num);
  
  const parts: string[] = [];
  let remaining = Math.floor(num);
  
  for (const scale of scales) {
    if (remaining >= scale.value) {
      const count = Math.floor(remaining / scale.value);
      const countText = convertLessThanThousand(count);
      const scaleText = getScaleText(scale, count);
      
      if (count === 1 && scale.value === 1000) {
        parts.push(scaleText);
      } else if (count === 2 && scale.value === 1000) {
        parts.push(scaleText);
      } else {
        parts.push(`${countText} ${scaleText}`);
      }
      
      remaining %= scale.value;
    }
  }
  
  // Handle remaining hundreds, tens, and ones
  if (remaining > 0) {
    parts.push(convertLessThanThousand(remaining));
  }
  
  return parts.filter(Boolean).join(' و');
}

export function formatCurrency(amount: number, currency: string = 'ريال'): string {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  
  let result = numberToArabic(integerPart) + ' ' + currency;
  
  if (decimalPart > 0) {
    result += ' و' + numberToArabic(decimalPart) + ' هللة';
  }
  
  return result;
}

export default { numberToArabic, formatCurrency };
