
// Funções utilitárias de validação (mantidas para uso direto)
export function validateNickname(nickname) {
  nickname = (nickname || '').trim();
  if (!nickname) return { valid: false, message: 'Digite seu apelido!' };
  if (nickname.length < 3) return { valid: false, message: 'Mínimo 3 caracteres!' };
  if (nickname.length > 20) return { valid: false, message: 'Máximo 20 caracteres!' };
  return { valid: true, message: '' };
}

export function validateAvatar(avatar) {
  if (!avatar) return { valid: false, message: 'Selecione um avatar!' };
  return { valid: true, message: '' };
}
