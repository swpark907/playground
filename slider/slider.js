// slider
// 랜딩페이지에 쓰일 슬라이더
// hero 문구의 일부분이 정해진 문자열 배열 순서대로 위에서 아래로 슬라이더 되며 무한 반복복

const sliderContents = ["kim", "lee", "park"];

const slider = document.querySelector('.slider');

const sliderItems = document.createElement('li');
sliderItems.className = 'slider-item';

slider.appendChild(sliderItems);

sliderItems.textContent = sliderContents[0];

