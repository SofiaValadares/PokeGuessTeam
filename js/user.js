// ====== POKÉTEAMGUESS USER MANAGEMENT ======

class UserManager {
  static STORAGE_KEY = 'poketeamguess_player';

  /**
   * Obtém dados do jogador armazenados
   * @returns {Object|null} Dados do jogador ou null se não existir
   */
  static getPlayerData() {
    try {
      const playerData = localStorage.getItem(this.STORAGE_KEY);
      return playerData ? JSON.parse(playerData) : null;
    } catch (error) {
      console.error('Erro ao obter dados do jogador:', error);
      return null;
    }
  }

  /**
   * Verifica se existe um jogador registrado
   * @returns {Boolean}
   */
  static isPlayerRegistered() {
    return this.getPlayerData() !== null;
  }

  /**
   * Salva dados do jogador
   * @param {Object} playerData Dados a serem salvos
   * @returns {Object|null} Dados salvos ou null se houver erro
   */
  static setPlayerData(playerData) {
    try {
      const completeData = {
        nickname: playerData.nickname || '',
        avatar: playerData.avatar || '',
        registeredAt: playerData.registeredAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        level: playerData.level || 1,
        experience: playerData.experience || 0,
        team: playerData.team || []
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completeData));
      return completeData;
    } catch (error) {
      console.error('Erro ao salvar dados do jogador:', error);
      return null;
    }
  }

  /**
   * Atualiza dados específicos do jogador
   * @param {Object} updates Campos a serem atualizados
   * @returns {Object|null} Dados atualizados ou null se houver erro
   */
  static updatePlayerData(updates) {
    try {
      const playerData = this.getPlayerData();
      if (playerData) {
        const updated = { ...playerData, ...updates, updatedAt: new Date().toISOString() };
        return this.setPlayerData(updated);
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      return null;
    }
  }

  /**
   * Remove dados do jogador (logout)
   * @returns {Boolean}
   */
  static clearPlayerData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  }

  /**
   * Valida nickname
   * @param {String} nickname
   * @returns {Object} { valid: Boolean, message: String }
   */
  static validateNickname(nickname) {
    nickname = nickname.trim();

    if (!nickname) {
      return { valid: false, message: 'Digite seu apelido!' };
    }

    if (nickname.length < 3) {
      return { valid: false, message: 'Mínimo 3 caracteres!' };
    }

    if (nickname.length > 20) {
      return { valid: false, message: 'Máximo 20 caracteres!' };
    }

    return { valid: true, message: '' };
  }

  /**
   * Valida avatar
   * @param {String} avatar
   * @returns {Object} { valid: Boolean, message: String }
   */
  static validateAvatar(avatar) {
    if (!avatar) {
      return { valid: false, message: 'Selecione um avatar!' };
    }

    return { valid: true, message: '' };
  }

  /**
   * Registra um novo jogador
   * @param {String} nickname
   * @param {String} avatar
   * @returns {Object} { success: Boolean, data: Object|null, message: String }
   */
  static registerPlayer(nickname, avatar) {
    // Validar nickname
    const nicknameValidation = this.validateNickname(nickname);
    if (!nicknameValidation.valid) {
      return { success: false, data: null, message: nicknameValidation.message };
    }

    // Validar avatar
    const avatarValidation = this.validateAvatar(avatar);
    if (!avatarValidation.valid) {
      return { success: false, data: null, message: avatarValidation.message };
    }

    // Salvar dados
    const playerData = this.setPlayerData({
      nickname: nickname.trim(),
      avatar: avatar
    });

    if (playerData) {
      return {
        success: true,
        data: playerData,
        message: '✓ Registro confirmado! Bem-vindo, treinador!'
      };
    } else {
      return {
        success: false,
        data: null,
        message: 'Erro ao salvar dados. Tente novamente!'
      };
    }
  }

  /**
   * Atualiza o perfil do jogador
   * @param {String} nickname
   * @param {String} avatar
   * @returns {Object} { success: Boolean, data: Object|null, message: String }
   */
  static updateProfile(nickname, avatar) {
    // Validar nickname
    const nicknameValidation = this.validateNickname(nickname);
    if (!nicknameValidation.valid) {
      return { success: false, data: null, message: nicknameValidation.message };
    }

    // Validar avatar
    const avatarValidation = this.validateAvatar(avatar);
    if (!avatarValidation.valid) {
      return { success: false, data: null, message: avatarValidation.message };
    }

    // Atualizar dados
    const playerData = this.updatePlayerData({
      nickname: nickname.trim(),
      avatar: avatar
    });

    if (playerData) {
      return {
        success: true,
        data: playerData,
        message: '✓ Perfil atualizado com sucesso!'
      };
    } else {
      return {
        success: false,
        data: null,
        message: 'Erro ao atualizar dados. Tente novamente!'
      };
    }
  }

  /**
   * Adiciona experiência ao jogador
   * @param {Number} xp Experiência a adicionar
   * @returns {Object|null}
   */
  static addExperience(xp) {
    const playerData = this.getPlayerData();
    if (playerData) {
      const newXp = playerData.experience + xp;
      const newLevel = Math.floor(newXp / 100) + 1;
      return this.updatePlayerData({
        experience: newXp,
        level: newLevel
      });
    }
    return null;
  }

  /**
   * Adiciona um Pokémon ao time
   * @param {Object} pokemon Dados do Pokémon
   * @returns {Object|null}
   */
  static addPokemonToTeam(pokemon) {
    const playerData = this.getPlayerData();
    if (playerData && playerData.team.length < 6) {
      const newTeam = [...playerData.team, pokemon];
      return this.updatePlayerData({ team: newTeam });
    }
    return null;
  }

  /**
   * Remove um Pokémon do time
   * @param {Number} index Índice do Pokémon
   * @returns {Object|null}
   */
  static removePokemonFromTeam(index) {
    const playerData = this.getPlayerData();
    if (playerData && index >= 0 && index < playerData.team.length) {
      const newTeam = playerData.team.filter((_, i) => i !== index);
      return this.updatePlayerData({ team: newTeam });
    }
    return null;
  }

  /**
   * Obtém o time do jogador
   * @returns {Array}
   */
  static getTeam() {
    const playerData = this.getPlayerData();
    return playerData ? playerData.team : [];
  }
}
