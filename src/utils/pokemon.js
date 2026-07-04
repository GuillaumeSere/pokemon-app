export const TYPE_META = {
  normal: { label: 'Normal', color: '#9fa19f', soft: '#eef0ed', text: '#151515' },
  fire: { label: 'Feu', color: '#f0501d', soft: '#ffe6db', text: '#151515' },
  water: { label: 'Eau', color: '#3692dc', soft: '#dff0ff', text: '#151515' },
  electric: { label: 'Electrik', color: '#f4d23c', soft: '#fff7cf', text: '#151515' },
  grass: { label: 'Plante', color: '#63bc5a', soft: '#e2f6dc', text: '#151515' },
  ice: { label: 'Glace', color: '#73cec0', soft: '#e0faf6', text: '#151515' },
  fighting: { label: 'Combat', color: '#ce416b', soft: '#ffe0e9', text: '#151515' },
  poison: { label: 'Poison', color: '#aa6bc8', soft: '#f2e4fa', text: '#151515' },
  ground: { label: 'Sol', color: '#d97845', soft: '#ffe9d8', text: '#151515' },
  flying: { label: 'Vol', color: '#89aae3', soft: '#e8f0ff', text: '#151515' },
  psychic: { label: 'Psy', color: '#fa7179', soft: '#ffe0e3', text: '#151515' },
  bug: { label: 'Insecte', color: '#91c12f', soft: '#edf7d7', text: '#151515' },
  rock: { label: 'Roche', color: '#c5b78c', soft: '#f3eddb', text: '#151515' },
  ghost: { label: 'Spectre', color: '#5269ad', soft: '#e4e9ff', text: '#ffffff' },
  dragon: { label: 'Dragon', color: '#0b6dc3', soft: '#dceeff', text: '#ffffff' },
  dark: { label: 'Tenebres', color: '#5a5465', soft: '#e8e5ee', text: '#ffffff' },
  steel: { label: 'Acier', color: '#5a8ea2', soft: '#dfedf1', text: '#ffffff' },
  fairy: { label: 'Fee', color: '#ec8fe6', soft: '#ffe5fb', text: '#151515' },
};

export const STAT_LABELS = {
  hp: 'PV',
  attack: 'Attaque',
  defense: 'Defense',
  'special-attack': 'Atq. Spe.',
  'special-defense': 'Def. Spe.',
  speed: 'Vitesse',
};

export function formatPokemonName(name = '') {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getPokemonNumber(pokemon) {
  return String(pokemon?.id || 0).padStart(3, '0');
}

export function getPokemonImage(pokemon) {
  return (
    pokemon?.sprites?.other?.['official-artwork']?.front_default ||
    pokemon?.sprites?.other?.home?.front_default ||
    pokemon?.sprites?.front_default ||
    ''
  );
}

export function getPokemonTypes(pokemon) {
  return pokemon?.types?.map((slot) => slot.type.name) || [];
}

export function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.normal;
}

export function getPrimaryType(pokemon) {
  return getPokemonTypes(pokemon)[0] || 'normal';
}

export function getPrimaryTypeMeta(pokemon) {
  return getTypeMeta(getPrimaryType(pokemon));
}

export function formatHeight(height = 0) {
  return `${(height / 10).toFixed(1).replace('.', ',')} m`;
}

export function formatWeight(weight = 0) {
  return `${(weight / 10).toFixed(1).replace('.', ',')} kg`;
}

export function formatStatName(name) {
  return STAT_LABELS[name] || formatPokemonName(name);
}

export function getStatTotal(pokemon) {
  return pokemon?.stats?.reduce((total, slot) => total + slot.base_stat, 0) || 0;
}

export function getStatPercent(value) {
  return Math.min(100, Math.round((value / 180) * 100));
}

export function formatAbilityName(ability) {
  return formatPokemonName(ability?.ability?.name || ability || '');
}

export function cleanFlavorText(text = '') {
  return text.replace(/\f/g, ' ').replace(/\s+/g, ' ').trim();
}
