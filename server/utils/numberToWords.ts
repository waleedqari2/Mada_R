/**
 * تحويل الأرقام إلى نص عربي
 * Converts numbers to Arabic words
 */

const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const hundreds = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];

function convertThreeDigits(num: number): string {
  if (num === 0) return '';
  
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  const ten = Math.floor(remainder / 10);
  const one = remainder % 10;
  
  let result = '';
  
  if (hundred > 0) {
    result += hundreds[hundred];
  }
  
  if (remainder >= 10 && remainder < 20) {
    if (result) result += ' و';
    result += teens[remainder - 10];
  } else {
    if (ten > 0) {
      if (result) result += ' و';
      result += tens[ten];
    }
    if (one > 0) {
      if (result) result += ' و';
      result += ones[one];
    }
  }
  
  return result;
}

export function numberToArabicWords(num: number): string {
  if (num === 0) return 'صفر ريال سعودي';
  
  // Split into integer and decimal parts
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = '';
  
  if (integerPart === 0) {
    result = 'صفر ريال';
  } else if (integerPart < 1000) {
    result = convertThreeDigits(integerPart) + ' ريال';
  } else if (integerPart < 1000000) {
    const thousands = Math.floor(integerPart / 1000);
    const remainder = integerPart % 1000;
    
    if (thousands === 1) {
      result = 'ألف';
    } else if (thousands === 2) {
      result = 'ألفان';
    } else if (thousands >= 3 && thousands <= 10) {
      result = convertThreeDigits(thousands) + ' آلاف';
    } else {
      result = convertThreeDigits(thousands) + ' ألف';
    }
    
    if (remainder > 0) {
      result += ' و' + convertThreeDigits(remainder);
    }
    
    result += ' ريال';
  } else {
    const millions = Math.floor(integerPart / 1000000);
    const thousands = Math.floor((integerPart % 1000000) / 1000);
    const remainder = integerPart % 1000;
    
    if (millions === 1) {
      result = 'مليون';
    } else if (millions === 2) {
      result = 'مليونان';
    } else {
      result = convertThreeDigits(millions) + ' مليون';
    }
    
    if (thousands > 0) {
      if (thousands === 1) {
        result += ' وألف';
      } else if (thousands === 2) {
        result += ' وألفان';
      } else if (thousands >= 3 && thousands <= 10) {
        result += ' و' + convertThreeDigits(thousands) + ' آلاف';
      } else {
        result += ' و' + convertThreeDigits(thousands) + ' ألف';
      }
    }
    
    if (remainder > 0) {
      result += ' و' + convertThreeDigits(remainder);
    }
    
    result += ' ريال';
  }
  
  if (decimalPart > 0) {
    result += ' و' + convertThreeDigits(decimalPart) + ' هللة';
  }
  
  result += ' سعودي';
  
  return result;
}
