import clickSound from '../assets/Pokemon (A Button) - Sound Effect (HD).mp3';
import buttonSoundFile from '../assets/buttonsound_viCuiozs.mp3';
import gameBonusFile from '../assets/game-bonus.mp3';
import rouletteSoundFile from '../assets/Roulette Sound.mp3';
import victorySoundFile from '../assets/victory-sound-effect_2.mp3';
import gameOverFile from '../assets/gameover_2.mp3';
import selectSoundFile from '../assets/select-sound-121244.mp3';
import boardButtonSoundFile from '../assets/button.mp3';

// Sound Instance Pool to reduce latency
const SFX_POOL = {};
const MAX_POOL_SIZE = 5; // Allow overlapping sounds for the same file

// Volume states (0 to 1)
let sfxVolume = parseFloat(localStorage.getItem('sfxVolume') || '1.0');
let bgmVolume = parseFloat(localStorage.getItem('bgmVolume') || '0.5');

const getSfxFromPool = (file) => {
    if (!SFX_POOL[file]) {
        SFX_POOL[file] = [];
    }

    // Find an available (paused) instance
    let instance = SFX_POOL[file].find(a => a.paused);

    if (!instance && SFX_POOL[file].length < MAX_POOL_SIZE) {
        instance = new Audio(file);
        instance.preload = 'auto';
        SFX_POOL[file].push(instance);
    } else if (!instance) {
        // If pool is full and all are playing, reuse the oldest one
        instance = SFX_POOL[file][0];
        instance.pause();
        instance.currentTime = 0;
    }

    return instance;
};

const playSound = (file, volumeMultiplier = 1) => {
    try {
        const audio = getSfxFromPool(file);
        audio.volume = sfxVolume * volumeMultiplier;
        audio.currentTime = 0;
        audio.play().catch(e => console.warn("Audio play failed", e));
        return audio;
    } catch (e) {
        console.error("Audio error", e);
    }
};

export const playClickSound = () => playSound(clickSound);
export const playButtonSound = () => playSound(buttonSoundFile);
export const playCardRevealSound = () => playSound(gameBonusFile);
export const playRouletteSpinSound = (startTime = 0) => {
    const audio = playSound(rouletteSoundFile);
    if (audio && startTime > 0) {
        audio.currentTime = startTime;
    }
    return audio;
};
export const playVictorySound = () => playSound(victorySoundFile);
export const playGameOverSound = () => playSound(gameOverFile);
export const playSelectSound = () => playSound(selectSoundFile);
export const playBoardButtonSound = () => playSound(boardButtonSoundFile);

// For Background Music
import menuMusicFile from '../assets/OMORI OST - 012 Trees....mp3';
import gameMusicFile from '../assets/Minish Woods - The Legend of Zelda_ The Minish Cap OST.mp3';

let currentBgm = null;
let currentType = null;

export const playBgm = (type) => {
    if (currentType === type && currentBgm && !currentBgm.paused) return;

    if (currentBgm) {
        currentBgm.pause();
        currentBgm = null;
    }

    currentType = type;
    const file = type === 'menu' ? menuMusicFile : gameMusicFile;
    currentBgm = new Audio(file);
    currentBgm.loop = true;
    currentBgm.volume = bgmVolume;
    currentBgm.play().catch(e => {
        console.warn("BGM play failed (interaction required?)", e);
    });
};

export const stopBgm = () => {
    if (currentBgm) {
        currentBgm.pause();
        currentBgm = null;
    }
};

// Volume controls
export const setSfxVolume = (vol) => {
    sfxVolume = vol;
    localStorage.setItem('sfxVolume', vol.toString());
};

export const setBgmVolume = (vol) => {
    bgmVolume = vol;
    if (currentBgm) {
        currentBgm.volume = vol;
    }
    localStorage.setItem('bgmVolume', vol.toString());
};

export const getSfxVolume = () => sfxVolume;
export const getBgmVolume = () => bgmVolume;
