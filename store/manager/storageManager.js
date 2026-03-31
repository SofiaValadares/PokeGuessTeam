// Funções utilitárias para manipulação de objetos no localStorage

export function saveToStorage(key, object) {
  try {
    localStorage.setItem(key, JSON.stringify(object));
    return true;
  } catch (error) {
    console.error('Erro ao salvar no storage:', error);
    return false;
  }
}

export function getFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Erro ao obter do storage:', error);
    return null;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Erro ao remover do storage:', error);
    return false;
  }
}
