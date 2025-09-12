class ColorSpotlight {
  constructor() {
    this.canvas = document.getElementById("mainCanvas");
    this.ctx = this.canvas.getContext("2d");

    // 이미지 경로 설정 (여기서 수정하세요)
    // 로컬 이미지나 CORS를 지원하는 이미지 URL을 사용하세요
    this.imagePath = "https://previews.123rf.com/images/chrisdorney/chrisdorney1607/chrisdorney160700100/61360644-sample-rubber-stamp-over-a-white-background.jpg";

    // 대체 이미지들 (CORS 문제가 있을 때 사용)
    this.fallbackImages = [
      "https://via.placeholder.com/800x600/ff6b6b/ffffff?text=Color+Spotlight",
      "https://via.placeholder.com/800x600/4ecdc4/ffffff?text=Demo+Image",
      "https://via.placeholder.com/800x600/45b7d1/ffffff?text=Test+Image",
    ];

    // 사각형 배열 - 위치와 크기를 쉽게 수정할 수 있습니다
    this.rects = [
      { x: 100, y: 100, w: 150, h: 100 },
      { x: 400, y: 200, w: 120, h: 80 },
      { x: 250, y: 350, w: 100, h: 120 },
    ];

    this.isDragging = false;
    this.dragIndex = -1;
    this.dragOffset = { x: 0, y: 0 };
    this.imageLoaded = false;
    this.currentImageIndex = 0;

    this.init();
  }

  async init() {
    try {
      // 메인 이미지 로드 시도
      await this.loadImage(this.imagePath);
    } catch (error) {
      console.log("메인 이미지 로드 실패, 대체 이미지 시도:", error.message);
      await this.tryFallbackImages();
    }

    // 이벤트 리스너 설정
    this.setupEventListeners();

    // 초기 렌더링
    this.render();
  }

  async tryFallbackImages() {
    for (let i = 0; i < this.fallbackImages.length; i++) {
      try {
        await this.loadImage(this.fallbackImages[i]);
        console.log("대체 이미지 로드 성공:", i);
        return;
      } catch (error) {
        console.log(`대체 이미지 ${i} 로드 실패:`, error.message);
        continue;
      }
    }

    // 모든 이미지 로드 실패 시 에러 표시
    throw new Error("모든 이미지 로드 실패");
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      // CORS 설정
      img.crossOrigin = "anonymous";

      img.onload = () => {
        console.log("이미지 로드 성공:", img.width, "x", img.height);
        this.image = img;
        this.imageLoaded = true;
        resolve(img);
      };

      img.onerror = (error) => {
        console.error("이미지 로드 에러:", error);
        reject(new Error("이미지를 로드할 수 없습니다"));
      };

      // 이미지 로딩 시작
      img.src = src;

      // 타임아웃 설정 (10초)
      setTimeout(() => {
        if (!this.imageLoaded) {
          reject(new Error("이미지 로딩 타임아웃"));
        }
      }, 10000);
    });
  }

  setupEventListeners() {
    // 마우스 이벤트
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));

    // 터치 이벤트 (모바일 지원)
    this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
    this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));

    // 버튼 이벤트
    document
      .getElementById("addRect")
      .addEventListener("click", this.addRandomRect.bind(this));
    document
      .getElementById("clearRects")
      .addEventListener("click", this.clearRects.bind(this));
    document
      .getElementById("changeImage")
      .addEventListener("click", this.changeImage.bind(this));

    // 파일 입력(사용자 업로드)
    const fileInput = document.getElementById("imageInput");
    if (fileInput) {
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        await this.loadFromFile(file);
      });
    }

    // 드래그 앤 드롭 업로드 (캔버스 위)
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      this.canvas.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    this.canvas.addEventListener("drop", async (e) => {
      const dt = e.dataTransfer;
      if (!dt) return;
      const file = dt.files && dt.files[0];
      if (!file) return;
      await this.loadFromFile(file);
    });
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.startDrag(x, y);
  }

  onMouseMove(e) {
    if (this.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.updateDrag(x, y);
    }
  }

  onMouseUp() {
    this.endDrag();
  }

  onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.startDrag(x, y);
  }

  onTouchMove(e) {
    e.preventDefault();
    if (this.isDragging) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.updateDrag(x, y);
    }
  }

  onTouchEnd(e) {
    e.preventDefault();
    this.endDrag();
  }

  startDrag(x, y) {
    for (let i = this.rects.length - 1; i >= 0; i--) {
      const rect = this.rects[i];
      if (
        x >= rect.x &&
        x <= rect.x + rect.w &&
        y >= rect.y &&
        y <= rect.y + rect.h
      ) {
        this.isDragging = true;
        this.dragIndex = i;
        this.dragOffset.x = x - rect.x;
        this.dragOffset.y = y - rect.y;
        break;
      }
    }
  }

  updateDrag(x, y) {
    if (this.isDragging && this.dragIndex >= 0) {
      const rect = this.rects[this.dragIndex];
      rect.x = x - this.dragOffset.x;
      rect.y = y - this.dragOffset.y;

      // 캔버스 경계 내로 제한
      rect.x = Math.max(0, Math.min(this.canvas.width - rect.w, rect.x));
      rect.y = Math.max(0, Math.min(this.canvas.height - rect.h, rect.y));

      this.render();
    }
  }

  endDrag() {
    this.isDragging = false;
    this.dragIndex = -1;
  }

  addRandomRect() {
    const w = 80 + Math.random() * 120;
    const h = 60 + Math.random() * 100;
    const x = Math.random() * (this.canvas.width - w);
    const y = Math.random() * (this.canvas.height - h);

    this.rects.push({ x, y, w, h });
    this.render();
  }

  clearRects() {
    this.rects = [];
    this.render();
  }

  async changeImage() {
    try {
      this.imageLoaded = false;

      // 다음 대체 이미지 시도
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.fallbackImages.length;
      const newImagePath = this.fallbackImages[this.currentImageIndex];

      console.log("새 이미지 시도:", newImagePath);
      await this.loadImage(newImagePath);
      this.render();
    } catch (error) {
      console.error("이미지 변경 실패:", error);
      this.showError();
    }
  }

  render() {
    // 이미지가 로드되지 않았으면 렌더링하지 않음
    if (!this.imageLoaded || !this.image) {
      return;
    }

    try {
      // 캔버스 클리어
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // 흑백 이미지 그리기
      this.ctx.filter = "grayscale(100%)";
      this.ctx.drawImage(
        this.image,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.ctx.filter = "none";

      // 각 사각형 영역에 컬러 이미지 그리기
      this.rects.forEach((rect) => {
        try {
          // 클리핑 마스크 설정
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.rect(rect.x, rect.y, rect.w, rect.h);
          this.ctx.clip();

          // 컬러 이미지 그리기
          this.ctx.drawImage(
            this.image,
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );

          this.ctx.restore();

          // 흰색 테두리 그리기
          this.ctx.strokeStyle = "white";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        } catch (clipError) {
          console.error("클리핑 에러:", clipError);
          this.ctx.restore();
        }
      });
    } catch (renderError) {
      console.error("렌더링 에러:", renderError);
      this.showError();
    }
  }

  async loadFromFile(file) {
    try {
      this.imageLoaded = false;
      const objectUrl = URL.createObjectURL(file);
      await this.loadImage(objectUrl);
      // 보안/메모리 누수 방지: 로드 후 해제 (이미지가 내부에 보관됨)
      URL.revokeObjectURL(objectUrl);
      this.render();
    } catch (error) {
      console.error("파일로부터 이미지 로드 실패:", error);
      this.showError();
    }
  }

  showError() {
    // 에러 시 기본 텍스트 표시
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "이미지를 로드할 수 없습니다",
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.fillText(
      "script.js의 imagePath를 확인해주세요",
      this.canvas.width / 2,
      this.canvas.height / 2 + 30
    );
    this.ctx.fillText(
      "CORS를 지원하는 이미지나 로컬 이미지를 사용하세요",
      this.canvas.width / 2,
      this.canvas.height / 2 + 60
    );
  }
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", () => {
  new ColorSpotlight();
});
