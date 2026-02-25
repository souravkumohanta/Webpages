/* ===================================
   Global Variables
   =================================== */
let scrollTimer = null;
let player;
let playerState = 'UNSTARTED';
const YOUTUBE_VIDEO_ID = 'jwCVQ8EnKUA'; // Hanuman Chalisa

/* ===================================
   Font Size Control
   =================================== */
function setFontSize(size) {
  const el = document.getElementById('chalisaText');
  if (!el) return;

  const map = { 
    base: '1.05rem', 
    large: '1.35rem', 
    xl: '1.65rem', 
    xxl: '1.95rem' 
  };
  el.style.fontSize = map[size] || map.base;
  localStorage.setItem('fontSize', size);
}

/* ===================================
   Auto Scroll Functions
   =================================== */
function startAutoScroll() {
  stopAutoScroll();
  scrollTimer = setInterval(() => {
    window.scrollBy({ top: 1, behavior: 'smooth' });
  }, 20);
}

function stopAutoScroll() {
  if (scrollTimer) {
    clearInterval(scrollTimer);
    scrollTimer = null;
  }
}

/* ===================================
   Theme Toggle Functions
   =================================== */
function toggleTheme() {
  document.body.classList.toggle('theme-light');
  localStorage.setItem(
    'theme',
    document.body.classList.contains('theme-light') ? 'light' : 'dark'
  );
}

function toggleTextColor() {
  const root = document.documentElement;
  const current = getComputedStyle(root).getPropertyValue('--text').trim();
  const next = (current === '#000000' || current === 'rgb(0, 0, 0)') ? '#ffffff' : '#000000';
  root.style.setProperty('--text', next);
  localStorage.setItem('textColor', next);
}

function setThemeHue(hue) {
  const color = `hsl(${hue}, 85%, 55%)`;
  document.documentElement.style.setProperty('--accent', color);
  localStorage.setItem('accentHue', hue);
}

/* ===================================
   Color Picker Functions
   =================================== */
function setBgColor(color) {
  document.documentElement.style.setProperty('--bg', color);
  localStorage.setItem('bgColor', color);
}

function setCardColor(color) {
  document.documentElement.style.setProperty('--card', color);
  localStorage.setItem('cardColor', color);
}

/* ===================================
   YouTube Music Player
   =================================== */

// YouTube API callback - called when API is ready
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      loop: 1,
      playlist: YOUTUBE_VIDEO_ID, // Required for loop to work
      enablejsapi: 1,
      origin: window.location.origin
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
}

function onPlayerReady(event) {
  console.log('YouTube player is ready');
  playerState = 'READY';
  updateMusicButton();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    playerState = 'PLAYING';
  } else if (event.data === YT.PlayerState.PAUSED) {
    playerState = 'PAUSED';
  } else if (event.data === YT.PlayerState.ENDED) {
    playerState = 'ENDED';
  } else if (event.data === YT.PlayerState.BUFFERING) {
    playerState = 'BUFFERING';
  } else if (event.data === YT.PlayerState.CUED) {
    playerState = 'READY';
  }
  updateMusicButton();
}

function onPlayerError(event) {
  console.error('YouTube player error:', event.data);
  playerState = 'ERROR';
  updateMusicButton();
}

function toggleMusic() {
  if (!player || !player.playVideo) {
    console.log('Player not ready yet');
    playerState = 'NOT_READY';
    updateMusicButton();
    return;
  }

  const currentState = player.getPlayerState();
  
  if (currentState === YT.PlayerState.PLAYING || currentState === YT.PlayerState.BUFFERING) {
    player.pauseVideo();
    playerState = 'PAUSING';
  } else {
    player.playVideo();
    playerState = 'BUFFERING';
  }
  
  updateMusicButton();
}

function updateMusicButton() {
  const button = document.getElementById('musicButton');
  if (!button) return;

  switch(playerState) {
    case 'PLAYING':
      button.textContent = '⏸️ Pause Music';
      button.style.borderColor = 'var(--accent)';
      button.style.background = 'rgba(255, 183, 3, 0.15)';
      break;
    case 'BUFFERING':
      button.textContent = '⏳ Loading...';
      button.style.borderColor = 'var(--accent)';
      button.style.background = 'rgba(255, 183, 3, 0.1)';
      break;
    case 'PAUSED':
    case 'ENDED':
    case 'READY':
      button.textContent = '🎵 Play Music';
      button.style.borderColor = 'rgba(255, 255, 255, 0.25)';
      button.style.background = 'rgba(23, 23, 32, 0.9)';
      break;
    case 'PAUSING':
      button.textContent = '⏸️ Pausing...';
      button.style.borderColor = 'rgba(255, 255, 255, 0.25)';
      button.style.background = 'rgba(23, 23, 32, 0.9)';
      break;
    case 'ERROR':
      button.textContent = '❌ Error';
      button.style.borderColor = 'rgba(255, 50, 50, 0.5)';
      button.style.background = 'rgba(23, 23, 32, 0.9)';
      break;
    case 'NOT_READY':
    case 'UNSTARTED':
    default:
      button.textContent = '🎵 Play Music';
      button.style.borderColor = 'rgba(255, 255, 255, 0.25)';
      button.style.background = 'rgba(23, 23, 32, 0.9)';
  }
}

/* ===================================
   Restore User Preferences
   =================================== */
(function restorePrefs() {
  // Restore theme
  const theme = localStorage.getItem('theme');
  if (theme === 'light') document.body.classList.add('theme-light');

  // Restore text color
  const textColor = localStorage.getItem('textColor');
  if (textColor) document.documentElement.style.setProperty('--text', textColor);

  // Restore font size
  const fontSize = localStorage.getItem('fontSize');
  if (fontSize) setFontSize(fontSize);

  // Restore accent hue
  const hue = localStorage.getItem('accentHue');
  if (hue) setThemeHue(hue);

  // Restore background color
  const bgColor = localStorage.getItem('bgColor');
  const bgColorPicker = document.getElementById('bgColorPicker');
  if (bgColor && bgColorPicker) {
    document.documentElement.style.setProperty('--bg', bgColor);
    bgColorPicker.value = bgColor;
  } else if (bgColorPicker) {
    bgColorPicker.value = '#0f0f14';
  }

  // Restore card color
  const cardColor = localStorage.getItem('cardColor');
  const cardColorPicker = document.getElementById('cardColorPicker');
  if (cardColor && cardColorPicker) {
    document.documentElement.style.setProperty('--card', cardColor);
    cardColorPicker.value = cardColor;
  } else if (cardColorPicker) {
    cardColorPicker.value = '#171720';
  }
})();
