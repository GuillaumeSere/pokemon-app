import './PokemonCard.css'
import pokeball from '../images/pokeballcolor.png'
import {
    formatAbilityName,
    formatHeight,
    formatPokemonName,
    formatStatName,
    formatWeight,
    getPokemonImage,
    getPokemonNumber,
    getPokemonTypes,
    getPrimaryTypeMeta,
    getStatPercent,
    getTypeMeta,
} from '../utils/pokemon'

function PokemonCard({ pokemon, isActive, onFocus, onOpen }) {
    const name = formatPokemonName(pokemon.name)
    const number = getPokemonNumber(pokemon)
    const artwork = getPokemonImage(pokemon)
    const primaryType = getPrimaryTypeMeta(pokemon)
    const types = getPokemonTypes(pokemon)
    const leadStats = pokemon.stats?.slice(0, 3) || []
    const firstAbility = pokemon.abilities?.[0]

    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen(pokemon)
        }
    }

    return (
        <article
            className={`pokemon-card ${isActive ? 'is-active' : ''}`}
            style={{
                '--type-color': primaryType.color,
                '--type-soft': primaryType.soft,
                '--type-text': primaryType.text,
            }}
            role="button"
            tabIndex="0"
            onMouseEnter={() => onFocus(pokemon)}
            onFocus={() => onFocus(pokemon)}
            onClick={() => onOpen(pokemon)}
            onKeyDown={handleKeyDown}
        >
            <div className="pokemon-card__topline">
                <span>No. {number}</span>
                <img src={pokeball} alt="" aria-hidden="true" />
            </div>

            <div className="pokemon-card__art">
                <img src={artwork} alt={name} loading="lazy" />
            </div>

            <div className="pokemon-card__body">
                <h3>{name}</h3>
                <p>{formatAbilityName(firstAbility) || 'Talent inconnu'}</p>

                <div className="pokemon-card__types">
                    {types.map((type) => {
                        const meta = getTypeMeta(type)

                        return (
                            <span
                                key={type}
                                style={{
                                    '--type-color': meta.color,
                                    '--type-soft': meta.soft,
                                    '--type-text': meta.text,
                                }}
                            >
                                {meta.label}
                            </span>
                        )
                    })}
                </div>

                <div className="pokemon-card__metrics">
                    <div>
                        <span>Taille</span>
                        <strong>{formatHeight(pokemon.height)}</strong>
                    </div>
                    <div>
                        <span>Poids</span>
                        <strong>{formatWeight(pokemon.weight)}</strong>
                    </div>
                </div>

                <div className="pokemon-card__stats">
                    {leadStats.map((slot) => (
                        <div key={slot.stat.name}>
                            <span>{formatStatName(slot.stat.name)}</span>
                            <strong>{slot.base_stat}</strong>
                            <div>
                                <i style={{ width: `${getStatPercent(slot.base_stat)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    )
}

export default PokemonCard
