class ZipperCard {
  constructor() {
    this.cardContainer = document.querySelector('.card-container');
    this.businessCard = document.querySelector('.business-card');
    this.expandableContent = document.getElementById('expandableContent');
    this.articlePanel = document.getElementById('articlePanel');
    this.zipperHandle = document.getElementById('zipperHandle');
    this.zipperArea = document.querySelector('.zipper-area');
    this.handleIcon = document.querySelector('.handle-icon');
    
    // 디버그 정보
    this.debugInfo = null;
    this.createDebugInfo();
    
    // 상태 변수
    this.isOpen = false;
    this.isDragging = false;
    this.dragProgress = 0; // 0 = 닫힘, 1 = 열림
    this.animationId = null;
    
    // 드래그 관련
    this.startY = 0;
    this.startHandleY = 0;
    this.handleStartY = 20; // 핸들 시작 위치
    this.handleMaxY = 520; // 핸들 최대 위치 (600 - 80 여백)
    this.MAX_DRAG_DISTANCE = this.handleMaxY - this.handleStartY; // 500px
    
    this.init();
  }
  
  createDebugInfo() {
    this.debugInfo = document.createElement('div');
    this.debugInfo.className = 'debug-info';
    this.debugInfo.innerHTML = `
      <div>Handle Y: <span id="handleY">20</span>px</div>
      <div>Progress: <span id="progress">0</span>%</div>
      <div>Card Width: <span id="cardWidth">400</span>px</div>
      <div>Is Dragging: <span id="isDragging">false</span></div>
      <div>Mouse Y: <span id="mouseY">0</span>px</div>
    `;
    document.body.appendChild(this.debugInfo);
    
    // 디버그 토글 (개발용)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.debugInfo.classList.add('show');
    }
  }
  
  updateDebugInfo() {
    if (!this.debugInfo) return;
    
    const handleY = this.handleStartY + (this.dragProgress * this.MAX_DRAG_DISTANCE);
    const cardWidth = 400 + (this.dragProgress * 280); // 400px에서 680px로
    
    document.getElementById('handleY').textContent = Math.round(handleY);
    document.getElementById('progress').textContent = Math.round(this.dragProgress * 100);
    document.getElementById('cardWidth').textContent = Math.round(cardWidth);
    document.getElementById('isDragging').textContent = this.isDragging;
  }
  
  init() {
    console.log('🚀 Initializing Zipper Card...');
    
    if (!this.zipperHandle) {
      console.error('❌ Zipper handle not found!');
      return;
    }
    
    this.setupEventListeners();
    console.log('✅ Event listeners attached');
    
    this.updateDebugInfo();
    console.log('✅ Zipper Card initialized');
  }
  
  setupEventListeners() {
    // 마우스 이벤트
    this.zipperHandle.addEventListener('mousedown', this.handleStart.bind(this));
    document.addEventListener('mousemove', this.handleMove.bind(this));
    document.addEventListener('mouseup', this.handleEnd.bind(this));
    
    // 터치 이벤트
    this.zipperHandle.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleEnd.bind(this));
    
    // 키보드 이벤트
    this.zipperHandle.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.zipperHandle.setAttribute('tabindex', '0');
    this.zipperHandle.setAttribute('role', 'button');
    this.zipperHandle.setAttribute('aria-label', '지퍼를 아래로 드래그하여 명함을 열어보세요');
    
    console.log('🎯 Event listeners attached to zipper handle');
  }
  
  handleStart(e) {
    e.preventDefault();
    console.log('🖱️  Drag start');
    
    this.isDragging = true;
    this.startY = this.getEventY(e);
    this.startHandleY = this.handleStartY + (this.dragProgress * this.MAX_DRAG_DISTANCE);
    this.zipperHandle.classList.add('dragging');
    
    // 햅틱 피드백
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    this.updateDebugInfo();
  }
  
  handleMove(e) {
    if (!this.isDragging) return;
    
    e.preventDefault();
    const currentY = this.getEventY(e);
    const deltaY = currentY - this.startY;
    
    // 마우스 위치를 디버그에 표시
    document.getElementById('mouseY').textContent = Math.round(currentY);
    
    // 새로운 핸들 위치 계산
    const newHandleY = this.startHandleY + deltaY;
    const clampedHandleY = Math.max(this.handleStartY, Math.min(this.handleMaxY, newHandleY));
    
    // 드래그 진행도 계산 (0 ~ 1)
    const oldProgress = this.dragProgress;
    this.dragProgress = (clampedHandleY - this.handleStartY) / this.MAX_DRAG_DISTANCE;
    
    if (oldProgress !== this.dragProgress) {
      this.updateZipperAnimation();
      this.updateCardSize();
      this.updateDebugInfo();
    }
  }
  
  handleEnd(e) {
    if (!this.isDragging) return;
    
    console.log(`🖱️  Drag end - Progress: ${Math.round(this.dragProgress * 100)}%`);
    
    this.isDragging = false;
    this.zipperHandle.classList.remove('dragging');
    
    // 80% 이상이면 완전히 열기, 20% 이하면 완전히 닫기
    if (this.dragProgress >= 0.8) {
      this.openZipper();
    } else if (this.dragProgress <= 0.2) {
      this.closeZipper();
    }
    // 중간 위치에서는 현재 위치 유지
    
    this.updateDebugInfo();
  }
  
  handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      console.log('⌨️  Keyboard activation');
      this.toggleZipper();
    }
  }
  
  getEventY(e) {
    return e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  }
  
  updateZipperAnimation() {
    // 지퍼 핸들을 세로로 이동
    const handleY = this.handleStartY + (this.dragProgress * this.MAX_DRAG_DISTANCE);
    
    this.zipperHandle.style.top = `${handleY}px`;
    this.zipperHandle.style.transform = 'translateX(-50%)';
    
    // 지퍼 이빨이 열린 정도에 따라 배경 업데이트
    if (this.dragProgress > 0.1) {
      const gapWidth = 5 + (this.dragProgress * 10); // 5%에서 15%로
      const leftWidth = 50 - (gapWidth / 2);
      const rightStart = 50 + (gapWidth / 2);
      
      this.zipperArea.style.background = `linear-gradient(to right, 
        #ccff00 0%, 
        #ccff00 ${leftWidth}%, 
        transparent ${leftWidth}%, 
        transparent ${rightStart}%, 
        #ccff00 ${rightStart}%, 
        #ccff00 100%)`;
    } else {
      this.zipperArea.style.background = 'linear-gradient(to bottom, #ccff00 0%, #ccff00 100%)';
    }
  }
  
  updateCardSize() {
    // 명함 크기를 점진적으로 증가
    const baseWidth = 400; // 기본 너비 (카드 280px + 지퍼 120px)
    const expandableWidth = this.dragProgress * 280; // 확장 가능한 공간
    const articleWidth = this.dragProgress * 280; // 아티클 너비
    
    // 확장 가능한 콘텐츠 영역 크기 조정
    this.expandableContent.style.width = `${expandableWidth}px`;
    
    // 아티클 패널은 확장 영역 다음에 위치
    this.articlePanel.style.width = `${articleWidth}px`;
    
    if (this.dragProgress > 0.3) {
      this.articlePanel.style.opacity = Math.min(1, (this.dragProgress - 0.3) / 0.7);
    } else {
      this.articlePanel.style.opacity = '0';
    }
  }
  
  openZipper() {
    console.log('🔓 Opening zipper');
    this.isOpen = true;
    
    this.animateToProgress(1, () => {
      this.cardContainer.classList.add('opened');
      this.handleIcon.textContent = '⇡';
      
      // 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
      
      console.log('✅ Zipper fully opened');
      this.updateDebugInfo();
    });
  }
  
  closeZipper() {
    console.log('🔒 Closing zipper');
    this.isOpen = false;
    this.cardContainer.classList.remove('opened');
    this.handleIcon.textContent = '⇣';
    
    this.animateToProgress(0, () => {
      console.log('✅ Zipper fully closed');
      this.updateDebugInfo();
    });
  }
  
  toggleZipper() {
    console.log('🔄 Toggling zipper');
    if (this.dragProgress > 0.5) {
      this.closeZipper();
    } else {
      this.openZipper();
    }
  }
  
  animateToProgress(targetProgress, callback) {
    const startProgress = this.dragProgress;
    const duration = 600;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = this.easeOutCubic(progress);
      
      this.dragProgress = startProgress + (targetProgress - startProgress) * easeProgress;
      this.updateZipperAnimation();
      this.updateCardSize();
      this.updateDebugInfo();
      
      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.dragProgress = targetProgress;
        if (callback) callback();
      }
    };
    
    animate();
  }
  
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
}

// 초기화 및 유틸리티
class ZipperCardManager {
  constructor() {
    this.zipperCard = null;
    this.articleScrollContainer = null;
  }
  
  async init() {
    try {
      console.log('🎬 Starting Zipper Card Manager...');
      
      this.zipperCard = new ZipperCard();
      this.setupArticleScroll();
      this.setupPerformanceMonitoring();
      
      console.log('🎉 Zipper Card Manager initialized successfully');
    } catch (error) {
      console.error('💥 Failed to initialize Zipper Card Manager:', error);
      this.showErrorFallback();
    }
  }
  
  setupArticleScroll() {
    this.articleScrollContainer = document.getElementById('articleScrollContainer');
    
    if (this.articleScrollContainer) {
      console.log('📜 Setting up article scroll');
      
      this.articleScrollContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        const scrollSpeed = 1.2;
        
        this.articleScrollContainer.scrollBy({
          top: delta * scrollSpeed,
          behavior: 'smooth'
        });
      });
      
      this.articleScrollContainer.addEventListener('scroll', this.handleArticleScroll.bind(this));
    }
  }
  
  handleArticleScroll() {
    const articles = document.querySelectorAll('.article-item');
    const containerRect = this.articleScrollContainer.getBoundingClientRect();
    
    articles.forEach((article, index) => {
      const articleRect = article.getBoundingClientRect();
      const isVisible = articleRect.top < containerRect.bottom && articleRect.bottom > containerRect.top;
      
      if (isVisible) {
        article.style.opacity = '1';
        article.style.transform = 'translateX(0)';
      }
    });
  }
  
  setupPerformanceMonitoring() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🎯 Performance monitoring enabled');
      
      let lastTime = performance.now();
      let frameCount = 0;
      
      const measureFPS = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
          console.log(`📊 FPS: ${frameCount}`);
          frameCount = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(measureFPS);
      };
      
      measureFPS();
    }
  }
  
  showErrorFallback() {
    const cardContainer = document.querySelector('.card-container');
    if (cardContainer) {
      cardContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #ccff00;">
          <h2>LUCID COUTURE</h2>
          <p>Eloise Moreau</p>
          <p>Fashion Designer</p>
          <p style="margin-top: 20px; font-size: 12px; color: #888;">
            Interactive features unavailable
          </p>
        </div>
      `;
    }
  }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌟 DOM Content Loaded - Initializing...');
  const manager = new ZipperCardManager();
  manager.init();
});

// 전역 에러 핸들링
window.addEventListener('error', (e) => {
  console.error('💥 Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('💥 Unhandled promise rejection:', e.reason);
});

// 리사이즈 최적화
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const zipperCard = document.querySelector('.card-container');
    if (zipperCard) {
      zipperCard.dispatchEvent(new CustomEvent('resize'));
    }
  }, 250);
}); 