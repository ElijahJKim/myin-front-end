<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';
	import DragFileBox from './DragFileBox.svelte';
	import ShipmentInfoForm from './ShipmentInfoForm.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores'; 
	import Modal from '../Modal.svelte';
	import { extractShipmentInfoFromImages } from '$lib/api/upload.ts';

	let { campaignId, matchId } = $props();

	interface ShipmentInfo {
		tracking_number: string;
		tracking_image_urls: string[];
		tracking_image_file_keys: string[];
		recipient_name: string;
		shipping_company: string;
	}

	let inputType = $state('auto');
	let isFileUploaded = $state(false);
	let isTablet = $state(false);
	let isShipmentInfoFormVisible = $state(false);
	let isErrorModalVisible = $state(false);
	let currentFiles = $state<File[]>([]);

	let isAnalyzing = $state(false);

	let shipmentInfo: ShipmentInfo = $state({
		tracking_number: '',
		tracking_image_urls: [],
		tracking_image_file_keys: [],
		recipient_name: '',
		shipping_company: ''
	});

	let validationErrors = $state({
	tracking_number: false,
	tracking_image_urls: false,
	tracking_image_file_keys: false,
	recipient_name: false,
	shipping_company: false
});

	onMount(() => {
		const mediaQuery = window.matchMedia('(min-width: 768px)');
		isTablet = mediaQuery.matches;

		const handler = (e: MediaQueryListEvent) => {
			isTablet = e.matches;
		};

		mediaQuery.addEventListener('change', handler);

		return () => mediaQuery.removeEventListener('change', handler);
	});

	const handleAutoFill = async (newFiles: File[]) => {
        // shipment 페이지가 아니면 실행하지 않음 (안전장치)
        if (!$page.url.pathname.includes('/shipments')) return;

        isAnalyzing = true;

        try {
            // 1. API 호출 (S3 업로드 -> OCR)
            const result = await extractShipmentInfoFromImages(newFiles);

		// [검증 로직 추가] 
            // 데이터가 아예 없거나, 필수 필드(수취인, 운송장, 택배사) 중 하나라도 비어있으면 에러 처리
            const isMissingData = 
                !result ||
                !result.recipient_name || 
                !result.tracking_number || 
                !result.shipping_company;

            if (isMissingData) {
                // catch 블록으로 이동하여 모달을 띄움
                throw new Error('OCR 정보가 불충분합니다.');
            }
            // 2. 결과값 바인딩
            shipmentInfo = {
                ...shipmentInfo,
                recipient_name: result.recipient_name || '',
                tracking_number: result.tracking_number || '',
                shipping_company: result.shipping_company || '',
                tracking_image_urls: result.tracking_image_urls,
                tracking_image_file_keys: result.tracking_image_file_keys
            };

            // 3. UI 자동 전환 (수동 입력 폼 보여주기)
            inputType = 'manual';
            isShipmentInfoFormVisible = true;

            // 성공 알림 (선택사항)
            // alert('송장 정보가 자동으로 입력되었습니다. 내용을 확인해주세요.');

        } catch (error) {
            console.error(error);
           
            
           
            isErrorModalVisible = true;
        } finally {
            isAnalyzing = false;
        }
    };

	const handleModalCancel = () => {
        isErrorModalVisible = false;
        // 취소를 누르면 보통 "직접 입력하겠다"는 뜻이므로 수동 폼을 보여줍니다.
        // (만약 그냥 닫기만 하고 싶으시면 아래 두 줄은 지우시면 됩니다)
        inputType = 'manual';
        isShipmentInfoFormVisible = true;
		currentFiles = [];
    };

    // [추가] 모달 '확인(Submit)' 버튼 핸들러 -> 파일 선택창 다시 띄우기
    const handleModalRetry = () => {
        isErrorModalVisible = false;
        inputType = 'auto';
        isShipmentInfoFormVisible = false; // 이 값이 false여야 DragFileBox가 보입니다.
		currentFiles = [];
    };
</script>

<div class="picture-file-upload-container manage-container">
    <h1 class="picture-file-upload-title">{@html t('collab.picturefileupload_title')}</h1>
    <p class="picture-file-upload-description">{t('collab.picturefileupload_description')}</p>
    
    <div class="picture-file-upload-button-container">
        <button
            class="picture-file-upload-button {inputType === 'auto' ? 'active' : ''}"
            onclick={() => (inputType = 'auto', isShipmentInfoFormVisible = false)}
        >
            {#if isTablet}
                {t('collab.picturefileupload_button_1')}
            {:else}
                {t('collab.picturefileupload_button_2')}
            {/if}
        </button>
        <button
            class="picture-file-upload-button {inputType === 'manual' ? 'active' : ''}"
            onclick={() => (inputType = 'manual', isShipmentInfoFormVisible = true)}>{t('collab.picturefileupload_button_3')}</button
        >
    </div>

    {#if !isShipmentInfoFormVisible}
        <DragFileBox onFileSelect={handleAutoFill} bind:files={currentFiles} />
    {/if}
    
    {#if isShipmentInfoFormVisible}
        <ShipmentInfoForm {campaignId} {matchId} bind:shipmentInfo bind:validationErrors />
    {/if}

    {#if isErrorModalVisible}
        <Modal modalTitle={t('collab.picturefileupload_modal_title')} warning={true} width="220px" maxWidth="400px">
            <p class="picture-file-upload-modal-description">
                {t('collab.picturefileupload_modal_description')}
            </p>
            <footer class="picture-file-upload-modal-footer">
                <button class="picture-file-upload-modal-footer-button-cancel" onclick={handleModalCancel}>
                    {t('collab.picturefileupload_modal_cancel_button')}
                </button>
                <button class="picture-file-upload-modal-footer-button-submit" onclick={handleModalRetry}>
                    {t('collab.picturefileupload_modal_submit_button')}
                </button>
            </footer>
        </Modal>
    {/if}
</div>

<style lang="scss">
	.manage-container {
		@include flex-column-center;
		gap: 20px;
		padding-top: 50px;
	}

	.picture-file-upload-container {
		text-align: center;

		.picture-file-upload-title {
			@include text-heading-1-semibold;
			color: $gray-900;
		}

		.picture-file-upload-description {
			@include text-caption-0-medium;
			color: $gray-900;
		}
	}

	.picture-file-upload-button-container {
		display: flex;
		justify-content: center;
		gap: 5px;
		width: 140px;
		height: 40px;
		margin-top: 20px;
		padding: 6px;
		border-radius: 10px;
		background-color: $gray-200;

		button {
			padding: 2px 8px;
			border: none;
			border-radius: 8px;
			outline: none;
			background-color: inherit;
			color: $gray-500;
			cursor: pointer;

			&.active {
				background-color: $gray-0;
				color: $gray-800;
			}
		}
	}

	.picture-file-upload-modal-description{
		@include text-headline-1-medium;
		color: $gray-800;
		margin-top: 20px;
	}

	.picture-file-upload-modal-footer{
		display: flex;
		gap: 10px;
		margin-top: 30px;
	}

	.picture-file-upload-modal-footer-button-submit{
		@include main-button('light');
		max-width: 150px;
		
	}

	.picture-file-upload-modal-footer-button-cancel{
		@include main-button('gray');
		max-width: 150px;
	}

	@include tablet-up {
		.picture-file-upload-container {
			.picture-file-upload-title {
				@include text-display-1-extrabold;
			}

			.picture-file-upload-description {
				@include text-title-2-semibold;
			}
		}

		.picture-file-upload-button-container {
			width: 620px;
			height: 48px;

			button {
				width: 304px;
			}
		}
	}
</style>
