import React, { useEffect, useMemo, useState } from 'react'
import './Modal.css'
import pokeball from '../images/pokeballcolor.png'
import bg from '../images/bg.jpg'
import {
    cleanFlavorText,
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
    getStatTotal,
    getTypeMeta,
} from '../utils/pokemon'

function findLocalizedEntry(entries = [], language = 'fr') {
    return (
        entries.find((entry) => entry.language.name === language) ||
        entries.find((entry) => entry.language.name === 'en') ||
        entries[0]
    )
}

const Modal = ({ pokemon, onClose }) => {
    const [species, setSpecies] = useState(null)
    const [speciesError, setSpeciesError] = useState('')
    const primaryType = getPrimaryTypeMeta(pokemon)
    const types = getPokemonTypes(pokemon)
    const artwork = getPokemonImage(pokemon)
    const name = formatPokemonName(pokemon.name)

    useEffect(() => {
        function closeOnEscape(event) {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', closeOnEscape)

        return () => {
            window.removeEventListener('keydown', closeOnEscape)
        }
    }, [onClose])

    useEffect(() => {
        let isActive = true

        async function loadSpecies() {
            if (!pokemon.species?.url) {
                return
            }

            setSpecies(null)
            setSpeciesError('')

            try {
                const response = await fetch(pokemon.species.url)

                if (!response.ok) {
                    throw new Error('Description indisponible.')
                }

                const data = await response.json()

                if (isActive) {
                    setSpecies(data)
                }
            } catch (error) {
                if (isActive) {
                    setSpeciesError(error.message)
                }
            }
        }

        loadSpecies()

        return () => {
            isActive = false
        }
    }, [pokemon])

    const speciesDescription = useMemo(() => {
        const entry = findLocalizedEntry(species?.flavor_text_entries)
        return cleanFlavorText(entry?.flavor_text)
    }, [species])

    const genus = useMemo(() => {
        const entry = findLocalizedEntry(species?.genera)
        return entry?.genus || 'Espece Pokemon'
    }, [species])

    const moves = pokemon.moves?.slice(0, 8) || []
    const abilities = pokemon.abilities || []

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <section
                className="pokemon-modal"
                style={{
                    '--type-color': primaryType.color,
                    '--type-soft': primaryType.soft,
                    '--type-text': primaryType.text,
                    '--modal-bg': `url(${bg})`,
                }}
                onClick={(event) => event.stopPropagation()}
                aria-modal="true"
                role="dialog"
                aria-labelledby="pokemon-modal-title"
            >
                <button className="modal-close" type="button" onClick={onClose} aria-label="Fermer">
                    X
                </button>

                <div className="pokemon-modal__visual">
                    <div className="pokemon-modal__badge">
                        <img src={pokeball} alt="" aria-hidden="true" />
                        <span>No. {getPokemonNumber(pokemon)}</span>
                    </div>
                    <img className="pokemon-modal__artwork" src={artwork} alt={name} />
                    <div className="type-row">
                        {types.map((type) => {
                            const meta = getTypeMeta(type)

                            return (
                                <span
                                    key={type}
                                    className="type-chip"
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
                </div>

                <div className="pokemon-modal__content">
                    <div className="pokemon-modal__title">
                        <div>
                            <p className="eyebrow">Fiche complete</p>
                            <h2 id="pokemon-modal-title">{name}</h2>
                            <span>{genus}</span>
                        </div>
                        <strong>{getStatTotal(pokemon)} pts</strong>
                    </div>

                    <p className="pokemon-modal__description">
                        {speciesDescription || speciesError || "Analyse de l'espece en cours..."}
                    </p>

                    <div className="pokemon-modal__metrics">
                        <div>
                            <span>Taille</span>
                            <strong>{formatHeight(pokemon.height)}</strong>
                        </div>
                        <div>
                            <span>Poids</span>
                            <strong>{formatWeight(pokemon.weight)}</strong>
                        </div>
                        <div>
                            <span>Base XP</span>
                            <strong>{pokemon.base_experience || '?'}</strong>
                        </div>
                        <div>
                            <span>Ordre</span>
                            <strong>{pokemon.order}</strong>
                        </div>
                    </div>

                    <div className="pokemon-modal__grid">
                        <section>
                            <h3>Stats</h3>
                            <div className="pokemon-modal__stats">
                                {pokemon.stats?.map((slot) => (
                                    <div className="stat-line" key={slot.stat.name}>
                                        <div className="stat-line__label">
                                            <span>{formatStatName(slot.stat.name)}</span>
                                            <strong>{slot.base_stat}</strong>
                                        </div>
                                        <div className="stat-line__track">
                                            <span style={{ width: `${getStatPercent(slot.base_stat)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3>Talents</h3>
                            <div className="pill-list">
                                {abilities.map((ability) => (
                                    <span key={ability.ability.name}>
                                        {formatAbilityName(ability)}
                                        {ability.is_hidden ? ' (cache)' : ''}
                                    </span>
                                ))}
                            </div>

                            <h3>Attaques</h3>
                            <div className="pill-list">
                                {moves.map((move) => (
                                    <span key={move.move.name}>{formatPokemonName(move.move.name)}</span>
                                ))}
                            </div>

                            <h3>Espece</h3>
                            <dl className="species-list">
                                <div>
                                    <dt>Capture</dt>
                                    <dd>{species?.capture_rate ?? '?'}</dd>
                                </div>
                                <div>
                                    <dt>Bonheur</dt>
                                    <dd>{species?.base_happiness ?? '?'}</dd>
                                </div>
                                <div>
                                    <dt>Habitat</dt>
                                    <dd>{formatPokemonName(species?.habitat?.name || 'inconnu')}</dd>
                                </div>
                                <div>
                                    <dt>Generation</dt>
                                    <dd>{formatPokemonName(species?.generation?.name || 'inconnue')}</dd>
                                </div>
                            </dl>
                        </section>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Modal
