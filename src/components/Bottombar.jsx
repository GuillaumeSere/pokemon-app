import React from 'react'
import './Bottombar.css'

const Bottombar = () => {
  return (
    <div className='bottom'>
      <div className="bottom-btn">
        <p className="bg-circle-white">A</p>&nbsp;
        <p>See Details</p>
      </div>

      <div className="bottom-btn">
        <p className="bg-circle-white">X</p>&nbsp;
        <p>Habitat</p>
      </div>

      <div className="bottom-btn">
        <p className="bg-circle-white">Y</p>&nbsp;
        <p>Sort</p>
      </div>

      <div className="bottom-btn">
        <p className="bg-circle-white">+</p>&nbsp;
        <p>See Evaluation</p>
      </div>

      <div className="bottom-btn">
        <p className="bg-circle-white">B</p>&nbsp;
        <p>Back</p>
      </div>
 
    </div>
  )
}

export default Bottombar
