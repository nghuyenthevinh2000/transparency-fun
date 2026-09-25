/**
 * sound.js
 * Adaptive ambient audio controller for Transparency Fun.
 *
 * Supports multi-track playlists discovered dynamically without hardcoding track names:
 * 1. Checks published audio manifest (assets/tracks.json)
 * 2. Checks local directory listing with full HTML entity decoding (e.g. serve, python http.server)
 * 3. Falls back to canonical ambient.mp3 or assets directory
 *
 * When a song completes, automatically advances to the next track in the playlist.
 * Respects browser autoplay restrictions with graceful fade-in/fade-out
 * and preserves playback continuity across page navigation via sessionStorage.
 */

const AUDIO_EXT_REGEX = /\.(?:mp3|wav|ogg|m4a|aac|flac)$/i;

function decodeHtmlEntities(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Resolves the array of available audio track URLs adaptively.
 */
export async function resolveAudioPlaylist() {
  const assetsBase = new URL('./assets/', import.meta.url);
  const tracksJsonUrl = new URL('tracks.json', assetsBase).href;
  const assetsDirUrl = assetsBase.href;

  // Strategy 1: Fetch tracks.json manifest (structured, reliable across all environments)
  try {
    const manifestResponse = await fetch(tracksJsonUrl);
    if (manifestResponse.ok) {
      const data = await manifestResponse.json();
      const list = Array.isArray(data) ? data : data.tracks || (data.track ? [data.track] : []);
      const validTracks = list
        .filter((item) => typeof item === 'string' && AUDIO_EXT_REGEX.test(item.trim()))
        .map((item) => new URL(decodeURIComponent(item.trim()), assetsBase).href);
      if (validTracks.length > 0) {
        return validTracks;
      }
    }
  } catch {
    // Continue to next strategy
  }

  // Strategy 2: Check live directory listing with entity decoding (for dev servers like serve or python http.server)
  try {
    const dirResponse = await fetch(assetsDirUrl, { method: 'GET' });
    if (dirResponse.ok) {
      const contentType = dirResponse.headers.get('content-type') || '';
      if (contentType.includes('html')) {
        const rawHtml = await dirResponse.text();
        const unescapedHtml = decodeHtmlEntities(rawHtml);
        const linkRegex = /href=["']([^"']+\.(?:mp3|wav|ogg|m4a|aac|flac))["']/gi;
        const matches = Array.from(unescapedHtml.matchAll(linkRegex), (m) => m[1].split(/[?#]/)[0].trim());
        const validTracks = [];
        for (const m of matches) {
          if (AUDIO_EXT_REGEX.test(m) && !m.startsWith('&')) {
            const url = new URL(m, assetsBase).href;
            if (!validTracks.includes(url)) {
              validTracks.push(url);
            }
          }
        }
        if (validTracks.length > 0) {
          return validTracks;
        }
      }
    }
  } catch {
    // Continue to next strategy
  }

  // Strategy 3: Canonical ambient fallback
  return [new URL('ambient.mp3', assetsBase).href];
}

export function initSoundToggle({
  buttonId = 'sound-toggle',
  audioId = 'ambient-audio',
  storageKey = 'transparency_ambient_sound',
  targetVolume = 0.4,
  fadeDurationMs = 600,
} = {}) {
  const button = document.getElementById(buttonId);
  const audio = document.getElementById(audioId);
  if (!button || !audio) return;

  // Crucial: ensure audio.loop is false so the 'ended' event fires to advance to the next song
  audio.loop = false;

  const label = button.querySelector('.sound-label');
  let fadeInterval = null;
  let playlist = [];
  let currentIndex = 0;
  let playlistPromise = null;
  let consecutiveErrors = 0;

  const trackUrlKey = `${storageKey}_track_url`;
  const posKey = `${storageKey}_pos`;

  function getPlaylist() {
    if (!playlistPromise) {
      playlistPromise = resolveAudioPlaylist().then((list) => {
        playlist = list;
        const savedTrack = sessionStorage.getItem(trackUrlKey);
        if (savedTrack && playlist.includes(savedTrack)) {
          currentIndex = playlist.indexOf(savedTrack);
        } else {
          currentIndex = 0;
        }
        return playlist;
      });
    }
    return playlistPromise;
  }

  function fadeTo(toVol, duration, onComplete) {
    if (fadeInterval) clearInterval(fadeInterval);
    const stepTime = 30;
    const steps = Math.max(1, Math.round(duration / stepTime));
    const stepDelta = (toVol - audio.volume) / steps;

    fadeInterval = setInterval(() => {
      const next = audio.volume + stepDelta;
      if ((stepDelta > 0 && next >= toVol) || (stepDelta < 0 && next <= toVol)) {
        audio.volume = Math.max(0, Math.min(1, toVol));
        clearInterval(fadeInterval);
        fadeInterval = null;
        if (onComplete) onComplete();
      } else {
        audio.volume = Math.max(0, Math.min(1, next));
      }
    }, stepTime);
  }

  function setPlayingUI() {
    button.classList.add('is-playing');
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('aria-label', 'Pause ambient background music');
    if (label) label.textContent = 'SOUND: ON';
  }

  function setPausedUI() {
    button.classList.remove('is-playing');
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', 'Play ambient background music');
    if (label) label.textContent = 'SOUND: OFF';
  }

  async function loadCurrentTrack(preservePosition = false) {
    await getPlaylist();
    if (!playlist.length) return;

    const targetUrl = playlist[currentIndex];
    if (audio.src !== targetUrl) {
      audio.src = targetUrl;
      sessionStorage.setItem(trackUrlKey, targetUrl);

      if (preservePosition) {
        const savedPos = sessionStorage.getItem(posKey);
        if (savedPos && !isNaN(Number(savedPos))) {
          audio.currentTime = Number(savedPos);
        } else {
          audio.currentTime = 0;
        }
      } else {
        audio.currentTime = 0;
        sessionStorage.setItem(posKey, '0');
      }
    }
  }

  async function playSound(preservePosition = true) {
    try {
      await loadCurrentTrack(preservePosition);
      audio.volume = 0;
      await audio.play();
      consecutiveErrors = 0;
      setPlayingUI();
      sessionStorage.setItem(storageKey, 'playing');
      fadeTo(targetVolume, fadeDurationMs);
    } catch (err) {
      console.warn('Audio playback could not start:', err);
      setPausedUI();
      sessionStorage.setItem(storageKey, 'paused');
    }
  }

  function pauseSound() {
    sessionStorage.setItem(storageKey, 'paused');
    setPausedUI();
    fadeTo(0, Math.min(300, fadeDurationMs / 2), () => {
      audio.pause();
    });
  }

  async function playNextTrack() {
    if (!playlist.length) await getPlaylist();
    if (playlist.length > 1) {
      currentIndex = (currentIndex + 1) % playlist.length;
      sessionStorage.setItem(posKey, '0');
      await playSound(false);
    } else if (playlist.length === 1) {
      audio.currentTime = 0;
      sessionStorage.setItem(posKey, '0');
      await playSound(false);
    }
  }

  // When a track completes, advance to the next song in the playlist!
  audio.addEventListener('ended', () => {
    playNextTrack();
  });

  // If a track errors out, try the next song in the playlist
  audio.addEventListener('error', () => {
    consecutiveErrors++;
    if (playlist.length > 1 && consecutiveErrors < playlist.length) {
      currentIndex = (currentIndex + 1) % playlist.length;
      loadCurrentTrack(false).then(() => {
        if (sessionStorage.getItem(storageKey) === 'playing') {
          playSound(false);
        }
      });
    } else {
      setPausedUI();
    }
  });

  button.addEventListener('click', () => {
    if (audio.paused) {
      playSound(true);
    } else {
      pauseSound();
    }
  });

  // Track position for smooth cross-page playback continuity
  audio.addEventListener('timeupdate', () => {
    sessionStorage.setItem(posKey, String(audio.currentTime));
  });

  // Sound on by default unless explicitly paused by the user
  const isUserPaused = sessionStorage.getItem(storageKey) === 'paused';
  if (!isUserPaused) {
    sessionStorage.setItem(storageKey, 'playing');
    setPlayingUI();

    loadCurrentTrack(true).then(() => {
      audio.volume = 0;
      audio.play().then(() => {
        consecutiveErrors = 0;
        setPlayingUI();
        fadeTo(targetVolume, fadeDurationMs);
      }).catch(() => {
        // Modern browser autoplay restrictions block unmuted audio without user interaction.
        // Begin playing seamlessly on the visitor's first gesture anywhere on the document.
        const startOnFirstGesture = () => {
          if (sessionStorage.getItem(storageKey) !== 'paused' && audio.paused) {
            audio.play().then(() => {
              consecutiveErrors = 0;
              setPlayingUI();
              fadeTo(targetVolume, fadeDurationMs);
            }).catch(() => {});
          }
        };
        ['pointerdown', 'keydown', 'touchstart', 'click'].forEach((evt) => {
          window.addEventListener(evt, startOnFirstGesture, { once: true, passive: true });
        });
      });
    });
  } else {
    setPausedUI();
    // Pre-resolve track in background
    loadCurrentTrack(true).catch(() => {});
  }
}
