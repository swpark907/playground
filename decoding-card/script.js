class SoftDecodeCard {
    constructor() {
        this.currentScreen = 'intro';
        this.decodingMessages = [
            '[INITIALIZING IDENTITY SCAN...]',
            '',
            '--> Signal corrupted.',
            '--> Attempting recovery...',
            '',
            '[RECOVERY SEQUENCE INITIATED]',
            '',
            '--> Scanning encrypted fragments... 23%',
            '--> Reconstructing data blocks... 58%',
            '--> Decrypting identity matrix... 73%',
            '--> Validating digital signature... 89%',
            '--> Cross-referencing neural patterns... 94%',
            '--> Identity verification: ✅ CONFIRMED',
            '',
            'Recovery complete. Loading profile...'
        ];
        this.messageIndex = 0;
        this.charIndex = 0;
        this.isTyping = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.addBackgroundNoise();
        console.log('SoftDecodeCard initialized'); // 디버깅용
    }

    bindEvents() {
        const startBtn = document.getElementById('start-decode-btn');
        const contactBtn = document.querySelector('.contact-btn');
        const downloadBtn = document.querySelector('.download-btn');
        const socialLinks = document.querySelectorAll('.social-link');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('Start decoding clicked'); // 디버깅용
                this.startDecoding();
            });
        }
        
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                this.showNotification('📧 Message sent successfully!');
            });
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.showNotification('📄 CV download started!');
            });
        }

        // 소셜 링크들
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const linkType = link.classList[1]; // github, linkedin, portfolio
                this.showNotification(`🔗 Opening ${linkType} profile...`);
            });
        });
    }

    addBackgroundNoise() {
        const intro = document.getElementById('intro-screen');
        if (!intro) return;
        
        const noiseDiv = document.createElement('div');
        noiseDiv.className = 'background-noise';
        noiseDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.03;
            background: repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(255, 198, 198, 0.1) 2px,
                rgba(255, 198, 198, 0.1) 4px
            );
            animation: noise 0.2s infinite linear;
            pointer-events: none;
        `;
        intro.appendChild(noiseDiv);

        // 노이즈 애니메이션 추가
        if (!document.getElementById('noise-style')) {
            const style = document.createElement('style');
            style.id = 'noise-style';
            style.textContent = `
                @keyframes noise {
                    0% { transform: translateX(0px); }
                    100% { transform: translateX(-4px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    startDecoding() {
        console.log('Starting decoding sequence'); // 디버깅용
        this.switchScreen('intro', 'decoding');
        setTimeout(() => {
            this.startTypingAnimation();
        }, 800);
    }

    switchScreen(fromScreen, toScreen) {
        console.log(`Switching from ${fromScreen} to ${toScreen}`); // 디버깅용
        
        // ID 매핑 처리
        const fromId = fromScreen === 'final-card' ? 'final-card' : `${fromScreen}-screen`;
        const toId = toScreen === 'final-card' ? 'final-card' : `${toScreen}-screen`;
        
        const from = document.getElementById(fromId);
        const to = document.getElementById(toId);
        
        if (!from || !to) {
            console.error(`Screen not found: ${fromId} or ${toId}`);
            return;
        }
        
        from.classList.remove('active');
        
        setTimeout(() => {
            to.classList.add('active');
            this.currentScreen = toScreen;
            console.log(`Screen switched to: ${toScreen}`); // 디버깅용
        }, 400);
    }

    startTypingAnimation() {
        console.log('Starting typing animation'); // 디버깅용
        this.isTyping = true;
        this.messageIndex = 0;
        this.charIndex = 0;
        
        const decodingText = document.getElementById('decoding-text');
        if (decodingText) {
            decodingText.innerHTML = '';
        }
        
        this.typeNextMessage();
    }

    typeNextMessage() {
        if (this.messageIndex >= this.decodingMessages.length) {
            console.log('All messages typed, completing decoding'); // 디버깅용
            this.completeDecoding();
            return;
        }

        const currentMessage = this.decodingMessages[this.messageIndex];
        
        if (currentMessage === '') {
            this.addLine('');
            this.messageIndex++;
            setTimeout(() => this.typeNextMessage(), 300);
            return;
        }

        this.typeMessage(currentMessage);
    }

    typeMessage(message) {
        if (this.charIndex === 0) {
            this.currentLine = this.addLine('');
        }

        if (this.charIndex < message.length) {
            this.currentLine.textContent += message.charAt(this.charIndex);
            this.charIndex++;
            
            const delay = this.getTypingDelay(message.charAt(this.charIndex - 1));
            setTimeout(() => this.typeMessage(message), delay);
        } else {
            this.charIndex = 0;
            this.messageIndex++;
            
            const nextDelay = this.getNextMessageDelay();
            setTimeout(() => this.typeNextMessage(), nextDelay);
        }
    }

    getTypingDelay(char) {
        if (char === ' ') return 30;
        if (['-', '>', '.', '[', ']', ':', '✔', '✅'].includes(char)) return 80;
        return 50;
    }

    getNextMessageDelay() {
        const currentMessage = this.decodingMessages[this.messageIndex - 1];
        
        if (currentMessage && (currentMessage.includes('✔') || currentMessage.includes('✅'))) {
            return 800;
        }
        
        if (currentMessage && currentMessage.includes('[') && currentMessage.includes(']')) {
            return 1000;
        }
        
        return 400;
    }

    addLine(text) {
        const decodingText = document.getElementById('decoding-text');
        if (!decodingText) return null;
        
        const line = document.createElement('div');
        line.textContent = text;
        
        // 특별한 스타일링
        if (text.includes('✔')) {
            line.style.color = '#90ee90';
        } else if (text.includes('✅')) {
            line.style.color = '#90ee90';
            line.style.fontWeight = 'bold';
        } else if (text.includes('[') && text.includes(']')) {
            line.style.color = '#ffc6c6';
            line.style.fontWeight = 'bold';
        } else if (text.includes('-->')) {
            line.style.color = '#a0a0a0';
        }
        
        decodingText.appendChild(line);
        decodingText.scrollTop = decodingText.scrollHeight;
        
        return line;
    }

    completeDecoding() {
        console.log('Completing decoding, preparing final card'); // 디버깅용
        this.isTyping = false;
        
        // 커서 숨기기
        const cursor = document.querySelector('.cursor-blink');
        if (cursor) {
            cursor.style.display = 'none';
        }
        
        // 최종 명함으로 전환
        setTimeout(() => {
            console.log('Switching to final card'); // 디버깅용
            this.switchScreen('decoding', 'final-card');
            
            // 화면 전환 후 카드 애니메이션 실행
            setTimeout(() => {
                this.animateCardEntrance();
            }, 500);
        }, 2000);
    }

    animateCardEntrance() {
        console.log('Animating card entrance'); // 디버깅용
        const card = document.querySelector('.business-card');
        
        if (!card) {
            console.error('Business card element not found');
            return;
        }
        
        // 초기 상태 설정
        card.style.transform = 'translateY(50px) rotateX(-10deg)';
        card.style.opacity = '0';
        
        // 애니메이션 실행
        setTimeout(() => {
            card.style.transition = 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.transform = 'translateY(0) rotateX(0deg)';
            card.style.opacity = '1';
            console.log('Card animation started'); // 디버깅용
        }, 100);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ffc6c6, #ffb3b3);
            color: #1a1e30;
            padding: 15px 25px;
            border-radius: 8px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.9rem;
            box-shadow: 0 8px 25px rgba(255, 198, 198, 0.3);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 전역 인스턴스 생성
let cardInstance = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing card'); // 디버깅용
    cardInstance = new SoftDecodeCard();
});

// 키보드 이벤트 (스페이스바로 빠른 전환)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && cardInstance) {
        e.preventDefault();
        if (cardInstance.currentScreen === 'intro') {
            cardInstance.startDecoding();
        }
    }
}); 