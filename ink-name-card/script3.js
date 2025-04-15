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
    this.flowers = []; // 꽃 배열 추가
    // 마지막 또는 마지막에서 두번째 분기 가지인지 확인
    this.canGrowFlower = depth === 1 || depth === 2;
    this.branchPointFlowerAdded = false; // 분기점에 꽃이 추가되었는지 확인
  }

  get currentX() {
    return this.x + Math.cos(this.angle) * this.progress;
  }

  get currentY() {
    return this.y + Math.sin(this.angle) * this.progress;
  }

  update() {
    if (this.progress < this.length) {
      this.progress += 2;
    }

    // 항상 그리기: 가지가 자라든 아니든 매 프레임 그린다
    this.drawSegment();
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

    ctx.fillStyle = `rgba(0, 0, 0, 0.9)`; // 살짝 투명하게 만들어 먹물 효과 강화
    ctx.fill();

    // 가지 성장 중에 먹물 얼룩 생성
    if (this.progress < this.length && Math.random() < 0.2) {
      // 30% 확률로 얼룩 생성
      this.createInkSplat(x2, y2, this.depth);
    }

    // 기존 먹물 얼룩들 그리기
    this.drawInkSplats();
  }

  // 새로운 먹물 얼룩 생성 메서드
  createInkSplat(x, y, depth) {
    const size = 5 + Math.random() * depth * 3; // 깊이에 따라 크기 달라짐
    const spread = 10 + Math.random() * 15; // 얼마나 퍼질지
    const lifetime = 50 + Math.random() * 100; // 얼룩 수명

    this.inkSplats.push({
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread,
      size: size,
      opacity: 0.1 + Math.random() * 0.2, // 초기 투명도
      lifetime: lifetime,
      age: 0,
      growFactor: 1 + Math.random() * 0.5, // 얼룩이 커지는 속도
    });

    // 일반 가지에서의 꽃 생성 확률 유지: 8%
    if (this.canGrowFlower && Math.random() < 0.01) {
      this.addFlower(x, y);
    }

    // 가지 끝 부분 꽃 생성 확률 대폭 감소: 12%에서 5%로
    if (
      this.canGrowFlower &&
      this.progress / this.length > 0.9 &&
      Math.random() < 0.03
    ) {
      this.addFlower(x, y);
    }
  }

  // 꽃 추가 헬퍼 메서드
  addFlower(x, y) {
    const flowerSize = 1 + Math.random() * 3; // 작은 크기의 꽃
    const baseColor = Math.random() * 30 + 330; // 분홍~연보라 계열
    const lightness = 70 + Math.random() * 20;
    const opacity = Math.random() * 0.4; // 투명도 50~90%로 상향 조정

    this.flowers.push({
      x: x,
      y: y,
      size: flowerSize,
      baseColor: baseColor,
      lightness: lightness,
      opacity: opacity,
    });
  }

  // 먹물 얼룩 그리기 및 업데이트
  drawInkSplats() {
    for (let i = this.inkSplats.length - 1; i >= 0; i--) {
      const splat = this.inkSplats[i];

      // 나이 증가
      splat.age++;

      // 크기 증가 (서서히 퍼짐)
      const currentSize =
        splat.size * (1 + (splat.age / 100) * splat.growFactor);

      // 투명도 감소 (서서히 흐려짐)
      const lifeRatio = 1 - splat.age / splat.lifetime;
      const opacity = splat.opacity * lifeRatio;

      // 불규칙한 모양의 얼룩 그리기
      ctx.beginPath();

      // 더 자연스러운 불규칙한 얼룩 형태 생성
      const points = 5 + Math.floor(Math.random() * 3);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const deform =
          1 - splat.deformFactor + Math.random() * splat.deformFactor * 2;
        const radius = currentSize * deform;

        const px = splat.x + Math.cos(angle) * radius;
        const py = splat.y + Math.sin(angle) * radius;

        if (j === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.closePath();
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.fill();

      // 수명이 다 된 얼룩 제거
      if (splat.age >= splat.lifetime) {
        this.inkSplats.splice(i, 1);
      }
    }
  }

  // 꽃 그리기
  drawFlowers() {
    this.flowers.forEach((flower) => {
      // 방사형 그라데이션 생성
      const gradient = ctx.createRadialGradient(
        flower.x,
        flower.y,
        0,
        flower.x,
        flower.y,
        flower.size
      );

      // 중앙은 더 밝고 진하게, 가장자리로 갈수록 완전히 투명하게
      gradient.addColorStop(
        0,
        `hsla(${flower.baseColor}, 90%, ${flower.lightness}%, ${flower.opacity})`
      );
      gradient.addColorStop(
        0.6,
        `hsla(${flower.baseColor}, 80%, ${flower.lightness - 5}%, ${
          flower.opacity * 0.8
        })`
      );
      gradient.addColorStop(
        1,
        `hsla(${flower.baseColor}, 70%, ${flower.lightness - 10}%, 0)`
      );

      ctx.beginPath();
      ctx.arc(flower.x, flower.y, flower.size * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }

  isReadyToBranch() {
    // 분기점 꽃 생성 확률도 낮춤: 20%에서 10%로
    if (
      !this.hasBranched &&
      !this.branchPointFlowerAdded &&
      this.progress >= this.length * this.branchPointRatio &&
      Math.random() < 0.1
    ) {
      // 분기점에 꽃 추가
      this.addFlower(this.currentX, this.currentY);
      this.branchPointFlowerAdded = true;
    }

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
      const branchCount = Math.max(
        1,
        baseCount + Math.floor(Math.random() * baseCount)
      );

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
  // 배경을 더 투명하게 만들어 먹물 잔상을 강화
  ctx.fillStyle = "rgba(100, 100, 100, 0.01)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const newBranches = [];

  // 1단계: 모든 가지 업데이트 및 그리기
  activeBranches.forEach((branch) => {
    branch.update();

    if (branch.isReadyToBranch()) {
      const children = branch.spawnChildren();
      newBranches.push(...children);
    }
  });

  // 2단계: 모든 꽃 그리기 (가지 위에 그려짐)
  activeBranches.forEach((branch) => {
    branch.drawFlowers();
  });

  activeBranches = activeBranches.concat(newBranches);
  requestAnimationFrame(animate);
}

animate();
