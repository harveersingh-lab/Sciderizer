// Sciderizer Sound Effects Controller (click sounds only - no background music)
class SoundEffectsSystem {
  constructor() {
    let saved = null;
    try { saved = localStorage.getItem('sciderizer_sound_enabled'); } catch (e) {}
    this.enabled = saved !== null ? JSON.parse(saved) : true;
    this.audioCtx = null;
    this.init();
  }

  init() {
    const start = () => {
      this.createToggleUI();
      this.bindEvents();
      this.syncHeaderHeight();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  }

  // Measure the fixed header so page content and #anchor jumps land in the right spot
  syncHeaderHeight() {
    const header = document.querySelector('.fixed-header-wrapper');
    if (!header) return;
    const update = () => {
      document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('load', () => {
      update();
      // If the page was opened with a #hash, re-align it now that the header size is known
      if (location.hash) {
        const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (el) el.scrollIntoView();
      }
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
  }

  getAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  createToggleUI() {
    const existingBtn = document.getElementById('soundToggleBtn');
    if (existingBtn) existingBtn.remove();

    const btn = document.createElement('button');
    btn.id = 'soundToggleBtn';
    btn.className = `sound-toggle-btn ${!this.enabled ? 'muted' : ''}`;
    btn.setAttribute('aria-label', 'Toggle sound effects');
    btn.innerHTML = `
      <span class="sound-icon">${this.enabled ? '🔊' : '🔇'}</span>
      <span class="sound-label">Sound FX: <strong>${this.enabled ? 'ON' : 'OFF'}</strong></span>
    `;
    document.body.appendChild(btn);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    try { localStorage.setItem('sciderizer_sound_enabled', JSON.stringify(this.enabled)); } catch (e) {}

    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
      btn.classList.toggle('muted', !this.enabled);
      btn.querySelector('.sound-icon').textContent = this.enabled ? '🔊' : '🔇';
      btn.querySelector('.sound-label').innerHTML = `Sound FX: <strong>${this.enabled ? 'ON' : 'OFF'}</strong>`;
    }

    if (this.enabled) this.playSFX('navbar');
  }

  playSFX(type = 'click') {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'navbar') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'option') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (err) {
      console.warn('Audio Context unlock required user gesture.', err);
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, .opt, .q-toggle, .tab-btn, .barebells-btn, .btn-pill, .test-start-btn');
      if (!target || target.id === 'soundToggleBtn') return;

      if (target.closest('.navbar')) {
        this.playSFX('navbar');
      } else if (target.classList.contains('opt')) {
        this.playSFX('option');
      } else {
        this.playSFX('click');
      }
    });
  }
}

const audioEngine = new SoundEffectsSystem();
