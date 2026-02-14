
<script>
    // 단순히 UI만 보여주는 컴포넌트입니다.
</script>

<div class="loading-overlay">
    <div class="loading-content">
      <div class="spinner"></div>
      <p class="loading-text">잠시만 기다려주세요...</p>
    </div>
  </div>


  <style lang="scss">
 
  .loading-overlay {
    position: fixed; 
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9); 
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; 
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px; // 스피너와 텍스트 사이 간격
  }

  // 로딩 스피너 (돌아가는 원)
  .spinner {
    width: 48px; // 스피너 크기
    height: 48px;
    border: 4px solid rgba(168, 158, 255, 0.3); // 전체 테두리 (연한 보라색)
    border-top-color: #a89eff; // 상단 테두리 (진한 보라색 - 돌아가는 부분)
    border-radius: 50%; // 원형으로 만들기
    animation: spin 1s linear infinite; // 1초 동안 선형으로 무한 반복 회전
  }

  // 로딩 텍스트
  .loading-text {
    font-size: 16px;
    color: #333; // 글자색
    font-weight: 500;
  }

  // 회전 애니메이션 정의
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  </style>