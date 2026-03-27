// ====== POKÉTEAMGUESS USER MANAGEMENT ======

class UserManager {
  static STORAGE_KEY = 'poketeamguess_player';
  static OPPONENT_DATA_KEY = 'poketeamguess_opponent_data';
  static MATCH_STATE_KEY = 'poketeamguess_match_state';
  static BASE_LEVEL_XP = 100;

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
        matchesWon: playerData.matchesWon || 0,
        matchesLost: playerData.matchesLost || 0,
        matchesPlayed: playerData.matchesPlayed || 0,
        team: playerData.team || [],
        lastTeam: playerData.lastTeam || []
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
      const progress = this.applyExperienceGain(playerData.level, playerData.experience, xp);
      return this.updatePlayerData({
        experience: progress.experience,
        level: progress.level
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

  /**
   * Salva o time completo do jogador
   * @param {Array} teamArray Array de Pokémon
   * @returns {Object|null}
   */
  static saveTeam(teamArray) {
    const playerData = this.getPlayerData();
    if (playerData) {
      return this.updatePlayerData({
        team: teamArray,
        lastTeam: teamArray
      });
    }
    return null;
  }

  /**
   * Obtém o último time salvo do jogador
   * @returns {Array}
   */
  static getLastTeam() {
    const playerData = this.getPlayerData();
    return playerData && playerData.lastTeam ? playerData.lastTeam : [];
  }

  /**
   * Verifica se o time está completo (6 Pokémon)
   * @returns {Boolean}
   */
  static isTeamComplete() {
    const team = this.getTeam();
    return team.length === 6;
  }

  /**
   * Adiciona uma vitória ao jogador
   * @returns {Object|null}
   */
  static addMatchWin() {
    const playerData = this.getPlayerData();
    if (playerData) {
      return this.updatePlayerData({
        matchesWon: (playerData.matchesWon || 0) + 1,
        matchesPlayed: (playerData.matchesPlayed || 0) + 1
      });
    }
    return null;
  }

  /**
   * Adiciona uma derrota ao jogador
   * @returns {Object|null}
   */
  static addMatchLoss() {
    const playerData = this.getPlayerData();
    if (playerData) {
      return this.updatePlayerData({
        matchesLost: (playerData.matchesLost || 0) + 1,
        matchesPlayed: (playerData.matchesPlayed || 0) + 1
      });
    }
    return null;
  }

  /**
   * Registra o resultado de uma partida e aplica progressão
   * @param {('victory'|'defeat'|'giveup')} result
   * @returns {Object|null}
   */
  static registerMatchResult(result) {
    const playerData = this.getPlayerData();
    if (!playerData) return null;

    const currentXp = Number(playerData.experience || 0);
    const currentWins = Number(playerData.matchesWon || 0);
    const currentLosses = Number(playerData.matchesLost || 0);
    const currentPlayed = Number(playerData.matchesPlayed || 0);

    let xpEarned = 0;
    let nextWins = currentWins;
    let nextLosses = currentLosses;

    if (result === 'victory') {
      xpEarned = 60;
      nextWins += 1;
    } else if (result === 'defeat') {
      xpEarned = 25;
      nextLosses += 1;
    } else if (result === 'giveup') {
      xpEarned = 0;
      nextLosses += 1;
    } else {
      return null;
    }

    const progress = this.applyExperienceGain(playerData.level, currentXp, xpEarned);

    return this.updatePlayerData({
      experience: progress.experience,
      level: progress.level,
      matchesWon: nextWins,
      matchesLost: nextLosses,
      matchesPlayed: currentPlayed + 1
    });
  }

  /**
   * Calcula o XP necessário para passar do nível atual para o próximo
   * Nível 1->2: 100 | 2->3: 200 | 3->4: 400 ...
   * @param {Number} currentLevel
   * @returns {Number}
   */
  static getXpRequiredForNextLevel(currentLevel) {
    const safeLevel = Math.max(1, Number(currentLevel) || 1);
    return this.BASE_LEVEL_XP * (2 ** (safeLevel - 1));
  }

  /**
   * Aplica ganho de XP com reset ao subir de nível.
   * Regra: ao alcançar o XP do próximo nível, sobe 1 nível e XP volta para 0.
   * @param {Number} currentLevel
   * @param {Number} currentXp
   * @param {Number} gainedXp
   * @returns {{level: Number, experience: Number}}
   */
  static applyExperienceGain(currentLevel, currentXp, gainedXp) {
    const safeLevel = Math.max(1, Number(currentLevel) || 1);
    const safeCurrentXp = Math.max(0, Number(currentXp) || 0);
    const safeGain = Math.max(0, Number(gainedXp) || 0);

    const requiredXp = this.getXpRequiredForNextLevel(safeLevel);
    const updatedXp = safeCurrentXp + safeGain;

    if (updatedXp >= requiredXp) {
      return {
        level: safeLevel + 1,
        experience: 0
      };
    }

    return {
      level: safeLevel,
      experience: updatedXp
    };
  }

  /**
   * Obtém o número de vitórias
   * @returns {Number}
   */
  static getMatchesWon() {
    const playerData = this.getPlayerData();
    return playerData ? (playerData.matchesWon || 0) : 0;
  }

  /**
   * Obtém dados estatísticas do jogador
   * @returns {Object}
   */
  static getStats() {
    const playerData = this.getPlayerData();
    if (!playerData) return null;

    const matchesPlayed = playerData.matchesPlayed || ((playerData.matchesWon || 0) + (playerData.matchesLost || 0));
    const winRate = matchesPlayed > 0 ? Math.round(((playerData.matchesWon || 0) / matchesPlayed) * 100) : 0;
    
    return {
      nickname: playerData.nickname,
      avatar: playerData.avatar,
      level: playerData.level,
      experience: playerData.experience,
      matchesWon: playerData.matchesWon || 0,
      matchesLost: playerData.matchesLost || 0,
      matchesPlayed,
      winRate,
      teamSize: (playerData.team || []).length
    };
  }

  static setOpponentData(opponentData) {
    try {
      const payload = {
        nickname: opponentData.nickname || '',
        team: Array.isArray(opponentData.team) ? opponentData.team : [],
        source: opponentData.source || 'code',
        importedAt: new Date().toISOString()
      };

      localStorage.setItem(this.OPPONENT_DATA_KEY, JSON.stringify(payload));
      return payload;
    } catch (error) {
      console.error('Erro ao salvar dados do adversário:', error);
      return null;
    }
  }

  static getOpponentData() {
    try {
      const raw = localStorage.getItem(this.OPPONENT_DATA_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Erro ao obter dados do adversário:', error);
      return null;
    }
  }

  static clearOpponentData() {
    try {
      localStorage.removeItem(this.OPPONENT_DATA_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados do adversário:', error);
      return false;
    }
  }

  static getPlayerCode() {
    const playerData = this.getPlayerData();
    if (!playerData) return '';

    const nickname = String(playerData.nickname || '').trim();
    const registeredAt = String(playerData.registeredAt || '').trim();
    if (!nickname || !registeredAt) return '';

    return `${nickname}::${registeredAt}`;
  }

  static setMatchState(matchState) {
    try {
      const payload = {
        playerCode: String(matchState.playerCode || ''),
        mode: matchState.mode || 'active',
        enemySlots: Array.isArray(matchState.enemySlots) ? matchState.enemySlots : [],
        selfSlots: Array.isArray(matchState.selfSlots) ? matchState.selfSlots : [],
        historyEntries: Array.isArray(matchState.historyEntries) ? matchState.historyEntries : [],
        freeNotes: String(matchState.freeNotes || ''),
        selectedEnemySlot: matchState.selectedEnemySlot ?? null,
        currentTurn: matchState.currentTurn || 'my',
        roundCounter: Number(matchState.roundCounter || 0),
        skipMyNextTurn: Boolean(matchState.skipMyNextTurn),
        skipOpponentNextTurn: Boolean(matchState.skipOpponentNextTurn),
        matchResult: matchState.matchResult || null,
        opponentData: matchState.opponentData || null,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(this.MATCH_STATE_KEY, JSON.stringify(payload));
      return payload;
    } catch (error) {
      console.error('Erro ao salvar estado da partida:', error);
      return null;
    }
  }

  static getMatchState() {
    try {
      const raw = localStorage.getItem(this.MATCH_STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Erro ao obter estado da partida:', error);
      return null;
    }
  }

  static hasActiveMatchForPlayer(playerCode) {
    const code = String(playerCode || '');
    if (!code) return false;

    const state = this.getMatchState();
    if (!state) return false;

    return String(state.playerCode || '') === code;
  }

  static clearMatchState() {
    try {
      localStorage.removeItem(this.MATCH_STATE_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar estado da partida:', error);
      return false;
    }
  }
}
