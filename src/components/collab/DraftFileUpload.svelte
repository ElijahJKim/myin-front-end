<script lang="ts">
    import DragFileBox from "./DragFileBox.svelte"; 
    import { t } from "$lib/i18n-helper.ts";
    import { goto } from '$app/navigation';
	import { uploadDraftFiles } from "$lib/api/upload.ts";
	import { isLoading } from "../../stores/loading.js";
    
    // 위에서 만든 API 함수 import
 

    let { data } = $props();

    // 1. 파일 상태 (DragFileBox와 바인딩)
    let files = $state<File[]>([]);
    
    // 2. 파라미터 가져오기
    let matchId = $derived(data.matchId);
    let influencerId = $derived(data.params.influencerId);

    // 3. 로딩 상태
    let isUploading = $state(false);

    // 4. 업로드 핸들러
    const handleUpload = async () => {
        if (files.length === 0) {
            alert(t('collab.alert_no_files') || "파일을 첨부해주세요.");
            return;
        }

        if (!matchId) {
            console.error("Match ID is missing");
            alert("잘못된 접근입니다 (Match ID 누락).");
            return;
        }


        isUploading = true;
        isLoading.set(true);

        try {
            // [핵심] 수정된 함수 호출 (파일 목록과 matchId만 넘기면 내부에서 S3 -> Backend 처리)
            await uploadDraftFiles(files, matchId);
            
            
            // 성공 시 대시보드 이동
            await goto(`/collab/influencer/${influencerId}/complete?type=draftfileupload`);
        } catch (error: any) {
            console.error(error);
            alert(`${t('collab.upload_fail') || "업로드 실패"}: ${error.message}`);
        } finally {
            isUploading = false;
            isLoading.set(false);
        }
    };

    const handleCancel = () => {
        goto(`/collab/influencer/${influencerId}/dashboard`);
    }

    const handleCheckGuidelines = () => {
        goto(`/collab/influencer/${influencerId}/guidelineform?matchId=${matchId}`);
    }
</script>

<div class="draft-file-upload-container manage-container">
    <h1 class="draft-file-upload-title">{t('collab.uploaddraft_title')}</h1>
    <p class="draft-file-upload-description">{t('collab.uploaddraft_description')}</p>
    <button class="draft-file-upload-check-guidelines-button" onclick={handleCheckGuidelines}>{t('collab.uploaddraft_check_guidelines')}</button>
    
    <DragFileBox bind:files={files} />

    {#if files.length > 0}
        <p class="draft-file-upload-file-category">{t('collab.uploaddraft_file_category')}</p>
    {/if}

    <div class="draft-file-upload-button-container">
        <button 
            class="draft-file-upload-cancel-button" 
            onclick={handleCancel} 
            disabled={isUploading}
        >
            {t('collab.uploaddraft_cancel_button')}
        </button>
        
        <button 
            class="draft-file-upload-button" 
            onclick={handleUpload}
            disabled={isUploading || files.length === 0}
        >
            {isUploading ? 'Uploading...' : t('collab.uploaddraft_button')}
        </button>
    </div>
</div>

	<style lang="scss">
		.manage-container {
			@include flex-column-center;
			gap: 10px;
			padding-top: 50px;
		}

		.draft-file-upload-container {
			text-align: center;

			.draft-file-upload-title {
				@include text-heading-1-semibold;
				color: $gray-900;
			}

			.draft-file-upload-description {
				display: none;
				@include text-caption-0-medium;
				color: $gray-700;
			}

			.draft-file-upload-check-guidelines-button {
				@include main-button('light', 'extra-large');
				display: none !important;
				margin-top: 20px;
			}

			.draft-file-upload-file-category {
				@include text-headline-0-semibold;
				color: $gray-600;
			}

			.draft-file-upload-button-container {
				display: flex;
				flex-direction: column;
				gap: 10px;

				.draft-file-upload-cancel-button {
					@include main-button('light', 'extra-large');
				}
				.draft-file-upload-button {
					@include main-button('primary', 'extra-large');
				}
			}

			@include tablet-up {
				.draft-file-upload-title {
					@include text-title-0-extrabold;
				}
				.draft-file-upload-description {
					display: block;
				}
				.draft-file-upload-check-guidelines-button {
					display: block !important;
				}
			}
		}
	</style>