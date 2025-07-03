const canvas = document.getElementById("front-canvas");
const ctx = canvas.getContext("2d");

// 캔버스 크기 설정
const cardBorder = document.querySelector('.card-border');
canvas.width = 800;
canvas.height = 400;

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
    this.maxHeightRatio = maxHeightRatio || 0.8;
    this.inkSplats = [];
    
    this.lifetime = 150 + Math.random() * 50;
    this.age = 0;
    this.opacity = 1.0;
    this.fadeStartAge = this.lifetime * 0.6;
    this.maxInkLifetime = 40;
  }

  get currentX() {
    return this.x + Math.cos(this.angle) * this.progress;
  }

  get currentY() {
    return this.y + Math.sin(this.angle) * this.progress;
  }

  update() {
    this.age++;
    
    if (this.progress < this.length) {
      this.progress += 2;
    }
    
    if (this.age > this.fadeStartAge) {
      const fadeProgress = (this.age - this.fadeStartAge) / (this.lifetime - this.fadeStartAge);
      this.opacity = 1.0 - Math.pow(fadeProgress, 0.4);
    }

    this.drawSegment();
    
    return this.age < this.lifetime && this.opacity > 0.05;
  }

  drawSegment() {
    const x2 = this.currentX;
    const y2 = this.currentY;

    const startTaper = Math.max(this.depth * 0.6, 0.5);
    const endTaper = Math.max(this.depth * 0.3, 0.2);
    const perpAngle = this.angle + Math.PI / 2;
    
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

    ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity * 0.9})`;
    ctx.fill();

    if (this.progress < this.length && Math.random() < 0.3 * this.opacity) {
      this.createInkSplat(x2, y2, this.depth);
    }
    
    this.drawInkSplats();
  }
  
  createInkSplat(x, y, depth) {
    const size = 5 + Math.random() * depth * 3;
    const spread = 10 + Math.random() * 15;
    const timeToFade = Math.max(0, this.fadeStartAge - this.age);
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
  
  drawInkSplats() {
    for (let i = this.inkSplats.length - 1; i >= 0; i--) {
      const splat = this.inkSplats[i];
      
      splat.age++;
      
      const currentSize = splat.size * (1 + (splat.age / 100) * splat.growFactor);
      const lifeRatio = Math.pow(1 - (splat.age / splat.lifetime), 0.7);
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
      const maxY = canvas.height * (1 - this.maxHeightRatio);
      if (this.currentY < maxY) return children;

      const baseCount = Math.max(1, Math.floor(this.depth / 2));
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
            this.maxHeightRatio
          )
        );
      }

      this.hasBranched = true;
    }
    return children;
  }
}

let activeBranches = [];

// 앞면 캔버스에서 나무 그리기
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = canvas.height;
  
  const baseLength = 80 + Math.random() * 20; // 캔버스 크기에 맞춰 조정
  const randomHeightRatio = 0.7 + Math.random() * 0.1;
  
  const root = new Branch(x, y, -Math.PI / 2, baseLength, 6, randomHeightRatio);
  activeBranches.push(root);
});

// 카드 뒤집기 기능
const card = document.getElementById('business-card');
const flipToBackBtn = document.getElementById('flip-to-back');
const flipToFrontBtn = document.getElementById('flip-to-front');
const cardBack = document.querySelector('.card-back');

// 앞면에서 뒷면으로 뒤집기
flipToBackBtn.addEventListener('click', () => {
  // 현재 캔버스 내용을 이미지로 캡처
  const canvasDataURL = canvas.toDataURL();
  
  // 뒷면 배경으로 설정
  cardBack.style.backgroundImage = `url(${canvasDataURL})`;
  
  // 카드 뒤집기
  card.classList.add('flipped');
});

// 뒷면에서 앞면으로 뒤집기
flipToFrontBtn.addEventListener('click', () => {
  card.classList.remove('flipped');
});

// 캔버스 초기화 버튼 (선택사항)
document.addEventListener('keydown', (e) => {
  if (e.key === 'c' || e.key === 'C') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    activeBranches = [];
  }
});

function animate() {
  // 배경 페이드 효과
  ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const newBranches = [];
  const survivingBranches = [];

  activeBranches.forEach((branch) => {
    const isAlive = branch.update();
    
    if (isAlive) {
      survivingBranches.push(branch);
      
      if (branch.isReadyToBranch()) {
        const children = branch.spawnChildren();
        newBranches.push(...children);
      }
    }
  });

  activeBranches = survivingBranches.concat(newBranches);
  requestAnimationFrame(animate);
}

animate();
