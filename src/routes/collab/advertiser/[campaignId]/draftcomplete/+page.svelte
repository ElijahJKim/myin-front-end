<script lang="ts">
    import { t } from '$lib/i18n-helper.ts';
	import FeedbackVideo from '../../../../../components/collab/FeedbackVideo.svelte';
    let { data } = $props();

    let matchId = $derived(data.matchId);
    let contentId = $derived(data.contentId);
    let finalDraft = $derived(data.finalDraft);

    $effect(() => {
        console.log("matchId", matchId);
        console.log("contentId", contentId);
        console.log("finalDraft", finalDraft);
    });

    let transcriptionList = $derived.by(() => {
        // 1. finalDraft에서 자막 데이터 가져오기
        const rawJson = finalDraft?.translated_transcription;
        
        if (!rawJson) return [];

        let scriptContent = '';

        // 2. JSON 파싱 시도
        try {
            // 문자열 형태의 JSON이라면 객체로 변환
            const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
            
            // 객체의 값(Value)만 추출 (URL Key는 무시)
            // 예: {"url": "자막내용..."} -> "자막내용..."
            const values = Object.values(parsed);
            if (values.length > 0) {
                scriptContent = values[0] as string;
            }
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // 파싱 실패 시 rawJson을 그대로 텍스트로 사용 (만약 JSON이 아닐 경우 대비)
            scriptContent = typeof rawJson === 'string' ? rawJson : '';
        }

        if (!scriptContent) return [];

        // 3. 줄바꿈으로 나누고 정규식으로 시간과 내용 분리
        return scriptContent.split('\n').reduce((acc, line) => {
            // [00:00 - 00:02] 내용 형태 매칭
            const match = line.match(/^\[(\d{2}:\d{2})\s-\s(\d{2}:\d{2})\]\s(.*)$/);
            if (match) {
                acc.push({
                    start: match[1],
                    end: match[2],
                    text: match[3].trim()
                });
            }
            return acc;
        }, [] as {start: string, end: string, text: string}[]);
    });
</script>


 <div class="finaldraft-container">
     <h1 class="finaldraft-title">
        {t('collab.finaldraft_title')}
     </h1>
     <div class="finaldraft-video-container">
        <FeedbackVideo src={finalDraft.file_urls} transcript={transcriptionList} />
        <div class="finaldraft-header  ">
            <h2 class="finaldraft-header-item">[인플루언서 이름]</h2>
            <h2 class="finaldraft-header-item">브랜드명</h2>
            <span class="finaldraft-header-item-separator">/</span>
            <h2 class="finaldraft-header-item">제품명</h2>
            <span class="finaldraft-header-item-separator">/</span>
            <h2 class="finaldraft-header-item">초안</h2>
            </div>
    
        <div class="finaldraft-date">
            <h2>{t('collab.finaldraft_date')}:</h2>
            <p>26.01.03</p>
        </div>
    
        <div class="finaldraft-sns-container">
            <div>[인플루언서 이름]{t('collab.finaldraft_sns_1')} 틱톡 {t('collab.finaldraft_sns_2')} 바로가기</div>
        </div>
     </div>
     
    <div class="finaldraft-warning-container">
        <div class="finaldraft-warning-title"><span>!</span>{t('collab.finaldraft_warning')}</div>
        <p>{t('collab.finaldraft_description_1')}</p>
        <p>{t('collab.finaldraft_description_2')}</p>
        <p>{t('collab.finaldraft_description_3')}</p>
    </div>
    <div class="finaldraft-button-container">
        <button class="finaldraft-download-button">{t('collab.finaldraft_download_button')}</button>
        <button class="finaldraft-home-button">{t('collab.finaldraft_home_button')}</button>
    </div>
 </div>


 <style lang="scss">

    .finaldraft-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
     
        margin-bottom: 30px;
        padding: 0 20px;
        margin-top: 20px;
        
    }

    .finaldraft-title {
    @include text-title-2-semibold;
      text-align: center;
    }

    .finaldraft-video-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: 100%;
        margin-top: 30px;
    }

    .finaldraft-header {
        display: flex;
        align-self: flex-start;
        gap: 5px;
        @include text-headline-1-semibold;
     
    }
  

    .finaldraft-date{
        display: flex;
        @include text-caption-0-semibold;
        align-self: flex-start;
        color: $gray-800;
      
    }

    .finaldraft-sns-container {
        display: flex;
        flex-direction: column;
        align-self: flex-start;
        gap: 10px;
        border: 1px solid $gray-400;
        padding: 8px 12px;
        border-radius: 10px;
    }

    .finaldraft-warning-container {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        gap: 10px;
        max-width: 650px;
        width: 100%;
        background-color: $gray-200 ;
        padding: 18px 8px;
        border-radius: 18px;
        .finaldraft-warning-title{
           align-self: center;
                text-align: center;
                @include error-message;
                span{
                    @include error-icon;
                    }
        }
        p{
            text-align: left;
            @include text-caption-0-medium;
            color: $gray-900;
        }
    }

    .finaldraft-button-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: 100%;
        margin-top: 20px;
    }
    
    .finaldraft-download-button {
        @include main-button('primary','extra-large');
    }

    .finaldraft-home-button {
        @include main-button('gray','extra-large');
        color: $primary-400;
    }
    
    
    @include tablet-up {
        .finaldraft-container {
            
            
        }

        .finaldraft-title {
            @include text-display-1-extrabold;

        }

        .finaldraft-video-container{
            width: 400px;
        }

        .finaldraft-header {
            @include text-title-2-semibold;
            align-self: center
        }

        .finaldraft-date {
            @include text-headline-0-medium;
         
        }

        .finaldraft-sns-container {
            @include text-body-0-semibold;
        }

        .finaldraft-warning-container {
            p{
                @include text-headline-0-bold;
            }
        }

       
    }
 </style>

