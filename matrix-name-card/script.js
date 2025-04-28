document.addEventListener('DOMContentLoaded', function() {
    const businessCard = document.getElementById('businessCard');
    const matrixCanvas = document.getElementById('matrixCanvas');
    const ctx = matrixCanvas.getContext('2d');

    // 매트릭스 효과 설정
    let columns;
    let drops = [];
    let dropSpeed = []; // 각 열마다 다른 낙하 속도 설정
    let colorVariations = ['#00FF00', '#00FF33', '#33FF00', '#00FF66', '#00FF99']; // 색상 변화 추가
    
    // 캔버스 크기 조정 함수
    function setupCanvas() {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        
        columns = Math.floor(matrixCanvas.width / 20); // 열 수 계산
        drops = [];
        dropSpeed = [];
        
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * matrixCanvas.height / 20) - 100; // 초기 위치
            dropSpeed[i] = Math.random() * 0.5 + 0.5; // 0.5~1.0 사이의 랜덤 속도
        }
    }
    
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    
    // 매트릭스 비 애니메이션
    function drawMatrixRain() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        
        for (let i = 0; i < drops.length; i++) {
            // 랜덤 문자 생성 (0과 1)
            const text = Math.random() > 0.5 ? '0' : '1';
            
            // 랜덤한 색상 변화 추가
            const colorIndex = Math.floor(Math.random() * colorVariations.length);
            ctx.fillStyle = colorVariations[colorIndex];
            ctx.font = '15px monospace';
            
            // 특별히 밝은 문자를 가끔 추가 (글로우 효과)
            if (Math.random() > 0.99) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 16px monospace';
            }
            
            ctx.fillText(text, i * 20, drops[i] * 20);
            
            // 일정 확률로 지워지거나 초기화
            if (drops[i] * 20 > matrixCanvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            // 각 열마다 다른 속도로 떨어짐
            drops[i] += dropSpeed[i];
        }
    }
    
    // 애니메이션 상태 관리
    let matrixInterval;
    let isAnimating = false;
    let stateCounter = 0; // 애니메이션 상태 카운터
    
    // 모든 텍스트 요소를 가져옴
    function getAllTextNodes() {
        const elements = [
            ...document.querySelectorAll('.name, .role, .detail-label, .detail-value, .card-footer')
        ];
        
        const nodes = [];
        
        elements.forEach(element => {
            const textContent = element.textContent;
            element.textContent = '';
            
            for (let i = 0; i < textContent.length; i++) {
                const charSpan = document.createElement('span');
                charSpan.className = 'character';
                
                // 공백 문자 처리 개선
                if (textContent[i] === ' ') {
                    charSpan.textContent = ' ';
                    charSpan.setAttribute('data-text', ' ');
                    charSpan.style.marginRight = '0.25em'; // 공백 너비 추가
                } else {
                    charSpan.textContent = textContent[i];
                    charSpan.setAttribute('data-text', textContent[i]);
                }
                
                element.appendChild(charSpan);
                nodes.push(charSpan);
            }
        });
        
        return nodes;
    }
    
    // 페이지 로드 시 텍스트 노드 초기화
    const initialTextNodes = getAllTextNodes();
    
    // 페이지 로드 시 랜덤 글리치 효과 추가
    function applyRandomGlitchOnLoad() {
        // 즉시 몇 개 요소에 글리치 효과 적용
        setTimeout(() => {
            const nodes = document.querySelectorAll('.character');
            if (nodes.length > 0) {
                // 초기에 몇 개 요소에 글리치 효과 적용
                const initialGlitchCount = Math.floor(Math.random() * 8) + 3;
                
                for (let i = 0; i < initialGlitchCount; i++) {
                    const randomIndex = Math.floor(Math.random() * nodes.length);
                    const randomNode = nodes[randomIndex];
                    
                    randomNode.classList.add('glitch');
                    
                    setTimeout(() => {
                        randomNode.classList.remove('glitch');
                    }, 150 + Math.random() * 250);
                }
            }
        }, 500);

        // 랜덤 간격으로 글리치 효과 적용
        setInterval(() => {
            const nodes = document.querySelectorAll('.character');
            if (nodes.length > 0) {
                // 랜덤 개수의 노드에 글리치 효과 적용
                const glitchCount = Math.floor(Math.random() * 5) + 1;
                
                for (let i = 0; i < glitchCount; i++) {
                    const randomIndex = Math.floor(Math.random() * nodes.length);
                    const randomNode = nodes[randomIndex];
                    
                    // 글리치 효과 적용
                    randomNode.classList.add('glitch');
                    
                    // 짧은 시간 후 효과 제거
                    setTimeout(() => {
                        randomNode.classList.remove('glitch');
                    }, 100 + Math.random() * 150);
                }
            }
        }, 800 + Math.random() * 500);
    }
    
    // 페이지 로드시 글리치 효과 시작
    applyRandomGlitchOnLoad();
    
    // 클릭 이벤트 처리
    businessCard.addEventListener('click', function() {
        if (isAnimating) return;
        isAnimating = true;
        stateCounter++;
        
        // 클릭 효과 추가
        businessCard.style.transform = 'scale(0.98)';
        setTimeout(() => {
            businessCard.style.transform = '';
        }, 150);
        
        if (stateCounter === 1) {
            // 첫 번째 변환: 매트릭스 효과 시작
            matrixCanvas.classList.add('active');
            matrixInterval = setInterval(drawMatrixRain, 50);
            
            // 모든 텍스트 노드 가져오기
            const textNodes = getAllTextNodes();
            
            // 셔플해서 랜덤한 순서로 변환
            shuffleArray(textNodes);
            
            // 각 문자를 네모로 바꾸고 랜덤하게 원래 문자로 변환
            textNodes.forEach((node, index) => {
                const originalChar = node.textContent;
                node.textContent = '█';
                node.style.color = '#0F0';
                node.style.opacity = '0.9';
                node.style.transform = 'scale(1.1)';
                // 빛번짐 효과 추가
                const glowIntensity = 4 + Math.random() * 4; // 4~8px 사이의 빛번짐
                const glowColor = Math.random() > 0.7 ? 'rgba(0, 255, 50, 0.8)' : 'rgba(0, 255, 0, 0.6)';
                node.style.textShadow = `0 0 ${glowIntensity}px ${glowColor}, 0 0 ${glowIntensity * 2}px rgba(0, 255, 0, 0.4)`;
                // 펄스 애니메이션 추가
                node.style.animation = `pulse ${0.5 + Math.random() * 1}s infinite alternate ease-in-out`;
                
                // 랜덤 딜레이 후 원래 글자로 복원, 복잡한 이징 효과 추가
                setTimeout(() => {
                    node.style.animation = 'none';
                    node.textContent = originalChar;
                    node.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    node.style.opacity = '1';
                    node.style.transform = 'scale(1)';
                    node.style.textShadow = 'none';
                    
                    // 글리치 효과 추가 (확률 높임)
                    if (Math.random() > 0.5) {
                        setTimeout(() => {
                            node.classList.add('glitch');
                            setTimeout(() => {
                                node.classList.remove('glitch');
                            }, 200);
                        }, 300 + Math.random() * 1000);
                    }
                }, Math.random() * 1200);
            });
            
            // 3.5초 후 두 번째 변환 준비
            setTimeout(() => {
                isAnimating = false;
            }, 3500);
        } else if (stateCounter === 2) {
            // 두 번째 변환: 이진수 효과
            const textNodes = document.querySelectorAll('.character');
            const totalNodes = textNodes.length;
            
            // 글자 하나씩 이진수로 변환, 단계적으로 파급
            let processedCount = 0;
            textNodes.forEach((node, index) => {
                setTimeout(() => {
                    binaryTransform(node);
                    
                    processedCount++;
                    // 마지막 노드 변환 후 애니메이션 상태를 끝내지만 초기화하지 않음
                    if (processedCount >= totalNodes - 5) {
                        setTimeout(() => {
                            isAnimating = false;
                        }, 1000);
                    }
                }, index * 35 + Math.random() * 50); // 더 자연스러운 시간차
            });
            
            // 글리치 효과 추가
            addGlitchEffect();
        } else if (stateCounter === 3) {
            // 세 번째 클릭: 초기 상태로 복원
            stateCounter = 0;
            matrixCanvas.classList.remove('active');
            clearInterval(matrixInterval);
            
            // 페이드 아웃 효과
            document.body.style.transition = 'opacity 1s ease';
            document.body.style.opacity = '0';
            
            // 페이지 새로고침
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    });
    
    // 배열을 섞는 함수 (Fisher-Yates 알고리즘)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 이진수 변환 함수
    function binaryTransform(element) {
        let count = 0;
        const maxCount = 10 + Math.floor(Math.random() * 5); // 10~14회 깜박임
        const originalChar = element.textContent;
        
        // 초기 상태 설정
        element.style.transition = 'all 0.15s ease';
        
        const interval = setInterval(() => {
            if (count >= maxCount) {
                clearInterval(interval);
                element.innerHTML = '<span class="binary">' + (Math.random() > 0.5 ? '0' : '1') + '</span>';
                // 변환 완료 후 특별 효과
                element.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 120);
                return;
            }
            
            // 0과 1 사이를 빠르게 전환, 때때로 다른 문자도 추가
            if (count % 3 === 0) {
                element.textContent = '0';
            } else if (count % 3 === 1) {
                element.textContent = '1';
            } else {
                element.textContent = Math.random() > 0.8 ? 'x' : (Math.random() > 0.5 ? '0' : '1');
            }
            
            // 색상 변화 추가
            const greenIntensity = 150 + Math.floor(Math.random() * 105);
            element.style.color = `rgb(0, ${greenIntensity}, 0)`;
            element.style.textShadow = `0 0 ${Math.random() * 5 + 3}px rgba(0, 255, 0, 0.7)`;
            count++;
        }, 80 + Math.random() * 40); // 깜박임 속도에 변화 추가
    }
    
    // 글리치 효과 추가
    function addGlitchEffect() {
        let glitchInterval = setInterval(() => {
            if (stateCounter !== 2) {
                clearInterval(glitchInterval);
                return;
            }
            
            const elements = document.querySelectorAll('.character');
            
            // 여러 요소를 한 번에 글리치 효과 적용 (더 많은 요소에 적용)
            for (let i = 0; i < 6 + Math.floor(Math.random() * 5); i++) {
                const randomIndex = Math.floor(Math.random() * elements.length);
                const randomElement = elements[randomIndex];
                
                // 글리치 효과 적용
                randomElement.classList.add('glitch');
                
                // 짧은 시간 후 효과 제거
                setTimeout(() => {
                    randomElement.classList.remove('glitch');
                }, 80 + Math.random() * 150);
            }
        }, 120); // 더 자주 발생하도록 간격 줄임
    }
    
    // 호버 효과 개선
    businessCard.addEventListener('mousemove', function(e) {
        // 마우스 위치에 따른 미세한 3D 회전 효과
        const rect = businessCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 중심에서의 거리 계산 (-15~15도 회전)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = (x - centerX) / centerX * 3; // X축 회전 (좌우)
        const rotateX = (centerY - y) / centerY * 2; // Y축 회전 (상하)
        
        businessCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    // 마우스가 나갈 때 원래 상태로 복원
    businessCard.addEventListener('mouseleave', function() {
        businessCard.style.transform = '';
    });
}); 