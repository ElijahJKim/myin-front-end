<script lang="ts">
    import { goto } from '$app/navigation';
    import { collaborationAPI } from '$lib/api/collaboration.ts';
    import { isLoading } from '../../../../../stores/loading.js';
    import { t } from '$lib/i18n-helper.ts';
	import FeedbackVideo from '../../../../../components/collab/FeedbackVideo.svelte';
	import Icons from '../../../../../components/Icons.svelte';
    import SelectButton from '../../../../../components/SelectButton.svelte';
    import TextArea from '../../../../../components/TextArea.svelte';
    import type { FeedbackFormData } from '../../../../../types/upload.ts';

    let { data } = $props();

    console.log(data);
    
    let feedbackFormData = $derived(data?.feedbackFormData || { files: [] } as FeedbackFormData);
    let contentId = $derived(data?.contentId);
    let matchId = $derived(data?.matchId);
    let campaignId = $derived(data?.campaignId);

    // [상태 관리] 타임라인 모드 및 피드백 데이터
    let isTimelineMode = $state(false);
    let timelineFeedbacks = $state<Record<number, { selected: boolean, text: string }>>({});

    // --- 트랜스크립션 파싱 로직 ---
    let transcriptionList = $derived.by(() => {
        // [Safety Check] Ensure files array exists and has elements
        const file = feedbackFormData?.files?.[0]; 
        const rawText = file?.transcription || '';
        
        if (!rawText) return [];

        return rawText.split('\n').reduce((acc, line) => {
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
    // ------------------------------------

    let hasPreviousFeedback = $state(false); 
    let feedbackText = $state('');
    
    // UI 상태 관리
    let isWritingMode = $state(false); 
    let isFeedbackSubmitted = $state(false); 

    const handleStartTextFeedback = () => {
        isWritingMode = true;
        isFeedbackSubmitted = false;
    };

    const handleSubmitFeedback = () => {
        if (!feedbackText.trim()) return; 
        isFeedbackSubmitted = true;
        hasPreviousFeedback = true; 
    };

    const handleCancelFeedback = () => {
        isWritingMode = false;
        isFeedbackSubmitted = false;
        feedbackText = ''; 
    };

    const handleTextAreaFocus = () => {
        if (isFeedbackSubmitted) {
            isFeedbackSubmitted = false;
        }
    };

    // [기능] 타임라인 피드백 시작 (우측으로 이동)
    const handleStartTimelineFeedback = () => {
        console.log("handleStartTimelineFeedback");
        isTimelineMode = true;
        
        // 상태 초기화 (기존 데이터 유지)
        transcriptionList.forEach((_, i) => {
            if (!timelineFeedbacks[i]) {
                timelineFeedbacks[i] = { selected: false, text: '' };
            }
        });

        // 스크롤 이동 (UX)
        setTimeout(() => {
            const el = document.querySelector('.feedback-ai.timeline-panel .feedback-ai-content');
            el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // [기능] 타임라인 피드백 종료 (X 버튼)
    const handleCloseTimelineFeedback = () => {
        isTimelineMode = false;
    };

    // [기능] 선택 토글
    const toggleTimelineSelection = (index: number) => {
        if (timelineFeedbacks[index]) {
            timelineFeedbacks[index].selected = !timelineFeedbacks[index].selected;
        }
    };

    const handleSubmitFinal = async () => {
        // 1. 일반 텍스트 피드백 데이터 생성 (작성 완료 상태이고 내용이 있을 경우)
        const textFeedbackPayload = isFeedbackSubmitted && feedbackText.trim() 
            ? [{
                feedback_type: 'text',
                timestamp_start: null, 
                timestamp_end: null,
                feedback_text: feedbackText
            }] 
            : [];

        // 2. 타임라인 피드백 데이터 생성
        // transcriptionList(시간 정보)와 timelineFeedbacks(입력 정보)를 병합
        const timelinePayload = transcriptionList.map((item, index) => {
            const fb = timelineFeedbacks[index];
            // '선택됨' AND '텍스트 있음' 인 경우만 데이터로 변환
            if (fb?.selected && fb.text.trim()) {
                return {
                    feedback_type: 'text',
                    timestamp_start: item.start, // 예: "00:00"
                    timestamp_end: item.end,     // 예: "00:05"
                    feedback_text: fb.text
                };
            }
            return null;
        }).filter(Boolean); // null 값 제거

        // 3. 두 피드백 합치기
        const allFeedbacks = [...textFeedbackPayload, ...timelinePayload];

        try {
            isLoading.set(true);
            // [분기 1] 피드백이 하나도 없는 경우 -> 바로 '승인(Confirm)' API 호출
            if (allFeedbacks.length === 0) {
                // confirmFeedback(contentId, matchId) 호출
                await collaborationAPI.confirmFeedback(contentId as string, matchId as string);
                
                alert(t('collab.feedback_confirm_success') || '콘텐츠가 승인되었습니다.'); // 메세지 처리
            } 
            // [분기 2] 피드백이 있는 경우 -> '수정 요청(Feedback)' API 호출
            else {
                const requestBody = {
                    content_upload_id: contentId,
                    file_key: feedbackFormData.files[0].file_key,
                    feedbacks: allFeedbacks,
                    is_immediate_confirmation: false
                };

                // writeFeedbackForm(matchId, form, contentId) 호출
                // (앞서 정의하신 함수 시그니처에 맞춰 인자를 전달하세요)
                await collaborationAPI.writeFeedbackForm(matchId as string, requestBody, contentId as string);
                await goto(`/collab/advertiser/${campaignId}/complete?type=feedback`, { invalidateAll: true });
           
            }
            
            // 성공 후 페이지 이동이나 새로고침이 필요하다면 여기에 추가
            // location.reload(); 
            
        } catch (error) {
            console.error('Submit Error:', error);
            alert('요청 처리에 실패했습니다.');
        } finally {
            isLoading.set(false);
        }
    };
</script>

<div class="feedback-container">
  <div class="feedback-content">
    <h1 class="feedback-title">{t('collab.feedback_title')}</h1>
        <div class="feedback-video-container">
            {#if feedbackFormData?.files?.[0]?.file_url && feedbackFormData?.files?.[0]?.translated_transcription}
            <FeedbackVideo 
                src={feedbackFormData.files[0].file_url}  
                transcript={feedbackFormData.files[0].translated_transcription || ''}
            />
        {:else}
            <div class="video-placeholder">No video available</div>
        {/if}
            
            {#if !isTimelineMode}
    <div class="desktop-feedback-write">
        <h2>{t('collab.feedback_write')}</h2>
        <p>{t('collab.feedback_write_placeholder')}</p>

                    {#if !isWritingMode}
                        <div class="initial-buttons">
                            <button class="feedback-write-button-1" onclick={handleStartTimelineFeedback}>{t('collab.feedback_write_button_1')}</button>
                            <button class="feedback-write-button-2" onclick={handleStartTextFeedback}>
                                {t('collab.feedback_write_button_2')}
                            </button>
                        </div>
                    {/if}

                    {#if isWritingMode}
                        <div class="desktop-feedback-text">
                            <div 
                                role="button" 
                                tabindex="0" 
                                onclick={handleTextAreaFocus} 
                                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTextAreaFocus(); }}
                                style="cursor: pointer;" 
                            >
                                <TextArea bind:value={feedbackText} placeholder={t('collab.feedback_text_placeholder')} />
                            </div>
                            
                            <div class="feedback-text-buttons">
                                {#if !isFeedbackSubmitted}
                                    <button type="button" class="feedback-text-button-1" onclick={handleCancelFeedback} >
                                        {t('collab.feedback_text_button')}
                                    </button>
                                    <button type="button" class="feedback-text-button-2" onclick={handleSubmitFeedback}>
                                        {t('collab.feedback_text_cancel_button')}
                                    </button>
                                {/if}

                                {#if (hasPreviousFeedback && !isFeedbackSubmitted) || isFeedbackSubmitted}
                                    <button type="button" class="feedback-text-button-3" onclick={handleStartTimelineFeedback}>
                                        {t('collab.feedback_timeline_button')}
                                    </button>
                                {/if}
                            </div>
                        </div>
                    {/if}
                </div>
            
            {:else}
                <div class="feedback-ai timeline-panel">
                    <div class="feedback-ai-header">
                        <div class="header-left">
                            <Icons name="ai_agent" width="24" height="24" color="#472DCB" />
                            <h2>{t('collab.feedback_ai_title')}</h2>
                        </div>
                        <button class="close-timeline-btn" onclick={handleCloseTimelineFeedback}>
                            <Icons name="xMarkCircle" width="24" height="24" color="#151515" />
                        </button>
                    </div>
                    
                    <div class="feedback-ai-content">
                        {#if transcriptionList.length > 0}
                            <ul class="transcript-list">
                                {#each transcriptionList as item, index}
                                    <div class="transcript-row">
                                        <div class="select-btn-wrapper">
                                            {#if timelineFeedbacks[index]}
                                                <SelectButton
                                                    checked={timelineFeedbacks[index].selected} 
                                                    onclick={() => toggleTimelineSelection(index)}
                                                />
                                            {/if}
                                        </div>

                                        <div class="transcript-content">
                                            <li class="transcript-item">
                                                <div class="transcript-header-row">
                                                    <div class="transcript-info">
                                                        <span class="transcript-time">{item.start} - {item.end}</span>
                                                        <p class="transcript-text">{item.text}</p>
                                                    </div>
                                                </div>
                                            </li>

                                            {#if timelineFeedbacks[index]?.selected}
                                                <div class="transcript-feedback-input">
                                                    <h6>{t('collab.feedback_write_feedback')}</h6>
                                                    <TextArea 
                                                        bind:value={timelineFeedbacks[index].text} 
                                                        placeholder={t('collab.feedback_text_placeholder')} 
                                                    />
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                {/each}
                            </ul>
                        {:else}
                            <p class="no-transcript">분석된 자막 데이터가 없습니다.</p>
                        {/if}
    </div>
   </div>
            {/if}
        </div>
        
    <div class="feedback-header">
        <h2 class="feedback-header-item">{feedbackFormData.influencer_name}</h2>
        <h2 class="feedback-header-item">{feedbackFormData.brand_name}</h2>
        <span class="feedback-header-item-separator">/</span>
        <h2 class="feedback-header-item">{feedbackFormData.product_name}</h2>
        <span class="feedback-header-item-separator">/</span>
        <h2 class="feedback-header-item">초안</h2>
        </div>

    <div class="feedback-date">
        <h2>{t('collab.feedback_date')}:</h2>
        <p>{feedbackFormData.delivery_deadline}</p>
    </div>

        {#if !isTimelineMode}
    <div class="feedback-write">
        <h2>{t('collab.feedback_write')}</h2>
        <p>{t('collab.feedback_write_placeholder')}</p>

                {#if !isWritingMode}
                    <button type="button" class="feedback-write-button-1" onclick={handleStartTimelineFeedback}>{t('collab.feedback_write_button_1')}</button>
                    <button type="button" class="feedback-write-button-2" onclick={handleStartTextFeedback}>
                        {t('collab.feedback_write_button_2')}
                    </button>
                {/if}
        
                {#if isWritingMode}
                    <div class="desktop-feedback-text">
                        <div 
                            role="button" tabindex="0" 
                            onclick={handleTextAreaFocus} 
                            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTextAreaFocus(); }}
                            style="cursor: pointer;"
                        >
                            <TextArea bind:value={feedbackText} placeholder={t('collab.feedback_text_placeholder')} />
                        </div>
                        
                        <div class="feedback-text-buttons">
                            {#if !isFeedbackSubmitted}
                                <button type="button" class="feedback-text-button-1" onclick={handleCancelFeedback} >
                                    {t('collab.feedback_text_button')}
                                </button>
                                <button type="button" class="feedback-text-button-2" onclick={handleSubmitFeedback}>
                                    {t('collab.feedback_text_cancel_button')}
                                </button>
                            {/if}

                            {#if (hasPreviousFeedback && !isFeedbackSubmitted) || isFeedbackSubmitted}
                                <button type="button" class="feedback-text-button-3" onclick={handleStartTimelineFeedback}>
                                    {t('collab.feedback_timeline_button')}
                                </button>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
        
        {#if !isTimelineMode}
            <div class="feedback-ai bottom-panel">
                <div class="feedback-ai-header">
                    <div class="header-left">
                        <Icons name="ai_agent" width="24" height="24" color="#472DCB" />
                        <h2>{t('collab.feedback_ai_title')}</h2>
                    </div>
                    </div>
                
                <div class="feedback-ai-content">
                    {#if transcriptionList.length > 0}
                        <ul class="transcript-list">
                            {#each transcriptionList as item, index}
                                <div class="transcript-row">
                                    <div class="transcript-content">
                                        <li class="transcript-item">
                                            <div class="transcript-info">
                                                <span class="transcript-time">{item.start} - {item.end}</span>
                                                <p class="transcript-text">{item.text}</p>
                                            </div>
                                        </li>
                                    </div>
                                </div>
                            {/each}
                        </ul>
                    {:else}
                        <p class="no-transcript">분석된 자막 데이터가 없습니다.</p>
                    {/if}
    </div>
    </div>
        {/if}

    <footer class="feedback-footer">
            <div class="feedback-warning-title"><span class="feedback-warning-title-icon">!</span>{t('collab.feedback_warning_title')}</div>
            <p class="feedback-footer-warning-description">{t('collab.feedback_warning_description')}</p>
            <button 
                class="feedback-footer-submit-button" 
                onclick={handleSubmitFinal}
            >
                {t('collab.feedback_submit_button')}
            </button>
        <button class="feedback-footer-cancel-button">{t('collab.feedback_cancel_button')}</button>
    </footer>
  </div>
</div>

<style lang="scss">

    .feedback-container {
     display: flex;
     flex-direction: column;
     justify-content: center;
        gap: 10px;
        margin-bottom: 30px;
        padding: 0 20px;

        
        @include tablet-up { align-items: center; }
    }

    .feedback-content {
        @include tablet-up { width: 800px;}
    }

    .feedback-title { @include text-heading-1-semibold; color:$primary-800; }
    .feedback-description { @include text-caption-0-semibold; color:$gray-900; }
    .feedback-video-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;

        @include tablet-up {
            flex-direction: row;
            gap: 10px;
            align-items: flex-start;
            width: 100%;
        }
    }

    .feedback-header {
        display: flex;
        flex-direction: row;
        align-self: flex-start;
        gap: 5px;
        @include text-headline-1-semibold;
      
    }

    .feedback-date {
        display: flex; 
        gap: 3px; 
        align-self: flex-start;
        @include text-caption-0-semibold; 
        color: $gray-800; 
    }

    /* 모바일용 작성 영역 */
    .feedback-write {
        display: flex;
        flex-direction: column;
        gap: 3px;
        @include text-caption-0-semibold;
        color: $gray-800;
        margin-top: 10px;

        h2 { @include text-headline-0-semibold; color: $gray-900; }
        p { @include text-body-0-semibold; color: $gray-700; }
        
        .feedback-write-button-1 { @include main-button('primary', 'extra-large'); width: 100%; max-width: 300px; }
        .feedback-write-button-2 { @include main-button('light', 'extra-large'); width: 100%; border: none; max-width: 300px; }
    }

    /* 데스크탑용 작성 영역 (기본 숨김) */
    .desktop-feedback-write {
        display: none;
    }

    /* 공통 텍스트 에디터 컨테이너 */
    .desktop-feedback-text {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .feedback-text-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
            width: 100%;

        .feedback-text-button-1, .feedback-text-button-2 {
            flex: 1; min-width: 0; @include main-button('light');
            &:disabled { opacity: 0.5; cursor: not-allowed; }
        }
        .feedback-text-button-2 { color: $primary-400; }
        .feedback-text-button-3 { width: 100%; flex-basis: 100%; @include main-button('primary'); }
    }

    /* AI 피드백 (타임라인) 패널 스타일 */
    .feedback-ai {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        flex:1;
        .feedback-ai-header {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between; // 양끝 정렬 (X버튼 위치)
            @include text-headline-0-semibold;
            color:$gray-800;
            
            .header-left {
                display: flex; align-items: center; gap: 5px;
            }

            // [수정] 닫기 버튼: 모바일에서는 숨기고, 태블릿 이상에서만 표시
            .close-timeline-btn {
                background: none; border: none; cursor: pointer; padding: 0;
                display: none; // 기본 숨김
                align-items: center; justify-content: center;
                
                @include tablet-up {
                    display: flex; // 태블릿 이상 보임
                }
            }
        }

        .feedback-ai-content{
            margin-top: 15px;
            height: 700px;
            overflow-y: auto;
            -ms-overflow-style: none;
            scrollbar-width: none;
            &::-webkit-scrollbar { display: none; }
            
            .transcript-list{
                 display: flex; flex-direction: column; gap: 15px;

                 .transcript-row {
                     display: flex; align-items: flex-start; gap: 12px;
                     .select-btn-wrapper { flex-shrink: 0; margin-top: 12px; }
                     .transcript-content {
                       

                     }
                 }

                 .transcript-item{
                     background-color:$gray-100; border-radius: 10px; padding: 12px 22px;
                     .transcript-time{ @include text-caption-0-medium; color:$gray-600; }
                     .transcript-text{ @include text-headline-1-regular; color:$gray-900; }
                 }
                 
                 .transcript-feedback-input{
                     border-radius: 10px;
                     h6{ @include text-headline-0-semibold; color:$gray-800; margin-bottom: 8px; margin-top: 10px; }
                 }
             }
        }
    }

    .feedback-footer {
        display: flex; flex-direction: column; align-items: center; text-align: center;
        gap:10px; @include text-caption-0-semibold; color:$gray-800; margin-top: 25px;

        .feedback-warning-title { @include error-message; .feedback-warning-title-icon { @include error-icon; } }
        p { @include text-body-0-semibold; color:$gray-600; width: 250px; }
        .feedback-footer-submit-button { @include main-button('gray', 'extra-large');  max-width: 400px; }
        .feedback-footer-cancel-button { @include main-button('light', 'extra-large');  background-color: $gray-100; border: none; max-width: 400px; }
    }

    .initial-buttons {
        display: flex; flex-direction: column; gap: 10px; width: 100%; align-items: center;
    }

    @include tablet-up {

        .feedback-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .feedback-title {
            align-self: flex-start;
            width: 100%;
            @include text-title-0-extrabold; 
        }
        .feedback-description{ @include text-heading-1-semibold; }
        .feedback-header{ @include text-title-2-semibold; }
        .feedback-date{ @include text-headline-0-medium; }
        .feedback-ai .feedback-ai-header{ @include text-heading-1-semibold; }

        .feedback-video-container {
            display: flex;
            flex-direction: row;
            gap: 10px;
            align-items: flex-start;
            width: 100%;
        }

        .feedback-header {
            @include text-title-2-semibold;
        }

        .feedback-date {
            @include text-headline-0-medium;
        }

        /* 우측 패널 (피드백 폼 & 타임라인 패널 공통 스타일) */
        .desktop-feedback-write,
        .feedback-ai.timeline-panel {
            display: flex;
            flex-direction: column;
            width: 50%;
            height: 100%; // 비디오 높이에 맞추거나 고정
            // min-height: 600px; 
            border-radius: 12px;
            padding: 20px;
            box-sizing: border-box;
            // margin-right: 20px; // gap으로 대체
        }
        
        // 타임라인 패널일 때 내부 스타일 조정
        .feedback-ai.timeline-panel {
             margin-top: 0; // 컨테이너 내부이므로 상단 마진 제거
             
             .feedback-ai-content {
                 height: 520px; // 헤더 제외 높이 확보
             }
        }

        .desktop-feedback-write {
            gap: 10px;
            h2 { @include text-headline-0-semibold; color: $gray-900; }
            p { @include text-body-0-semibold; color: $gray-700; }
            .feedback-write-button-1 { @include main-button('primary', 'extra-large'); width: 100%; max-width: 300px; }
            .feedback-write-button-2 { @include main-button('light', 'extra-large'); width: 100%; border: none; max-width: 300px; }
        }

        .feedback-write {
            display: none;
        }
    }

    @include desktop-up {
       // 추가 스타일이 필요하면 여기에
    }
</style>