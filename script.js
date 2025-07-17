class BioWebsite {
    constructor() {
      this.entryOverlay = document.getElementById('entryOverlay');
      this.mainContent = document.getElementById('mainContent');
      this.audioControl = document.getElementById('audioControl');
      this.backgroundAudio = document.getElementById('backgroundAudio');
      this.backgroundVideo = document.getElementById('backgroundVideo');
      this.audioIcon = document.querySelector('.audio-icon');
  
      this.isAudioPlaying = false;
      this.isAudioMuted = false;
      this.hasEntered = false;
      this.hasVideoAudio = false;
      this.audioOperationInProgress = false;
  
      this.init();
    }
  
    init() {
      this.setupEventListeners();
      this.preloadAssets();
      this.setupAudioSettings();
    }
  
    setupEventListeners() {
      this.entryOverlay.addEventListener('click', () => this.enterSite());
      this.audioControl.addEventListener('click', () => this.toggleAudio());
  
      document.addEventListener('keydown', (e) => {
        if (!this.hasEntered && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          this.enterSite();
        }
  
        if (this.hasEntered && (e.key === 'm' || e.key === 'M')) {
          e.preventDefault();
          this.toggleAudio();
        }
      });
  
      if (this.backgroundVideo) {
        this.backgroundVideo.addEventListener('loadedmetadata', () => {
          this.hasVideoAudio =
            this.backgroundVideo.webkitAudioDecodedByteCount > 0 ||
            this.backgroundVideo.audioTracks?.length > 0 ||
            this.backgroundVideo.mozHasAudio === true;
  
          if (this.hasVideoAudio) {
            this.backgroundVideo.muted = true;
          }
        });
  
        this.backgroundVideo.addEventListener('canplay', () => {
          this.backgroundVideo.play().catch((e) => {});
        });
  
        this.backgroundVideo.addEventListener('error', (e) => {
          this.handleVideoError();
        });
  
        this.backgroundVideo.load();
      }
  
      this.backgroundAudio.addEventListener('canplaythrough', () => {});
  
      this.backgroundAudio.addEventListener('error', (e) => {
        if (!this.hasVideoAudio) {
          this.hideAudioControl();
        }
      });
  
      this.backgroundAudio.addEventListener('play', () => {
        this.isAudioPlaying = true;
        this.updateAudioIcon();
      });
  
      this.backgroundAudio.addEventListener('pause', () => {
        this.isAudioPlaying = false;
        this.updateAudioIcon();
      });
  
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.isAudioPlaying && !this.isAudioMuted) {
          this.backgroundAudio.pause();
        } else if (!document.hidden && this.isAudioPlaying && !this.isAudioMuted) {
          this.backgroundAudio.play().catch(() => {});
        }
      });
    }
  
    setupAudioSettings() {
      this.backgroundAudio.volume = 0.3;
      this.backgroundAudio.load();
    }
  
    preloadAssets() {
      const url = this.getBackgroundImageUrl();
      if (url) {
        const img = new Image();
        img.src = url;
      }
    }
  
    getBackgroundImageUrl() {
      const background = document.querySelector('.background-image');
      if (background) {
        const style = window.getComputedStyle(background);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
          return bgImage.slice(5, -2);
        }
      }
      return null;
    }
  
    async enterSite() {
      if (this.hasEntered) return;
      this.hasEntered = true;
  
      if (this.backgroundVideo) {
        this.backgroundVideo.muted = false;
  
        try {
          this.backgroundVideo.play().catch((e) => {});
          if (this.hasVideoAudio) {
            this.isAudioPlaying = true;
            this.isAudioMuted = false;
            this.updateAudioIcon();
          }
        } catch (e) {}
      }
  
      this.entryOverlay.classList.add('hidden');
      setTimeout(() => {
        this.entryOverlay.style.display = 'none';
      }, 800);
  
      this.startAudioPlayback();
    }
  
    async startAudioPlayback() {
      try {
        if (!this.backgroundAudio.src && this.backgroundAudio.children.length === 0) {
          this.hideAudioControl();
          return;
        }
  
        await this.backgroundAudio.play();
        this.isAudioPlaying = true;
        this.updateAudioIcon();
      } catch (e) {
        this.updateAudioIcon();
      }
    }
  
    async toggleAudio() {
      if (this.audioOperationInProgress) return;
      this.audioOperationInProgress = true;
  
      try {
        if (this.isAudioMuted) {
          await this.unmuteAudio();
        } else {
          await this.muteAudio();
        }
      } finally {
        this.audioOperationInProgress = false;
      }
    }
  
    async unmuteAudio() {
      try {
        this.isAudioMuted = false;
        this.audioControl.classList.remove('muted');
  
        if (this.backgroundVideo && this.hasVideoAudio) {
          this.backgroundVideo.muted = false;
          this.isAudioPlaying = true;
        }
  
        if (this.backgroundAudio.src || this.backgroundAudio.children.length > 0) {
          if (this.backgroundAudio.paused) {
            await this.backgroundAudio.play()
              .then(() => {
                this.isAudioPlaying = true;
              })
              .catch((e) => {});
          }
        }
  
        this.updateAudioIcon();
      } catch (e) {}
    }
  
    muteAudio() {
      this.isAudioMuted = true;
      this.audioControl.classList.add('muted');
  
      if (this.backgroundVideo && this.hasVideoAudio) {
        this.backgroundVideo.muted = true;
      }
  
      if (this.backgroundAudio.src || this.backgroundAudio.children.length > 0) {
        this.backgroundAudio.pause();
      }
  
      this.isAudioPlaying = false;
      this.updateAudioIcon();
    }
  
    updateAudioIcon() {
      if (this.isAudioMuted || !this.isAudioPlaying) {
        this.audioIcon.className = 'fas fa-volume-mute audio-icon';
      } else {
        this.audioIcon.className = 'fas fa-volume-up audio-icon';
      }
    }
  
    hideAudioControl() {
      this.audioControl.style.display = 'none';
    }
  
    changeBackground(type, source) {
      const container = document.querySelector('.background-container');
      container.innerHTML = '';
  
      switch (type) {
        case 'image':
        case 'gif':
          const imageDiv = document.createElement('div');
          imageDiv.className = 'background-image';
          imageDiv.style.backgroundImage = `url('${source}')`;
          container.appendChild(imageDiv);
          break;
        case 'video':
          const video = document.createElement('video');
          video.className = 'background-video';
          video.autoplay = true;
          video.muted = true;
          video.loop = true;
  
          const sourceElement = document.createElement('source');
          sourceElement.src = source;
          sourceElement.type = 'video/mp4';
  
          video.appendChild(sourceElement);
          container.appendChild(video);
          break;
      }
    }
  
    changeBackgroundColor(color) {
      document.body.style.backgroundColor = color;
    }
  
    changeAudioSource(audioUrl) {
      this.backgroundAudio.src = audioUrl;
      this.backgroundAudio.load();
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const bioWebsite = new BioWebsite();
    window.bioWebsite = bioWebsite;
  });
  
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  
  document.documentElement.style.scrollBehavior = 'smooth';
  
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    document.documentElement.style.setProperty('--reduced-motion', '1');
  }
  
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });
  
  window.customizeBio = {
    setBackgroundColor: (color) => {
      document.body.style.backgroundColor = color;
    },
  
    setBackground: (type, source) => {
      if (window.bioWebsite) {
        window.bioWebsite.changeBackground(type, source);
      }
    },
  
    setAudio: (audioUrl) => {
      if (window.bioWebsite) {
        window.bioWebsite.changeAudioSource(audioUrl);
      }
    },
  
    setButtonColors: (options = {}) => {
      const {
        buttonColor = 'rgba(255, 255, 255, 0.7)',
        buttonColorHover = 'rgba(255, 255, 255, 1)',
        buttonColorMuted = 'rgba(255, 255, 255, 0.4)',
        glowColor = '#ffffff',
        glowColorHover = '#00d4ff'
      } = options;
  
      const root = document.documentElement;
      root.style.setProperty('--button-color', buttonColor);
      root.style.setProperty('--button-color-hover', buttonColorHover);
      root.style.setProperty('--button-color-muted', buttonColorMuted);
      root.style.setProperty('--glow-color', glowColor);
      root.style.setProperty('--glow-color-hover', glowColorHover);
    },
  
    updateSocialLinks: (links) => {
      const container = document.querySelector('.social-container');
      container.innerHTML = '';
  
      links.forEach((link) => {
        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.className = 'social-icon';
        anchor.setAttribute('aria-label', link.text);
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
  
        const icon = document.createElement('i');
        icon.className = link.iconClass || 'fas fa-link';
        anchor.appendChild(icon);
  
        container.appendChild(anchor);
      });
    }
  };
  