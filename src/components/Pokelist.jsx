import React, { useCallback, useEffect, useMemo, useState } from 'react'
import './Pokelist.css'
import Bottombar from './Bottombar'
import PokemonCard from './PokemonCard'
import Modal from './Modal'
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
    getStatTotal,
    getTypeMeta,
} from '../utils/pokemon'

const PAGE_SIZE = 48
const API_URL = 'https://pokeapi.co/api/v2/pokemon'
const SORT_OPTIONS = [
    { value: 'id', label: 'Numero' },
    { value: 'name', label: 'Nom A-Z' },
    { value: 'power', label: 'Stats' },
    { value: 'height', label: 'Taille' },
    { value: 'weight', label: 'Poids' },
]

async function fetchPokemonPage(offset) {
    const response = await fetch(`${API_URL}?limit=${PAGE_SIZE}&offset=${offset}`)

    if (!response.ok) {
        throw new Error('Impossible de charger le Pokedex.')
    }

    const page = await response.json()
    const details = await Promise.all(
        page.results.map(async (pokemon) => {
            const detailResponse = await fetch(pokemon.url)

            if (!detailResponse.ok) {
                throw new Error(`Impossible de charger ${pokemon.name}.`)
            }

            return detailResponse.json()
        })
    )

    return {
        count: page.count,
        details,
        hasMore: Boolean(page.next),
        nextOffset: offset + PAGE_SIZE,
    }
}

function mergePokemon(previous, incoming) {
    const pokemonsById = new Map()

    previous.forEach((pokemon) => pokemonsById.set(pokemon.id, pokemon))
    incoming.forEach((pokemon) => pokemonsById.set(pokemon.id, pokemon))

    return Array.from(pokemonsById.values()).sort((a, b) => a.id - b.id)
}

function sortPokemons(pokemons, sortMode) {
    const sortedPokemons = [...pokemons]

    if (sortMode === 'name') {
        return sortedPokemons.sort((a, b) => a.name.localeCompare(b.name))
    }

    if (sortMode === 'height') {
        return sortedPokemons.sort((a, b) => b.height - a.height)
    }

    if (sortMode === 'weight') {
        return sortedPokemons.sort((a, b) => b.weight - a.weight)
    }

    if (sortMode === 'power') {
        return sortedPokemons.sort((a, b) => getStatTotal(b) - getStatTotal(a))
    }

    return sortedPokemons.sort((a, b) => a.id - b.id)
}

function SpotlightPokemon({ pokemon, onOpen }) {
    if (!pokemon) {
        return (
            <section className="spotlight-panel spotlight-panel--empty">
                <div className="spotlight-panel__scanner" />
                <p>Chargement du radar Pokedex...</p>
            </section>
        )
    }

    const primaryType = getPrimaryTypeMeta(pokemon)
    const types = getPokemonTypes(pokemon)
    const artwork = getPokemonImage(pokemon)
    const mainAbility = pokemon.abilities?.[0]

    return (
        <section
            className="spotlight-panel"
            style={{
                '--type-color': primaryType.color,
                '--type-soft': primaryType.soft,
                '--type-text': primaryType.text,
            }}
        >
            <div className="spotlight-panel__header">
                <div>
                    <p className="eyebrow">Dossier actif</p>
                    <h2>{formatPokemonName(pokemon.name)}</h2>
                </div>
                <span>No. {getPokemonNumber(pokemon)}</span>
            </div>

            <div className="spotlight-panel__visual">
                <div className="spotlight-panel__ring" />
                <img src={artwork} alt={formatPokemonName(pokemon.name)} />
            </div>

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

            <div className="spotlight-metrics" aria-label="Mesures du Pokemon">
                <div>
                    <span>Taille</span>
                    <strong>{formatHeight(pokemon.height)}</strong>
                </div>
                <div>
                    <span>Poids</span>
                    <strong>{formatWeight(pokemon.weight)}</strong>
                </div>
                <div>
                    <span>Total</span>
                    <strong>{getStatTotal(pokemon)}</strong>
                </div>
            </div>

            <div className="spotlight-stats">
                {pokemon.stats?.slice(0, 4).map((slot) => (
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

            <div className="spotlight-panel__footer">
                <div>
                    <span>Talent principal</span>
                    <strong>{formatAbilityName(mainAbility)}</strong>
                </div>
                <button type="button" onClick={() => onOpen(pokemon)}>
                    Voir la fiche
                </button>
            </div>
        </section>
    )
}

const Pokelist = () => {
    const [allPokemons, setAllPokemons] = useState([])
    const [nextOffset, setNextOffset] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('all')
    const [sortMode, setSortMode] = useState('id')
    const [spotlightPokemon, setSpotlightPokemon] = useState(null)
    const [selectedPokemon, setSelectedPokemon] = useState(null)

    const loadPokemonPage = useCallback(async (offset = nextOffset) => {
        if (isLoading && offset !== 0) {
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const page = await fetchPokemonPage(offset)

            setAllPokemons((currentPokemons) => mergePokemon(currentPokemons, page.details))
            setTotalCount(page.count)
            setNextOffset(page.nextOffset)
            setHasMore(page.hasMore)
            setSpotlightPokemon((currentPokemon) => currentPokemon || page.details[0] || null)
        } catch (currentError) {
            setError(currentError.message)
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, nextOffset])

    useEffect(() => {
        let isActive = true

        async function loadInitialPokemons() {
            setIsLoading(true)

            try {
                const page = await fetchPokemonPage(0)

                if (!isActive) {
                    return
                }

                setAllPokemons(page.details)
                setTotalCount(page.count)
                setNextOffset(page.nextOffset)
                setHasMore(page.hasMore)
                setSpotlightPokemon(page.details[0] || null)
            } catch (currentError) {
                if (isActive) {
                    setError(currentError.message)
                }
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        loadInitialPokemons()

        return () => {
            isActive = false
        }
    }, [])

    const availableTypes = useMemo(() => {
        const types = allPokemons.flatMap((pokemon) => getPokemonTypes(pokemon))
        return Array.from(new Set(types)).sort((a, b) =>
            getTypeMeta(a).label.localeCompare(getTypeMeta(b).label)
        )
    }, [allPokemons])

    const filteredPokemons = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()

        const filtered = allPokemons.filter((pokemon) => {
            const types = getPokemonTypes(pokemon)
            const abilities = pokemon.abilities?.map((ability) => ability.ability.name) || []
            const searchableText = [
                pokemon.name,
                pokemon.id,
                getPokemonNumber(pokemon),
                ...types,
                ...abilities,
            ]
                .join(' ')
                .toLowerCase()

            const matchesSearch = !query || searchableText.includes(query)
            const matchesType = selectedType === 'all' || types.includes(selectedType)

            return matchesSearch && matchesType
        })

        return sortPokemons(filtered, sortMode)
    }, [allPokemons, searchTerm, selectedType, sortMode])

    const visibleSpotlight = useMemo(() => {
        if (!filteredPokemons.length) {
            return spotlightPokemon || allPokemons[0] || null
        }

        const spotlightIsVisible = filteredPokemons.some((pokemon) => pokemon.id === spotlightPokemon?.id)

        return spotlightIsVisible ? spotlightPokemon : filteredPokemons[0]
    }, [allPokemons, filteredPokemons, spotlightPokemon])
    const averagePower = allPokemons.length
        ? Math.round(allPokemons.reduce((total, pokemon) => total + getStatTotal(pokemon), 0) / allPokemons.length)
        : 0
    const currentSortLabel = SORT_OPTIONS.find((option) => option.value === sortMode)?.label || 'Tri'

    const openSpotlightDetails = useCallback(() => {
        if (visibleSpotlight) {
            setSelectedPokemon(visibleSpotlight)
        }
    }, [visibleSpotlight])

    const cycleTypeFilter = useCallback(() => {
        const typeList = ['all', ...availableTypes]

        setSelectedType((currentType) => {
            const currentIndex = typeList.indexOf(currentType)
            const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % typeList.length

            return typeList[nextIndex]
        })
    }, [availableTypes])

    const cycleSortMode = useCallback(() => {
        setSortMode((currentMode) => {
            const currentIndex = SORT_OPTIONS.findIndex((option) => option.value === currentMode)
            const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % SORT_OPTIONS.length

            return SORT_OPTIONS[nextIndex].value
        })
    }, [])

    const closeOrReset = useCallback(() => {
        if (selectedPokemon) {
            setSelectedPokemon(null)
            return
        }

        setSearchTerm('')
        setSelectedType('all')
        setSortMode('id')
    }, [selectedPokemon])

    const handleFooterAction = useCallback((action) => {
        if (action === 'details') {
            openSpotlightDetails()
            return
        }

        if (action === 'filter') {
            cycleTypeFilter()
            return
        }

        if (action === 'sort') {
            cycleSortMode()
            return
        }

        if (action === 'load') {
            if (hasMore && !isLoading) {
                loadPokemonPage(nextOffset)
            }
            return
        }

        if (action === 'close') {
            closeOrReset()
        }
    }, [
        closeOrReset,
        cycleSortMode,
        cycleTypeFilter,
        hasMore,
        isLoading,
        loadPokemonPage,
        nextOffset,
        openSpotlightDetails,
    ])

    const footerActions = useMemo(() => [
        {
            action: 'details',
            key: 'A',
            label: 'Details',
            mobileLabel: 'Details',
            disabled: !visibleSpotlight,
        },
        {
            action: 'filter',
            key: 'X',
            label: selectedType === 'all' ? 'Filtrer' : getTypeMeta(selectedType).label,
            mobileLabel: 'Type',
            active: selectedType !== 'all',
            disabled: !availableTypes.length,
        },
        {
            action: 'sort',
            key: 'Y',
            label: currentSortLabel,
            mobileLabel: 'Tri',
            active: sortMode !== 'id',
        },
        {
            action: 'load',
            key: '+',
            label: !hasMore ? 'Complet' : isLoading ? 'Charge...' : 'Charger',
            mobileLabel: !hasMore ? 'Complet' : 'Plus',
            disabled: isLoading || !hasMore,
        },
        {
            action: 'close',
            key: 'Esc',
            label: selectedPokemon ? 'Fermer' : 'Reset',
            mobileLabel: selectedPokemon ? 'Fermer' : 'Reset',
        },
    ], [availableTypes.length, currentSortLabel, hasMore, isLoading, selectedPokemon, selectedType, sortMode, visibleSpotlight])

    useEffect(() => {
        const activeFilter = document.querySelector('.type-filter button.is-active')
        activeFilter?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    }, [selectedType])

    useEffect(() => {
        function handleKeyDown(event) {
            const targetName = event.target?.tagName
            const isFormField = ['INPUT', 'SELECT', 'TEXTAREA'].includes(targetName)

            if (isFormField && event.key !== 'Escape') {
                return
            }

            const actionByKey = {
                a: 'details',
                x: 'filter',
                y: 'sort',
                '+': 'load',
                Escape: 'close',
            }
            const action =
                actionByKey[event.key] ||
                actionByKey[event.key.toLowerCase()] ||
                (event.code === 'NumpadAdd' ? 'load' : '')

            if (!action) {
                return
            }

            event.preventDefault()
            handleFooterAction(action)
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleFooterAction])

    return (
        <>
            <main className="app-container">
                <div className="pokedex-shell">
                    <SpotlightPokemon pokemon={visibleSpotlight} onOpen={setSelectedPokemon} />

                    <section className="catalog-panel">
                        <div className="catalog-panel__header">
                            <div>
                                <p className="eyebrow">Catalogue interactif</p>
                                <h2>{filteredPokemons.length} cartes visibles</h2>
                            </div>
                            <div className="catalog-counters">
                                <span>{allPokemons.length}/{totalCount || '...'} charges</span>
                                <span>Puissance moy. {averagePower || '...'}</span>
                            </div>
                        </div>

                        <div className="catalog-toolbar">
                            <label className="search-field" htmlFor="pokemon-search">
                                <span>Recherche</span>
                                <input
                                    id="pokemon-search"
                                    type="search"
                                    placeholder="Nom, numero, type, talent..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                />
                            </label>

                            <label className="sort-field" htmlFor="pokemon-sort">
                                <span>Tri</span>
                                <select
                                    id="pokemon-sort"
                                    value={sortMode}
                                    onChange={(event) => setSortMode(event.target.value)}
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option value={option.value} key={option.value}>
                                            {option.value === 'power' ? 'Stats totales' : option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="type-filter" aria-label="Filtrer par type">
                            <button
                                type="button"
                                className={selectedType === 'all' ? 'is-active' : ''}
                                onClick={() => setSelectedType('all')}
                            >
                                Tous
                            </button>
                            {availableTypes.map((type) => {
                                const meta = getTypeMeta(type)

                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        className={selectedType === type ? 'is-active' : ''}
                                        style={{
                                            '--type-color': meta.color,
                                            '--type-soft': meta.soft,
                                            '--type-text': meta.text,
                                        }}
                                        onClick={() => setSelectedType(type)}
                                    >
                                        {meta.label}
                                    </button>
                                )
                            })}
                        </div>

                        {error && (
                            <div className="catalog-message catalog-message--error">
                                {error}
                                <button type="button" onClick={() => loadPokemonPage(nextOffset)}>
                                    Reessayer
                                </button>
                            </div>
                        )}

                        <div className="pokemon-grid" aria-live="polite">
                            {filteredPokemons.map((pokemon) => (
                                <PokemonCard
                                    key={pokemon.id}
                                    pokemon={pokemon}
                                    isActive={visibleSpotlight?.id === pokemon.id}
                                    onFocus={setSpotlightPokemon}
                                    onOpen={setSelectedPokemon}
                                />
                            ))}

                            {isLoading &&
                                Array.from({ length: allPokemons.length ? 4 : 8 }).map((_, index) => (
                                    <div className="pokemon-card-skeleton" key={`skeleton-${index}`} />
                                ))}
                        </div>

                        {!isLoading && !filteredPokemons.length && (
                            <div className="catalog-message">
                                Aucun Pokemon ne correspond a cette recherche.
                            </div>
                        )}

                        <div className="catalog-panel__footer">
                            {hasMore ? (
                                <button
                                    type="button"
                                    className="load-more"
                                    disabled={isLoading}
                                    onClick={() => loadPokemonPage(nextOffset)}
                                >
                                    {isLoading ? 'Chargement...' : `Charger ${PAGE_SIZE} Pokemon`}
                                </button>
                            ) : (
                                <span className="catalog-complete">Catalogue complet charge</span>
                            )}
                        </div>
                    </section>
                </div>

                {selectedPokemon && (
                    <Modal pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} />
                )}
            </main>
            <Bottombar actions={footerActions} onAction={handleFooterAction} />
        </>
    )
}

export default Pokelist
