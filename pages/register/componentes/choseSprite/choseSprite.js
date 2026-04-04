export function setupChoseSprite(container, { selectedSpriteId, disabled = false, onSelect } = {}) {
	const spriteButtons = Array.from(container.querySelectorAll('.sprite-option'));
	const selectedSpriteImage = container.querySelector('#registerSelectedSpriteImage');
	const selectedSpriteName = container.querySelector('#registerSelectedSpriteName');
	const selectedSpriteCode = container.querySelector('#registerSelectedSpriteCode');

	let currentSpriteId = selectedSpriteId ?? spriteButtons[0]?.dataset.spriteId;
	let isDisabled = disabled;

	const findSpriteButton = spriteId => {
		return spriteButtons.find(button => button.dataset.spriteId === spriteId) ?? spriteButtons[0] ?? null;
	};

	const render = () => {
		const activeButton = findSpriteButton(currentSpriteId);

		spriteButtons.forEach(button => {
			const isSelected = button.dataset.spriteId === activeButton?.dataset.spriteId;

			button.classList.toggle('is-selected', isSelected);
			button.classList.toggle('is-disabled', isDisabled);
			button.disabled = isDisabled;
			button.setAttribute('aria-pressed', String(isSelected));
		});

		if (!activeButton) {
			return;
		}

		currentSpriteId = activeButton.dataset.spriteId;
		selectedSpriteImage.src = activeButton.dataset.spritePath;
		selectedSpriteImage.alt = `Sprite selecionado: ${activeButton.dataset.spriteName}`;
		selectedSpriteName.textContent = activeButton.dataset.spriteName;

		if (selectedSpriteCode) {
			selectedSpriteCode.textContent = `Sprite ${activeButton.dataset.spriteId}`;
		}
	};

	spriteButtons.forEach(button => {
		button.addEventListener('click', () => {
			if (isDisabled) {
				return;
			}

			currentSpriteId = button.dataset.spriteId;
			render();

			if (typeof onSelect === 'function') {
				onSelect({
					id: button.dataset.spriteId,
					label: button.dataset.spriteName,
					path: button.dataset.spritePath,
				});
			}
		});
	});

	render();

	return {
		setSelected(nextSpriteId) {
			currentSpriteId = nextSpriteId;
			render();
		},
		setDisabled(nextDisabled) {
			isDisabled = nextDisabled;
			render();
		},
	};
}
