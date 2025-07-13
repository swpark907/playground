document.addEventListener('DOMContentLoaded', function() {
    // AURORA SVG 데이터
    const auroraLetters = [
        {
            letter: 'A',
            path: 'M0.501563 36V7.2C0.501563 5.86666 0.818229 4.66666 1.45156 3.6C2.11823 2.5 2.9849 1.63333 4.05156 0.999998C5.15156 0.333332 6.36823 -1.43051e-06 7.70156 -1.43051e-06H29.2516C30.5849 -1.43051e-06 31.7849 0.333332 32.8516 0.999998C33.9516 1.63333 34.8349 2.5 35.5016 3.6C36.1682 4.66666 36.5016 5.86666 36.5016 7.2V36H29.2016V24.15H7.70156V36H0.501563ZM7.70156 16.95H29.2016V7.55C29.2016 7.45 29.1682 7.38333 29.1016 7.35C29.0682 7.28333 29.0016 7.25 28.9016 7.25H8.00156C7.90156 7.25 7.81823 7.28333 7.75156 7.35C7.71823 7.38333 7.70156 7.45 7.70156 7.55V16.95Z'
        },
        {
            letter: 'U',
            path: 'M7.69688 36C6.36354 36 5.14688 35.6833 4.04688 35.05C2.98021 34.3833 2.11354 33.5167 1.44688 32.45C0.813542 31.35 0.496875 30.1333 0.496875 28.8V-1.43051e-06H7.69688V28.45C7.69688 28.55 7.71354 28.6333 7.74688 28.7C7.81354 28.7333 7.89688 28.75 7.99688 28.75H28.8969C28.9969 28.75 29.0635 28.7333 29.0969 28.7C29.1635 28.6333 29.1969 28.55 29.1969 28.45V-1.43051e-06H36.4969V28.8C36.4969 30.1333 36.1635 31.35 35.4969 32.45C34.8302 33.5167 33.9469 34.3833 32.8469 35.05C31.7802 35.6833 30.5969 36 29.2969 36H7.69688Z'
        },
        {
            letter: 'R',
            path: 'M28.9701 36L18.3201 23.3H27.7701L36.5701 33.75V36H28.9701ZM0.670117 36V0.0499979H29.4201C30.7535 0.0499979 31.9535 0.383331 33.0201 1.05C34.1201 1.68333 35.0035 2.55 35.6701 3.65C36.3368 4.75 36.6701 5.95 36.6701 7.25V16.75C36.6701 18.05 36.3368 19.25 35.6701 20.35C35.0035 21.4167 34.1201 22.2833 33.0201 22.95C31.9535 23.5833 30.7535 23.9 29.4201 23.9L7.87012 23.95V36H0.670117ZM8.17012 16.65H29.0701C29.1701 16.65 29.2368 16.6333 29.2701 16.6C29.3368 16.5333 29.3701 16.4667 29.3701 16.4V7.55C29.3701 7.45 29.3368 7.38333 29.2701 7.35C29.2368 7.28333 29.1701 7.25 29.0701 7.25H8.17012C8.07012 7.25 7.98678 7.28333 7.92012 7.35C7.88678 7.38333 7.87012 7.45 7.87012 7.55V16.4C7.87012 16.4667 7.88678 16.5333 7.92012 16.6C7.98678 16.6333 8.07012 16.65 8.17012 16.65Z'
        },
        {
            letter: 'O',
            path: 'M7.69688 36C6.36354 36 5.14688 35.6833 4.04688 35.05C2.98021 34.3833 2.11354 33.5167 1.44688 32.45C0.813542 31.35 0.496875 30.1333 0.496875 28.8V7.2C0.496875 5.86666 0.813542 4.66666 1.44688 3.6C2.11354 2.5 2.98021 1.63333 4.04688 0.999998C5.14688 0.333332 6.36354 -1.43051e-06 7.69688 -1.43051e-06H29.2969C30.5969 -1.43051e-06 31.7802 0.333332 32.8469 0.999998C33.9469 1.63333 34.8302 2.5 35.4969 3.6C36.1635 4.66666 36.4969 5.86666 36.4969 7.2V28.8C36.4969 30.1333 36.1635 31.35 35.4969 32.45C34.8302 33.5167 33.9469 34.3833 32.8469 35.05C31.7802 35.6833 30.5969 36 29.2969 36H7.69688ZM7.99688 28.75H28.8969C28.9969 28.75 29.0635 28.7333 29.0969 28.7C29.1635 28.6333 29.1969 28.55 29.1969 28.45V7.55C29.1969 7.45 29.1635 7.38333 29.0969 7.35C29.0635 7.28333 28.9969 7.25 28.8969 7.25H7.99688C7.89688 7.25 7.81354 7.28333 7.74688 7.35C7.71354 7.38333 7.69688 7.45 7.69688 7.55V28.45C7.69688 28.55 7.71354 28.6333 7.74688 28.7C7.81354 28.7333 7.89688 28.75 7.99688 28.75Z'
        },
        {
            letter: 'R',
            path: 'M28.9701 36L18.3201 23.3H27.7701L36.5701 33.75V36H28.9701ZM0.670117 36V0.0499979H29.4201C30.7535 0.0499979 31.9535 0.383331 33.0201 1.05C34.1201 1.68333 35.0035 2.55 35.6701 3.65C36.3368 4.75 36.6701 5.95 36.6701 7.25V16.75C36.6701 18.05 36.3368 19.25 35.6701 20.35C35.0035 21.4167 34.1201 22.2833 33.0201 22.95C31.9535 23.5833 30.7535 23.9 29.4201 23.9L7.87012 23.95V36H0.670117ZM8.17012 16.65H29.0701C29.1701 16.65 29.2368 16.6333 29.2701 16.6C29.3368 16.5333 29.3701 16.4667 29.3701 16.4V7.55C29.3701 7.45 29.3368 7.38333 29.2701 7.35C29.2368 7.28333 29.1701 7.25 29.0701 7.25H8.17012C8.07012 7.25 7.98678 7.28333 7.92012 7.35C7.88678 7.38333 7.87012 7.45 7.87012 7.55V16.4C7.87012 16.4667 7.88678 16.5333 7.92012 16.6C7.98678 16.6333 8.07012 16.65 8.17012 16.65Z'
        },
        {
            letter: 'A',
            path: 'M0.501563 36V7.2C0.501563 5.86666 0.818229 4.66666 1.45156 3.6C2.11823 2.5 2.9849 1.63333 4.05156 0.999998C5.15156 0.333332 6.36823 -1.43051e-06 7.70156 -1.43051e-06H29.2516C30.5849 -1.43051e-06 31.7849 0.333332 32.8516 0.999998C33.9516 1.63333 34.8349 2.5 35.5016 3.6C36.1682 4.66666 36.5016 5.86666 36.5016 7.2V36H29.2016V24.15H7.70156V36H0.501563ZM7.70156 16.95H29.2016V7.55C29.2016 7.45 29.1682 7.38333 29.1016 7.35C29.0682 7.28333 29.0016 7.25 28.9016 7.25H8.00156C7.90156 7.25 7.81823 7.28333 7.75156 7.35C7.71823 7.38333 7.70156 7.45 7.70156 7.55V16.95Z'
        }
    ];

    // 메인 텍스트 생성
    function createMainText() {
        const mainAurora = document.getElementById('main-aurora');
        
        if (!mainAurora) {
            console.error('main-aurora 요소를 찾을 수 없습니다!');
            return;
        }

        auroraLetters.forEach((letterData, index) => {
            const svg = document.createElement('svg');
            svg.className = 'letter-svg';
            svg.setAttribute('viewBox', '0 0 37 36');
            svg.setAttribute('data-letter', letterData.letter);
            
            const path = document.createElement('path');
            path.setAttribute('d', letterData.path);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'white');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            // 손글씨 애니메이션을 위한 속성 추가
            path.setAttribute('stroke-dasharray', '1000');
            path.setAttribute('stroke-dashoffset', '1000');
            
            svg.appendChild(path);
            mainAurora.appendChild(svg);
        });
    }

    // 서브 텍스트 생성
    function createSubText() {
        for (let i = 1; i <= 4; i++) {
            const subElement = document.getElementById(`sub-${i}`);
            
            if (!subElement) {
                console.error(`sub-${i} 요소를 찾을 수 없습니다!`);
                continue;
            }

            const handwrittenDiv = document.createElement('div');
            handwrittenDiv.className = 'handwritten-text';
            
            auroraLetters.forEach((letterData, index) => {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('class', 'letter-svg');
                svg.setAttribute('viewBox', '0 0 37 36');
                svg.setAttribute('data-letter', letterData.letter);
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', letterData.path);
                
                svg.appendChild(path);
                handwrittenDiv.appendChild(svg);
                
                // DOM에 추가된 후 실제 path 길이 계산하여 애니메이션 설정
                const pathLength = path.getTotalLength();
                path.style.strokeDasharray = pathLength;
                path.style.strokeDashoffset = pathLength;
            });
            
            subElement.appendChild(handwrittenDiv);
            console.log(`sub-${i} 생성 완료, SVG 개수:`, handwrittenDiv.children.length);
        }
    }

    // 메인 텍스트 애니메이션 적용
    function initMainTextAnimation() {
        const mainTextPaths = document.querySelectorAll('.main-text .letter-svg path');
        mainTextPaths.forEach(path => {
            const pathLength = path.getTotalLength();
            path.style.strokeDasharray = pathLength;
            path.style.strokeDashoffset = pathLength;
        });
    }
    
    // 텍스트 생성
    initMainTextAnimation(); // 메인 텍스트 애니메이션 초기화
    createSubText();
    
    // 영사기 깜빡임 효과 추가 (1초에 3번)
    function addProjectorFlicker() {
        const card = document.querySelector('.cinema-card');
        const flicker = document.createElement('div');
        flicker.className = 'projector-flicker';
        flicker.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.05);
            pointer-events: none;
            z-index: 20;
            opacity: 0;
            animation: projectorFlicker 0.33s linear infinite;
        `;
        card.appendChild(flicker);
    }
    
    // 필름 노이즈 효과 추가
    function addFilmNoise() {
        const overlay = document.querySelector('.overlay');
        const noise = document.createElement('div');
        noise.className = 'film-noise';
        noise.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/><circle cx="90" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/><circle cx="20" cy="80" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="90" r="1" fill="white" opacity="0.1"/></svg>');
            animation: noise 0.5s linear infinite;
            pointer-events: none;
            z-index: 3;
        `;
        overlay.appendChild(noise);
    }
    
    // 필름 구멍 효과 추가
    function addFilmPerforations() {
        const card = document.querySelector('.cinema-card');
        const perforations = document.createElement('div');
        perforations.className = 'film-perforations';
        perforations.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
                to bottom,
                transparent 0px,
                transparent 45px,
                rgba(255, 255, 255, 0.05) 45px,
                rgba(255, 255, 255, 0.05) 55px
            );
            pointer-events: none;
            z-index: 4;
        `;
        card.appendChild(perforations);
    }
    
    // 먼지 효과 추가 (dust: 10)
    function addDustParticles() {
        const card = document.querySelector('.cinema-card');
        const dustCount = 10; // dust 수치
        
        for (let i = 0; i < dustCount; i++) {
            const dust = document.createElement('div');
            dust.className = 'dust-particle';
            dust.style.cssText = `
                left: ${Math.random() * 100}%;
                animation-duration: ${3 + Math.random() * 4}s;
                animation-delay: ${Math.random() * 5}s;
                opacity: ${0.1 + Math.random() * 0.2};
            `;
            card.appendChild(dust);
        }
    }
    
    // 머리카락/흠집 효과 추가 (hair: 10)
    function addHairLines() {
        const card = document.querySelector('.cinema-card');
        const hairCount = 10; // hair 수치
        
        for (let i = 0; i < hairCount; i++) {
            const hair = document.createElement('div');
            hair.className = 'hair-line';
            hair.style.cssText = `
                left: ${Math.random() * 100}%;
                animation-duration: ${4 + Math.random() * 6}s;
                animation-delay: ${Math.random() * 8}s;
                opacity: ${0.1 + Math.random() * 0.1};
                transform: rotate(${-10 + Math.random() * 20}deg);
            `;
            card.appendChild(hair);
        }
    }
    
    // 필름 그레인 효과 추가
    function addFilmGrain() {
        const card = document.querySelector('.cinema-card');
        const grain = document.createElement('div');
        grain.className = 'film-grain';
        card.appendChild(grain);
    }
    
    // 명함 상태 관리
    let isDetailsView = false;
    let particleInterval;
    
    // 명함 클릭 이벤트
    function initCardClickEvent() {
        const card = document.querySelector('.cinema-card');
        card.addEventListener('click', toggleCardView);
        card.style.cursor = 'pointer';
    }
    
    // 명함 뷰 토글
    function toggleCardView() {
        if (isDetailsView) {
            showNormalView();
        } else {
            showDetailsView();
        }
        isDetailsView = !isDetailsView;
    }
    
    // 일반 뷰 표시
    function showNormalView() {
        const details = document.getElementById('businessCardDetails');
        const mainContent = document.querySelectorAll('.main-text, .sub-text, .vertical-text');
        const card = document.querySelector('.cinema-card');
        
        // 명함 세부정보 숨기기
        details.classList.remove('active');
        card.classList.remove('details-active');
        
        // 애니메이션 리셋
        setTimeout(() => {
            resetAnimations();
        }, 300);
        
        // 메인 콘텐츠 fade in
        setTimeout(() => {
            mainContent.forEach(el => {
                el.style.opacity = '1';
                el.style.transition = 'opacity 0.8s ease-in-out';
            });
            
            // 특수효과 다시 시작
            startParticleEffects();
        }, 400);
    }
    
    // 세부정보 뷰 표시
    function showDetailsView() {
        const details = document.getElementById('businessCardDetails');
        const mainContent = document.querySelectorAll('.main-text, .sub-text, .vertical-text');
        const card = document.querySelector('.cinema-card');
        
        // 메인 콘텐츠 fade out
        mainContent.forEach(el => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.6s ease-in-out';
        });
        
        // 특수효과 중지
        stopParticleEffects();
        
        // 명함 세부정보 표시
        setTimeout(() => {
            details.classList.add('active');
            card.classList.add('details-active');
            resetAnimations();
        }, 600);
    }
    
    // 애니메이션 리셋
    function resetAnimations() {
        // 렌즈 애니메이션 리셋
        const lensCircles = document.querySelectorAll('.lens-circle');
        const curvedTexts = document.querySelectorAll('.curved-text');
        
        lensCircles.forEach(circle => {
            circle.style.animation = 'none';
            circle.offsetHeight; // 리플로우 강제 실행
            circle.style.animation = null;
        });
        
        curvedTexts.forEach(text => {
            text.style.animation = 'none';
            text.offsetHeight; // 리플로우 강제 실행
            text.style.animation = null;
        });
        
        // 메인 텍스트 애니메이션 리셋
        if (!isDetailsView) {
            const mainTextPaths = document.querySelectorAll('.main-text .letter-svg path');
            mainTextPaths.forEach(path => {
                const pathLength = path.getTotalLength();
                path.style.strokeDasharray = pathLength;
                path.style.strokeDashoffset = pathLength;
                path.style.animation = 'none';
                path.offsetHeight; // 리플로우 강제 실행
                path.style.animation = null;
            });
        }
    }
    
    // 특수효과 시작
    function startParticleEffects() {
        addProjectorFlicker();
        addFilmNoise();
        addDustParticles();
        addHairLines();
        addFilmGrain();
        
        // 주기적으로 먼지와 머리카락 효과 갱신
        particleInterval = setInterval(() => {
            document.querySelectorAll('.dust-particle, .hair-line').forEach(el => el.remove());
            addDustParticles();
            addHairLines();
        }, 12000);
    }
    
    // 특수효과 중지
    function stopParticleEffects() {
        if (particleInterval) {
            clearInterval(particleInterval);
        }
        
        // 기존 특수효과 요소들 fade out
        const effects = document.querySelectorAll('.projector-flicker, .film-noise, .dust-particle, .hair-line, .film-grain');
        effects.forEach(el => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.6s ease-in-out';
            setTimeout(() => {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            }, 600);
        });
    }
    
    // 초기화
    initCardClickEvent();
    startParticleEffects();
    
    // 메인 텍스트는 한 번만 써지고 계속 유지
});

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes noise {
        0% { opacity: 0.1; transform: translateX(0); }
        25% { opacity: 0.2; transform: translateX(-1px); }
        50% { opacity: 0.1; transform: translateX(1px); }
        75% { opacity: 0.2; transform: translateX(-1px); }
        100% { opacity: 0.1; transform: translateX(0); }
    }
    
    @keyframes projectorFlicker {
        0% { opacity: 0; }
        15% { opacity: 0; }
        20% { opacity: 0.3; }
        25% { opacity: 0; }
        30% { opacity: 0; }
        35% { opacity: 0.1; }
        40% { opacity: 0; }
        50% { opacity: 0; }
        55% { opacity: 0.2; }
        60% { opacity: 0; }
        70% { opacity: 0; }
        75% { opacity: 0.15; }
        80% { opacity: 0; }
        100% { opacity: 0; }
    }
    

    
    .main-text {
        animation: textGlow 4s ease-in-out infinite alternate;
    }
    
    @keyframes textGlow {
        0% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            filter: brightness(1);
        }
        25% {
            text-shadow: 0 0 25px rgba(255, 255, 255, 0.6);
            filter: brightness(1.05);
        }
        50% {
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
            filter: brightness(1.1);
        }
        75% {
            text-shadow: 0 0 25px rgba(255, 255, 255, 0.6);
            filter: brightness(1.05);
        }
        100% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            filter: brightness(1);
        }
    }
`;
document.head.appendChild(style); 