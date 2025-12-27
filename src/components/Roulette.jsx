import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import spinBtnImg from '../assets/Spinbtn.png';

// European Roulette Order
const wheelOrder = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const getRealColor = (n) => {
  if (n === 0) return 'green';
  if ((n >= 1 && n <= 10) || (n >= 19 && n <= 28)) {
    return n % 2 === 0 ? 'black' : 'red';
  }
  return n % 2 === 0 ? 'red' : 'black';
};

const CELL_SIZE = 360 / 37;

const Roulette = forwardRef(({ playerCard, onCard, onResult, theme }, ref) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  // Ball starts at outer rim (approx 135px radius for a 300px wheel)
  const [ballRadius, setBallRadius] = useState(220); // approx 220 for 500px wheel

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);

    // 1. Determine Result
    const resultIndex = Math.floor(Math.random() * 37);
    const winningNumber = wheelOrder[resultIndex];

    const targetBaseAngle = resultIndex * CELL_SIZE;

    // 2. Calculate Angles
    const currentRotation = rotation;
    const spins = 5;
    const targetRotation = currentRotation + (spins * 360) + (360 - (currentRotation % 360)) - targetBaseAngle;

    const ballSpins = 5;
    const targetBallRotation = ballRotation - (ballSpins * 360) - (ballRotation % 360);

    // Execute Animation
    setRotation(targetRotation);
    setBallRotation(targetBallRotation);
    setBallRadius(220); // Reset to rim

    // Drop phase with Physics Bounce
    // Timing: The ball spins for 4s total.
    // Drop starts around 2s.

    setTimeout(() => {
      setBallRadius(160); // Drop to slot ring
    }, 2000);

    // Bounce 1
    setTimeout(() => {
      setBallRadius(180);
    }, 2400);

    // Land 1
    setTimeout(() => {
      setBallRadius(160);
    }, 2700);

    // Bounce 2 (Small)
    setTimeout(() => {
      setBallRadius(170);
    }, 3000);

    // Final Land
    setTimeout(() => {
      setBallRadius(160);
    }, 3200);

    // Finish
    setTimeout(() => {
      setSpinning(false);
      onResult({ n: winningNumber, color: getRealColor(winningNumber) });
    }, 5000); // 5s total
  };

  // Expose triggerSpin method to parent via ref
  useImperativeHandle(ref, () => ({
    triggerSpin: () => {
      if (!spinning) {
        spinWheel();
      }
    }
  }));

  return (
    <div className="roulette-container">
      <div className="casino-wheel-outer">
        {/* Rim & Background */}
        <div className="wheel-rim"></div>

        {/* The Spinning Wheel */}
        <div
          className="wheel-spinner"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.1, 0, 0.1, 1)' : 'none'
          }}
        >
          {wheelOrder.map((num, i) => (
            <div
              key={i}
              className={`wheel-slot ${getRealColor(num)}`}
              style={{
                transform: `rotate(${i * CELL_SIZE}deg)`,
              }}
            >
              <div className="wheel-number">
                {/* Text rotates with the wheel (radial orientation) */}
                {num}
              </div>
            </div>
          ))}
        </div>

        {/* Center Knob */}
        <div className="wheel-center-knob"></div>

        {/* The Ball Container (Rotates Independent of Wheel) */}
        <div
          className="ball-container"
          style={{
            transform: `rotate(${ballRotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.1, 0.2, 0.1, 1)' : 'none'
          }}
        >
          <div
            className="casino-ball"
            style={{
              transform: `translateY(-${ballRadius}px)`,
              transition: spinning ? 'transform 1.5s ease-out 2s' : 'none'
            }}
          ></div>
        </div>

        {/* Golden Triangle Pointer at Top */}
        <div className="wheel-pointer"></div>

      </div>

      <div className="controls" style={{ margin: '24px 0', display: 'flex', justifyContent: 'center' }}>
        <button className="btn-img" onClick={spinWheel} disabled={spinning} style={{ opacity: spinning ? 0.6 : 1, filter: spinning ? 'grayscale(0.5)' : 'none' }}>
          <img src={spinBtnImg} alt={spinning ? 'SPINNING...' : 'SPIN'} style={{ width: '300px', marginBottom: '30px' }} />
        </button>
      </div>
    </div>
  );
});

export default Roulette;