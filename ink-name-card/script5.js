const canvas = document.getElementById("ink-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 각 글자 요소 선택
const charElements = document.querySelectorAll('.char-wrapper');
// 각 글자 요소별 위치와 크기 정보를 저장할 배열
const charInfo = [];
// 각 글자 요소의 표시 여부
const revealedState = new Array(charElements.length).fill(false);

// 글자 요소들의 위치 및 크기 계산
function calculateCharPositions() {
  charInfo.length = 0; // 기존 정보 초기화
  
  charElements.forEach((element, index) => {
    // 초기에 모든 글자가 숨겨져 있도록
    element.classList.remove('revealed');
    
    // 위치 정보 계산
    const rect = element.getBoundingClientRect();
    
    charInfo.push({
      element: element,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
      text: element.textContent
    });
  });
}

// DOM이 완전히 로드된 후 초기 글자 위치 계산
document.addEventListener('DOMContentLoaded', () => {
  // 초기 계산
  calculateCharPositions();
});

class Branch {
  constructor(x, y, angle, length, depth, maxDistance) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.length = length;
    this.depth = depth;
    this.progress = 0;
    this.hasBranched = false;
    // 분기점 비율 수정
    this.branchPointRatio = 0.3 + Math.random() * 0.2; // 0.3 ~ 0.5 사이로 변경
    this.maxDistance = maxDistance || 300; // 최대 거리 제한 (기본값 300px)
    this.inkSplats = []; // 먹물 얼룩 배열
    
    // 수명 관련 속성 - 가지가 더 빨리 사라지도록 설정
    this.lifetime = 80 + Math.random() * 30; // 수명 더 줄임
    this.age = 0;
    this.opacity = 1.0;
    this.fadeStartAge = this.lifetime * 0.4; // 40% 지점부터 페이드 시작 (더 빨리 사라짐)
    
    // 먹물이 빨리 사라지도록 먹물 최대 수명 제한
    this.maxInkLifetime = 40; // 먹물 최대 수명 40프레임(약 0.66초)
    
    // 시작점 저장 (거리 계산용)
    this.startX = x;
    this.startY = y;
    
    // 성장 속도를 좀 더 빠르게
    this.growthSpeed = 3 + Math.random() * 2; // 3~5 픽셀/프레임
  }

  get currentX() {
    return this.x + Math.cos(this.angle) * this.progress;
  }

  get currentY() {
    return this.y + Math.sin(this.angle) * this.progress;
  }
  
  // 시작점으로부터의 거리 계산
  getDistanceFromStart() {
    const dx = this.currentX - this.startX;
    const dy = this.currentY - this.startY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  update() {
    // 나이 증가
    this.age++;
    
    // 성장 로직(기존)
    if (this.progress < this.length) {
      this.progress += this.growthSpeed; // 성장 속도 적용
    }
    
    // 페이드 아웃 효과 계산 - 더 빠르게 사라지도록 수정
    if (this.age > this.fadeStartAge) {
      const fadeProgress = (this.age - this.fadeStartAge) / (this.lifetime - this.fadeStartAge);
      // 더 급격한 비선형 감소 적용 (더 빨리 사라짐)
      this.opacity = 1.0 - Math.pow(fadeProgress, 0.3);
    }

    // 그리기
    this.drawSegment();
    
    // 투명도가 0.05 이하면 사라진 것으로 간주 (수명이 다 되지 않아도)
    return this.age < this.lifetime && this.opacity > 0.05;
  }

  drawSegment() {
    const x2 = this.currentX;
    const y2 = this.currentY;

    // 시작점의 두께
    const startTaper = Math.max(this.depth * 0.5, 0.5);
    
    // 끝점의 두께 (시작점보다 더 가늘게)
    const endTaper = Math.max(this.depth * 0.3, 0.2);
    
    const perpAngle = this.angle + Math.PI / 2;
    
    // 시작점과 끝점의 오프셋 계산
    const startOffsetX = Math.cos(perpAngle) * startTaper;
    const startOffsetY = Math.sin(perpAngle) * startTaper;
    const endOffsetX = Math.cos(perpAngle) * endTaper;
    const endOffsetY = Math.sin(perpAngle) * endTaper;

    ctx.beginPath();
    ctx.moveTo(this.x - startOffsetX, this.y - startOffsetY);
    ctx.lineTo(x2 - endOffsetX, y2 - endOffsetY);
    ctx.lineTo(x2 + endOffsetX, y2 + endOffsetY);
    ctx.lineTo(this.x + startOffsetX, this.y + startOffsetY);
    ctx.closePath();

    // 투명도를 적용한 색상 사용
    ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity * 0.9})`;
    ctx.fill();

    // 가지 성장 중에 먹물 얼룩 생성 (opacity를 고려하여) - 더 많은 얼룩 생성
    if (this.progress < this.length && Math.random() < 0.5 * this.opacity) {
      this.createInkSplat(x2, y2, this.depth);
    }
    
    // 기존 먹물 얼룩들 그리기
    this.drawInkSplats();
  }
  
  // 새로운 먹물 얼룩 생성 메서드
  createInkSplat(x, y, depth) {
    // 먹물 크기 증가
    const size = 10 + Math.random() * depth * 5;
    const spread = 15 + Math.random() * 25;
    
    // 가지의 페이드 시작 시점에 맞춰 먹물도 사라지도록 조정
    const timeToFade = Math.max(0, this.fadeStartAge - this.age);
    
    // 먹물 수명을 최대값으로 제한하고, 가지가 페이드 시작하기 전에 사라지도록 함
    const lifetime = Math.min(this.maxInkLifetime, Math.max(10, timeToFade - 10));
    
    const splat = {
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread,
      size: size,
      opacity: Math.min(this.opacity, 0.1 + Math.random() * 0.2),
      lifetime: lifetime,
      age: 0,
      growFactor: 1 + Math.random() * 0.5
    };
    
    this.inkSplats.push(splat);
    
    // 먹물 얼룩과 글자 충돌 체크
    this.checkCharCollision(splat);
  }
  
  // 먹물 얼룩과 글자의 충돌 체크 - 개별 글자 단위로 처리
  checkCharCollision(splat) {
    // 글자 요소가 비어있으면 위치 재계산
    if (charInfo.length === 0) {
      calculateCharPositions();
    }
    
    charInfo.forEach((char, index) => {
      if (!revealedState[index]) {
        // 확장된 충돌 영역 (글자 주변 여유 공간 포함)
        const padding = 10; // 글자 주변에 10px 여유 공간
        
        // 간단한 충돌 감지 - 원과 사각형 충돌 (확장된 영역 사용)
        const dx = Math.abs(splat.x - char.x);
        const dy = Math.abs(splat.y - char.y);
        
        // 글자의 확장된 경계와 먹물 얼룩의 충돌 확인
        if (dx <= ((char.width/2 + padding) + splat.size) && 
            dy <= ((char.height/2 + padding) + splat.size)) {
          
          // 충돌하면 해당 글자만 표시
          revealedState[index] = true;
          char.element.classList.add('revealed');
        }
      }
    });
  }
  
  // 먹물 얼룩 그리기 및 업데이트
  drawInkSplats() {
    for (let i = this.inkSplats.length - 1; i >= 0; i--) {
      const splat = this.inkSplats[i];
      
      splat.age++;
      
      const currentSize = splat.size * (1 + (splat.age / 100) * splat.growFactor);
      
      // 더 빠른 페이드아웃 적용
      const lifeRatio = Math.pow(1 - (splat.age / splat.lifetime), 0.7);
      // 가지의 투명도에 영향을 받음
      const opacity = splat.opacity * lifeRatio * this.opacity;
      
      ctx.beginPath();
      ctx.arc(splat.x, splat.y, currentSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.fill();
      
      // 업데이트된 크기로 다시 충돌 체크
      if (currentSize > splat.size) {
        this.checkCharCollision({...splat, size: currentSize});
      }
      
      if (splat.age >= splat.lifetime) {
        this.inkSplats.splice(i, 1);
      }
    }
  }

  isReadyToBranch() {
    return (
      !this.hasBranched && this.progress >= this.length * this.branchPointRatio
    );
  }

  spawnChildren() {
    const children = [];
    if (this.depth > 0) {
      // 시작점으로부터의 거리가 최대 거리를 초과하면 더 이상 분기하지 않음
      if (this.getDistanceFromStart() > this.maxDistance) return children;

      // 자식 수 대폭 줄이기
      const baseCount = Math.floor(this.depth / 2); // depth 6 → 3, depth 1 → 0
      
      // 가지 개수 - 훨씬 적은 가지 생성 (성능 향상)
      const branchCount = Math.max(1, baseCount); // 최소 1개, 최대 depth/2개
      
      for (let i = 0; i < branchCount; i++) {
        const spread = Math.PI / 3; // 60도 각도
        const angleOffset = (Math.random() - 0.5) * spread;
        // 짧은 길이의 새 가지 생성
        const newLength = this.length * (0.3 + Math.random() * 0.3); // 30%~60%

        children.push(
          new Branch(
            this.currentX,
            this.currentY,
            this.angle + angleOffset,
            newLength,
            this.depth - 1,
            this.maxDistance
          )
        );
      }

      this.hasBranched = true;
    }
    return children;
  }
}

let activeBranches = [];

// 최대 가지 수 제한
const MAX_BRANCHES = 300;

// 클릭 지점에서 모든 방향으로 퍼지도록 수정
canvas.addEventListener("click", (e) => {
  const x = e.clientX;
  const y = e.clientY;
  // 더 짧은 초기 가지 길이로 변경
  const baseLength = 30 + Math.random() * 20; // 30~50으로 줄임
  // 초기 가지 수 줄이기
  const branches = 6 + Math.floor(Math.random() * 3); // 6~8개의 초기 가지
  const maxDistance = 200 + Math.random() * 50; // 최대 거리 감소
  
  // 여러 방향으로 동시에 가지 생성
  for (let i = 0; i < branches; i++) {
    const angle = (Math.PI * 2 * i / branches) + (Math.random() * 0.3); // 고른 분포의 초기 각도
    const root = new Branch(x, y, angle, baseLength, 4, maxDistance);
    activeBranches.push(root);
  }
});

function animate() {
  // 배경 페이드 효과 - 흰 배경에 맞게 변경
  ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const newBranches = [];
  const survivingBranches = [];

  activeBranches.forEach((branch) => {
    // update 메서드가 가지가 살아있는지 여부를 반환하도록 수정
    const isAlive = branch.update();
    
    // 이 가지가 살아있으면 유지
    if (isAlive) {
      survivingBranches.push(branch);
      
      // 분기 가능한 상태인지 확인
      if (branch.isReadyToBranch()) {
        // 가지 수 제한에 도달하지 않았을 때만 새 가지 추가
        if (activeBranches.length + newBranches.length < MAX_BRANCHES) {
          const children = branch.spawnChildren();
          newBranches.push(...children);
        }
      }
    }
  });

  // 살아남은 가지들만 유지
  activeBranches = survivingBranches.concat(newBranches);
  
  requestAnimationFrame(animate);
}

// 리사이즈 이벤트 처리
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // 글자 위치 재계산
  calculateCharPositions();
});

// 페이지 로딩 완료 후 애니메이션 시작
window.addEventListener('load', () => {
  // 글자 위치 계산
  calculateCharPositions();
  
  // 애니메이션 시작
  animate();
}); 