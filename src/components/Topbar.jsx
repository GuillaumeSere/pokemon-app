import React from 'react'
import './Topbar.css'
import pokeball from '../images/pokeball.png'
import pokeballcolor from '../images/pokeballcolor.png'

const Topbar = () => {
  return (
    <header className='title'>
      <div className="title__brand">
        <img src={pokeballcolor} alt="" aria-hidden="true" />
        <div>
          <span>API Pokemon</span>
          <h1>Pokedex</h1>
        </div>
      </div>

      <div className="title__status">
        <div>
          <img src={pokeball} alt="" aria-hidden="true" />
          <span>Catalogue</span>
        </div>
        <div>
          <img src={pokeballcolor} alt="" aria-hidden="true" />
          <span>A -&gt; Z</span>
        </div>
      </div>
    </header>
  )
}

export default Topbar
