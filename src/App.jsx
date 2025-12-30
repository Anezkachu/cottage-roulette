import React, { useMemo, useState, useRef } from 'react';
import OpeningMenu from './components/OpeningMenu.jsx';
import Roulette from './components/Roulette.jsx';
import BettingBoard from './components/BettingBoard.jsx';
import bgVideo from './assets/pokemon_emerald_waterfall.mp4';
import { CARD_TYPES } from './card-data.js';
import drawFateBtn from './assets/Drawfatebtn.png';
import ChestResult from './components/ChestResult.jsx';
import useSavedCardBtn from './assets/usesaved.png';
import {
  playClickSound,
  playButtonSound,
  playCardRevealSound,
  playVictorySound,
  playGameOverSound,
  playSelectSound,
  playBgm
} from './utils/audio';
import { useEffect } from 'react';
import SoundSettings from './components/SoundSettings.jsx';

export default function App() {
  const [player, setPlayer] = useState(null);               // { theme, balance }
  const [gameState, setGameState] = useState('menu');       // menu | name-entry | game
  const [stake, setStake] = useState(100);
  const [betType, setBetType] = useState('straight');       // straight | color | split
  const [betColor, setBetColor] = useState('red');          // red | black
  const [betNumber, setBetNumber] = useState(0);            // 0..36
  const [splitPair, setSplitPair] = useState('0-1');        // for split bets
  const [message, setMessage] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const [choosingCard, setChoosingCard] = useState(false);
  const [card, setCard] = useState(null);                   // active card for current spin
  const [cardInventory, setCardInventory] = useState([]);   // saved cards (max 2)
  const [drawnCard, setDrawnCard] = useState(null);         // temporarily holds drawn card before decision
  const [showInventory, setShowInventory] = useState(false); // show inventory overlay
  const [mustSelectCard, setMustSelectCard] = useState(false); // true when user MUST select a card to continue
  const [tableMax, setTableMax] = useState(2000);           // default max bet
  // 5. New states for card draw overlay
  const [revealed, setRevealed] = useState(false);
  const [pickedIndex, setPickedIndex] = useState(-1); // Visual state for the card selection (which of the 3 was picked)
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [cardOptions, setCardOptions] = useState([]); // Pre-generated cards for the 3 choices
  const [fatesDriftUsed, setFatesDriftUsed] = useState(false); // Track if FATES_DRIFT re-spin was used
  const rouletteRef = useRef(null); // Ref to trigger re-spin
  const MAX_INVENTORY = 2; // Maximum cards player can hold

  const placeable = useMemo(
    () => player && stake > 0 && stake <= player.balance && stake <= tableMax,
    [player, stake, tableMax]
  );

  useEffect(() => {
    // Attempt to play on mount
    playBgm(gameState === 'game' ? 'game' : 'menu');

    // Also retry on interaction in case it was blocked
    const handleInteraction = () => {
      playBgm(gameState === 'game' ? 'game' : 'menu');
      window.removeEventListener('click', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, [gameState]);

  // --- Helper functions ---
  const startCardDraw = () => {
    playButtonSound();
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

  const handleCardPick = (visualIndex) => {
    if (revealed) return; // Prevent double click

    // Use the pre-generated card for this position
    const selected = cardOptions[visualIndex];

    setPickedIndex(visualIndex);
    setDrawnCard(selected); // Store temporarily, don't activate yet
    setRevealed(true);
    playCardRevealSound();
  };

  const useCardNow = () => {
    if (!drawnCard) return;

    setCard(drawnCard);
    setChoosingCard(false);
    setRevealed(false);
    setPickedIndex(-1);
    setDrawnCard(null);

    // Apply immediate effects
    if (drawnCard.type === 'HOUSE_EDGE') {
      setTableMax(5000);
    } else {
      setTableMax(2000);
    }

    setMessage(`${drawnCard.label} Active! ${drawnCard.effect}`);
  };

  const saveCardToInventory = () => {
    if (!drawnCard) return;
    if (cardInventory.length >= MAX_INVENTORY) {
      setMessage('Inventory full! Use or discard a card first.');
      return;
    }

    const savedCard = { ...drawnCard, inventoryId: Date.now() };
    setCardInventory(prev => [...prev, savedCard]);
    setChoosingCard(false);
    setRevealed(false);
    setPickedIndex(-1);
    setDrawnCard(null);

    // After saving, open inventory overlay to force user to select a card for this round
    setShowInventory(true);
    setMustSelectCard(true); // User MUST select a card now
    setMessage(`${drawnCard.label} saved! Now select a card to use for this spin.`);
  };

  const useCardFromInventory = (inventoryId) => {
    playButtonSound();
    const selectedCard = cardInventory.find(c => c.inventoryId === inventoryId);
    if (!selectedCard) return;

    setCard(selectedCard);
    setCardInventory(prev => prev.filter(c => c.inventoryId !== inventoryId));
    setShowInventory(false);
    setMustSelectCard(false); // Selection complete

    // Apply immediate effects
    if (selectedCard.type === 'HOUSE_EDGE') {
      setTableMax(5000);
    } else {
      setTableMax(2000);
    }

    setMessage(`${selectedCard.label} Active! ${selectedCard.effect}`);
  };

  const discardCard = (inventoryId) => {
    playButtonSound();
    const discardedCard = cardInventory.find(c => c.inventoryId === inventoryId);
    setCardInventory(prev => prev.filter(c => c.inventoryId !== inventoryId));
    setMessage(`${discardedCard?.label || 'Card'} discarded.`);
  };

  const confirmCard = () => {
    useCardNow();
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

  const getAdjacentNumbers = (num) => {
    const idx = wheelOrder.indexOf(num);
    if (idx === -1) return [];
    const prev = wheelOrder[(idx - 1 + 37) % 37];
    const next = wheelOrder[(idx + 1) % 37];
    return [prev, next];
  };

  const wheelOrder = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  const calcPayout = (result) => {
    let win = false, payout = 0;
    let partialWin = false; // For TWILIGHT_BLOOM adjacent wins

    if (betType === 'color') {
      win = colorCountsWithWildZero(result.color, result.n);

      // COLOR_BLOOM: Red or Black bets pay 1.5×
      if (win) {
        const multiplier = card?.type === 'COLOR_BLOOM' ? 1.5 : 1;
        payout = Math.floor(stake * multiplier);
      } else {
        payout = -stake;
      }
    } else if (betType === 'straight') {
      win = result.n === Number(betNumber);

      // Check for TWILIGHT_BLOOM: Adjacent numbers win at half payout
      if (!win && (card?.type === 'TWILIGHT_BLOOM')) {
        const adjacent = getAdjacentNumbers(Number(betNumber));
        if (adjacent.includes(result.n)) {
          partialWin = true;
          // SUNBEAM_BOOST applies to base, then halved for adjacent
          const baseMultiplier = card?.type === 'SUNBEAM_BOOST' ? 40 : 35;
          payout = Math.floor(stake * baseMultiplier * 0.5);
        }
      }

      if (win) {
        // SUNBEAM_BOOST: Straight-up bets pay 40× instead of 35×
        const multiplier = card?.type === 'SUNBEAM_BOOST' ? 40 : 35;
        payout = stake * multiplier;
      } else if (!partialWin) {
        payout = -stake;
      }
    } else if (betType === 'split') {
      const pair = splitPairsMap[splitPair] || [];
      win = pair.includes(result.n);
      const base = 17;
      // SPLIT_BOOST: Split bets pay 2×
      const mult = card?.type === 'SPLIT_BOOST' ? 2 : 1;
      payout = win ? stake * base * mult : -stake;
    }

    // BERRY_BOOST: Outside bets (color is an outside bet) gain +10% payout
    if (card?.type === 'BERRY_BOOST' && betType === 'color' && win) {
      payout = Math.floor(payout * 1.1);
    }

    // HARVEST_SPIN: All winning bets gain +20%
    if (card?.type === 'HARVEST_SPIN' && (win || partialWin) && payout > 0) {
      payout = Math.floor(payout * 1.2);
    }

    // Apply house edge if applicable
    payout = applyHouseEdge(payout);

    // MOSS_COVER: Protect one bet; recover half chips if it loses
    if (card?.type === 'MOSS_COVER' && !win && !partialWin && payout < 0) {
      payout = Math.floor(payout * 0.5); // Lose only half
    }

    // LANTERNS_GUIDE: Mark one chip; return it if it loses (full protection)
    if (card?.type === 'LANTERNS_GUIDE' && !win && !partialWin && payout < 0) {
      payout = 0; // Full bet returned
    }

    return { win: win || partialWin, payout };
  };

  const handleResult = (result) => {
    // FATES_DRIFT: Re-spin once if Zero hits (and hasn't been used yet)
    if (card?.type === 'FATES_DRIFT' && result.n === 0 && !fatesDriftUsed) {
      setFatesDriftUsed(true);
      setMessage(`🪶 FATE'S DRIFT ACTIVATED! Zero hit - FREE RE-SPIN!`);
      // Trigger re-spin after a short delay
      setTimeout(() => {
        if (rouletteRef.current) {
          rouletteRef.current.triggerSpin();
        }
      }, 1500);
      return; // Don't calculate payout yet
    }

    setLastResult(result);
    const { win, payout } = calcPayout(result);
    setPlayer(p => ({ ...p, balance: p.balance + payout }));

    let msg = '';
    let cardEffect = '';

    // Generate card effect message
    if (card) {
      if (card.type === 'COLOR_BLOOM' && betType === 'color' && win) {
        cardEffect = '🌹 Color Bloom: 1.5× payout!';
      } else if (card.type === 'SPLIT_BOOST' && betType === 'split' && win) {
        cardEffect = '🪨 Split Boost: 2× payout!';
      } else if (card.type === 'SUNBEAM_BOOST' && betType === 'straight' && win) {
        cardEffect = '☀️ Sunbeam Boost: 40× payout!';
      } else if (card.type === 'BERRY_BOOST' && betType === 'color' && win) {
        cardEffect = '🫐 Berry Boost: +10% bonus!';
      } else if (card.type === 'HARVEST_SPIN' && win) {
        cardEffect = '🌻 Harvest Spin: +20% bonus!';
      } else if (card.type === 'TWILIGHT_BLOOM' && betType === 'straight' && win && result.n !== Number(betNumber)) {
        cardEffect = '🌸 Twilight Bloom: Adjacent number win at half payout!';
      } else if (card.type === 'WILD_ZERO' && result.n === 0 && win) {
        cardEffect = '🌿 Wild Zero: Zero counted as your color!';
      } else if (card.type === 'MOSS_COVER' && !win && payout > -stake) {
        cardEffect = '🍀 Moss Cover: Protected! Lost only half.';
      } else if (card.type === 'LANTERNS_GUIDE' && !win && payout === 0) {
        cardEffect = '🏮 Lantern\'s Guide: Full bet returned!';
      }
    }

    if (win) {
      if (betType === 'straight') msg = `WIN! Number ${result.n}!`;
      else if (betType === 'color') msg = `WIN! Color ${result.color.toUpperCase()}!`;
      else if (betType === 'split') msg = `WIN! Split Hit!`;
      msg += ` Payout: +₱${payout}.`;
    } else {
      if (payout === 0) {
        msg = `No Win. Result: ${result.n} (${result.color}). Bet protected!`;
      } else if (payout > -stake) {
        msg = `No Win. Result: ${result.n} (${result.color}). Reduced loss: ₱${-payout}.`;
      } else {
        msg = `LOSS. Result: ${result.n} (${result.color}). Loss: ₱${-payout}.`;
      }
    }

    if (cardEffect) {
      msg = cardEffect + ' ' + msg;
    }

    setMessage(msg);
    // Sounds moved to ChestResult for better synchronization with animation
    setShowResultPopup(true);
  };

  const closeResultPopup = () => {
    playButtonSound();
    setShowResultPopup(false);
    setCard(null);
    setTableMax(2000);
    setFatesDriftUsed(false); // Reset for next round
  };

  const handleBetSelect = (bet) => {
    setBetType(bet.type);
    if (bet.type === 'straight') setBetNumber(bet.value);
    if (bet.type === 'color') setBetColor(bet.value);
  };

  return (
    <>
      <video autoPlay loop muted playsInline className="video-background">
        <source src={bgVideo} type="video/mp4" />
      </video>
      <SoundSettings />
      {gameState === 'menu' && (
        <OpeningMenu onStart={() => {
          setPlayer({ theme: 'cottage', balance: 1000 });
          setGameState('game');
        }} />
      )}

      {gameState === 'game' && player && (
        <div className="container">
          {/* 1. Betting Board Area */}
          <h2 style={{ textAlign: 'center', marginTop: 10, marginBottom: 10, fontFamily: '"VT323", monospace', fontSize: '5.1rem', color: '#ffd700', textShadow: '4px 4px 0 #3e2723' }}>
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
              <div className="control-group">
                <div className="control-label">Balance</div>
                <div className="control-value-box">₱{player.balance}</div>
              </div>

              <div className="control-group">
                <div className="control-label">Stake</div>
                <input
                  className="control-input"
                  type="number"
                  min="1"
                  max={tableMax}
                  value={stake}
                  onClick={playSelectSound}
                  onChange={e => setStake(Number(e.target.value))}
                />
                <div className="bet-summary" style={{ color: '#a5d6a7' }}>Max: ₱{tableMax}</div>
              </div>

              <div className="control-group">
                <div className="control-label">Bet Mode</div>
                <select className="control-select" value={betType} onClick={playSelectSound} onChange={e => { setBetType(e.target.value); playSelectSound(); }}>
                  <option value="straight">Straight</option>
                  <option value="color">Color</option>
                  <option value="split">Split</option>
                </select>

                {betType === 'split' && (
                  <select className="control-select" style={{ marginTop: '8px' }} value={splitPair} onClick={playSelectSound} onChange={e => { setSplitPair(e.target.value); playSelectSound(); }}>
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
                  <strong className={betType === 'color' ? `color-${betColor}` : ''}>
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
            <div className="status" style={{ minHeight: '24px' }}>{message}</div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {!card && !choosingCard && (
                <button className="btn-img" onClick={startCardDraw}>
                  <img src={drawFateBtn} alt="DRAW FATE" style={{ width: '400px' }} />
                </button>
              )}

              {!card && !choosingCard && cardInventory.length > 0 && (
                <button className="btn-img" onClick={() => { playButtonSound(); setShowInventory(true); }}>
                  <img src={useSavedCardBtn} alt="USE SAVED CARD" style={{ width: '400px' }} />
                </button>
              )}
            </div>

            {card && <div style={{ fontFamily: '"VT323", monospace', fontSize: '2rem', color: '#ffd700', textShadow: '2px 2px 0 #000' }}>🔥 ACTIVE FATE: {card.label} {card.icon}</div>}
          </div>

          {/* 4. Roulette */}
          <div style={{ transition: 'all 0.5s' }}>
            <Roulette
              ref={rouletteRef}
              playerCard={card}
              onCard={() => { }}
              onResult={handleResult}
              theme={player.theme}
            />
            {!card && (
              <div style={{ textAlign: 'center', marginTop: '-50px', position: 'relative', zIndex: 100, fontWeight: 'bold', color: '#ffd700', textShadow: '0 2px 4px black', fontSize: '1.2rem', fontFamily: '"VT323", monospace' }}>
                💫 No Fate Card Active - Spinning with base odds
              </div>
            )}
          </div>

          {/* 8. OVERLAY for Card Draw */}
          {choosingCard && (
            <div className="fate-overlay">
              <h2 style={{ color: '#ffd700', fontFamily: '"VT323", monospace', fontSize: '4rem', textShadow: '4px 4px 0 #000' }}>Choose Your Fate</h2>
              <div className="fate-card-container">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="fate-card-wrapper" onClick={() => handleCardPick(i)}>
                    <div className={`fate-card ${revealed && pickedIndex === i ? 'flipped' : ''} ${revealed && pickedIndex !== i ? 'faded' : ''} ${revealed && pickedIndex === i && drawnCard ? `rarity-${drawnCard.rarity}` : 'rarity-common'} `}>
                      <div className="fate-card-face fate-card-back" style={{
                        backgroundImage: cardOptions[i] ? `url(${cardOptions[i].cardBackImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                      </div>
                      <div className="fate-card-face fate-card-front">
                        {revealed && pickedIndex === i && drawnCard && (
                          <>
                            <div className="card-header">{drawnCard.label}</div>
                            <div style={{ borderBottom: '1px solid #ccc', margin: '4px 20px' }}></div>
                            <div className="card-body">
                              <div style={{ fontSize: '1.1rem' }}>{drawnCard.effect}</div>
                            </div>
                            <div className="card-icon">{drawnCard.icon}</div>
                            <div className="card-footer">{drawnCard.rarity}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {revealed && drawnCard && (
                <div className="card-explanation">
                  <strong style={{ display: 'block', fontSize: '1.4rem', marginBottom: '8px' }}>{drawnCard.icon} {drawnCard.label}</strong>
                  <div style={{ marginBottom: '16px', color: '#555' }}>{drawnCard.effect}</div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-xl"
                      style={{ background: '#2e7d32' }}
                      onClick={() => { playButtonSound(); useCardNow(); }}
                    >
                      ⚡ USE NOW
                    </button>

                    {cardInventory.length < MAX_INVENTORY && (
                      <button
                        className="btn btn-xl"
                        style={{ background: '#1976d2' }}
                        onClick={() => { playButtonSound(); saveCardToInventory(); }}
                      >
                        📦 SAVE FOR LATER ({cardInventory.length}/{MAX_INVENTORY})
                      </button>
                    )}

                    {cardInventory.length >= MAX_INVENTORY && (
                      <div style={{ color: '#ff6b6b', fontFamily: '"VT323", monospace', fontSize: '1.2rem' }}>
                        ⚠️ Inventory Full! Use Now or Discard a Saved Card.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 8.5 INVENTORY OVERLAY */}
          {showInventory && (
            <div className="fate-overlay">
              <div className="card panel" style={{
                maxWidth: '600px',
                textAlign: 'center',
                border: '8px solid #ffd700',
                padding: '30px',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '16px'
              }}>
                <h2 style={{
                  color: '#ffd700',
                  fontFamily: '"VT323", monospace',
                  fontSize: '2.5rem',
                  textShadow: '3px 3px 0 #000',
                  marginBottom: '10px'
                }}>
                  📦 {mustSelectCard ? 'Select a Card for This Spin!' : 'Your Saved Cards'}
                </h2>

                {mustSelectCard && (
                  <p style={{ color: '#ff9800', fontSize: '1.1rem', marginBottom: '16px', fontFamily: '"VT323", monospace' }}>
                    ⚠️ You can select a card to activate its power, or spin with base odds.
                  </p>
                )}

                {cardInventory.length === 0 ? (
                  <p style={{ color: '#aaa', fontSize: '1.2rem' }}>No saved cards. Draw a card and choose "Save for Later"!</p>
                ) : (
                  <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {cardInventory.map((c) => (
                      <div key={c.inventoryId} style={{
                        background: c.rarity === 'rare' ? 'linear-gradient(135deg, #7b1fa2 0%, #4a0072 100%)' :
                          c.rarity === 'uncommon' ? 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)' :
                            c.rarity === 'event' ? 'linear-gradient(135deg, #ff6f00 0%, #e65100 100%)' :
                              'linear-gradient(135deg, #424242 0%, #212121 100%)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '3px solid #ffd700',
                        width: '200px',
                        color: '#fff'
                      }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{c.icon}</div>
                        <div style={{ fontFamily: '"VT323", monospace', fontSize: '1.4rem', marginBottom: '8px' }}>{c.label}</div>
                        <div style={{ fontSize: '0.9rem', marginBottom: '12px', opacity: 0.9 }}>{c.effect}</div>
                        <div style={{
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          marginBottom: '12px',
                          color: '#ffd700'
                        }}>
                          {c.rarity}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="btn"
                            style={{ background: '#2e7d32', padding: '8px 16px', fontSize: '0.9rem' }}
                            onClick={() => useCardFromInventory(c.inventoryId)}
                          >
                            ⚡ USE
                          </button>
                          {!mustSelectCard && (
                            <button
                              className="btn"
                              style={{ background: '#c62828', padding: '8px 16px', fontSize: '0.9rem' }}
                              onClick={() => discardCard(c.inventoryId)}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mustSelectCard && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ color: '#aaa', fontSize: '1rem', marginBottom: '12px', fontFamily: '"VT323", monospace' }}>— OR —</div>
                    <button
                      className="btn btn-xl"
                      style={{ background: '#ff5722' }}
                      onClick={() => {
                        playButtonSound();
                        setMustSelectCard(false);
                        setMessage('Spinning without a Fate Card - Base odds apply!');
                      }}
                    >
                      🎲 SPIN WITHOUT FATE
                    </button>
                  </div>
                )}

                {!mustSelectCard && (
                  <button
                    className="btn btn-xl"
                    style={{ marginTop: '24px', background: '#555' }}
                    onClick={() => { playButtonSound(); setShowInventory(false); }}
                  >
                    ← BACK
                  </button>
                )}
              </div>
            </div>
          )}

          {showResultPopup && lastResult && (
            <div className="fate-overlay">
              <ChestResult message={message} win={message.includes('WIN')} onClose={closeResultPopup} />
            </div>
          )}
        </div>
      )}
    </>
  );
}