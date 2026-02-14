

<script lang="ts">
	import { t } from "$lib/i18n-helper.ts";
	import { collaborationAPI } from "$lib/api/collaboration.ts";

	import DragFileBox from "./DragFileBox.svelte";
	import { isLoading } from "../../stores/loading.ts";
	import { goto } from "$app/navigation";
	

    let { onBackToCheck, matchId, influencerId, } = $props();
    let files = $state<File[]>([]);
    let instagramUrl = $state('');
    let youtubeUrl = $state('');
    let tiktokUrl = $state('');
    
    // URL 중 하나라도 입력되었는지 확인
    let hasAnyUrl = $derived(
        instagramUrl.trim() !== '' || 
        youtubeUrl.trim() !== '' || 
        tiktokUrl.trim() !== ''
    );
    
    const handleCheckFeedback = () => {
        console.log('check feedback');
        onBackToCheck?.();
    };
    
    const handleUpload = async () => {
        if (!hasAnyUrl) {
            alert(t('collab.reviewfeedback_upload_url_required') || '최소 하나의 URL을 입력해주세요.');
            return;
        }
        
        try {
            isLoading.set(true);
            
            const requestBody = {
                file_urls: files.map(f => f.name), // 또는 실제 URL이 있으면 사용
                file_keys: files.map(f => f.name),
                instagram_url: instagramUrl.trim() || null,
                youtube_url: youtubeUrl.trim() || null,
                tiktok_url: tiktokUrl.trim() || null
            };
            
            console.log('Upload Request:', requestBody);
            
            const result = await collaborationAPI.uploadFinalDraft(matchId, requestBody);
            await goto(`/collab/influencer/${influencerId}/complete?type=finaldraftfileupload`, { invalidateAll: true });
            
        } catch (error) {
            console.error('Upload Error:', error);
            alert('업로드에 실패했습니다.');
        } finally {
            isLoading.set(false);
        }
    };
</script>



<div class="final-draft-file-upload">
    <h1 class="final-draft-file-upload-title">{t(`collab.reviewfeedback_final_upload_button`)}</h1>
    <button class="final-draft-file-upload-check-feedback-button" onclick={handleCheckFeedback}>{t('collab.reviewfeedback_check_feedback')}</button>
    <DragFileBox bind:files={files}/>
    
    <div class="final-draft-file-upload-upload-link-container">
        <h1>{t('collab.reviewfeedback_upload_link')}</h1>
        <input 
            type="text" 
            placeholder={t('collab.reviewfeedback_upload_link_placeholder1')}
            bind:value={instagramUrl}
        />
        <input 
            type="text" 
            placeholder={t('collab.reviewfeedback_upload_link_placeholder2')}
            bind:value={youtubeUrl}
        />
        <input 
            type="text" 
            placeholder={t('collab.reviewfeedback_upload_link_placeholder3')}
            bind:value={tiktokUrl}
        />
    </div>

    <div class="final-draft-file-upload-upload-warning-container">
        <h1>{t('collab.reviewfeedback_upload_warning1')}</h1>
        <h2>{t('collab.reviewfeedback_upload_warning2')}</h2>
        <button 
            class:primary={hasAnyUrl}
            class:disabled={!hasAnyUrl}
            disabled={!hasAnyUrl}
            onclick={handleUpload}
        >
            {t('collab.reviewfeedback_upload_button')}
        </button>
    </div>
</div>

<style lang="scss">
    .final-draft-file-upload{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
        margin-bottom: 50px;
    }

    .final-draft-file-upload-title{
        @include text-heading-1-semibold;
    }

    .final-draft-file-upload-check-feedback-button{
        @include main-button('gray','extra-large');
        background-color: $gray-100;
        color: $primary-400;
     
    }


    .final-draft-file-upload-upload-link-container{
        display: flex;
        flex-direction: column;
        justify-self: flex-start;
        align-items: flex-start;
       
        gap: 10px;
        width: 440px;

        h1{
            @include text-headline-0-semibold;
        }
        input{
            @include input-filed;
            width: 100%;
            padding: 0 24px;
            box-sizing: border-box;
        }
    }

    .final-draft-file-upload-upload-warning-container{
        display: flex;
        flex-direction: column;
        text-align: center;
        margin-top: 20px;
        gap: 10px;
        
        h1{
            @include text-caption-0-semibold;
            color: $gray-600;
        }

        h2{
            @include text-caption-0-semibold;
            color: #ff080c
        }

        button{
            @include main-button('gray','extra-large');
            max-width: 440px;
            
            &.primary {
                @include main-button('primary','extra-large');
            }
            
            &.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }

    }


    @include tablet-up {
        .final-draft-file-upload-title{
            @include text-title-0-extrabold;
        }
        

        .final-draft-file-upload-upload-warning-container{
            h1{
                @include text-headline-0-semibold;
            }
            h2{
                @include text-headline-0-semibold;
            }
          
        }
    }


    

</style>