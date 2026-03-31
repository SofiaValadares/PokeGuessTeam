
import { getPlayer, savePlayer, removePlayer } from '../store/manager/playerManager.js';
import Player from '../store/objects/Player.js';
import { validateNickname, validateAvatar } from './user.js';
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
    const existingPlayer = getPlayer();

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

    // Formulário já tem dados — habilitar botão
    this.validateForm();
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
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
      deleteModal.classList.add('is-hidden');
    }

    // Avatar button selection
    document.querySelectorAll('.avatar-button').forEach(button => {
      button.addEventListener('click', (e) => this.selectAvatar(e.target.closest('.avatar-button')));
    });

    // Character counter
    const nicknameInput = document.getElementById('nickname-input');
    nicknameInput.addEventListener('input', (e) => {
      this.updateCharCounter(e.target.value);
      this.validateForm();
    });

    // Register button
    document.getElementById('register-btn').addEventListener('click', () => this.handleRegister());

    // Delete profile button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Modal buttons
    const cancelBtn = document.getElementById('modal-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        const modal = document.getElementById('delete-modal');
        if (modal) {
          modal.classList.add('is-hidden');
        }
      });
    }

    const confirmBtn = document.getElementById('modal-confirm-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.confirmDelete());
    }

    // Close modal clicking outside
    const modalOverlay = document.getElementById('delete-modal');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          modalOverlay.classList.add('is-hidden');
        }
      });
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
    this.validateForm();
  }

  validateForm() {
    const nickname = document.getElementById('nickname-input').value.trim();
    const registerBtn = document.getElementById('register-btn');
    const isValid = nickname.length > 0 && this.selectedAvatar !== null;
    registerBtn.disabled = !isValid;
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
    // Validação
    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.valid) {
      this.showMessage(nicknameValidation.message, 'error');
      registerBtn.disabled = false;
      return;
    }
    const avatarValidation = validateAvatar(this.selectedAvatar);
    if (!avatarValidation.valid) {
      this.showMessage(avatarValidation.message, 'error');
      registerBtn.disabled = false;
      return;
    }
    let player;
    if (this.isEditing) {
      player = getPlayer();
      if (!player) {
        this.showMessage('Jogador não encontrado.', 'error');
        registerBtn.disabled = false;
        return;
      }
      player.nickname = nickname;
      player.avatar = this.selectedAvatar;
      player.updatedAt = new Date().toISOString();
    } else {
      player = new Player({ nickname, avatar: this.selectedAvatar });
    }
    const ok = savePlayer(player);
    if (ok) {
      this.showMessage('✓ Registro confirmado! Bem-vindo, treinador!', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      this.showMessage('Erro ao salvar dados. Tente novamente!', 'error');
      registerBtn.disabled = false;
    }
  }

  /**
   * Trata a exclusão do perfil do jogador
   */
  handleLogout() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
      modal.classList.remove('is-hidden');
    }
  }

  /**
   * Confirma e executa a exclusão do perfil
   */
  confirmDelete() {
    removePlayer();
    this.showMessage('✓ Perfil deletado! Redirecionando...', 'success');
    const modal = document.getElementById('delete-modal');
    if (modal) {
      modal.classList.add('is-hidden');
    }
    setTimeout(() => {
      window.location.href = 'register.html';
    }, 1200);
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