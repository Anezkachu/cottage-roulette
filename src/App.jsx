import React, { useMemo, useState } from 'react';
import OpeningMenu from './components/OpeningMenu.jsx';
import Roulette from './components/Roulette.jsx';
import BettingBoard from './components/BettingBoard.jsx';
import { CARD_TYPES } from './card-data.js';

export default function App() {
  const [player, setPlayer] = useState(null);               // { theme, balance }
  const [stake, setStake] = useState(100);
  const [betType, setBetType] = useState('straight');       // straight | color | split
  const [betColor, setBetColor] = useState('red');          // red | black
  const [betNumber, setBetNumber] = useState(0);            // 0..36
  const [splitPair, setSplitPair] = useState('0-1');        // for split bets
  const [message, setMessage] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const [choosingCard, setChoosingCard] = useState(false);
  const [card, setCard] = useState(null);                   // special card for current spin
  const [tableMax, setTableMax] = useState(2000);           // default max bet
  // 2. Removed uiCosmetics, showShopOnly, showShopOverlay states.
  // 5. New states for card draw overlay
  const [revealed, setRevealed] = useState(false);
  const [pickedIndex, setPickedIndex] = useState(-1); // Visual state for the card selection (which of the 3 was picked)
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [cardOptions, setCardOptions] = useState([]); // Pre-generated cards for the 3 choices

  const placeable = useMemo(
    () => player && stake > 0 && stake <= player.balance && stake <= tableMax,
    [player, stake, tableMax]
  );

  // --- Opening Menu ---
  if (!player) {
    return (
      <OpeningMenu
        onStart={(p) => setPlayer(p || { theme: 'cottage', balance: 1000 })}
        onShop={() => { }} // 6. Removed shop logic from OpeningMenu usage
      />
    );
  }

  // --- Helper functions ---
  // 4. Update startCardDraw
  const startCardDraw = () => {
    // Pre-generate 3 random cards
    const options = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * CARD_TYPES.length);
      options.push(CARD_TYPES[randomIndex]);
    }
    setCardOptions(options);
    setChoosingCard(true);
    setRevealed(false);
    setPickedIndex(-1);
    setMessage('Choose your Fate...');
  };

  // 5. Update handleCardPick
  const handleCardPick = (visualIndex) => {
    if (revealed) return; // Prevent double click

    // Use the pre-generated card for this position
    const selected = cardOptions[visualIndex];

    setPickedIndex(visualIndex);
    setCard(selected);
    setRevealed(true);

    // Apply immediate effects
    if (selected.type === 'HOUSE_EDGE') {
      setTableMax(5000);
    } else {
      setTableMax(2000); // Reset if not HOUSE_EDGE
    }
  };

  // 5. New function to confirm card selection
  const confirmCard = () => {
    setChoosingCard(false);
    setRevealed(false);
    setPickedIndex(-1);
    setMessage(`${card.label} Active! ${card.effect} `);
  };

  const applyHouseEdge = (payout) => {
    if (card && card.type === 'HOUSE_EDGE') return Math.floor(payout * 0.95);
    return payout;
  };

  const colorCountsWithWildZero = (resultColor, resultNumber) => {
    if (card?.type === 'WILD_ZERO' && resultNumber === 0) {
      return true;
    }
    return resultColor === betColor;
  };

  const splitPairsMap = {
    '0-1': [0, 1], '1-2': [1, 2], '2-3': [2, 3],
    '4-5': [4, 5], '5-6': [5, 6], '7-8': [7, 8], '8-9': [8, 9],
    '10-11': [10, 11], '11-12': [11, 12],
    '13-14': [13, 14], '14-15': [14, 15], '16-17': [16, 17],
    '19-20': [19, 20], '20-21': [20, 21], '22-23': [22, 23],
    '25-26': [25, 26], '26-27': [26, 27], '28-29': [28, 29],
    '31-32': [31, 32], '32-33': [32, 33], '34-35': [34, 35],
    // Vertical Splits (examples)
    '1-4': [1, 4], '2-5': [2, 5], '3-6': [3, 6]
  };

  const calcPayout = (result) => {
    let win = false, payout = 0;

    if (betType === 'color') {
      win = colorCountsWithWildZero(result.color, result.n);
      payout = win ? stake : -stake;
    } else if (betType === 'straight') {
      win = result.n === Number(betNumber);
      payout = win ? stake * 35 : -stake;
    } else if (betType === 'split') {
      const pair = splitPairsMap[splitPair] || [];
      win = pair.includes(result.n);
      const base = 17;
      const mult = card?.type === 'SPLIT_BOOST' ? 2 : 1;
      payout = win ? stake * base * mult : -stake;
    }
    // ... Add logic for other card types if necessary (e.g. EVENING_BELL)
    if (card?.type === 'EVENING_BELL' && (betType === 'even' || betType === 'odd')) {
      // Not implemented in UI yet but logic ready
    }
    if (card?.type === 'GOLDEN_DOZEN' && betType === 'dozen') {
      // Not implemented
    }

    payout = applyHouseEdge(payout);
    return { win, payout };
  };

  const handleResult = (result) => {
    if (!card) return;
    setLastResult(result);
    const { win, payout } = calcPayout(result);
    setPlayer(p => ({ ...p, balance: p.balance + payout }));

    let msg = '';
    if (win) {
      if (betType === 'straight') msg = `WIN! Number ${result.n}!`;
      else if (betType === 'color') msg = `WIN! Color ${result.color.toUpperCase()}!`;
      else if (betType === 'split') msg = `WIN! Split Hit!`;
      msg += ` Payout: +₱${payout}.`;
    } else {
      msg = `LOSS. Result: ${result.n} (${result.color}). Loss: ₱${-payout}.`;
    }

    setMessage(msg);
    setShowResultPopup(true);
  };

  const closeResultPopup = () => {
    setShowResultPopup(false);
    setCard(null);
    setTableMax(2000);
  };

  const handleBetSelect = (bet) => {
    setBetType(bet.type);
    if (bet.type === 'straight') setBetNumber(bet.value);
    if (bet.type === 'color') setBetColor(bet.value);
  };

  // 7. Removed Shop UI from render.

  // --- Main Game View ---
  return (
    <div className="container">
      {/* 1. Betting Board Area */}
      <h2 style={{ textAlign: 'center', marginTop: 10, fontFamily: '"VT323", monospace', fontSize: '3.5rem', color: '#ffd700', textShadow: '4px 4px 0 #3e2723' }}>
        Place Your Bets
      </h2>
      <BettingBoard
        onBet={handleBetSelect}
        betType={betType}
        betNumber={betNumber}
        betColor={betColor}
      />

      {/* 2. Controls & Info */}
      <div className="control-panel">
        <div className="control-row">

          {/* Balance Group */}
          <div className="control-group">
            <div className="control-label">Balance</div>
            <div className="control-value-box">₱{player.balance}</div>
          </div>

          {/* Stake Group */}
          <div className="control-group">
            <div className="control-label">Stake</div>
            <input
              className="control-input"
              type="number"
              min="1"
              max={tableMax}
              value={stake}
              onChange={e => setStake(Number(e.target.value))}
            />
            <div className="bet-summary" style={{ color: '#a5d6a7' }}>Max: ₱{tableMax}</div>
          </div>

          {/* Bet Mode Group */}
          <div className="control-group">
            <div className="control-label">Bet Mode</div>
            <select className="control-select" value={betType} onChange={e => setBetType(e.target.value)}>
              <option value="straight">Straight</option>
              <option value="color">Color</option>
              <option value="split">Split</option>
            </select>

            {betType === 'split' && (
              <select className="control-select" style={{ marginTop: '8px' }} value={splitPair} onChange={e => setSplitPair(e.target.value)}>
                <option value="0-1">0-1 (H)</option>
                <option value="1-2">1-2 (H)</option>
                <option value="2-3">2-3 (H)</option>
                <option value="4-5">4-5 (H)</option>
                <option value="5-6">5-6 (H)</option>
                <option value="1-4">1-4 (V)</option>
                <option value="2-5">2-5 (V)</option>
                <option value="3-6">3-6 (V)</option>
              </select>
            )}

            <div className="bet-summary">
              Target:
              <strong>
                {betType === 'straight' && ` #${betNumber}`}
                {betType === 'color' && ` ${betColor.toUpperCase()}`}
                {betType === 'split' && ` ${splitPair}`}
              </strong>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Helper / Status */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div className="status" style={{ minHeight: '24px', marginBottom: '16px' }}>{message}</div>

        {!card && !choosingCard && (
          <button className="btn btn-xl" style={{ background: '#673ab7' }} onClick={startCardDraw}>
            DRAW FATE CARD
          </button>
        )}

        {card && <div style={{ fontFamily: '"VT323", monospace', fontSize: '2rem', color: '#ffd700', textShadow: '2px 2px 0 #000' }}>ACTIVE FATE: {card.label}</div>}
      </div>

      {/* 4. Roulette */}
      <div style={{ opacity: card ? 1 : 0.5, pointerEvents: card ? 'auto' : 'none', filter: card ? 'none' : 'grayscale(100%)', transition: 'all 0.5s' }}>
        <Roulette
          playerCard={card}
          onCard={() => { }}
          onResult={handleResult}
          theme={player.theme}
        />
        {!card && <div style={{ textAlign: 'center', marginTop: '-300px', position: 'relative', zIndex: 100, fontWeight: 'bold', color: 'white', textShadow: '0 2px 4px black' }}>DRAW CARD TO ACTIVATE</div>}
      </div>

      {/* 8. OVERLAY for Card Draw */}
      {choosingCard && (
        <div className="fate-overlay">
          <h2 style={{ color: '#ffd700', fontFamily: '"VT323", monospace', fontSize: '4rem', textShadow: '4px 4px 0 #000' }}>Choose Your Fate</h2>
          <div className="fate-card-container">
            {[0, 1, 2].map((i) => (
              <div key={i} className="fate-card-wrapper" onClick={() => handleCardPick(i)}>
                <div className={`fate-card ${revealed && pickedIndex === i ? 'flipped' : ''} ${revealed && pickedIndex !== i ? 'faded' : ''} ${revealed && pickedIndex === i && card ? `rarity-${card.rarity}` : 'rarity-common'} `}>
                  <div className="fate-card-face fate-card-back" style={{
                    backgroundImage: cardOptions[i] ? `url(${cardOptions[i].cardBackImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                  </div>
                  <div className="fate-card-face fate-card-front">
                    {/* Only render front content if this card was picked and we have a card data */}
                    {revealed && pickedIndex === i && card && (
                      <>
                        <div className="card-header">{card.label}</div>
                        <div style={{ borderBottom: '1px solid #ccc', margin: '4px 20px' }}></div>
                        <div className="card-body">
                          <div style={{ fontSize: '1.1rem' }}>{card.effect}</div>
                        </div>
                        <div className="card-icon">{card.icon}</div>
                        <div className="card-footer">{card.rarity}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {revealed && card && (
            <div className="card-explanation">
              <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '4px' }}>{card.label}</strong>
              {card.effect}
              <br />
              <button className="btn" style={{ marginTop: '12px' }} onClick={confirmCard}>CONTINUE</button>
            </div>
          )}
        </div>
      )}

      {/* 9. RESULT OVERLAY */}
      {showResultPopup && lastResult && (
        <div className="fate-overlay">
          <div className="card panel" style={{ width: '400px', textAlign: 'center', border: '8px solid #ffd700', padding: '40px', background: '#fff' }}>
            <h2 style={{
              fontSize: '3rem',
              fontFamily: '"Rubik Bubbles"',
              color: message.startsWith('WIN') ? '#2e7d32' : '#d84315',
              margin: '0 0 20px 0',
              textShadow: '2px 2px 0 #000'
            }}>
              {message.startsWith('WIN') ? 'BIG WIN!' : 'NO LUCK!'}
            </h2>

            <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
              {betType === 'color' ? (
                <>Result: <span style={{ textTransform: 'uppercase', color: lastResult.color, fontWeight: 'bold', fontSize: '2rem' }}>{lastResult.color}</span></>
              ) : (
                <>Result: <span style={{ fontWeight: 'bold', fontSize: '2rem' }}>{lastResult.n}</span> <span style={{ textTransform: 'uppercase', color: lastResult.color }}>{lastResult.color}</span></>
              )}
            </div>

            <div style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#555' }}>
              {message}
            </div>

            <button className="btn btn-xl" onClick={closeResultPopup}>
              NEXT ROUND
            </button>
          </div>
        </div>
      )}

    </div>
  );
}