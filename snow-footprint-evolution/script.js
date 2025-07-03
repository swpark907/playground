document.addEventListener('DOMContentLoaded', function() {
    const card = document.getElementById('snowCard');
    let mouseTrail = []; // 마우스 궤적 저장
    let lastFootprintTime = 0;
    let isMouseInCard = false;
    let isRunning = false; // 달리기 모드
    let isDragging = false; // 드래그 중
    let dragStart = null;
    let lastFootprintRotation = 0; // 마지막 발자국 각도 저장
    let sledTrackPoints = []; // 썰매 자국 포인트들
    let activeSledTrack = null; // 현재 그려지고 있는 썰매 자국
    let wasDragging = false; // 드래그 상태 추적용
    let jumpFootprintBlocked = false; // 점프 발자국 생성 후 일반 발자국 차단
    
    // 눈송이 생성 함수 (기존 유지)
    function createSnowflakes() {
        const snowflakeCount = 20;
        
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            
            const sizes = ['small', 'medium', '', 'large'];
            const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
            if (randomSize) snowflake.classList.add(randomSize);
            
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            snowflake.style.left = x + '%';
            snowflake.style.top = y + '%';
            
            snowflake.style.animationDelay = Math.random() * 8 + 's';
            snowflake.style.opacity = 0.4 + Math.random() * 0.6;
            
            card.appendChild(snowflake);
        }
    }
    
    createSnowflakes();
    
    // 마우스 움직임 추적 (통합 버전)
    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const currentTime = Date.now();
        
        if (isDragging) {
            // 드래그 중: 실시간 썰매 자국 그리기
            const currentPoint = { x: x, y: y };
            
            // 이전 포인트와의 거리가 일정 이상일 때만 추가
            const lastPoint = sledTrackPoints[sledTrackPoints.length - 1];
            const distance = Math.sqrt(
                Math.pow(currentPoint.x - lastPoint.x, 2) + 
                Math.pow(currentPoint.y - lastPoint.y, 2)
            );
            
            if (distance > 4) { // 4px 간격으로 포인트 추가 (더 부드럽게)
                sledTrackPoints.push(currentPoint);
                
                // 세그먼트 썰매 자국 생성 (겹치도록)
                createSledTrackSegment(lastPoint, currentPoint);
            }
        } else if (!jumpFootprintBlocked) {
            // 일반 모드: 발자국 생성 (점프 발자국 차단 중이 아닐 때만)
            mouseTrail.push({
                x: x,
                y: y,
                time: currentTime
            });
            
            // 메모리 관리
            mouseTrail = mouseTrail.filter(point => currentTime - point.time < 3000);
            
            // 달리기 모드에 따른 발자국 생성 간격 조정
            const footprintInterval = isRunning ? 120 : 250; // 달리기: 120ms, 걷기: 250ms
            
            if (currentTime - lastFootprintTime > footprintInterval && mouseTrail.length > 1) {
                createDelayedFootprint(isRunning ? 'run' : 'walk');
                lastFootprintTime = currentTime;
            }
        }
    });
    
    // 좌클릭: 점프
    card.addEventListener('click', function(e) {
        if (e.button !== 0) return; // 좌클릭만
        
        // 드래그가 끝난 직후라면 점프 발자국 생성하지 않음
        if (wasDragging) {
            wasDragging = false;
            return;
        }
        
        e.preventDefault();
        
        // 점프 발자국 생성 전 일반 발자국 완전 차단
        jumpFootprintBlocked = true;
        mouseTrail = []; // 마우스 궤적 초기화로 기존 데이터 제거
        lastFootprintTime = Date.now(); // 현재 시간으로 리셋하여 일반 발자국 생성 차단
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        createJumpFootprints(x, y);
        
        // 500ms 후 일반 발자국 차단 해제 (더 확실하게)
        setTimeout(() => {
            jumpFootprintBlocked = false;
        }, 500);
    });
    
    // 우클릭: 달리기 모드 토글
    card.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        isRunning = !isRunning;
        
        // 시각적 피드백
        card.style.cursor = isRunning ? 'crosshair' : 'default';
        
        // 가이드 업데이트
        const runGuide = document.querySelector('.guide-item:nth-child(3)');
        if (runGuide) {
            runGuide.style.color = isRunning ? '#e74c3c' : '#2c3e50';
            runGuide.style.fontWeight = isRunning ? '700' : '500';
        }
    });
    
    // 드래그 시작
    card.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return; // 좌클릭만
        
        isDragging = true;
        wasDragging = false; // 드래그 시작 시 초기화
        
        const rect = card.getBoundingClientRect();
        dragStart = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        // 새로운 썰매 자국 시작
        sledTrackPoints = [dragStart];
        card.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    // 드래그 끝
    card.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        
        // 실제로 드래그가 발생했는지 확인 (썰매 자국이 생성되었는지)
        if (sledTrackPoints.length > 1) {
            wasDragging = true;
        }
        
        isDragging = false;
        sledTrackPoints = [];
        dragStart = null;
        card.style.cursor = isRunning ? 'crosshair' : 'default';
    });
    
    // 마우스 enter/leave
    card.addEventListener('mouseenter', function() {
        isMouseInCard = true;
        mouseTrail = [];
    });
    
    card.addEventListener('mouseleave', function() {
        isMouseInCard = false;
        isDragging = false;
        sledTrackPoints = [];
        dragStart = null;
        jumpFootprintBlocked = false; // 상태 초기화
        wasDragging = false; // 상태 초기화
        card.style.cursor = 'default';
    });
    
    // 발자국 생성 함수들
    function createDelayedFootprint(type = 'walk') {
        if (mouseTrail.length < 2) return;
        
        const currentTime = Date.now();
        const delayTime = Math.random() * 200;
        const targetTime = currentTime - delayTime;
        
        let targetPoint = mouseTrail[0];
        for (let i = 0; i < mouseTrail.length; i++) {
            if (Math.abs(mouseTrail[i].time - targetTime) < Math.abs(targetPoint.time - targetTime)) {
                targetPoint = mouseTrail[i];
            }
        }
        
        // 방향 계산
        let rotation = 0;
        if (mouseTrail.length > 0) {
            const currentMousePos = mouseTrail[mouseTrail.length - 1];
            const dx = currentMousePos.x - targetPoint.x;
            const dy = currentMousePos.y - targetPoint.y;
            
            rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            rotation += (Math.random() - 0.5) * (type === 'run' ? 30 : 20);
        }
        
        // 마지막 발자국 각도 저장
        lastFootprintRotation = rotation;
        
        createFootprint(targetPoint.x, targetPoint.y, rotation, type);
    }
    
    function createFootprint(x, y, rotation = 0, type = 'walk') {
        const footprint = document.createElement('div');
        footprint.className = `footprint ${type}`;
        footprint.style.left = x + 'px';
        footprint.style.top = y + 'px';
        
        if (type === 'run') {
            footprint.style.setProperty('--rotation', rotation + 'deg');
        } else {
            footprint.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        }
        
        card.appendChild(footprint);
        
        setTimeout(() => {
            footprint.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            footprint.classList.remove('visible');
            footprint.classList.add('fading');
        }, 3000);
        
        setTimeout(() => {
            if (footprint.parentNode) {
                footprint.parentNode.removeChild(footprint);
            }
        }, 4500);
    }
    
    function createJumpFootprints(x, y) {
        // 직전 발자국 각도를 기반으로 점프 발자국 각도 결정
        const baseRotation = lastFootprintRotation + (Math.random() - 0.5) * 20;
        
        // 점프 발자국 컨테이너 생성
        const jumpContainer = document.createElement('div');
        jumpContainer.className = 'footprint jump';
        jumpContainer.style.left = x + 'px';
        jumpContainer.style.top = y + 'px';
        jumpContainer.style.setProperty('--rotation', baseRotation + 'deg');
        jumpContainer.style.transform = `translate(-50%, -50%) rotate(${baseRotation}deg)`;
        
        // 좌발 생성
        const leftFoot = document.createElement('div');
        leftFoot.className = 'foot left';
        
        // 우발 생성
        const rightFoot = document.createElement('div');
        rightFoot.className = 'foot right';
        
        // 컨테이너에 발들 추가
        jumpContainer.appendChild(leftFoot);
        jumpContainer.appendChild(rightFoot);
        
        // 카드에 컨테이너 추가
        card.appendChild(jumpContainer);
        
        // 애니메이션 적용
        setTimeout(() => {
            jumpContainer.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            jumpContainer.classList.remove('visible');
            jumpContainer.classList.add('fading');
        }, 4000);
        
        setTimeout(() => {
            if (jumpContainer.parentNode) {
                jumpContainer.parentNode.removeChild(jumpContainer);
            }
        }, 5500);
    }
    
    function createSledTrackSegment(startPoint, endPoint) {
        const sledTrack = document.createElement('div');
        sledTrack.className = 'sled-track';
        
        const baseLength = Math.sqrt(
            Math.pow(endPoint.x - startPoint.x, 2) + 
            Math.pow(endPoint.y - startPoint.y, 2)
        );
        
        // 세그먼트를 더 길게 만들어서 겹치도록 (1.5배)
        const length = baseLength * 1.5;
        const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * (180 / Math.PI);
        
        // 시작점을 조금 뒤로 이동시켜서 겹치게 함
        const backOffset = baseLength * 0.25;
        const adjustedStartX = startPoint.x - Math.cos(angle * Math.PI / 180) * backOffset;
        const adjustedStartY = startPoint.y - Math.sin(angle * Math.PI / 180) * backOffset;
        
        sledTrack.style.left = adjustedStartX + 'px';
        sledTrack.style.top = adjustedStartY + 'px';
        sledTrack.style.width = length + 'px';
        sledTrack.style.transform = `rotate(${angle}deg)`;
        sledTrack.style.transformOrigin = '0 50%';
        
        // 랜덤한 두께 변화로 더 자연스럽게
        const thickness = 10 + Math.random() * 4; // 10-14px
        sledTrack.style.height = thickness + 'px';
        
        // 투명도 랜덤 변화 (겹치는 부분을 고려해서 조금 더 투명하게)
        const opacity = 0.5 + Math.random() * 0.3;
        sledTrack.style.opacity = opacity;
        
        card.appendChild(sledTrack);
        
        // 개별 세그먼트는 더 오래 유지
        setTimeout(() => {
            sledTrack.classList.add('fading');
        }, 5000);
        
        setTimeout(() => {
            if (sledTrack.parentNode) {
                sledTrack.parentNode.removeChild(sledTrack);
            }
        }, 7000);
    }
}); 