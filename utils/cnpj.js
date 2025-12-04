/**
 * CNPJ validation and formatting utilities
 */

/**
 * Removes all non-numeric characters from CNPJ
 */
function cleanCNPJ(cnpj) {
  return cnpj.replace(/\D/g, '');
}

/**
 * Formats CNPJ with dots, slash, and dash
 */
function formatCNPJ(cnpj) {
  const clean = cleanCNPJ(cnpj);
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Validates CNPJ using the check digit algorithm
 */
function validateCNPJ(cnpj) {
  const clean = cleanCNPJ(cnpj);
  
  if (clean.length !== 14) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(clean)) return false;
  
  // Calculate first check digit
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (parseInt(clean[12]) !== firstDigit) return false;
  
  // Calculate second check digit
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return parseInt(clean[13]) === secondDigit;
}

module.exports = {
  cleanCNPJ,
  formatCNPJ,
  validateCNPJ
};