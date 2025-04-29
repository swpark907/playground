document.addEventListener('DOMContentLoaded', () => {
    const nameCard = document.querySelector('.name-card');
    const manuscriptPaper = document.querySelector('.manuscript-paper');
    const grid = document.querySelector('.grid');
    
    // 기본 텍스트 내용 정의 (문자열로)
    const defaultLines = [
        "  한국 소프트웨어                ",
        "  홍길동              ",
        "  한국대학교 소프트웨어 공학부    ",
        "  기술 총괄    ",
        "                            ",
        "  hong@example.com         ",
        "  한국 서울특별시 용산구         "
    ];
    
    // 문자열을 개별 문자 배열로 변환하는 함수
    function stringToCharArray(str, cellsPerRow = 20) {
        const result = [];
        // 문자열이 cellsPerRow보다 짧으면 나머지를 빈 문자로 채움
        for (let i = 0; i < cellsPerRow; i++) {
            result.push(i < str.length ? str[i] : '');
        }
        return result;
    }
    
    // 문자열 배열을 개별 문자 2차원 배열로 변환
    function stringsToContentArray(lines) {
        return lines.map(line => stringToCharArray(line));
    }
    
    // 원고지 내용 생성 (localStorage에서 불러오거나 기본값 사용)
    let content;
    
    try {
        const savedContent = localStorage.getItem('manuscriptContent');
        if (savedContent) {
            content = JSON.parse(savedContent);
        } else {
            content = stringsToContentArray(defaultLines);
        }
    } catch (e) {
        console.error('저장된 내용을 불러오는 중 오류가 발생했습니다:', e);
        content = stringsToContentArray(defaultLines);
    }
    
    // 원고지 행과 셀 생성 함수
    function createManuscriptGrid() {
        // 행 수 만큼 반복
        for (let i = 0; i < content.length; i++) {
            // 행 요소 생성
            const row = document.createElement('div');
            row.className = 'row';
            
            // 각 행의 셀 생성 (20개의 셀)
            for (let j = 0; j < 20; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                // 내용이 있으면 셀에 추가
                if (content[i][j]) {
                    cell.textContent = content[i][j];
                }
                
                // 행에 셀 추가
                row.appendChild(cell);
            }
            
            // 그리드에 행 추가
            grid.appendChild(row);
        }
    }
    
    // 원고지 그리드 생성
    createManuscriptGrid();
    
    // 마우스 이동에 따른 3D 효과
    nameCard.addEventListener('mousemove', (e) => {
        const rect = nameCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        manuscriptPaper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // 그림자 효과 추가
        manuscriptPaper.style.boxShadow = `${rotateY * -1}px ${rotateX}px 15px rgba(0,0,0,0.2)`;
    });
    
    // 마우스가 카드를 벗어났을 때 원래 상태로 복귀
    nameCard.addEventListener('mouseleave', () => {
        manuscriptPaper.style.transform = 'rotateX(0) rotateY(0)';
        manuscriptPaper.style.boxShadow = '0px 0px 15px rgba(0,0,0,0.1)';
    });
    
    // 초기 그림자 설정
    manuscriptPaper.style.boxShadow = '0px 0px 15px rgba(0,0,0,0.1)';
    
    // 텍스트 내용 변경 함수 (개별 셀)
    function updateCell(rowIndex, colIndex, text) {
        if (rowIndex >= 0 && rowIndex < content.length && 
            colIndex >= 0 && colIndex < 20) {
            // 내용 배열 업데이트
            content[rowIndex][colIndex] = text;
            
            // DOM 요소 업데이트
            const rows = grid.querySelectorAll('.row');
            const cell = rows[rowIndex].querySelectorAll('.cell')[colIndex];
            cell.textContent = text;
            
            // 로컬 스토리지에 저장
            localStorage.setItem('manuscriptContent', JSON.stringify(content));
        }
    }
    
    // 텍스트 라인 변경 함수 (문자열로 한 줄 변경)
    function updateLine(rowIndex, text) {
        if (rowIndex >= 0 && rowIndex < content.length) {
            // 문자열을 개별 문자 배열로 변환
            const charArray = stringToCharArray(text);
            
            // 내용 배열 업데이트
            content[rowIndex] = charArray;
            
            // DOM 요소 업데이트
            const rows = grid.querySelectorAll('.row');
            const cells = rows[rowIndex].querySelectorAll('.cell');
            
            cells.forEach((cell, index) => {
                cell.textContent = charArray[index] || '';
            });
            
            // 로컬 스토리지에 저장
            localStorage.setItem('manuscriptContent', JSON.stringify(content));
        }
    }
    
    // 전체 내용 변경 함수 (2차원 배열)
    function setContent(newContent) {
        // 기존 내용 삭제
        grid.innerHTML = '';
        content.length = 0;
        
        // 새 내용으로 업데이트
        for (const row of newContent) {
            content.push([...row]);
        }
        
        // 그리드 재생성
        createManuscriptGrid();
        
        // 로컬 스토리지에 저장
        localStorage.setItem('manuscriptContent', JSON.stringify(content));
    }
    
    // 문자열 배열로 전체 내용 설정 (개발 편의성)
    function setContentFromStrings(stringArray) {
        const newContent = stringsToContentArray(stringArray);
        setContent(newContent);
    }
    
    // 글로벌 스코프에 함수 노출 (개발 편의성)
    window.updateCell = updateCell;
    window.updateLine = updateLine;
    window.setContent = setContent;
    window.setContentFromStrings = setContentFromStrings;
}); 