import React from 'react';
import startBtnImg from '../assets/Startbtn.png';
import openingBg from '../assets/Pixel art landscape Pixel art background Cool pixel art.gif';
import titleImg from '../assets/CottageRoullete2.png';

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
      <div className="menu-container" style={{ background: 'transparent', border: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Replacement for text title with image */}
        <img
          src={titleImg}
          alt="Cottage Roulette"
          style={{
            width: '800px',
            maxWidth: '90vw',
            height: 'auto',
            marginBottom: '40px',
            imageRendering: 'pixelated'
          }}
        />

        {/* Diamond Layout of Buttons */}
        <div className="menu-buttons-diamond">
          <button className="btn-img" onClick={() => onStart({ theme: 'cottage', balance: 10000 })}>
            <img src={startBtnImg} alt="START" style={{ width: '500px' }} />
          </button>

          <div className="menu-decor" style={{ color: '#fdfcf4ff', fontSize: '3rem', marginTop: '20px' }}>♣ ♦ ♥ ♠</div>
        </div>
      </div>
    </div>
  );
}