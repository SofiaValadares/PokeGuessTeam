import { pokemonData } from './pokemonData.js';

export const AI_DEFAULT_NAME = 'PokéBot';
export const AI_TURN_DELAY_MS = 1400;

function shuffleArray(values) {
	const copy = [...values];

	for (let index = copy.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
	}

	return copy;
}

function normalizeValue(value) {
	return String(value ?? '').trim().toUpperCase();
}

function normalizeSecondaryType(value) {
	return value ? normalizeValue(value) : 'NENHUM';
}

function countKnownFields(slot = {}) {
	return [
		slot.primaryType,
		slot.secondaryType,
		slot.color,
		slot.generation,
		slot.height,
		slot.weight,
	].filter(Boolean).length;
}

function scoreCandidateForSlot(pokemon, slot) {
	if (!slot || slot.isRevealed) {
		return 0;
	}

	let score = 0;

	if (slot.primaryType) {
		if (normalizeValue(pokemon.primary_type) !== normalizeValue(slot.primaryType)) {
			return -1;
		}
		score += 4;
	}

	if (slot.secondaryType) {
		if (normalizeSecondaryType(pokemon.secondary_type) !== normalizeValue(slot.secondaryType)) {
			return -1;
		}
		score += 4;
	}

	if (slot.color) {
		if (normalizeValue(pokemon.color) !== normalizeValue(slot.color)) {
			return -1;
		}
		score += 3;
	}

	if (slot.generation) {
		if (String(pokemon.generation).padStart(2, '0') !== String(slot.generation)) {
			return -1;
		}
		score += 2;
	}

	if (slot.height) {
		if (String(pokemon.height) !== String(slot.height)) {
			return -1;
		}
		score += 2;
	}

	if (slot.weight) {
		if (String(pokemon.weight) !== String(slot.weight)) {
			return -1;
		}
		score += 2;
	}

	return score + countKnownFields(slot);
}

export function buildAiTeam(excludedNames = []) {
	const excludedSet = new Set(excludedNames.map(name => String(name).toLowerCase()));
	const availablePool = pokemonData.filter(pokemon => !excludedSet.has(pokemon.name.toLowerCase()));
	const safePool = availablePool.length >= 6 ? availablePool : pokemonData;

	return shuffleArray(safePool)
		.slice(0, 6)
		.map(pokemon => pokemon.name);
}

export function chooseAiGuess({ guessedNames = [], knownSlots = [] } = {}) {
	const guessedSet = new Set(guessedNames.map(name => String(name).toLowerCase()));
	const availablePokemons = pokemonData.filter(pokemon => !guessedSet.has(pokemon.name.toLowerCase()));

	if (availablePokemons.length === 0) {
		return null;
	}

	const scoredCandidates = availablePokemons.map(pokemon => ({
		pokemon,
		score: Math.max(
			0,
			...knownSlots.map(slot => scoreCandidateForSlot(pokemon, slot))
		),
	}));

	const topScore = Math.max(...scoredCandidates.map(item => item.score));
	const topCandidates = scoredCandidates
		.filter(item => item.score === topScore)
		.map(item => item.pokemon);

	return shuffleArray(topCandidates)[0] ?? availablePokemons[0] ?? null;
}
