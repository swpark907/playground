class BuildingCanvas {
    constructor() {
        this.canvas = document.getElementById('buildingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.buildings = [];
        this.currentIndex = 0;
        this.scrollY = 0;
        this.isScrolling = false;
        this.animating = false;
        this.animationType = 'slide'; // 'slide' 또는 'fade'로 변경 가능
        this.pixelSize = 6; // 픽셀 크기 줄임
        this.textLines = [
            '홍길동',
            '건축가',
            '서울특별시',
            '010-1234-5678',
            'email@example.com'
        ];
        this.fontLoaded = false;
        this.isMouseOnGlow = false;
        // 별, 구름, 달 랜덤값 미리 생성
        this.stars = Array.from({length: 32}, (_,i) => ({
            x: 40 + Math.random()*600,
            y: 20 + Math.random()*120,
            r: 1.2 + Math.random()*1.8,
            a: 0.6 + Math.random()*0.4,
            phase: Math.random()*Math.PI*2
        }));
        this.clouds = [
            {x: 180, y: 90, r: 22, a: 0.18},
            {x: 200, y: 90, r: 18, a: 0.13},
            {x: 190, y: 100, r: 16, a: 0.15},
            {x: 300, y: 60, r: 20, a: 0.10},
            {x: 320, y: 70, r: 16, a: 0.09}
        ];
        this.init();
    }

    init() {
        this.canvas.width = 700;
        this.canvas.height = 400;

        // 더 디테일한 건축물 데이터
        this.buildings = [
            this.createPixelHanokFancy(),
            this.createPixelModern(),      // 현대식 빌딩
            this.createPixelCathedral(),   // 서양식 성당
        ];

        this.canvas.addEventListener('wheel', this.handleScroll.bind(this));
        document.addEventListener('keydown', this.handleKey.bind(this));
        
        // 픽셀 폰트 로딩 후 draw
        document.fonts.load('16px "Press Start 2P"').then(() => {
            this.fontLoaded = true;
            this.draw();
        });
        // 마우스 오버 감지
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseOnGlow = false;
            this.draw();
        });
        // 별 깜빡임 애니메이션
        setInterval(() => { this.draw(); }, 600);
    }

    // 감성 밤하늘
    drawNightSky() {
        // 별 (분포 개선)
        const now = Date.now();
        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];
            const blink = 0.7 + 0.3 * Math.sin(now/900 + s.phase);
            this.ctx.globalAlpha = s.a * blink;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();
        }
        // 달 + glow
        this.ctx.globalAlpha = 0.95;
        this.ctx.beginPath();
        this.ctx.arc(120, 60, 18, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffeeb0';
        this.ctx.shadowColor = '#ffeeb0';
        this.ctx.shadowBlur = 32;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        // 구름 여러 개(위치/투명도 개선)
        const clouds = [
            {x: 180, y: 90, r: 22, a: 0.13},
            {x: 200, y: 90, r: 18, a: 0.09},
            {x: 190, y: 100, r: 16, a: 0.11},
            {x: 320, y: 70, r: 16, a: 0.07},
            {x: 350, y: 60, r: 20, a: 0.08}
        ];
        for (const c of clouds) {
            this.ctx.globalAlpha = c.a;
            this.ctx.beginPath();
            this.ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }

    // 더 정돈된 화려한 한옥 픽셀 아트
    createPixelHanokFancy() {
        const p = this.pixelSize;
        const px = 60, py = 5; // py 값을 더 크게 줄여서 건물이 확실히 위로 올라가도록 설정
        const pixels = [];
        // 1층 기단
        for(let i=0; i<40; i++) pixels.push({x: px+i*p, y: py+65*p, color:'#b0b0b0'});
        // 계단
        for(let j=63; j<65; j++) pixels.push({x: px+19*p, y: py+j*p, color:'#888'});
        for(let j=63; j<65; j++) pixels.push({x: px+20*p, y: py+j*p, color:'#888'});
        // 1층 본체(초록)
        for(let i=4; i<36; i++) for(let j=56; j<63; j++) pixels.push({x: px+i*p, y: py+j*p, color:'#2ecc71'});
        // 1층 창문(노란불)
        for(let i=6; i<34; i+=4) for(let j=58; j<61; j++) pixels.push({x: px+i*p, y: py+j*p, color:'#ffe066'});
        // 1층 기둥(붉은색)
        for(let i=6; i<34; i+=7) pixels.push({x: px+i*p, y: py+62*p, color:'#c0392b'});
        // 1층 난간(주황)
        for(let i=4; i<36; i+=4) pixels.push({x: px+i*p, y: py+64*p, color:'#e67e22'});
        // 2층 본체(청록)
        for(let i=8; i<32; i++) for(let j=49; j<55; j++) pixels.push({x: px+i*p, y: py+j*p, color:'#16a085'});
        // 2층 창문(하얀불)
        for(let i=10; i<30; i+=4) for(let j=51; j<54; j++) pixels.push({x: px+i*p, y: py+j*p, color:'#fff'});
        // 2층 기둥(붉은색)
        for(let i=10; i<30; i+=10) pixels.push({x: px+i*p, y: py+54*p, color:'#c0392b'});
        // 3층 본체(밝은 초록)
        for(let i=13; i<27; i++) for(let j=44; j<48; j++) pixels.push({x: px+i*p, y: py+j*p, color:'#6ee7b7'});
        // 3층 창문(하얀불)
        for(let i=15; i<26; i+=5) for(let j=45; j<47; j++) pixels.push({x: px+i*p, y: py+j*p, color:'#fff'});
        // 3층 기둥(붉은색)
        for(let i=15; i<26; i+=10) pixels.push({x: px+i*p, y: py+47*p, color:'#c0392b'});
        // 1층 지붕(곡선, 검정)
        for(let i=0; i<40; i++) pixels.push({x: px+i*p, y: py+55*p+Math.round(Math.sin(i/8)*3), color:'#222'});
        // 2층 지붕(곡선, 남색)
        for(let i=6; i<34; i++) pixels.push({x: px+i*p, y: py+48*p+Math.round(Math.sin(i/7)*2), color:'#223366'});
        // 3층 지붕(곡선, 남색)
        for(let i=12; i<28; i++) pixels.push({x: px+i*p, y: py+42*p+Math.round(Math.sin(i/6)*1.5), color:'#223366'});
        // 단청(지붕 아래 장식)
        for(let i=6; i<34; i+=4) pixels.push({x: px+i*p, y: py+49*p, color:'#f6c177'});
        for(let i=12; i<28; i+=4) pixels.push({x: px+i*p, y: py+43*p, color:'#f6c177'});
        // 처마 끝(파랑, 위치 정돈)
        for(let i=0; i<40; i+=8) pixels.push({x: px+i*p, y: py+55*p+Math.round(Math.sin(i/8)*3), color:'#3498db'});
        for(let i=6; i<34; i+=7) pixels.push({x: px+i*p, y: py+48*p+Math.round(Math.sin(i/7)*2), color:'#3498db'});
        for(let i=12; i<28; i+=8) pixels.push({x: px+i*p, y: py+42*p+Math.round(Math.sin(i/6)*1.5), color:'#3498db'});
        return pixels;
    }

    createPixelModern() {
        // 현대식 빌딩 위치/크기 통일
        const p = this.pixelSize;
        const px = 60, py = 5; // py 값을 더 크게 줄여서 건물이 확실히 위로 올라가도록 설정
        const pixels = [];
        // 본체
        for(let i=0; i<20; i++) for(let j=0; j<60; j++) pixels.push({x: px+i*p, y: py+j*p, color:'#2980b9'});
        // 창문
        for(let i=2; i<18; i+=2) for(let j=4; j<56; j+=6) pixels.push({x: px+i*p, y: py+j*p, color:'#ecf0f1'});
        // 옥상
        for(let i=0; i<20; i++) pixels.push({x: px+i*p, y: py-2*p, color:'#222'});
        return pixels;
    }

    createPixelCathedral() {
        // 서양식 성당 위치/크기 통일
        const p = this.pixelSize;
        const px = 60, py = 5; // py 값을 더 크게 줄여서 건물이 확실히 위로 올라가도록 설정
        const pixels = [];
        // 본체
        for(let i=6; i<34; i++) for(let j=20; j<60; j++) pixels.push({x: px+i*p, y: py+j*p, color:'#b4926a'});
        // 지붕
        for(let i=4; i<36; i++) pixels.push({x: px+i*p, y: py+19*p, color:'#7f5539'});
        // 창문
        for(let i=10; i<30; i+=4) for(let j=32; j<52; j+=8) pixels.push({x: px+i*p, y: py+j*p, color:'#f6e58d'});
        // 첨탑
        for(let j=0; j<20; j++) pixels.push({x: px+20*p, y: py+j*p, color:'#7f5539'});
        // 십자가
        pixels.push({x: px+20*p, y: py-4*p, color:'#fff'});
        pixels.push({x: px+19*p, y: py-2*p, color:'#fff'});
        pixels.push({x: px+21*p, y: py-2*p, color:'#fff'});
        return pixels;
    }

    handleKey(e) {
        if (e.key === 'ArrowUp') this.changeBuilding(-1);
        if (e.key === 'ArrowDown') this.changeBuilding(1);
    }

    handleScroll(e) {
        e.preventDefault();
        if (!this.isScrolling && !this.animating) {
            this.isScrolling = true;
            this.scrollY += e.deltaY;
            if (Math.abs(this.scrollY) > 100) {
                this.changeBuilding(this.scrollY > 0 ? 1 : -1);
                this.scrollY = 0;
            }
            setTimeout(() => { this.isScrolling = false; }, 100);
        }
    }

    changeBuilding(direction) {
        if (this.animating) return;
        const prevIndex = this.currentIndex;
        this.currentIndex = (this.currentIndex + direction + this.buildings.length) % this.buildings.length;
        if (this.animationType === 'slide') {
            this.animateSlide(prevIndex, this.currentIndex, direction);
        } else if (this.animationType === 'fade') {
            this.animateFade(prevIndex, this.currentIndex);
        } else {
            this.draw();
        }
    }

    animateSlide(fromIdx, toIdx, direction) {
        this.animating = true;
        const duration = 400;
        const start = performance.now();
        const height = this.canvas.height;
        const self = this;
        function animate(now) {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            const offset = direction > 0 ? -t * height : t * height;
            self.ctx.clearRect(0, 0, self.canvas.width, height);
            self.drawBackground();
            self.drawBuildingAt(fromIdx, 0, offset);
            self.drawBuildingAt(toIdx, 0, offset + (direction > 0 ? height : -height));
            self.drawLampAndText();
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                self.animating = false;
                self.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    animateFade(fromIdx, toIdx) {
        this.animating = true;
        const duration = 400;
        const start = performance.now();
        const self = this;
        function animate(now) {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
            self.drawBackground();
            self.ctx.globalAlpha = 1 - t;
            self.drawBuildingAt(fromIdx, 0, 0);
            self.ctx.globalAlpha = t;
            self.drawBuildingAt(toIdx, 0, 0);
            self.ctx.globalAlpha = 1;
            self.drawLampAndText();
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                self.animating = false;
                self.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    drawBuildingAt(idx, offsetX = 0, offsetY = 0) {
        const building = this.buildings[idx];
        building.forEach(pixel => {
            this.ctx.fillStyle = pixel.color;
            this.ctx.fillRect(pixel.x + offsetX, pixel.y + offsetY - 20, this.pixelSize, this.pixelSize); // 모든 건물을 20픽셀 위로 추가 이동
        });
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const glowX = 580; // 빛의 중심점 조정
        const glowY = 300; 
        const dist = Math.sqrt((mouseX - glowX) ** 2 + (mouseY - glowY) ** 2);
        this.isMouseOnGlow = dist < 90;
        this.draw();
    }

    drawLampAndText() {
        // 가로등 위치(글씨 오른쪽으로 이동)
        const lampX = 640, lampY = 260; // 가로등을 왼쪽으로 약간 이동(680->640)
        const poleHeight = 90;
        // 기둥
        this.ctx.save();
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(lampX, lampY);
        this.ctx.lineTo(lampX, lampY + poleHeight);
        this.ctx.stroke();
        // 램프 헤드(작게)
        this.ctx.beginPath();
        this.ctx.arc(lampX, lampY, 16, Math.PI * 0.2, Math.PI * 0.8, false); // 램프 헤드 방향 변경
        this.ctx.lineTo(lampX, lampY);
        this.ctx.closePath();
        this.ctx.fillStyle = '#222';
        this.ctx.fill();
        // 헤드 아래 spot(광원)
        this.ctx.beginPath();
        this.ctx.arc(lampX, lampY + 8, 6, 0, Math.PI * 2);
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillStyle = 'rgba(255,255,200,0.9)';
        this.ctx.fill();
        this.ctx.globalAlpha = 1;

        // 가로등에서 퍼지는 빛 개선 - 자연스러운 원뿔형 빛
        this.ctx.save();
        
        // 중앙 빛
        const centerGrad = this.ctx.createRadialGradient(lampX, lampY + 8, 5, lampX, lampY + 60, 120);
        centerGrad.addColorStop(0, this.isMouseOnGlow ? 'rgba(255,255,200,0.4)' : 'rgba(255,255,200,0.25)');
        centerGrad.addColorStop(0.6, this.isMouseOnGlow ? 'rgba(255,255,200,0.15)' : 'rgba(255,255,200,0.08)');
        centerGrad.addColorStop(1, 'rgba(255,255,200,0)');
        
        this.ctx.beginPath();
        this.ctx.arc(lampX, lampY + 50, 100, 0, Math.PI * 2);
        this.ctx.fillStyle = centerGrad;
        this.ctx.fill();
        
        // 왼쪽으로 퍼지는 빛(텍스트 영역 강조)
        const leftGrad = this.ctx.createRadialGradient(lampX - 70, lampY + 40, 10, lampX - 70, lampY + 40, 120);
        leftGrad.addColorStop(0, this.isMouseOnGlow ? 'rgba(255,255,200,0.7)' : 'rgba(255,255,200,0.5)');
        leftGrad.addColorStop(0.5, this.isMouseOnGlow ? 'rgba(255,255,200,0.25)' : 'rgba(255,255,200,0.15)');
        leftGrad.addColorStop(1, 'rgba(255,255,200,0)');
        
        this.ctx.beginPath();
        this.ctx.moveTo(lampX, lampY + 10);
        this.ctx.lineTo(lampX - 100, lampY + 20);
        this.ctx.lineTo(lampX - 120, lampY + 120);
        this.ctx.lineTo(lampX - 20, lampY + 120);
        this.ctx.closePath();
        this.ctx.fillStyle = leftGrad;
        this.ctx.fill();
        
        this.ctx.restore();
        this.ctx.restore();
        
        // 글씨 크기/위치 조정
        this.ctx.save();
        const textStartX = 590; // 텍스트를 가로등과 더 가깝게 조정
        let textStartY = lampY + 40; // y축 위치 유지
        this.ctx.font = 'bold 16px "Press Start 2P", monospace'; // 글씨 크기 증가 (14->16)
        this.ctx.textAlign = 'right'; 
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = this.isMouseOnGlow ? '#fffbe6' : '#fff';
        this.ctx.shadowColor = this.isMouseOnGlow ? '#fffbe6' : '#fff';
        this.ctx.shadowBlur = this.isMouseOnGlow ? 8 : 2;
        this.ctx.fillText(this.textLines[0], textStartX, textStartY);
        this.ctx.font = '10px "Press Start 2P", monospace'; // 글씨 크기 증가 (8->10)
        for (let i = 1; i < this.textLines.length; i++) {
            this.ctx.fillStyle = this.isMouseOnGlow ? '#fffbe6' : '#fff';
            this.ctx.shadowColor = this.isMouseOnGlow ? '#fffbe6' : '#fff';
            this.ctx.shadowBlur = this.isMouseOnGlow ? 6 : 1;
            this.ctx.fillText(this.textLines[i], textStartX, textStartY + 22 + (i-1) * 14); // 줄 간격 조정
        }
        this.ctx.restore();
    }

    drawBackground() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#232946');
        grad.addColorStop(1, '#393e60');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawNightSky();
    }

    draw() {
        if (!this.fontLoaded) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.drawBuildingAt(this.currentIndex, 0, 0);
        this.drawLampAndText();
    }
}

// Canvas 초기화
window.addEventListener('load', () => {
    new BuildingCanvas();
});
