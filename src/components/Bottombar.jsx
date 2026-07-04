import React from 'react'
import './Bottombar.css'

const Bottombar = ({ actions = [], onAction }) => {
  return (
    <footer className='bottom'>
      {actions.map(({ action, active, disabled, key, label, mobileLabel }) => (
        <button
          className={`bottom-btn ${active ? 'is-active' : ''}`}
          disabled={disabled}
          key={action}
          title={label}
          type="button"
          aria-label={label}
          onClick={() => onAction(action)}
        >
          <span className="bg-circle-white">{key}</span>
          <span className="bottom-btn__label bottom-btn__label--full">{label}</span>
          <span className="bottom-btn__label bottom-btn__label--compact">{mobileLabel || label}</span>
        </button>
      ))}
    </footer>
  )
}

export default Bottombar
