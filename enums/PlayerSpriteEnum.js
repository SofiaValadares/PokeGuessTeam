export const PLAYER_SPRITES = [
	{
		id: '001P',
		label: 'Bulbasaur',
		path: 'assets/player/001P.png',
	},
	{
		id: '002P',
		label: 'Charmander',
		path: 'assets/player/002P.png',
	},
	{
		id: '003P',
		label: 'Squirtle',
		path: 'assets/player/003P.png',
	},
];

export function getPlayerSpriteById(spriteId) {
	return PLAYER_SPRITES.find(sprite => sprite.id === spriteId) ?? PLAYER_SPRITES[0];
}

export function getPlayerSpriteByPath(spritePath) {
	return PLAYER_SPRITES.find(sprite => sprite.path === spritePath) ?? PLAYER_SPRITES[0];
}

export function getGuestSpriteByPlayerPath(playerSpritePath) {
	const index = PLAYER_SPRITES.findIndex(sprite => sprite.path === playerSpritePath);
	const safeIndex = index >= 0 ? index : 0;
	return PLAYER_SPRITES[(safeIndex + 1) % PLAYER_SPRITES.length];
}