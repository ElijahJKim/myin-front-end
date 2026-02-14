<script lang="ts">  
    import Icons from '../Icons.svelte';

    let {src , transcript} = $props();

      let videoRef = $state<HTMLVideoElement>();
    let paused = $state(true);
    let currentTime = $state(0);
    let duration = $state(0);
    let isDragging = $state(false);



   // MM:SS 문자열을 초(Number) 단위로 변환하는 함수
    const timeToSeconds = (time: string | number) => {
        if (typeof time === 'number') return time; // 이미 숫자면 그대로 반환
        if (!time) return 0;
        const parts = time.split(':');
        if (parts.length !== 2) return 0;
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    // 1. 자막 리스트 생성 로직 수정 ($derived.by)
    let subtitleList = $derived.by(() => {
        if (!transcript) return [];

        // [CASE 1] 이미 배열 형태로 들어온 경우 (현재 부모 컴포넌트 상황)
        if (Array.isArray(transcript)) {
            return transcript.map((item: any) => ({
                start: timeToSeconds(item.start), // "00:00" -> 0
                end: timeToSeconds(item.end),     // "00:02" -> 2
                text: item.text
            }));
        }

        // [CASE 2] 문자열(Raw Text) 형태로 들어온 경우 (예외 처리)
        let rawText = '';
        if (typeof transcript === 'string') {
            // JSON 문자열인 경우 파싱 시도
            if (transcript.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(transcript);
                    rawText = Object.values(parsed)[0] as string || '';
                } catch {
                    rawText = transcript;
                }
            } else {
                rawText = transcript;
            }
        } else if (typeof transcript === 'object') {
             // 혹시라도 {url: "텍스트"} 형태의 객체로 들어올 경우
            rawText = Object.values(transcript)[0] as string || '';
        }

        if (typeof rawText !== 'string') return [];

        // 기존 문자열 파싱 로직
        return rawText.split('\n').reduce((acc, line) => {
            const match = line.match(/^\[(\d{2}:\d{2})\s-\s(\d{2}:\d{2})\]\s(.*)$/);
            if (match) {
                acc.push({
                    start: timeToSeconds(match[1]),
                    end: timeToSeconds(match[2]),
                    text: match[3].trim()
                });
            }
            return acc;
        }, [] as {start: number, end: number, text: string}[]);
    });
 // 2. 현재 재생 시간(currentTime)에 맞는 자막 찾기 ($derived 사용)
 let currentSubtitle = $derived(
        subtitleList.find(s => currentTime >= s.start && currentTime <= s.end)?.text || ''
    );
    // ----------------------------------------------------

    // 진행률 계산 (0 ~ 100%)
    let progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

    // 재생/일시정지 토글
    const togglePlay = () => {
        if (!videoRef) return;
        if (videoRef.paused) {
            videoRef.play();
            paused = false;
        } else {
            videoRef.pause();
            paused = true;
        }
    };

    const handleSeekInput = (e: Event) => {
        // 드래그 중에는 비디오 시간을 업데이트하지 않고 UI만 업데이트 (끊김 방지)
        isDragging = true;
        const target = e.target as HTMLInputElement;
        const newTime = (parseFloat(target.value) / 100) * duration;
        currentTime = newTime; // UI용 currentTime 업데이트
    };

    const handleSeekChange = (e: Event) => {
        // 드래그 끝났을 때 비디오 시간 이동
        if (!videoRef) return;
        const target = e.target as HTMLInputElement;
        const newTime = (parseFloat(target.value) / 100) * duration;
        videoRef.currentTime = newTime;
        currentTime = newTime;
        isDragging = false;
    };
    // 비디오 시간 업데이트 이벤트
    const handleTimeUpdate = () => {
        if (!videoRef || isDragging) return;
        currentTime = videoRef.currentTime;
    };

    // 비디오 로드 완료 시
    const handleLoadedMetadata = () => {
        if (!videoRef) return;
        duration = videoRef.duration;
    };
    
    // 비디오 끝났을 때
    const handleEnded = () => {
        paused = true;
    };

    console.log(transcript)
</script>

<div class="feedback-video-container">
    <video src={src} bind:this={videoRef} onclick={togglePlay}
    ontimeupdate={handleTimeUpdate}
    onloadedmetadata={handleLoadedMetadata}
    onended={handleEnded}></video>

    {#if currentSubtitle}
        <div class="subtitle-overlay">
            <p>{currentSubtitle}</p>
        </div>
    {/if}

    <div class="controls-overlay">
        
        <button class="play-button" onclick={togglePlay}>
            {#if paused}
                <Icons name="play_button" width="24" height="24" color="#fff" />
            {:else}
                <Icons name="pause_button" width="24" height="24" color="#fff" />
            {/if}

        </button>

        <div class="timeline-container">
            <input
                type="range"
                min="0"
                max="100"
                value={progress}
                oninput={handleSeekInput}
                onchange={handleSeekChange}
                class="timeline-slider"
                style="background: linear-gradient(to right, #FF0000 {progress}%, rgba(255, 255, 255, 0.3) {progress}%);"
            />
        </div>
    </div>
   </div>


   <style lang="scss">
    .feedback-video-container {
        position: relative;
        width: 100%;
        max-height: 700px;
        aspect-ratio: 9 / 16;
        border-radius: 12px;
        overflow: hidden;
        background-color: #000;
        flex:1;
        video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            cursor: pointer;
        }

        .subtitle-overlay{
            position: absolute;
            bottom: 45px;
            left: 50%;
            transform: translateX(-50%);
         
          
       
            background-color: $gray-900;
            width:70%;
            z-index: 1000;
            pointer-events: none; 
            p{
                @include text-headline-1-regular;
                color: $gray-0;
                padding: 8px 10px;
            }
        }

        .controls-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60px; /* 컨트롤 영역 높이 */
            display: flex;
            align-items: center;
            padding: 0 15px;
            box-sizing: border-box;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent); /* 가독성을 위한 그라데이션 */
            gap: 15px;
            opacity: 1;
            transition: opacity 0.3s;

            // 마우스 안 올렸을 때 숨기고 싶으면 아래 주석 해제
            // &:hover { opacity: 1; }
            // opacity: 0; 
        }
    }

    .play-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        
        
    }

    .timeline-container {
        flex: 1;
        display: flex;
        align-items: center;

        .timeline-slider {
            -webkit-appearance: none; /* 기본 스타일 제거 (필수) */
            width: 100%;
            height: 4px;
            border-radius: 2px;
            background: rgba(255, 255, 255, 0.3); /* 기본 회색 트랙 */
            outline: none;
            cursor: pointer;

            /* 붉은색 진행 바 (인라인 스타일의 linear-gradient로 제어됨) */
            
            /* [크롬, 사파리, 엣지용 썸(Thumb/동그라미)] */
            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #FF0000; /* 빨간색 동그라미 */
                cursor: pointer;
                box-shadow: 0 0 4px rgba(0,0,0,0.5);
                transition: transform 0.1s;

                &:hover {
                    transform: scale(1.2);
                }
            }

            /* [파이어폭스용 썸] */
            &::-moz-range-thumb {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #FF0000;
                border: 2px solid #fff;
                cursor: pointer;
            }
        }
    }

    @include tablet-up {
        .feedback-video-container {
            height: 600px;
        }
    }
</style>