export function setupSpriteCreditsModal(root = document) {
	const modal = root.getElementById('spriteCreditsModal');
	const closeButton = root.getElementById('closeSpriteCredits');
	const creditsText = root.getElementById('spriteCreditsText');

	if (!modal || !closeButton || !creditsText) {
		return null;
	}

	function closeModal() {
		modal.style.display = 'none';
		modal.setAttribute('aria-hidden', 'true');
	}

	async function openModal() {
		const response = await fetch('sprits_credits.txt');
		creditsText.textContent = await response.text();
		modal.style.display = 'block';
		modal.setAttribute('aria-hidden', 'false');
	}

	closeButton.addEventListener('click', closeModal);
	modal.addEventListener('click', event => {
		if (event.target === modal) {
			closeModal();
		}
	});

	return {
		openModal,
		closeModal,
	};
}
