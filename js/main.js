// ====== POKÉTEAMGUESS REGISTRATION ======

class PlayerRegistration {
  constructor() {
    this.selectedAvatar = null;
    this.isEditing = false;
    this.init();
  }

  init() {
    this.checkExistingPlayer();
    this.setupEventListeners();
  }

  /**
   * Verifica se há um jogador já registrado
   */
  checkExistingPlayer() {
    const existingPlayer = UserManager.getPlayerData();

    if (existingPlayer) {
      this.isEditing = true;
      this.loadPlayerData(existingPlayer);
      this.updateUIForEditing();
    }
  }

  /**
   * Carrega dados do jogador existente nos campos
   */
  loadPlayerData(player) {
    // Preencher nickname
    document.getElementById('nickname-input').value = player.nickname;
    this.updateCharCounter(player.nickname);

    // Selecionar avatar
    this.selectedAvatar = player.avatar;
    const avatarButton = document.querySelector(`[data-avatar="${player.avatar}"]`);
    if (avatarButton) {
      avatarButton.classList.add('selected');
      this.updateAvatarPreview();
    }
  }

  /**
   * Atualiza a interface quando está editando um registro existente
   */
  updateUIForEditing() {
    // Mudar título do formulário
    const formTitle = document.querySelector('.registration-form h2');
    if (formTitle) {
      formTitle.textContent = 'EDITAR PERFIL';
    }

    // Mudar texto do botão principal
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
      registerBtn.textContent = 'ATUALIZAR PERFIL';
    }

    // Mostrar botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.style.display = 'block';
    }
  }

  setupEventListeners() {
    // Avatar button selection
    document.querySelectorAll('.avatar-button').forEach(button => {
      button.addEventListener('click', (e) => this.selectAvatar(e.target.closest('.avatar-button')));
    });

    // Character counter
    const nicknameInput = document.getElementById('nickname-input');
    nicknameInput.addEventListener('input', (e) => this.updateCharCounter(e.target.value));

    // Register button
    document.getElementById('register-btn').addEventListener('click', () => this.handleRegister());

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
  }

  selectAvatar(button) {
    // Remove previous selection
    document.querySelectorAll('.avatar-button').forEach(btn => btn.classList.remove('selected'));

    // Add selection to clicked button
    button.classList.add('selected');
    this.selectedAvatar = button.getAttribute('data-avatar');

    // Update preview
    this.updateAvatarPreview();
  }

  updateAvatarPreview() {
    const previewDiv = document.getElementById('avatar-preview');

    if (this.selectedAvatar) {
      previewDiv.innerHTML = `<img src="assets/players/${this.selectedAvatar}" alt="Avatar selecionado">`;
    } else {
      previewDiv.innerHTML = '<p>NENHUM AVATAR SELECIONADO</p>';
    }
  }

  updateCharCounter(value) {
    document.getElementById('char-count').textContent = value.length;
  }

  /**
   * Trata o registro ou atualização do perfil
   */
  handleRegister() {
    const nickname = document.getElementById('nickname-input').value.trim();
    const registerBtn = document.getElementById('register-btn');

    // Disable button during processing
    registerBtn.disabled = true;

    // Register or update
    const result = this.isEditing
      ? UserManager.updateProfile(nickname, this.selectedAvatar)
      : UserManager.registerPlayer(nickname, this.selectedAvatar);

    if (result.success) {
      this.showMessage(result.message, 'success');
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      this.showMessage(result.message, 'error');
      registerBtn.disabled = false;
    }
  }

  /**
   * Trata o logout do jogador
   */
  handleLogout() {
    if (confirm('Tem certeza que deseja fazer logout?')) {
      UserManager.clearPlayerData();
      this.showMessage('✓ Logout realizado! Redirecionando...', 'success');

      setTimeout(() => {
        window.location.href = 'register.html';
      }, 1000);
    }
  }

  showMessage(message, type) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;

    // Auto-clear error messages after 3 seconds
    if (type === 'error') {
      setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
          registerBtn.disabled = false;
        }
      }, 3000);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PlayerRegistration();
});