// Valida CPF conferindo os dígitos verificadores.
// Retorna true apenas para CPFs matematicamente válidos.
export function isValidCPF(cpf) {
  if (!cpf) return false;

  // Remove tudo que não for número
  const clean = String(cpf).replace(/\D/g, '');

  // Precisa ter exatamente 11 dígitos
  if (clean.length !== 11) return false;

  // Rejeita sequências repetidas (000.000.000-00, 111..., etc.)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // Valida o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (check !== parseInt(clean.charAt(9), 10)) return false;

  // Valida o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (check !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

// Formata um CPF para exibição: 12345678901 -> 123.456.789-01
export function formatCPF(cpf) {
  const clean = String(cpf || '').replace(/\D/g, '').slice(0, 11);
  return clean
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
