import React, { useState, useEffect } from 'react';
import { getBgmVolume, getSfxVolume, setBgmVolume, setSfxVolume, playButtonSound } from '../utils/audio';
import toggleIcon from '../assets/toggle.png';

export default function SoundSettings() {
    const [isOpen, setIsOpen] = useState(false);
    const [bgm, setBgm] = useState(getBgmVolume());
    const [sfx, setSfx] = useState(getSfxVolume());

    const toggleOpen = () => {
        playButtonSound();
        setIsOpen(!isOpen);
    };

    const handleBgmChange = (e) => {
        const val = parseFloat(e.target.value);
        setBgm(val);
        setBgmVolume(val);
    };

    const handleSfxChange = (e) => {
        const val = parseFloat(e.target.value);
        setSfx(val);
        setSfxVolume(val);
    };

    return (
        <div className="sound-settings-wrapper">
            <button className="sound-toggle-btn" onClick={toggleOpen} title="Audio Settings">
                <img src={toggleIcon} alt="Sound Settings" />
            </button>

            {isOpen && (
                <div className="sound-popup">
                    <div className="sound-row">
                        <label>Music</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={bgm}
                            onChange={handleBgmChange}
                        />
                        <span className="vol-text">{Math.round(bgm * 100)}%</span>
                    </div>
                    <div className="sound-row">
                        <label>SFX</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={sfx}
                            onChange={handleSfxChange}
                        />
                        <span className="vol-text">{Math.round(sfx * 100)}%</span>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .sound-settings-wrapper {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 2000;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 10px;
                }

                .sound-toggle-btn {
                    background: transparent;
                    border: none;
                    outline: none;
                    width: 50px;
                    height: 50px;
                    padding: 0;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.1s;
                }

                .sound-toggle-btn:focus {
                    outline: none;
                }

                .sound-toggle-btn:hover {
                    transform: scale(1.05);
                    filter: brightness(1.1);
                }

                .sound-toggle-btn:active {
                    transform: scale(0.95);
                }

                .sound-toggle-btn img {
                    width: 32px;
                    height: 32px;
                    image-rendering: pixelated;
                }

                .sound-popup {
                    background: #2e7d32;
                    border: 4px solid #3e2723;
                    padding: 15px;
                    width: 220px;
                    box-shadow: 8px 8px 0 rgba(0,0,0,0.5);
                    color: white;
                    font-family: 'VT323', monospace;
                    position: relative;
                    animation: slideDown 0.2s ease-out;
                }

                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .sound-row {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    margin-bottom: 12px;
                }

                .sound-row:last-child {
                    margin-bottom: 0;
                }

                .sound-row label {
                    font-size: 1.5rem;
                    color: #ffd700;
                    text-shadow: 2px 2px 0 #000;
                }

                .vol-text {
                    font-size: 1.2rem;
                    text-align: right;
                    color: #a5d6a7;
                }

                /* Custom Pixel Slider */
                input[type=range] {
                    -webkit-appearance: none;
                    width: 100%;
                    background: transparent;
                }

                input[type=range]:focus {
                    outline: none;
                }

                /* Track */
                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 12px;
                    cursor: pointer;
                    background: #1b5e20;
                    border: 2px solid #ffd700;
                }

                input[type=range]::-moz-range-track {
                    width: 100%;
                    height: 12px;
                    cursor: pointer;
                    background: #1b5e20;
                    border: 2px solid #ffd700;
                }

                /* Thumb */
                input[type=range]::-webkit-slider-thumb {
                    height: 24px;
                    width: 12px;
                    background: #ffd700;
                    cursor: pointer;
                    -webkit-appearance: none;
                    margin-top: -8px; 
                    box-shadow: 2px 2px 0 #000;
                    border: 2px solid #3e2723;
                }

                input[type=range]::-moz-range-thumb {
                    height: 24px;
                    width: 12px;
                    background: #ffd700;
                    cursor: pointer;
                    box-shadow: 2px 2px 0 #000;
                    border: 2px solid #3e2723;
                }
            `}</style>
        </div>
    );
}
