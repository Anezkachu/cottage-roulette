import React from 'react';
import startBtnImg from '../assets/Startbtn.png';
import openingBg from '../assets/Pixel art landscape Pixel art background Cool pixel art.gif';

export default function OpeningMenu({ onStart, onShop }) {
  return (
    <div style={{
      fontFamily: '"VT323", monospace',
      minHeight: '100vh',
      width: '100%',
      backgroundImage: `url("${openingBg}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div className="menu-container" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
        {/* Pixel Bubble Title */}
        <h1 className="pixel-bubble-title" style={{ fontSize: '7rem', color: '#ffeb3b', textShadow: '6px 6px 0px #3e2723' }}>
          Cottage<br />
          <span className="roulette-text" style={{ fontSize: '4rem', color: '#4caf50' }}>Roulette</span>
        </h1>

        {/* Diamond Layout of Buttons */}
        <div className="menu-buttons-diamond">
          <button className="btn-img" onClick={() => onStart({ theme: 'cottage', balance: 10000 })}>
            <img src={startBtnImg} alt="START" style={{ width: '250px' }} />
          </button>

          <div className="menu-decor" style={{ color: '#ffd700', fontSize: '3rem', marginTop: '20px' }}>♣ ♦ ♥ ♠</div>
        </div>
      </div>
    </div>
  );
}