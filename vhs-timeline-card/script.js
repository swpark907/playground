class VHSTimelineCard {
    constructor() {
        this.currentTime = 1;
        this.maxTime = 21;
        this.isPlaying = false;
        this.playInterval = null;
        this.scenes = [
            { id: 'scene-1', time: 1, duration: 4 },
            { id: 'scene-2', time: 5, duration: 5 },
            { id: 'scene-3', time: 10, duration: 5 },
            { id: 'scene-4', time: 15, duration: 3 },
            { id: 'scene-5', time: 18, duration: 3 }
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
        this.showScene(1);
        this.autoPlay();
    }

    bindEvents() {
        // Control buttons
        document.getElementById('play-btn').addEventListener('click', () => this.play());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('rewind-btn').addEventListener('click', () => this.rewind());
        document.getElementById('forward-btn').addEventListener('click', () => this.forward());

        // Timeline markers
        document.querySelectorAll('.marker').forEach(marker => {
            marker.addEventListener('click', (e) => {
                const time = parseInt(e.target.dataset.time);
                this.goToTime(time);
            });
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.isPlaying ? this.pause() : this.play();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.rewind();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.forward();
                    break;
            }
        });
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        // Update timer
        document.getElementById('timer').textContent = this.formatTime(this.currentTime);
        
        // Update timeline progress
        const progressPercent = (this.currentTime / this.maxTime) * 100;
        document.getElementById('timeline-progress').style.width = `${progressPercent}%`;
        
        // Update button states
        document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
        if (this.isPlaying) {
            document.getElementById('play-btn').classList.add('active');
        } else {
            document.getElementById('pause-btn').classList.add('active');
        }
        
        // Update timeline markers
        document.querySelectorAll('.marker').forEach(marker => {
            marker.classList.remove('active');
            const markerTime = parseInt(marker.dataset.time);
            if (markerTime <= this.currentTime) {
                marker.classList.add('active');
            }
        });
        
        // Update VHS header indicators
        this.updateHeaderIndicators();
    }

    updateHeaderIndicators() {
        const playIndicator = document.querySelector('.play-indicator');
        const recIndicator = document.querySelector('.rec-indicator');
        
        if (this.isPlaying) {
            playIndicator.textContent = 'PLAY ▷';
            playIndicator.style.color = '#ff0000';
            recIndicator.style.display = 'inline';
        } else {
            playIndicator.textContent = 'PAUSE ⏸';
            playIndicator.style.color = '#ffff00';
            recIndicator.style.display = 'none';
        }
    }

    showScene(time) {
        // Hide all scenes
        document.querySelectorAll('.scene').forEach(scene => {
            scene.classList.remove('active');
        });

        // Find and show current scene
        const currentScene = this.scenes.find(scene => 
            time >= scene.time && time < scene.time + scene.duration
        );

        if (currentScene) {
            const sceneElement = document.getElementById(currentScene.id);
            if (sceneElement) {
                sceneElement.classList.add('active');
                this.animateSceneEntry(sceneElement);
            }
        }
    }

    animateSceneEntry(sceneElement) {
        // Add special entry animations based on scene
        const sceneId = sceneElement.id;
        
        switch(sceneId) {
            case 'scene-1':
                this.animateVHSNoise();
                break;
            case 'scene-2':
                this.animateTapeLabel();
                break;
            case 'scene-3':
                this.animateSubtitles();
                break;
            case 'scene-4':
                this.animatePortfolio();
                break;
            case 'scene-5':
                this.animateBusinessCard();
                break;
        }
    }

    animateVHSNoise() {
        const staticElement = document.querySelector('.static');
        const glitchText = document.querySelector('.glitch-text');
        
        // Remove infinite animations, add one-time effect
        if (staticElement) {
            staticElement.style.animation = 'none';
            staticElement.style.background = 'rgba(255, 255, 255, 0.05)';
        }
        
        // Fix typewriter effect - only run once per scene entry
        if (glitchText && !glitchText.dataset.typed) {
            glitchText.textContent = ''; // Clear first
            this.typewriterEffect(glitchText, '테이프 재생 중...');
            glitchText.dataset.typed = 'true';
        }
    }

    animateTapeLabel() {
        const tapeLabel = document.querySelector('.vhs-tape-label');
        const labelRows = document.querySelectorAll('.label-row');
        
        // Remove infinite animations
        if (tapeLabel) {
            tapeLabel.style.animation = 'tapeSlideIn 1.5s ease-out';
        }
        
        // Animate each row with delay - one time only
        labelRows.forEach((row, index) => {
            if (!row.dataset.animated) {
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    row.style.transition = 'all 0.5s ease-out';
                    row.style.opacity = '1';
                    row.style.transform = 'translateX(0)';
                    row.dataset.animated = 'true';
                }, 300 + (index * 100));
            }
        });
    }

    animateSubtitles() {
        const subtitleElements = document.querySelectorAll('.subtitle-box > *');
        const techItems = document.querySelectorAll('.tech-item');
        
        // One-time subtitle animation
        subtitleElements.forEach((element, index) => {
            if (!element.dataset.animated) {
                element.style.animation = `subtitleSlide 1s ease-out ${index * 0.3}s both`;
                element.dataset.animated = 'true';
            }
        });
        
        // Remove infinite glow, add one-time effect
        techItems.forEach((item, index) => {
            if (!item.dataset.animated) {
                item.style.animation = 'none';
                setTimeout(() => {
                    item.style.transform = 'scale(1.05)';
                    item.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.6)';
                    setTimeout(() => {
                        item.style.transform = 'scale(1)';
                        item.style.boxShadow = '0 0 3px rgba(0, 255, 0, 0.3)';
                    }, 200);
                    item.dataset.animated = 'true';
                }, 1000 + (index * 100));
            }
        });
    }

    animatePortfolio() {
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach((item, index) => {
            if (!item.dataset.animated) {
                // Reset animation
                item.style.animation = 'none';
                item.style.opacity = '0';
                item.style.transform = 'translateX(-30px)';
                
                setTimeout(() => {
                    item.style.transition = 'all 0.8s ease-out';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                    item.dataset.animated = 'true';
                }, index * 200);
            }
        });
    }

    animateBusinessCard() {
        const businessCard = document.querySelector('.business-card');
        const contactItems = document.querySelectorAll('.contact-item');
        const statusIndicator = document.querySelector('.status-indicator');
        
        // One-time card animation
        if (businessCard && !businessCard.dataset.animated) {
            businessCard.style.animation = 'cardFlip 1s ease-out';
            businessCard.dataset.animated = 'true';
        }
        
        // One-time contact items animation
        contactItems.forEach((item, index) => {
            if (!item.dataset.animated) {
                item.style.opacity = '0';
                item.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease-out';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    item.dataset.animated = 'true';
                }, 800 + (index * 100));
            }
        });
        
        // Remove infinite pulse, add one-time effect
        if (statusIndicator && !statusIndicator.dataset.animated) {
            statusIndicator.style.animation = 'none';
            setTimeout(() => {
                statusIndicator.style.color = '#ff0000';
                setTimeout(() => {
                    statusIndicator.style.color = '#00ff00';
                    statusIndicator.dataset.animated = 'true';
                }, 300);
            }, 1200);
        }
    }

    typewriterEffect(element, text) {
        element.textContent = '';
        let i = 0;
        const typeInterval = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(typeInterval);
            }
        }, 150);
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.playInterval = setInterval(() => {
                this.currentTime++;
                this.updateDisplay();
                this.showScene(this.currentTime);
                
                if (this.currentTime >= this.maxTime) {
                    this.pause();
                    this.currentTime = this.maxTime;
                }
            }, 1000);
            this.updateDisplay();
        }
    }

    pause() {
        this.isPlaying = false;
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
        this.updateDisplay();
    }

    rewind() {
        this.pause();
        this.currentTime = Math.max(1, this.currentTime - 5);
        this.updateDisplay();
        this.showScene(this.currentTime);
        
        // Add rewind visual effect
        this.addRewindEffect();
    }

    forward() {
        this.pause();
        this.currentTime = Math.min(this.maxTime, this.currentTime + 5);
        this.updateDisplay();
        this.showScene(this.currentTime);
        
        // Add fast forward visual effect
        this.addFastForwardEffect();
    }

    goToTime(time) {
        this.pause();
        this.currentTime = time;
        this.resetAnimationStates();
        this.updateDisplay();
        this.showScene(this.currentTime);
    }

    autoPlay() {
        // Start automatic playback after a short delay
        setTimeout(() => {
            this.play();
        }, 500);
    }

    addRewindEffect() {
        // Add visual rewind effect
        const mainContent = document.querySelector('.main-content');
        mainContent.style.filter = 'blur(2px) brightness(0.8)';
        mainContent.style.transform = 'scaleX(-1)';
        
        setTimeout(() => {
            mainContent.style.filter = '';
            mainContent.style.transform = '';
        }, 300);
    }

    addFastForwardEffect() {
        // Add visual fast forward effect
        const mainContent = document.querySelector('.main-content');
        mainContent.style.filter = 'blur(1px) contrast(1.2)';
        mainContent.style.transform = 'scaleX(1.02)';
        
        setTimeout(() => {
            mainContent.style.filter = '';
            mainContent.style.transform = '';
        }, 300);
    }

    addGlitchEffect() {
        // Random glitch effect with multiple patterns
        const randomScene = document.querySelector('.scene.active');
        if (randomScene) {
            const glitchType = Math.floor(Math.random() * 4);
            
            switch(glitchType) {
                case 0: // Color shift glitch
                    randomScene.style.filter = 'hue-rotate(180deg) saturate(2)';
                    randomScene.style.transform = 'translate(1px, -1px)';
                    break;
                case 1: // RGB split glitch
                    randomScene.style.filter = 'contrast(1.5) brightness(1.2)';
                    randomScene.style.transform = 'skew(0.5deg, 0)';
                    break;
                case 2: // Digital noise glitch
                    randomScene.style.filter = 'grayscale(1) contrast(2)';
                    randomScene.style.transform = 'scale(1.002) translate(-1px, 1px)';
                    break;
                case 3: // Chromatic aberration
                    randomScene.style.filter = 'sepia(1) hue-rotate(300deg)';
                    randomScene.style.transform = 'translate(0.5px, -0.5px)';
                    break;
            }
            
            setTimeout(() => {
                randomScene.style.filter = '';
                randomScene.style.transform = '';
            }, 100 + Math.random() * 100); // Random duration between 100-200ms
        }
    }

    // Easter egg: Add occasional glitch effects
    startGlitchLoop() {
        setInterval(() => {
            if (Math.random() < 0.04 && this.isPlaying) { // 4% chance every interval
                this.addGlitchEffect();
            }
        }, 3000); // 3초마다 체크
    }

    resetAnimationStates() {
        // Reset all animation states so they can play again
        document.querySelectorAll('[data-typed]').forEach(el => {
            el.removeAttribute('data-typed');
        });
        document.querySelectorAll('[data-animated]').forEach(el => {
            el.removeAttribute('data-animated');
        });
        
        // Reset specific elements
        const glitchText = document.querySelector('.glitch-text');
        if (glitchText) {
            glitchText.textContent = '';
        }
    }
}

// Initialize the VHS Timeline Card when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const vhsCard = new VHSTimelineCard();
    
    // Start occasional glitch effects
    vhsCard.startGlitchLoop();
    
    // Add some ambient VHS sounds simulation (visual feedback only)
    document.addEventListener('click', (e) => {
        if (e.target.matches('.control-btn, .marker')) {
            // Visual feedback for button presses
            e.target.style.transform = 'scale(0.95)';
            setTimeout(() => {
                e.target.style.transform = '';
            }, 100);
        }
    });
    
    // Add loading complete message to console
    console.log('🎬 VHS Timeline Card Loaded');
    console.log('🎮 Controls: SPACE = Play/Pause, ← → = Rewind/Forward');
    console.log('📼 Film Director Portfolio Ready!');
}); 