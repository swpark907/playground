// 필름 데이터 배열 정의
const filmData = [
  {
    title: "홍길동",
    content: "",
    bgImage: "assets/images/profile1.png",
    bgVideo: null
  },
  {
    title: "사진 작가",
    content: "빛으로 마음을 기록합니다.",
    bgImage: "assets/images/profile1.png",
    bgVideo: null
  },
  {
    title: "기술 스택",
    content: "HTML, CSS, JavaScript, React, Node.js",
    bgImage: "assets/images/profile1.png",
    bgVideo: null
  },
  {
    title: "연락처",
    content: "email@example.com<br>instagram: @myprofile",
    bgImage: "assets/images/profile1.png",
    bgVideo: null
  }
];

// DOM 요소 선택
const startScreen = document.getElementById('startScreen');
const playBtn = document.getElementById('playBtn');
const filmSlider = document.getElementById('filmSlider');
const filmContainer = document.getElementById('filmContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const filmCounter = document.getElementById('filmCounter');
const bgMusic = document.getElementById('bgMusic');
const shutterSound = document.getElementById('shutterSound');
const curtainContainer = document.getElementById('curtainContainer');
const replayBtn = document.getElementById('replayBtn');
const homeBtn = document.getElementById('homeBtn');

// 현재 필름 인덱스
let currentFilmIndex = 0;
const LAST_FILM_INDEX = filmData.length - 1;

// 시작 화면 설정
filmSlider.style.display = 'none';
curtainContainer.style.display = 'none';

// 셔터 효과 재생
function playShutterEffect() {
  // 사운드 재생
  shutterSound.currentTime = 0;
  shutterSound.play().catch(error => {
    console.log('사운드 재생이 차단되었습니다:', error);
  });
  
  // 흔들림 효과
  filmContainer.classList.add('shake');
  setTimeout(() => {
    filmContainer.classList.remove('shake');
  }, 500);
}

// 커튼 효과 표시
function showCurtain() {
  curtainContainer.style.display = 'block';
  setTimeout(() => {
    curtainContainer.classList.add('active');
  }, 10);
}

// 커튼 효과 숨기기
function hideCurtain() {
  curtainContainer.classList.remove('active');
  setTimeout(() => {
    curtainContainer.style.display = 'none';
  }, 1500);
}

// 필름 프레임 생성 함수
function createFilmFrames() {
  filmContainer.innerHTML = '';
  
  filmData.forEach((film, index) => {
    const filmFrame = document.createElement('div');
    filmFrame.classList.add('film-frame');
    
    // 백그라운드 설정
    const bgElement = document.createElement('div');
    bgElement.classList.add('frame-background');
    
    if (film.bgVideo) {
      const video = document.createElement('video');
      video.src = film.bgVideo;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.classList.add('bg-video');
      bgElement.appendChild(video);
    } else if (film.bgImage) {
      bgElement.style.backgroundImage = `url(${film.bgImage})`;
    }
    
    // 컨텐츠 영역
    const contentElement = document.createElement('div');
    contentElement.classList.add('frame-content');
    
    const titleElement = document.createElement('h2');
    titleElement.textContent = film.title;
    
    const textElement = document.createElement('p');
    textElement.innerHTML = film.content;
    
    contentElement.appendChild(titleElement);
    contentElement.appendChild(textElement);
    
    // 프레임 구성
    filmFrame.appendChild(bgElement);
    filmFrame.appendChild(contentElement);
    
    // 활성화 여부 설정
    if (index === currentFilmIndex) {
      filmFrame.classList.add('active');
    } else {
      filmFrame.classList.add('hidden');
    }
    
    filmContainer.appendChild(filmFrame);
  });
  
  updateCounter();
}

// 카운터 업데이트
function updateCounter() {
  filmCounter.textContent = `${currentFilmIndex + 1}/${filmData.length}`;
}

// 필름 프레임 전환
function showFilmFrame(index) {
  // 유효한 인덱스 확인
  if (index < 0) {
    index = filmData.length - 1;
  } else if (index >= filmData.length) {
    index = 0;
  }
  
  // 셔터 효과 재생
  playShutterEffect();
  
  // 현재 활성화된 프레임 숨기기
  const currentFrame = filmContainer.querySelector('.film-frame.active');
  if (currentFrame) {
    currentFrame.classList.remove('active');
    currentFrame.classList.add('hidden');
  }
  
  // 새 프레임 활성화
  currentFilmIndex = index;
  const newFrame = filmContainer.querySelectorAll('.film-frame')[currentFilmIndex];
  newFrame.classList.remove('hidden');
  
  // 슬라이드 애니메이션 효과
  setTimeout(() => {
    newFrame.classList.add('active');
  }, 10);
  
  // 비디오 요소가 있다면 재생
  const video = newFrame.querySelector('video');
  if (video) {
    video.play();
  }
  
  updateCounter();
}

// 이벤트 리스너
playBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  filmSlider.style.display = 'block';
  createFilmFrames();
  
  // 배경 음악 재생
  bgMusic.play().catch(error => {
    console.log('자동 재생이 차단되었습니다:', error);
  });
});

prevBtn.addEventListener('click', () => {
  showFilmFrame(currentFilmIndex - 1);
});

nextBtn.addEventListener('click', () => {
  // 마지막 프레임에서 다음 버튼 클릭 시 커튼 효과 보여주기
  if (currentFilmIndex === LAST_FILM_INDEX) {
    showCurtain();
  } else {
    showFilmFrame(currentFilmIndex + 1);
  }
});

// 키보드 네비게이션
document.addEventListener('keydown', (e) => {
  if (filmSlider.style.display === 'block') {
    if (e.key === 'ArrowLeft') {
      showFilmFrame(currentFilmIndex - 1);
    } else if (e.key === 'ArrowRight') {
      // 마지막 프레임에서 오른쪽 화살표 누를 시 커튼 효과 보여주기
      if (currentFilmIndex === LAST_FILM_INDEX) {
        showCurtain();
      } else {
        showFilmFrame(currentFilmIndex + 1);
      }
    }
  }
});

// 커튼 버튼 이벤트 리스너
replayBtn.addEventListener('click', () => {
  hideCurtain();
  currentFilmIndex = 0;
  setTimeout(() => {
    showFilmFrame(0);
  }, 1000);
});

homeBtn.addEventListener('click', () => {
  hideCurtain();
  setTimeout(() => {
    filmSlider.style.display = 'none';
    startScreen.style.display = 'flex';
    currentFilmIndex = 0;
    // 배경 음악 정지
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }, 1000);
});
