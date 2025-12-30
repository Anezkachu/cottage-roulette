import React, { useState } from 'react';
import startBtnImg from '../assets/Startbtn.png';
import openingBg from '../assets/Pixel art landscape Pixel art background Cool pixel art.gif';
import titleImg from '../assets/CottageRoullete2.png';
import { playButtonSound } from '../utils/audio';

export default function OpeningMenu({ onStart }) {
    const handleStart = () => {
        playButtonSound();
        onStart();
    };

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
            <div className="menu-container" style={{
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
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

                <div className="menu-buttons-diamond">
                    <button className="btn-img" onClick={handleStart}>
                        <img src={startBtnImg} alt="START" style={{ width: '500px' }} />
                    </button>

                    <div className="menu-decor" style={{ color: '#ffd700', fontSize: '3rem', marginTop: '20px', textShadow: '4px 4px 0 #000' }}>♣ ♦ ♥ ♠</div>
                </div>
            </div>
        </div>
    );
}
