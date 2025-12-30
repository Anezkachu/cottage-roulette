import React, { useEffect, useState, useRef } from 'react';
import chestOpenGif from '../assets/chestopen.gif';
import { playButtonSound, playVictorySound, playGameOverSound } from '../utils/audio';

const ChestResult = ({ message, win, onClose }) => {
    const [showText, setShowText] = useState(false);
    const [isFrozen, setIsFrozen] = useState(false);
    const imgRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        // Timeline:
        // 1. 900ms: Start showing text (rising) and play sound
        const textTimer = setTimeout(() => {
            setShowText(true);
            if (win) {
                playVictorySound();
            } else {
                playGameOverSound();
            }
        }, 900);

        // 2. 1200ms: Freeze the GIF by drawing its current frame to a canvas
        const freezeTimer = setTimeout(() => {
            if (imgRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                // Use natural dimensions of the GIF asset
                canvas.width = imgRef.current.naturalWidth;
                canvas.height = imgRef.current.naturalHeight;
                ctx.drawImage(imgRef.current, 0, 0);
                setIsFrozen(true);
            }
        }, 1200);

        return () => {
            clearTimeout(textTimer);
            clearTimeout(freezeTimer);
        };
    }, []);

    const isWin = win;

    return (
        <div className="chest-overlay-content">
            <div className="chest-container">
                {/* Dynamic Glow */}
                <div className={`glow-light ${showText ? 'stage-2' : 'visible'}`}></div>

                <div className="chest-main">
                    {/* The Actual GIF (Visible during animation) */}
                    <img
                        ref={imgRef}
                        src={chestOpenGif}
                        alt="Chest Opening"
                        className={`chest-gif ${isFrozen ? 'hidden' : 'visible'}`}
                    />

                    {/* Static Canvas Frame (Visible once frozen) */}
                    <canvas
                        ref={canvasRef}
                        className={`chest-frozen-canvas ${isFrozen ? 'visible' : 'hidden'}`}
                    />
                </div>

                {showText && (
                    <div className="rising-announcement animate">
                        <h2 className={`result-title ${isWin ? 'win' : 'loss'}`}>
                            {isWin ? 'BIG WIN!' : 'NO LUCK!'}
                        </h2>
                        <div className="result-msg">{message}</div>
                        <button className="btn btn-xl next-btn" onClick={() => { onClose(); playButtonSound(); }}>
                            NEXT ROUND
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChestResult;
