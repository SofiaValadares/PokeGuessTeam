// Modal de Créditos das Sprites
document.addEventListener('DOMContentLoaded', function () {
	const modal = document.getElementById('spriteCreditsModal');
	const closeBtn = document.getElementById('closeSpriteCredits');
	const creditsText = document.getElementById('spriteCreditsText');

	// Função para criar e exibir o modal de créditos das sprites via JS
	function showSpriteCreditsModal() {
		let modal = document.getElementById('sprite-credits-modal');
		if (!modal) {
			modal = document.createElement('div');
			modal.id = 'sprite-credits-modal';
			modal.className = 'modal';
			modal.innerHTML = `
				<div class="modal-content">
					<h2>Créditos das Sprites</h2>
					<pre id="sprite-credits-content" style="max-height: 300px; overflow-y: auto; background: var(--color-surface); padding: 1em; border-radius: var(--border-radius);"></pre>
					<button id="close-credits-modal" class="modal-close">Fechar</button>
				</div>
			`;
			document.body.appendChild(modal);
			document.getElementById('close-credits-modal').onclick = () => modal.remove();
		}
		fetch('sprits_credits.txt')
			.then(r => r.text())
			.then(txt => {
				document.getElementById('sprite-credits-content').textContent = txt;
			});
		modal.style.display = 'flex';
	}

	// Função para abrir o modal e carregar os créditos
	window.openSpriteCreditsModal = showSpriteCreditsModal;

	// Fechar modal ao clicar no X
	closeBtn.onclick = function () {
		modal.style.display = 'none';
	};

	// Fechar modal ao clicar fora do conteúdo
	window.onclick = function (event) {
		if (event.target === modal) {
			modal.style.display = 'none';
		}
	};
});

// Exporte para uso global
window.showSpriteCreditsModal = showSpriteCreditsModal;
