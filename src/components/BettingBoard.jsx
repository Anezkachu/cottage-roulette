import React from 'react';

const COLORS = {
    0: 'green',
    1: 'red', 2: 'black', 3: 'red',
    4: 'black', 5: 'red', 6: 'black',
    7: 'red', 8: 'black', 9: 'red',
    10: 'black', 11: 'black', 12: 'red',
    13: 'black', 14: 'red', 15: 'black',
    16: 'red', 17: 'black', 18: 'red',
    19: 'red', 20: 'black', 21: 'red',
    22: 'black', 23: 'red', 24: 'black',
    25: 'red', 26: 'black', 27: 'red',
    28: 'black', 29: 'black', 30: 'red',
    31: 'black', 32: 'red', 33: 'black',
    34: 'red', 35: 'black', 36: 'red'
};

export default function BettingBoard({ onBet, betType, betNumber, betColor }) {
    const rows = [];
    // Standard roulette board layout: 0 Left. Then 12 columns of 3 rows.
    // We want visual order:
    // Row 1 (Top): 3, 6, 9...
    // Row 2 (Mid): 2, 5, 8...
    // Row 3 (Bot): 1, 4, 7...
    //
    // CSS Grid with 'grid-auto-flow: column' fills Top->Bottom.
    // So we provide data in Column sets: [3, 2, 1], [6, 5, 4], etc.

    for (let c = 1; c <= 12; c++) {
        rows.push(c * 3);     // Top (e.g. 3)
        rows.push(c * 3 - 1); // Mid (e.g. 2)
        rows.push(c * 3 - 2); // Bot (e.g. 1)
    }

    const handleNumberClick = (n) => {
        onBet({ type: 'straight', value: n });
    };

    const handleColorClick = (c) => {
        onBet({ type: 'color', value: c });
    };

    return (
        <div className="betting-board-container">
            <div className="betting-board">
                {/* Zero */}
                <div
                    className={`board-cell zero ${betType === 'straight' && betNumber == 0 ? 'selected' : ''}`}
                    onClick={() => handleNumberClick(0)}
                >
                    0
                </div>

                {/* Number Grid */}
                <div className="numbers-grid">
                    {rows.map(n => (
                        <div
                            key={n}
                            className={`board-cell number-cell ${COLORS[n]} ${betType === 'straight' && betNumber == n ? 'selected' : ''}`}
                            onClick={() => handleNumberClick(n)}
                        >
                            {n}
                        </div>
                    ))}
                </div>

                {/* Side Bets (Color) */}
                <div className="side-bets-row">
                    <div
                        className={`board-cell bet-red ${betType === 'color' && betColor === 'red' ? 'selected' : ''}`}
                        onClick={() => handleColorClick('red')}
                    >
                        RED
                    </div>
                    <div
                        className={`board-cell bet-black ${betType === 'color' && betColor === 'black' ? 'selected' : ''}`}
                        onClick={() => handleColorClick('black')}
                    >
                        BLACK
                    </div>
                </div>
            </div>
        </div>
    );
}
