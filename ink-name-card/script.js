const canvas = document.getElementById("ink-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Branch {
  constructor(x, y, angle, length, depth, maxHeightRatio) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.length = length;
    this.depth = depth;
    this.progress = 0;
    this.hasBranched = false;
    this.branchPointRatio = 0.6 + Math.random() * 0.3;
    this.maxHeightRatio = maxHeightRatio || 0.3; // 기본값은 30%
    this.inkSplats = []; // 먹물 얼룩 배열
    
    // 수명 관련 속성 더욱 조정
    this.lifetime = 150 + Math.random() * 50; // 150~200으로 더 줄임
    this.age = 0;
    this.opacity = 1.0;
    this.fadeStartAge = this.lifetime * 0.6; // 60% 지점부터 페이드 시작
    
    // 먹물이 빨리 사라지도록 먹물 최대 수명 제한
    this.maxInkLifetime = 40; // 먹물 최대 수명 40프레임(약 0.66초)
  }

  get currentX() {
    return this.x + Math.cos(this.angle) * this.progress;
  }

  get currentY() {
    return this.y + Math.sin(this.angle) * this.progress;
  }

  update() {
    // 나이 증가
    this.age++;
    
    // 성장 로직(기존)
    if (this.progress < this.length) {
      this.progress += 2;
    }
    
    // 페이드 아웃 효과 계산 - 훨씬 더 빠르게 사라지도록 수정
    if (this.age > this.fadeStartAge) {
      const fadeProgress = (this.age - this.fadeStartAge) / (this.lifetime - this.fadeStartAge);
      // 더 급격한 비선형 감소 적용 (매우 빨리 사라짐)
      this.opacity = 1.0 - Math.pow(fadeProgress, 0.4);
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
    const startTaper = Math.max(this.depth * 0.6, 0.5);
    
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

    // 가지 성장 중에 먹물 얼룩 생성 (opacity를 고려하여)
    if (this.progress < this.length && Math.random() < 0.3 * this.opacity) {
      this.createInkSplat(x2, y2, this.depth);
    }
    
    // 기존 먹물 얼룩들 그리기
    this.drawInkSplats();
  }
  
  // 새로운 먹물 얼룩 생성 메서드
  createInkSplat(x, y, depth) {
    const size = 5 + Math.random() * depth * 3;
    const spread = 10 + Math.random() * 15;
    
    // 가지의 페이드 시작 시점에 맞춰 먹물도 사라지도록 조정
    const timeToFade = Math.max(0, this.fadeStartAge - this.age);
    
    // 먹물 수명을 최대값으로 제한하고, 가지가 페이드 시작하기 전에 사라지도록 함
    const lifetime = Math.min(this.maxInkLifetime, Math.max(10, timeToFade - 10));
    
    this.inkSplats.push({
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread,
      size: size,
      opacity: Math.min(this.opacity, 0.1 + Math.random() * 0.2),
      lifetime: lifetime,
      age: 0,
      growFactor: 1 + Math.random() * 0.5
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
      // 각 나무의 최대 높이 제한 사용
      const maxY = canvas.height * (1 - this.maxHeightRatio); // 위에서부터의 최대 높이
      if (this.currentY < maxY) return children;

      const baseCount = Math.max(1, Math.floor(this.depth / 2)); // depth 6 → 3, depth 1 → 1
      
      // 가지 개수를 1개 줄이기: baseCount-1을 기본으로 하고, 랜덤하게 추가
      // 단, 최소 1개는 보장
      const branchCount = Math.max(1, baseCount + Math.floor(Math.random() * baseCount));
      
      for (let i = 0; i < branchCount; i++) {
        const spread = Math.PI / 10;
        const angleOffset = (Math.random() - 0.5) * spread * 4;
        const newLength = this.length * (0.5 + Math.random() * 0.4);

        children.push(
          new Branch(
            this.currentX,
            this.currentY,
            this.angle + angleOffset,
            newLength,
            this.depth - 1,
            this.maxHeightRatio // 자식 가지에 최대 높이 비율 전달
          )
        );
      }

      this.hasBranched = true;
    }
    return children;
  }
}

let activeBranches = [];

canvas.addEventListener("click", (e) => {
  const x = e.clientX;
  const y = canvas.height;
  const baseLength = 120 + Math.random() * 30;
  
  // 나무 높이를 30%에서 70% 사이로 랜덤하게 설정
  const randomHeightRatio = 0.3 + Math.random() * 0.4; // 30%~70%
  
  const root = new Branch(x, y, -Math.PI / 2, baseLength, 7, randomHeightRatio);
  activeBranches.push(root);
});

function animate() {
  // 배경 페이드 효과
  ctx.fillStyle = "rgba(100, 100, 100, 0.01)";
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
        const children = branch.spawnChildren();
        newBranches.push(...children);
      }
    }
  });

  // 살아남은 가지들만 유지
  activeBranches = survivingBranches.concat(newBranches);
  requestAnimationFrame(animate);
}

animate();
