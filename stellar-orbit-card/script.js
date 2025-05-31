document.addEventListener('DOMContentLoaded', function() {
    // 행성 클릭 이벤트 처리
    const planets = document.querySelectorAll('.planet');
    const mainStar = document.querySelector('.main-star');
    
    planets.forEach((planet, index) => {
        const planetDot = planet.querySelector('.planet-dot');
        
        // 행성 클릭 시 메인 별 효과
        planetDot.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 메인 별에 펄스 효과 추가
            mainStar.style.animation = 'pulse 0.5s ease-in-out, pulse 4s infinite ease-in-out 0.5s';
            
            // 클릭된 행성에 특별한 효과
            planetDot.style.transform = 'translateX(-50%) scale(2)';
            planetDot.style.boxShadow = '0 0 30px currentColor';
            
            // 0.5초 후 원래 상태로 복원
            setTimeout(() => {
                planetDot.style.transform = 'translateX(-50%) scale(1)';
                planetDot.style.boxShadow = '0 0 10px currentColor';
                mainStar.style.animation = 'pulse 4s infinite ease-in-out';
            }, 500);
            
            // 콘솔에 포트폴리오 정보 출력 (실제 구현에서는 모달이나 페이지 이동으로 대체)
            const portfolioInfo = {
                0: { name: 'Branding', description: '브랜드 아이덴티티 디자인 프로젝트' },
                1: { name: 'AI App', description: '인공지능 기반 모바일 애플리케이션' },
                2: { name: 'Web Dev', description: '반응형 웹사이트 개발 프로젝트' },
                3: { name: 'UI/UX Design', description: '사용자 경험 중심의 인터페이스 디자인' },
                4: { name: 'Mobile App', description: '크로스 플랫폼 모바일 애플리케이션' }
            };
            
            console.log(`포트폴리오 선택: ${portfolioInfo[index].name} - ${portfolioInfo[index].description}`);
        });
        
        // 행성에 마우스 오버 시 궤도 하이라이트
        planetDot.addEventListener('mouseenter', function() {
            const orbitLine = document.querySelector('.orbit-line');
            orbitLine.style.borderColor = 'rgba(135, 206, 235, 0.6)';
            orbitLine.style.boxShadow = '0 0 20px rgba(135, 206, 235, 0.3)';
        });
        
        planetDot.addEventListener('mouseleave', function() {
            const orbitLine = document.querySelector('.orbit-line');
            orbitLine.style.borderColor = 'rgba(135, 206, 235, 0.3)';
            orbitLine.style.boxShadow = 'none';
        });
    });
    
    // 별자리 연결선에 애니메이션 효과 추가
    const constellationLines = document.querySelectorAll('.constellation-line');
    
    function animateConstellationLines() {
        constellationLines.forEach((line, index) => {
            setTimeout(() => {
                line.style.opacity = '0.8';
                line.style.boxShadow = '0 0 5px rgba(135, 206, 235, 0.5)';
                
                setTimeout(() => {
                    line.style.opacity = '1';
                    line.style.boxShadow = 'none';
                }, 1000);
            }, index * 500);
        });
    }
    
    // 페이지 로드 후 3초 뒤에 별자리 애니메이션 시작
    setTimeout(animateConstellationLines, 3000);
    
    // 10초마다 별자리 애니메이션 반복
    setInterval(animateConstellationLines, 10000);
    
    // 배경 별들에 랜덤 트윙클 효과 강화
    const backgroundStars = document.querySelectorAll('.star');
    
    function enhanceStarTwinkle() {
        backgroundStars.forEach(star => {
            const randomDelay = Math.random() * 5;
            const randomDuration = 2 + Math.random() * 3;
            
            star.style.animationDelay = `${randomDelay}s`;
            star.style.animationDuration = `${randomDuration}s`;
        });
    }
    
    // 별 트윙클 효과 초기화
    enhanceStarTwinkle();
    
    // 메인 별 클릭 시 전체 시스템 하이라이트
    mainStar.addEventListener('click', function() {
        // 리플 효과 트리거
        const ripple = this.querySelector('.ripple');
        
        // 기존 애니메이션이 있다면 제거
        ripple.classList.remove('active');
        
        // 강제로 리플로우를 발생시켜 클래스 제거를 즉시 적용
        ripple.offsetHeight;
        
        // 새로운 리플 효과 시작
        ripple.classList.add('active');
        
        // 애니메이션 완료 후 클래스 제거 (다음 클릭을 위해)
        setTimeout(() => {
            ripple.classList.remove('active');
        }, 800);
        
        // 모든 행성을 동시에 하이라이트
        planets.forEach((planet, index) => {
            const planetDot = planet.querySelector('.planet-dot');
            setTimeout(() => {
                planetDot.style.transform = 'translateX(-50%) scale(1.8)';
                planetDot.style.boxShadow = '0 0 25px currentColor';
                
                setTimeout(() => {
                    planetDot.style.transform = 'translateX(-50%) scale(1)';
                    planetDot.style.boxShadow = '0 0 10px currentColor';
                }, 300);
            }, index * 100);
        });
        
        // 궤도 하이라이트
        const orbitLine = document.querySelector('.orbit-line');
        orbitLine.style.borderColor = 'rgba(135, 206, 235, 0.8)';
        orbitLine.style.boxShadow = '0 0 30px rgba(135, 206, 235, 0.5)';
        
        setTimeout(() => {
            orbitLine.style.borderColor = 'rgba(135, 206, 235, 0.3)';
            orbitLine.style.boxShadow = 'none';
        }, 1500);
        
        console.log('Eunji Park의 포트폴리오 시스템에 오신 것을 환영합니다!');
    });
    
    // 키보드 접근성 추가
    planets.forEach(planet => {
        const planetDot = planet.querySelector('.planet-dot');
        planetDot.setAttribute('tabindex', '0');
        planetDot.setAttribute('role', 'button');
        
        planetDot.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    mainStar.setAttribute('tabindex', '0');
    mainStar.setAttribute('role', 'button');
    mainStar.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
    
    // 카드 로딩 완료 표시
    console.log('🌟 Stellar Orbit Card 로딩 완료!');
    console.log('💫 행성들을 클릭하여 포트폴리오를 탐험해보세요.');
    console.log('⭐ 중앙의 별을 클릭하면 전체 시스템을 확인할 수 있습니다.');
}); 