// 라벨드 포토 카드 - 리팩토링 버전

(function () {
  "use strict";

  // ===== 설정 및 상수 =====
  const CONFIG = {
    // 개발용 설정 - true로 설정하면 인트로를 건너뜀
    SKIP_INTRO: false, // 개발 시 편의를 위해 true로 변경 가능

    // UI 표시 설정 - 전체 라벨과 폴리라인 표시 제어
    SHOW_LABELS: true,        // 모든 라벨 표시 여부
    SHOW_POLYLINES: false,     // 모든 폴리라인 표시 여부

    IMAGE_SOURCES: ["photo-3.png"],
    FIT_MODE: "contain",
    FLASH_DURATION: {
      HOVER: 180,
      CLICK: 140
    },
    SCRAMBLE: {
      INTERVAL: 60,
      DELAY: 50,
      GLITCH_CHANCE: 0.7,
      DURATION: 1000 // 스크램블 유지 시간 (0.5초)
    }
  };

  // 영역 설정 데이터
  const AREAS_CONFIG = [
    {
      id: "area-1",
      label: "첫 번째 영역",
      rect: { x: 300, y: 700, w: 600, h: 200 },
      connector: {
        type: "polyline",
        points: [
          { x: 300, y: 900 },
          { x: 270, y: 950 },
          { x: 150, y: 950 }
        ]
      },
      labelPos: { x: 150, y: 970 },
      action: { type: "component", componentId: "view-area-1" },
      position: "bottom",
      hasScrambleEffect: true
    },
    {
      id: "area-2",
      label: "두 번째 영역",
      rect: { x: 700, y: 150, w: 400, h: 420 },
      connector: {
        type: "polyline",
        points: [
          { x: 1100, y: 570 },
          { x: 1000, y: 650 },
          { x: 850, y: 650 }
        ]
      },
      labelPos: { x: 850, y: 630 },
      action: { type: "component", componentId: "view-area-2" },
      position: "right",
      hasScrambleEffect: true
    },
    {
      id: "area-3",
      label: "세 번째 영역",
      rect: { x: 250, y: 150, w: 200, h: 150 },
      connector: {
        type: "polyline",
        points: [
          { x: 250, y: 300 },
          { x: 100, y: 200 },
          { x: 200, y: 200 }
        ]
      },
      labelPos: { x: 100, y: 180 },
      action: { type: "component", componentId: "view-area-3" },
      position: "left",
      hasScrambleEffect: true
    },
    {
      id: "area-4",
      label: "네 번째 영역",
      rect: { x: 120, y: 420, w: 150, h: 240 },
      connector: {
        type: "polyline",
        points: [
          { x: 270, y: 420 },
          { x: 350, y: 400 },
          { x: 460, y: 400 }
        ]
      },
      labelPos: { x: 370, y: 420 },
      action: { type: "component", componentId: "view-area-4" },
      position: "bottom",
      hasScrambleEffect: false
    }
  ];

  // ===== 내부 상태 =====
  const DOM = {
    app: document.getElementById("app"),
    stage: document.getElementById("stage"),
    canvas: document.getElementById("imageCanvas"),
    ctx: document.getElementById("imageCanvas").getContext("2d"),
    svg: document.getElementById("labelOverlay"),
    bottomDock: document.getElementById("bottomDock"),
    bottomDockContent: document.getElementById("bottomDockContent"),
    leftPanel: document.getElementById("leftPanel"),
    leftPanelContent: document.getElementById("leftPanelContent"),
    rightPanel: document.getElementById("rightPanel"),
    rightPanelContent: document.getElementById("rightPanelContent")
  };

// 상태 관리
const STATE = {
    image: null,
    imageNaturalWidth: 0,
    imageNaturalHeight: 0,
    flashRects: new Set(),
    hoverFlashTimers: new Map(),
    panelClickOutsideListener: null,
    isGatePassed: false
};

  // ===== 차원 관문 함수들 =====
  function showDimensionGate() {
    const gate = document.getElementById('dimension-gate');
    const gateText = document.getElementById('gate-text');

    // 개발용: SKIP_INTRO가 true이면 인트로 건너뛰기
    if (CONFIG.SKIP_INTRO) {
      console.log('🎯 개발 모드: 차원 관문 인트로를 건너뜁니다.');
      STATE.isGatePassed = true;
      showMainContent();
      return;
    }

    // 관문이 아직 표시되지 않았을 때만 표시
    if (!gate || STATE.isGatePassed) return;

    gate.style.display = 'flex';

    // 관문 텍스트에 스크램블 효과 적용
    if (gateText) {
      // 딜레이 없이 바로 스크램블 초기화 및 애니메이션 시작
      initializeScrambledText(gateText);
      animateTextReveal(gateText);
    }

    // 4초 후 관문 사라지기 시작 (스크램블 효과 단축으로 전체 시간 축소)
    setTimeout(() => {
      hideDimensionGate();
    }, 4000);
  }

  function hideDimensionGate() {
    const gate = document.getElementById('dimension-gate');

    if (!gate) return;

    // 페이드 아웃 효과
    gate.classList.add('fade-out');

    // 1.5초 후 완전히 숨김
    setTimeout(() => {
      gate.style.display = 'none';
      STATE.isGatePassed = true;

      // 메인 콘텐츠 표시
      showMainContent();
    }, 1500);
  }

  function showMainContent() {
    // 메인 앱 콘텐츠가 자연스럽게 나타나도록 함
    const app = DOM.app;
    if (app) {
      app.style.opacity = '0';
      app.style.display = 'block';

      // 부드러운 페이드 인
      setTimeout(() => {
        app.style.transition = 'opacity 1s ease-in-out';
        app.style.opacity = '1';
      }, 100);
    }
  }

  // ===== 유틸리티 함수들 =====
  function resizeCanvasToDisplaySize() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = DOM.stage.getBoundingClientRect();
    const displayWidth = Math.max(1, Math.floor(rect.width));
    const displayHeight = Math.max(1, Math.floor(rect.height));

    DOM.canvas.style.width = displayWidth + "px";
    DOM.canvas.style.height = displayHeight + "px";
    DOM.canvas.width = Math.floor(displayWidth * devicePixelRatio);
    DOM.canvas.height = Math.floor(displayHeight * devicePixelRatio);
    DOM.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function computeImageDrawRect() {
    const { width, height } = DOM.canvas.getBoundingClientRect();
    const iw = STATE.imageNaturalWidth;
    const ih = STATE.imageNaturalHeight;
    if (!iw || !ih || !width || !height) return { x: 0, y: 0, w: 0, h: 0 };

    const scaleContain = Math.min(width / iw, height / ih);
    const scaleCover = Math.max(width / iw, height / ih);
    const scale = CONFIG.FIT_MODE === "cover" ? scaleCover : scaleContain;
    const drawW = Math.round(iw * scale);
    const drawH = Math.round(ih * scale);
    const offX = Math.round((width - drawW) / 2);
    const offY = Math.round((height - drawH) / 2);
    return { x: offX, y: offY, w: drawW, h: drawH };
  }

  function imageToCanvasScale() {
    const drawRect = computeImageDrawRect();
    return {
      sx: drawRect.w / STATE.imageNaturalWidth,
      sy: drawRect.h / STATE.imageNaturalHeight,
      offX: drawRect.x,
      offY: drawRect.y,
    };
  }

  function drawScene() {
    if (!STATE.image) return;
    resizeCanvasToDisplaySize();
    const drawRect = computeImageDrawRect();

    // 바탕: 흑백 이미지 전체
    DOM.ctx.save();
    DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    DOM.ctx.filter = "grayscale(100%)";
    DOM.ctx.drawImage(STATE.image, drawRect.x, drawRect.y, drawRect.w, drawRect.h);
    DOM.ctx.restore();

    // 모든 사각형은 항상 컬러로, 단 hover 플래시 중인 사각형은 흰색으로 덮음
    const { sx, sy, offX, offY } = imageToCanvasScale();
    for (const r of AREAS_CONFIG) {
      const rx = Math.round(r.rect.x * sx + offX);
      const ry = Math.round(r.rect.y * sy + offY);
      const rw = Math.round(r.rect.w * sx);
      const rh = Math.round(r.rect.h * sy);

      if (STATE.flashRects.has(r.id)) {
        DOM.ctx.save();
        DOM.ctx.fillStyle = "#ffffff";
        DOM.ctx.fillRect(rx, ry, rw, rh);
        DOM.ctx.restore();
        continue;
      }

      DOM.ctx.save();
      DOM.ctx.beginPath();
      DOM.ctx.rect(rx, ry, rw, rh);
      DOM.ctx.clip();
      DOM.ctx.filter = "none";
      DOM.ctx.drawImage(STATE.image, drawRect.x, drawRect.y, drawRect.w, drawRect.h);
      DOM.ctx.restore();
    }
  }

  function updateSvgOverlay() {
    if (!STATE.image) return;
    const rect = DOM.canvas.getBoundingClientRect();
    DOM.svg.setAttribute(
      "viewBox",
      `0 0 ${Math.max(1, Math.floor(rect.width))} ${Math.max(1, Math.floor(rect.height))}`
    );
    DOM.svg.setAttribute("width", rect.width);
    DOM.svg.setAttribute("height", rect.height);
    DOM.svg.innerHTML = "";

    const { sx, sy, offX, offY } = imageToCanvasScale();

    for (const r of AREAS_CONFIG) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.classList.add("label-group", "cursor-pointer");
      group.dataset.id = r.id;

      const rx = r.rect.x * sx + offX;
      const ry = r.rect.y * sy + offY;
      const rw = r.rect.w * sx;
      const rh = r.rect.h * sy;

      const rectEl = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rectEl.setAttribute("x", rx);
      rectEl.setAttribute("y", ry);
      rectEl.setAttribute("width", rw);
      rectEl.setAttribute("height", rh);
      rectEl.setAttribute("class", "label-rect");
      group.appendChild(rectEl);

      // 히트 확장용 투명 rect
      const hitEl = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      hitEl.setAttribute("x", rx - 6);
      hitEl.setAttribute("y", ry - 6);
      hitEl.setAttribute("width", rw + 12);
      hitEl.setAttribute("height", rh + 12);
      hitEl.setAttribute("class", "label-hit");
      group.appendChild(hitEl);

      // 커넥터
      if (r.connector?.type === "polyline") {
        const connectorEl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        const pts = r.connector.points.map((p) => `${p.x * sx + offX},${p.y * sy + offY}`).join(" ");
        connectorEl.setAttribute("points", pts);
        connectorEl.setAttribute("class", "label-line");
        group.appendChild(connectorEl);
      }

      // 텍스트 라벨
      if (r.label && r.labelPos) {
        const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textEl.textContent = r.label;
        textEl.setAttribute("x", r.labelPos.x * sx + offX);
        textEl.setAttribute("y", r.labelPos.y * sy + offY);
        textEl.setAttribute("class", "label-text");
        textEl.setAttribute("dominant-baseline", "middle");
        textEl.setAttribute("text-anchor", "start");
        group.appendChild(textEl);
      }

      DOM.svg.appendChild(group);
    }

    bindSvgInteractions();
    updatePanelViewById("bottom", "view-default");
    hideLeftPanel();
    hideRightPanel();
  }

  function bindSvgInteractions() {
    const groups = DOM.svg.querySelectorAll(".label-group");
    groups.forEach((g) => {
      g.addEventListener("mouseenter", () => {
        const id = g.dataset.id || "";
        if (!id) return;
        if (STATE.hoverFlashTimers.has(id)) {
          clearTimeout(STATE.hoverFlashTimers.get(id));
        }
        STATE.flashRects.add(id);
        drawScene();
        const t = setTimeout(() => {
          STATE.flashRects.delete(id);
          STATE.hoverFlashTimers.delete(id);
          drawScene();
        }, CONFIG.FLASH_DURATION.HOVER);
        STATE.hoverFlashTimers.set(id, t);
      });
      g.addEventListener("click", () => {
        const id = g.dataset.id || "";
        if (!id) return;
        // 클릭 미세 피드백
        STATE.flashRects.add(id);
        drawScene();
        setTimeout(() => {
          STATE.flashRects.delete(id);
          drawScene();
        }, CONFIG.FLASH_DURATION.CLICK);
        handleRectClick(id);
      });
    });
  }

  // 범용 패널 뷰 업데이트 함수
  function updatePanelViewById(position, viewId) {
    const panels = {
      bottom: { container: DOM.bottomDockContent, selector: ".dock-view" },
      left: { container: DOM.leftPanelContent, selector: ".panel-view" },
      right: { container: DOM.rightPanelContent, selector: ".panel-view" }
    };

    const panel = panels[position];
    if (!panel?.container) return;

    const views = panel.container.querySelectorAll(panel.selector);
    views.forEach((v) => v.setAttribute("hidden", ""));
    const target = panel.container.querySelector(`#${viewId || "view-default"}`);
    if (target) target.removeAttribute("hidden");
  }


  // ===== 패널 표시 시 글리치 효과 =====
  function applyPanelEntryGlitch(panel) {
    console.log(`🎭 패널 표시 글리치 시작: ${panel.id}`);

    // 패널이 표시될 때 matrix-text 요소들에 글리치 효과 적용
    const matrixElements = panel.querySelectorAll('.matrix-text');
    console.log(`📝 ${panel.id}에서 ${matrixElements.length}개 matrix-text 요소 발견`);

    if (matrixElements.length > 0) {
      // 약간의 딜레이 후 글리치 효과 적용
      setTimeout(() => {
        matrixElements.forEach((element, index) => {
          console.log(`⚡ 요소 ${index + 1}/${matrixElements.length}에 글리치 적용`);
          setTimeout(() => {
            element.classList.add('glitch');
            setTimeout(() => {
              element.classList.remove('glitch');
            }, 250 + Math.random() * 200);
          }, index * 100); // 각 요소마다 100ms 간격으로 적용
        });

        // 추가로 2초 후 한번 더 강제 글리치 적용
        setTimeout(() => {
          console.log(`🔄 ${panel.id} 추가 글리치 적용`);
          const randomElement = matrixElements[Math.floor(Math.random() * matrixElements.length)];
          if (randomElement) {
            randomElement.classList.add('glitch');
            setTimeout(() => {
              randomElement.classList.remove('glitch');
            }, 300);
          }
        }, 2000);

      }, 300); // 패널 표시 후 300ms 딜레이
    }
  }

  // 패널 표시/숨김 제어
  function showLeftPanel() {
    DOM.leftPanel.classList.add('active');
    addPanelClickOutsideListener();
    // 패널 표시 시 글리치 효과 적용
    applyPanelEntryGlitch(DOM.leftPanel);
  }

  function hideLeftPanel() {
    DOM.leftPanel.classList.remove('active');
    removePanelClickOutsideListener();
  }

  function showRightPanel() {
    DOM.rightPanel.classList.add('active');
    addPanelClickOutsideListener();
    // 패널 표시 시 글리치 효과 적용
    applyPanelEntryGlitch(DOM.rightPanel);
  }

  function hideRightPanel() {
    DOM.rightPanel.classList.remove('active');
    removePanelClickOutsideListener();
  }

  // 패널 외부 클릭으로 닫기 기능
  function addPanelClickOutsideListener() {
    if (STATE.panelClickOutsideListener) {
      removePanelClickOutsideListener();
    }

    STATE.panelClickOutsideListener = function(event) {
      const isLeftActive = DOM.leftPanel.classList.contains('active');
      const isRightActive = DOM.rightPanel.classList.contains('active');

      // 패널이 활성화되어 있고, 패널 외부를 클릭한 경우
      if ((isLeftActive || isRightActive) &&
          !DOM.leftPanel.contains(event.target) &&
          !DOM.rightPanel.contains(event.target)) {
        hideLeftPanel();
        hideRightPanel();
      }
    };

    setTimeout(() => {
      document.addEventListener('click', STATE.panelClickOutsideListener);
    }, 50);
  }

  function removePanelClickOutsideListener() {
    if (STATE.panelClickOutsideListener) {
      document.removeEventListener('click', STATE.panelClickOutsideListener);
      STATE.panelClickOutsideListener = null;
    }
  }

  // ===== 스크램블 효과 함수들 =====
  function initializeScrambledText(element) {
    const originalText = element.textContent;
    element.setAttribute('data-original-text', originalText);

    const scrambledText = originalText.split('').map(char => {
      if (char === ' ' || char === ':' || char === '-' || char === '.') return char;
      return String.fromCharCode(33 + Math.random() * 94);
    }).join('');

    element.textContent = scrambledText;
    element.classList.add('scrambled');
  }

  function animateTextReveal(element) {
    const originalText = element.getAttribute('data-original-text');

    // 0.5초 동안 스크램블 상태 유지 (더 빠른 시작)
    const scrambleInterval = setInterval(() => {
      const scrambledText = originalText.split('').map(char => {
        if (char === ' ' || char === ':' || char === '-' || char === '.') return char;
        return String.fromCharCode(33 + Math.random() * 94);
      }).join('');

      element.textContent = scrambledText;

      if (Math.random() > CONFIG.SCRAMBLE.GLITCH_CHANCE) {
        element.classList.add('glitch');
        setTimeout(() => element.classList.remove('glitch'), 150 + Math.random() * 100);
      }
    }, CONFIG.SCRAMBLE.INTERVAL);

    // 0.5초 후 스크램블 종료 및 정상화 애니메이션 시작 (더 빠름)
    setTimeout(() => {
      clearInterval(scrambleInterval);

      // 정상화 애니메이션
      const chars = originalText.split('');
      let currentIndex = 0;

      const revealInterval = setInterval(() => {
        if (currentIndex >= chars.length) {
          clearInterval(revealInterval);
          element.textContent = originalText;
          element.classList.remove('scrambled');
          return;
        }

        const beforeText = originalText.substring(0, currentIndex + 1);
        let scrambledRest = '';

        if (currentIndex + 1 < chars.length) {
          scrambledRest = originalText.substring(currentIndex + 1).split('').map(char => {
            if (char === ' ' || char === ':' || char === '-' || char === '.') return char;
            return String.fromCharCode(33 + Math.random() * 94);
          }).join('');
        }

        element.textContent = beforeText + scrambledRest;

        if (Math.random() > CONFIG.SCRAMBLE.GLITCH_CHANCE) {
          element.classList.add('glitch');
          setTimeout(() => element.classList.remove('glitch'), 150 + Math.random() * 100);
        }

        currentIndex++;
      }, CONFIG.SCRAMBLE.INTERVAL);
    }, CONFIG.SCRAMBLE.DURATION);
  }

  function initializeAllMatrixText(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const matrixElements = container.querySelectorAll('.matrix-text');
    matrixElements.forEach(initializeScrambledText);
  }

  function animateAllMatrixText(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const matrixElements = container.querySelectorAll('.matrix-text');
    // 모든 요소가 동시에 스크램블 시작
    matrixElements.forEach(element => {
      animateTextReveal(element);
    });
  }

  // 사각형별 액션 라우팅
  function handleRectClick(id) {
    if (!id) return;
    const rect = AREAS_CONFIG.find((r) => r.id === id);
    if (!rect || !rect.action) return;

    const { action, position = "bottom", hasScrambleEffect = false } = rect;

    if (action.type === "link" && action.url) {
      window.open(action.url, "_blank", "noopener");
      return;
    }

    if (action.type === "component") {
      const componentId = action.componentId || "view-default";

      // 위치에 따른 패널 표시
      if (position === "left") {
        showLeftPanel();
        updatePanelViewById("left", componentId);
      } else if (position === "right") {
        showRightPanel();
        updatePanelViewById("right", componentId);
      } else {
        updatePanelViewById("bottom", componentId);
        // bottom dock에도 글리치 효과 적용
        applyPanelEntryGlitch(DOM.bottomDock);
      }

      // 스크램블 효과 적용
      if (hasScrambleEffect) {
        // 즉시 스크램블 초기화 및 애니메이션 시작
        initializeAllMatrixText(componentId);
        animateAllMatrixText(componentId);
      }
    }
  }

  // ===== 유틸리티 및 초기화 =====
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }


  // ===== 메인 텍스트 글리치 효과 =====
  function applyHeaderGlitch() {
    const headerText = document.querySelector('.header-text');
    if (!headerText) return;

    // 랜덤하게 글리치 효과 적용 (5-15초 간격)
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% 확률로 글리치 적용
        headerText.classList.add('glitch');
        setTimeout(() => {
          headerText.classList.remove('glitch');
        }, 200 + Math.random() * 300); // 0.2-0.5초 지속
      }
    }, 5000 + Math.random() * 10000); // 5-15초 간격

    // STATE에 저장해서 나중에 정리할 수 있도록
    STATE.headerGlitchInterval = glitchInterval;
  }

  // ===== 패널 글리치 효과 =====
  function applyPanelGlitch() {
    // 패널 글리치 효과 적용 (더 자주 적용하도록 변경)
    const panelGlitchInterval = setInterval(() => {
      // 현재 표시된 모든 matrix-text 요소들을 찾기 (header-text 제외)
      const matrixElements = document.querySelectorAll('.matrix-text:not(.header-text)');

      console.log(`🔍 패널 글리치 체크: ${matrixElements.length}개 요소 발견`);

      if (matrixElements.length > 0 && Math.random() < 1) { // 60% 확률로 글리치 적용 (증가)
        // 랜덤하게 1-4개의 요소 선택 (증가)
        const numElements = Math.min(Math.floor(Math.random() * 4) + 1, matrixElements.length);
        const selectedElements = [];

        for (let i = 0; i < numElements; i++) {
          const randomIndex = Math.floor(Math.random() * matrixElements.length);
          selectedElements.push(matrixElements[randomIndex]);
        }

        console.log(`⚡ 패널 글리치 적용: ${selectedElements.length}개 요소 선택`);

        // 선택된 요소들에 글리치 효과 적용
        selectedElements.forEach((element, index) => {
          setTimeout(() => {
            element.classList.add('glitch');
            setTimeout(() => {
              element.classList.remove('glitch');
            }, 200 + Math.random() * 300); // 0.2-0.5초 지속 (증가)
          }, index * 50); // 더 빠른 간격으로 적용
        });
      }
    }, 3000 + Math.random() * 500); // 3-8초 간격 (대폭 감소)

    // STATE에 저장해서 나중에 정리할 수 있도록
    STATE.panelGlitchInterval = panelGlitchInterval;
  }

  // ===== 기존 init 함수 확장 =====
  async function init() {
    try {
      console.log("🎬 초기화 시작...");

      // 이미지 로드
      const src = CONFIG.IMAGE_SOURCES[0];
      STATE.image = await loadImage(src);
      STATE.imageNaturalWidth = STATE.image.naturalWidth;
      STATE.imageNaturalHeight = STATE.image.naturalHeight;

      // 이벤트 리스너 설정
      window.addEventListener("resize", () => {
        drawScene();
        updateSvgOverlay();
      });

      // 캔버스 및 SVG 초기화
      drawScene();
      updateSvgOverlay();

      // 메인 텍스트에 글리치 효과 적용
      applyHeaderGlitch();

      // 패널 텍스트에 글리치 효과 적용
      applyPanelGlitch();

      console.log("✅ 초기화 완료!");
    } catch (err) {
      console.error("❌ 초기화 실패:", err);
    }
  }

  // 초기화 시작
  document.addEventListener("DOMContentLoaded", () => {
    // SKIP_INTRO가 true이면 관문 건너뛰고 바로 메인 콘텐츠 표시
    if (CONFIG.SKIP_INTRO) {
      console.log('🚀 개발 모드: 차원 관문을 건너뛰고 바로 메인 콘텐츠를 표시합니다.');
      // dimension-gate 요소를 완전히 숨김
      const gate = document.getElementById('dimension-gate');
      if (gate) {
        gate.style.display = 'none';
      }
      // 바로 메인 콘텐츠 표시 및 초기화
      showMainContent();
      init();
    } else {
      // 기존 로직: 먼저 관문 표시
      showDimensionGate();
      // 초기화 로직은 관문이 사라진 후에 실행 (4초 관문 + 1.5초 전환 = 5.5초)
      setTimeout(init, 5500);
    }
  });
})();

