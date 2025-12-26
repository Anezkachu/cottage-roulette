import React from 'react';

export default function OpeningMenu({ onStart, onShop }) {
  return (
    <div className="moving-bg" style={{ fontFamily: '"VT323", monospace' }}>
      <div className="menu-container">
        {/* Pixel Bubble Title */}
        <h1 className="pixel-bubble-title">
          Cottage<br />
          <span className="roulette-text">Roulette</span>
        </h1>

        {/* Diamond Layout of Buttons */}
        <div className="menu-buttons-diamond">
          <button className="btn-pixel-play" onClick={() => onStart({ theme: 'cottage', balance: 10000 })}>
            PLAY
          </button>



          <div className="menu-decor">♣ ♦ ♥ ♠</div>
        </div>
      </div>
    </div>
  );
}