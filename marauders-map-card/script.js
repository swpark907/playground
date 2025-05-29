document.addEventListener('DOMContentLoaded', function() {
    // 마우스 추적 변수들
    let mouseTrail = [];
    let lastFootprintTime = 0;
    const footprintInterval = 250; // 0.25초마다 발자국 생성
    const footprintDelay = 50; // 1초 딜레이
    
    // 마법 입자 생성
    function createMagicParticles() {
        const magicContainer = document.querySelector('.magic-particles');
        const particleCount = 15; // 마법 입자 개수
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'magic-particle';
            
            // 랜덤 크기 클래스 추가
            const sizes = ['small', 'medium', '', 'large'];
            const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
            if (randomSize) {
                particle.classList.add(randomSize);
            }
            
            // 랜덤 위치 설정
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.opacity = 0.3 + Math.random() * 0.4;
            
            magicContainer.appendChild(particle);
        }
    }
    
    // 발자국 생성 함수
    function createFootprint(x, y, rotation = 0) {
        const footprint = document.createElement('div');
        footprint.className = 'footprint';
        footprint.style.left = (x - 12.5) + 'px';
        footprint.style.top = (y - 17.5) + 'px';
        footprint.style.transform = `rotate(${rotation}deg)`;
        
        document.getElementById('footprints-container').appendChild(footprint);
        
        // 발자국 나타나기
        setTimeout(() => {
            footprint.classList.add('visible');
        }, 50);
        
        // 1초 후 사라지기 시작
        setTimeout(() => {
            footprint.classList.add('fading');
        }, 1000);
        
        // 완전히 제거
        setTimeout(() => {
            if (footprint.parentNode) {
                footprint.parentNode.removeChild(footprint);
            }
        }, 2500);
    }
    
    // 마우스 움직임 추적
    function trackMouse(e) {
        const rect = document.querySelector('.marauders-map').getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const currentTime = Date.now();
        
        // 마우스 위치를 배열에 저장 (시간과 함께)
        mouseTrail.push({
            x: x,
            y: y,
            time: currentTime
        });
        
        // 오래된 추적 데이터 제거 (3초 이상)
        mouseTrail = mouseTrail.filter(point => currentTime - point.time < 3000);
        
        // 발자국 생성 간격 체크
        if (currentTime - lastFootprintTime >= footprintInterval) {
            lastFootprintTime = currentTime;
            
            // 딜레이 후 발자국 생성
            setTimeout(() => {
                // 딜레이 시점의 마우스 위치 찾기
                const targetTime = currentTime - footprintDelay;
                let targetPoint = null;
                
                // 가장 가까운 시간의 포인트 찾기
                for (let i = 0; i < mouseTrail.length; i++) {
                    if (!targetPoint || Math.abs(mouseTrail[i].time - targetTime) < Math.abs(targetPoint.time - targetTime)) {
                        targetPoint = mouseTrail[i];
                    }
                }
                
                if (targetPoint) {
                    // 방향 계산 (현재 마우스 위치를 향하도록)
                    const deltaX = x - targetPoint.x;
                    const deltaY = y - targetPoint.y;
                    let rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                    
                    // 발가락이 마우스 방향을 향하도록 90도 추가
                    rotation += 90;
                    
                    // 약간의 랜덤 요소 추가
                    rotation += (Math.random() - 0.5) * 20;
                    
                    createFootprint(targetPoint.x, targetPoint.y, rotation);
                }
            }, footprintDelay);
        }
    }
    
    // 터치 이벤트 처리
    function trackTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = document.querySelector('.marauders-map').getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const currentTime = Date.now();
        
        // 마우스와 동일한 로직 적용
        mouseTrail.push({
            x: x,
            y: y,
            time: currentTime
        });
        
        mouseTrail = mouseTrail.filter(point => currentTime - point.time < 3000);
        
        if (currentTime - lastFootprintTime >= footprintInterval) {
            lastFootprintTime = currentTime;
            
            setTimeout(() => {
                const targetTime = currentTime - footprintDelay;
                let targetPoint = null;
                
                for (let i = 0; i < mouseTrail.length; i++) {
                    if (!targetPoint || Math.abs(mouseTrail[i].time - targetTime) < Math.abs(targetPoint.time - targetTime)) {
                        targetPoint = mouseTrail[i];
                    }
                }
                
                if (targetPoint) {
                    const deltaX = x - targetPoint.x;
                    const deltaY = y - targetPoint.y;
                    let rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                    rotation += 90;
                    rotation += (Math.random() - 0.5) * 20;
                    
                    createFootprint(targetPoint.x, targetPoint.y, rotation);
                }
            }, footprintDelay);
        }
    }
    
    // 마법 효과 추가 (호버 시)
    function addMagicalGlow() {
        const mapContent = document.querySelector('.map-content');
        mapContent.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))';
    }
    
    function removeMagicalGlow() {
        const mapContent = document.querySelector('.map-content');
        mapContent.style.filter = '';
    }
    
    // 이벤트 리스너 등록
    const maraudersMap = document.querySelector('.marauders-map');
    
    // 마우스 이벤트
    maraudersMap.addEventListener('mousemove', trackMouse);
    maraudersMap.addEventListener('mouseenter', addMagicalGlow);
    maraudersMap.addEventListener('mouseleave', removeMagicalGlow);
    
    // 터치 이벤트
    maraudersMap.addEventListener('touchmove', trackTouch);
    maraudersMap.addEventListener('touchstart', trackTouch);
    
    // 초기화
    createMagicParticles();
    
    // 주기적으로 마법 입자 재생성 (선택사항)
    setInterval(() => {
        // 기존 입자들 제거
        const existingParticles = document.querySelectorAll('.magic-particle');
        existingParticles.forEach(particle => {
            if (Math.random() < 0.1) { // 10% 확률로 재생성
                particle.remove();
                
                // 새 입자 생성
                const magicContainer = document.querySelector('.magic-particles');
                const newParticle = document.createElement('div');
                newParticle.className = 'magic-particle';
                
                const sizes = ['small', 'medium', '', 'large'];
                const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
                if (randomSize) {
                    newParticle.classList.add(randomSize);
                }
                
                newParticle.style.left = Math.random() * 100 + '%';
                newParticle.style.animationDelay = '0s';
                newParticle.style.opacity = 0.3 + Math.random() * 0.4;
                
                magicContainer.appendChild(newParticle);
            }
        });
    }, 5000); // 5초마다 체크
    
    // 콘솔에 마라우더의 지도 메시지 출력
    console.log(`
    ╔══════════════════════════════════════════════════════════════╗
    ║                    THE MARAUDER'S MAP                        ║
    ║                                                              ║
    ║  "I solemnly swear that I am up to no good"                  ║
    ║                                                              ║
    ║  Messrs Moony, Wormtail, Padfoot, and Prongs               ║
    ║  Purveyors of Aids to Magical Mischief-Makers              ║
    ║  are proud to present this interactive business card         ║
    ║                                                              ║
    ║  Move your mouse to leave magical footprints!               ║
    ║                                                              ║
    ║  "Mischief managed"                                          ║
    ╚══════════════════════════════════════════════════════════════╝
    `);
}); 