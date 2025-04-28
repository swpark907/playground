document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bubble-canvas');
  const ctx = canvas.getContext('2d');
  const card = document.querySelector('.card');
  const textElements = document.querySelectorAll('.card h1, .card .title, .card .contact');
  const debug = document.getElementById('debug');
  
  // 디버깅 정보 표시
  function updateDebug(message) {
    if (debug) {
      debug.innerHTML += `<br>${message}`;
    }
  }
  
  updateDebug('스크립트 로드됨');
  
  // 캔버스 크기 설정
  function setupCanvas() {
    canvas.width = card.offsetWidth;
    canvas.height = card.offsetHeight;
    updateDebug(`캔버스 크기: ${canvas.width}x${canvas.height}`);
  }
  
  setupCanvas();
  
  // 거품 클래스
  class Bubble {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.z = 1; // 1(깊음) ~ 0(수면)
      this.radius = Math.random() * 15 + 15; // 더 큰 거품 크기
      this.speed = Math.random() * 0.008 + 0.004; // z축 이동 속도
      this.opacity = Math.random() * 0.5 + 0.5;
      this.hue = Math.random() * 60 + 180;
      this.alive = true;
    }
    
    update() {
      this.z -= this.speed;
      if (this.z <= 0) {
        this.z = 0;
        this.alive = false;
        this.explode();
      }
    }
    
    draw() {
      // z값에 따라 크기와 투명도 변화
      const scale = 0.4 + (1 - this.z) * 0.8; // 0.4~1.2
      const alpha = 0.2 + (1 - this.z) * 0.8; // 0.2~1.0
      const currentRadius = this.radius * scale;
      
      // 거품 그리기
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
      
      // 그라데이션 생성
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, currentRadius
      );
      
      // 거품의 그라데이션 색상
      gradient.addColorStop(0, `hsla(${this.hue}, 80%, 85%, ${alpha * this.opacity})`);
      gradient.addColorStop(0.7, `hsla(${this.hue}, 75%, 70%, ${alpha * this.opacity * 0.4})`);
      gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, ${alpha * this.opacity * 0.2})`);
      
      // 거품 안쪽 채우기
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // 거품 테두리 효과
      ctx.strokeStyle = `hsla(${this.hue}, 90%, 80%, ${alpha * this.opacity * 0})`;
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
      
      // 하이라이트 효과
      ctx.beginPath();
      ctx.arc(
        this.x - currentRadius * 0.3,
        this.y - currentRadius * 0.3,
        currentRadius * 0.3,
        0, Math.PI * 2
      );
      
      // 하이라이트 그라데이션
      const highlightGradient = ctx.createRadialGradient(
        this.x - currentRadius * 0.3,
        this.y - currentRadius * 0.3,
        0,
        this.x - currentRadius * 0.3,
        this.y - currentRadius * 0.3,
        currentRadius * 0.3
      );
      
      highlightGradient.addColorStop(0, `hsla(${this.hue + 30}, 100%, 95%, ${alpha * this.opacity})`);
      highlightGradient.addColorStop(1, `hsla(${this.hue + 30}, 100%, 90%, ${alpha * this.opacity * 0.1})`);
      
      ctx.fillStyle = highlightGradient;
      ctx.fill();
    }
    
    explode() {
      const explosion = new Explosion(this.x, this.y, this.radius);
      explosions.push(explosion);
      applyTextImpact(this.x, this.y, this.radius * 2);
      this.reset();
    }
  }
  
  // 폭발 효과 클래스
  class Explosion {
    constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.life = 1;
      this.particles = [];
      
      // 폭발 입자 생성
      const particleCount = Math.floor(radius * 2.5);
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: this.x,
          y: this.y,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 3 + 1,
          size: Math.random() * 3 + 2,
          hue: Math.random() * 60 + 180
        });
      }
    }
    
    update() {
      this.life -= 0.05;
      
      // 파티클 이동
      this.particles.forEach(particle => {
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        particle.size *= 0.95;
      });
      
      return this.life > 0;
    }
    
    draw() {
      this.particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // 파티클 그라데이션
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        
        gradient.addColorStop(0, `hsla(${particle.hue}, 90%, 80%, ${this.life * 0.8})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 90%, 60%, ${this.life * 0.4})`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    }
  }
  
  // 텍스트 요소에 물리적 영향 주기
  function applyTextImpact(x, y, radius) {
    textElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      
      // 요소 위치를 캔버스 좌표계로 변환
      const elementX = rect.left - cardRect.left + rect.width / 2;
      const elementY = rect.top - cardRect.top + rect.height / 2;
      
      const dx = elementX - x;
      const dy = elementY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < radius * 2) {
        const angle = Math.atan2(dy, dx);
        const force = (radius * 2 - distance) / (radius * 2) * 15;
        
        const offsetX = Math.cos(angle) * force;
        const offsetY = Math.sin(angle) * force;
        
        element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        
        // 원래 위치로 복귀
        setTimeout(() => {
          element.style.transition = 'transform 0.5s ease-out';
          element.style.transform = 'translate(0, 0)';
          
          setTimeout(() => {
            element.style.transition = 'transform 0.2s ease-out';
          }, 500);
        }, 100);
      }
    });
  }
  
  // 거품 및 폭발 배열
  const bubbles = [];
  const explosions = [];
  
  // 거품 생성 관련 변수
  const MAX_BUBBLES = 12; // 거품 개수 감소
  const BUBBLE_SPAWN_INTERVAL = 600; // 생성 간격 증가
  let lastBubbleSpawnTime = 0;
  
  // 애니메이션 루프
  function animate(timestamp) {
    // 캔버스 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 순차적으로 거품 생성
    if (timestamp - lastBubbleSpawnTime > BUBBLE_SPAWN_INTERVAL && bubbles.length < MAX_BUBBLES) {
      bubbles.push(new Bubble());
      lastBubbleSpawnTime = timestamp;
    }
    
    // 거품 업데이트 및 그리기
    bubbles.forEach((bubble, index) => {
      bubble.update();
      if (bubble.alive) {
        bubble.draw();
      }
    });
    
    // 폭발 효과 업데이트 및 그리기
    for (let i = explosions.length - 1; i >= 0; i--) {
      if (!explosions[i].update()) {
        explosions.splice(i, 1);
      } else {
        explosions[i].draw();
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  // 창 크기 변경 대응
  window.addEventListener('resize', () => {
    setupCanvas();
  });
  
  // 애니메이션 시작
  setTimeout(() => {
    updateDebug('애니메이션 시작');
    animate(0);
  }, 100);
}); 