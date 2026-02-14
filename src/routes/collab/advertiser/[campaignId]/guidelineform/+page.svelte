<script lang="ts">
	import { goto } from '$app/navigation';
	import { collaborationAPI } from '$lib/api/collaboration.ts';
	import { t } from '$lib/i18n-helper.ts';
	import Icons from '../../../../../components/Icons.svelte';
	import InputText from '../../../../../components/InputText.svelte';
	import Modal from '../../../../../components/Modal.svelte';
	import SelectButton from '../../../../../components/SelectButton.svelte';
	import TextArea from '../../../../../components/TextArea.svelte';
	import { isLoading } from '../../../../../stores/loading.js';

	import type { AdvertiserMatchData, GuideLineFormData } from '../../../../../types/matches.ts';

	let { data } = $props();

	let advertiserMatchesData = $derived(data.advertiserMatchesData as AdvertiserMatchData[]);
	let campaignId = $derived(data.params.campaignId);
	let rawGuideLineData = $derived(
		data.guideLineFormData ?? (data as any).guideLineFormDataFromCampaign ?? null
	);

	let campaignData = $derived(data.campaignData);

	const PLATFORM_MAP: Record<string, string> = {
        'tiktok': '틱톡',
        'instagram': '인스타그램',
        'youtube': '유튜브',
	}

	// [데이터 로드]
	let existingGuideline = $derived.by(() => {
		if (!rawGuideLineData) return null;

		// 백엔드에서 에러 객체({ detail: ... })가 넘어온 경우
		if ('detail' in rawGuideLineData) {
			console.log('가이드라인 없음 (신규 작성 모드):', rawGuideLineData.detail);
			return null;
		}

		// 정상 데이터인 경우
		return rawGuideLineData as GuideLineFormData;
	});

	

	// [수정 모드 여부]
	let shouldEnterEditMode = $state(false);
	let isEditMode = $derived(!existingGuideline || shouldEnterEditMode);
	let showModal = $state(false);

	// [폼 초기화 - 파생값으로 기본값 설정]
	const getInitialForm = () => {
        // 우선 기존 가이드라인(한글)이 있는지 확인
        let initPlatforms = existingGuideline?.platforms || [];

        // 기존 가이드라인이 없고, 캠페인 데이터(영어)가 있다면 -> 한글로 변환
        if (initPlatforms.length === 0 && campaignData?.platforms) {
            initPlatforms = campaignData.platforms.map((p: string) => {
                // 소문자로 바꿔서 매핑된 한글 값을 찾음. 없으면 원래 값 사용
                return PLATFORM_MAP[p.toLowerCase()] || p;
            });
        }

        return {
            brandName: existingGuideline?.brand_name || campaignData?.brand_name || '',
            productName: existingGuideline?.product_name || campaignData?.product_name || '',
            date: existingGuideline?.campaign_period || campaignData?.upload_deadline || '',
            
            // 변환된 플랫폼 배열 사용
            platforms: initPlatforms, 
            
            purpose: existingGuideline?.campaign_purpose || campaignData?.campaign_purpose || '',
            videoMoods: existingGuideline?.tone_mood || ([] as string[]),
            videoLength: existingGuideline?.video_length || '',
            videoSubtitle: existingGuideline?.subtitle_required || ([] as string[]),
            requiredTextContent: existingGuideline?.required_mentions || '',
            requiredPictureContents: existingGuideline?.required_shots || ([] as string[]),
            requiredPictureContentsOther: existingGuideline?.required_shots_other || '',
            importantInstructions: existingGuideline?.prohibited_items || '',
            etc: existingGuideline?.hashtags || '',
            productionFee: existingGuideline?.production_fee || '20,000'
        };
    };

	const form = $state(getInitialForm());

	let validationErrors = $state<any>({
		brandName: false,
		productName: false,
		date: false,
		platforms: false,
		purpose: false,
		videoMoods: false,
		videoLength: false,
		videoSubtitle: false,
		requiredTextContent: false,
		requiredPictureContents: false
	});

	// --- 아이템 목록 정의 ---
	let uploadPlatformItems = $derived(
		(t('collab.guidelineform_platform.items') as { title: string }[]) ?? []
	);
	let videoMoodItems = $derived(
		(t('collab.guidelineform_video_mood.items') as { title: string }[]) ?? []
	);
	let requiredPictureContentItems = $derived(
		(t('collab.guidelineform_required_picture_content.items') as { title: string }[]) ?? []
	);
	let videoSubtitleItems = $derived(
		(t('collab.guidelineform_video_subtitle.items') as { title: string }[]) ?? []
	);

	// --- 선택 상태 배열 (Boolean) ---
	let selectedPlatforms = $state<boolean[]>([]);
	let selectedVideoMoods = $state<boolean[]>([]);
	let selectedRequiredPictureContent = $state<boolean[]>([]);
	let selectedVideoSubtitle = $state<boolean[]>([]);

	

	$effect(() => {
        // 1. 플랫폼 (대소문자 무시 비교 적용)
        if (uploadPlatformItems.length > 0) {
            selectedPlatforms = uploadPlatformItems.map((item) => 
                // form에 저장된 데이터 중 하나라도 대소문자 무시하고 일치하는지 확인
                form.platforms.some(savedPlatform => 
                    savedPlatform.toLowerCase() === item.title.toLowerCase()
                )
            );
        }

        // 2. 분위기 (단일 선택이지만 배열 구조 유지)
        if (videoMoodItems.length > 0) {
            selectedVideoMoods = videoMoodItems.map((item) => 
                form.videoMoods.includes(item.title)
            );
        }

        // 3. 자막 (단일 선택이지만 배열 구조 유지)
        if (videoSubtitleItems.length > 0) {
            selectedVideoSubtitle = videoSubtitleItems.map((item) =>
                form.videoSubtitle.includes(item.title)
            );
        }

        // 4. 필수 촬영 컷 (기존 유지)
        if (requiredPictureContentItems.length > 0) {
            selectedRequiredPictureContent = requiredPictureContentItems.map((item) =>
                form.requiredPictureContents.includes(item.title)
            );
        }
    });

	// --- 토글 함수들 ---
	const togglePlatform = (index: number) => {
		if (!isEditMode) return;
		selectedPlatforms[index] = !selectedPlatforms[index];
		form.platforms = selectedPlatforms
			.map((isSelected, i) => (isSelected ? uploadPlatformItems[i].title : ''))
			.filter(Boolean);
	};

const toggleMood = (index: number) => {
        if (!isEditMode) return;
        
      
        selectedVideoMoods = selectedVideoMoods.map((_, i) => i === index);
        
        
        if (selectedVideoMoods[index]) {
            form.videoMoods = [videoMoodItems[index].title];
        } else {
            form.videoMoods = []; 
        }
    };

 
    const toggleVideoSubtitle = (index: number) => {
        if (!isEditMode) return;

       
        selectedVideoSubtitle = selectedVideoSubtitle.map((_, i) => i === index);

        if (selectedVideoSubtitle[index]) {
            form.videoSubtitle = [videoSubtitleItems[index].title];
        } else {
             form.videoSubtitle = [];
        }
    };

	const toggleRequiredPictureContent = (index: number) => {
		if (!isEditMode) return;
		selectedRequiredPictureContent[index] = !selectedRequiredPictureContent[index];
		form.requiredPictureContents = selectedRequiredPictureContent
			.map((isSelected, i) => (isSelected ? requiredPictureContentItems[i].title : ''))
			.filter(Boolean);
	};

	// --- 유효성 검사 ---
	const validateForm = () => {
		let isValid = true;
		// ... (유효성 검사 로직 동일, 생략 가능하지만 안전을 위해 유지)
		if (!form.brandName.trim()) {
			validationErrors.brandName = true;
			isValid = false;
		} else {
			validationErrors.brandName = false;
		}
		if (!form.productName.trim()) {
			validationErrors.productName = true;
			isValid = false;
		} else {
			validationErrors.productName = false;
		}
		if (!form.date.trim()) {
			validationErrors.date = true;
			isValid = false;
		} else {
			validationErrors.date = false;
		}
		if (form.platforms.length === 0) {
			validationErrors.platforms = true;
			isValid = false;
		} else {
			validationErrors.platforms = false;
		}
		if (!form.purpose.trim()) {
			validationErrors.purpose = true;
			isValid = false;
		} else {
			validationErrors.purpose = false;
		}
		if (form.videoMoods.length === 0) {
			validationErrors.videoMoods = true;
			isValid = false;
		} else {
			validationErrors.videoMoods = false;
		}
		if (!form.videoLength.trim()) {
			validationErrors.videoLength = true;
			isValid = false;
		} else {
			validationErrors.videoLength = false;
		}
		if (form.videoSubtitle.length === 0) {
			validationErrors.videoSubtitle = true;
			isValid = false;
		} else {
			validationErrors.videoSubtitle = false;
		}
		if (!form.requiredTextContent.trim()) {
			validationErrors.requiredTextContent = true;
			isValid = false;
		} else {
			validationErrors.requiredTextContent = false;
		}
		if (form.requiredPictureContents.length === 0) {
			validationErrors.requiredPictureContents = true;
			isValid = false;
		} else {
			validationErrors.requiredPictureContents = false;
		}
		return isValid;
	};

	// --- 제출 핸들러 (Pre) ---
	const handlePreSubmit = (e: Event) => {
		e.preventDefault();

		if (!isEditMode) {
			shouldEnterEditMode = true;
			return;
		}

		if (validateForm()) {
			// 수정 모드(기존 데이터 있음)면 모달 없이 바로 저장
			if (existingGuideline) {
				handleFinalSubmit();
			} else {
				showModal = true;
			}
		} else {
			console.log('Validation Failed', validationErrors);
			alert('필수 항목을 모두 입력해주세요.');
		}
	};

	// --- 제출 핸들러 (Final) ---
	const handleFinalSubmit = async () => {
		const payload = {
			brand_name: form.brandName,
			product_name: form.productName,
			campaign_period: form.date,
			platforms: form.platforms,
			campaign_purpose: form.purpose,
			tone_mood: form.videoMoods,
			video_length: form.videoLength,
			subtitle_required: form.videoSubtitle,
			required_mentions: form.requiredTextContent,
			required_shots: form.requiredPictureContents,
			required_shots_other: form.requiredPictureContentsOther,
			prohibited_items: form.importantInstructions,
			hashtags: form.etc,
			required_brand_tag: [],
			precautions: form.importantInstructions,
			other: form.etc,
			production_fee: form.productionFee
		};

		isLoading.set(true);
		try {
			if (existingGuideline) {
				// 1. 기존 가이드라인이 있으면 -> 수정 (PUT)
				await collaborationAPI.editGuideLineForm(campaignId, payload);
				alert('수정이 완료되었습니다.'); // 사용자 피드백 (선택사항)
			} else {
				// 2. 없으면 -> 신규 등록 (POST)
				await collaborationAPI.writeGuideLineForm(campaignId, payload);
			}
		
			await goto(`/collab/advertiser/${campaignId}/complete?type=guidelineform`), { invalidateAll: true };
			showModal = false;
		} catch (error) {
			console.error('저장 실패', error);
			alert('저장에 실패했습니다.');
		} finally {
			isLoading.set(false);
		}
	};

	const handleCloseModal = () => {
		showModal = false;
	};

	const handleEditCancel = () => {
		shouldEnterEditMode = false;
		// 취소 시 데이터를 원래대로 되돌리는 로직이 필요하다면 여기에 추가 (지금은 UI만 잠금)
	};
</script>

<div class="guidelineform-container">
	<section class="guidelineform-header">
		<div class="guidelineform-header-title">
			<a href={`/collab/advertiser/${campaignId}/dashboard`}
				><Icons name="arrow_left" width="20" height="20" color="currentColor" /></a
			>
			<h1>{t('collab.guidelineform_title')}</h1>
		</div>
		<div class="guidelineform-header-subtitle">{@html t('collab.guidelineform_subtitle')}</div>
	</section>

	<section class="guidelineform-form">
		<form onsubmit={handlePreSubmit}>
			<label for="brand-name" class="required-label">{t('collab.guidelineform_brand')}</label>
			<InputText
				isError={validationErrors.brandName}
				bind:value={form.brandName}
				placeholder={t('collab.guidelineform_brand')}
				disabled={!isEditMode}
			/>

			<label for="product-name" class="required-label">{t('collab.guidelineform_product')}</label>
			<InputText
				isError={validationErrors.productName}
				bind:value={form.productName}
				placeholder={t('collab.guidelineform_product')}
				disabled={!isEditMode}
			/>

			<label for="date" class="required-label">{t('collab.guidelineform_date')}</label>
			<InputText
				isError={validationErrors.date}
				bind:value={form.date}
				placeholder={t('collab.guidelineform_date_placeholder')}
				disabled={!isEditMode}
			/>

			<label for="platform" class="required-label">{t('collab.guidelineform_platform.title')}</label
			>
			<ul id="platform">
				{#each t('collab.guidelineform_platform.items') as any as item, index}
					<li onclick={() => togglePlatform(index)} class:disabled={!isEditMode}>
						<SelectButton checked={selectedPlatforms[index]} disabled={!isEditMode} />
						<span>{item.title}</span>
					</li>
				{/each}
			</ul>

			<label for="purpose" class="required-label">{t('collab.guidelineform_purpose')}</label>
			<InputText
				isError={validationErrors.purpose}
				bind:value={form.purpose}
				placeholder={t('collab.guidelineform_purpose_placeholder')}
				disabled={!isEditMode}
			/>

			<label for="video-mood" class="required-label"
				>{t('collab.guidelineform_video_mood.title')}</label
			>
			<ul id="video-mood">
				{#each t('collab.guidelineform_video_mood.items') as any as item, index}
					<li onclick={() => toggleMood(index)} class:disabled={!isEditMode}>
						<SelectButton checked={selectedVideoMoods[index]} disabled={!isEditMode} />
						<span>{item.title}</span>
					</li>
				{/each}
			</ul>

			<label for="video-length" class="required-label"
				>{t('collab.guidelineform_video_length')}</label
			>
			<InputText
				isError={validationErrors.videoLength}
				bind:value={form.videoLength}
				placeholder={t('collab.guidelineform_video_length_placeholder')}
				disabled={!isEditMode}
			/>

			<label for="video-subtitle" class="required-label"
				>{t('collab.guidelineform_video_subtitle.title')}</label
			>
			<ul id="video-subtitle">
				{#each t('collab.guidelineform_video_subtitle.items') as any as item, index}
					<li onclick={() => toggleVideoSubtitle(index)} class:disabled={!isEditMode}>
						<SelectButton checked={selectedVideoSubtitle[index]} disabled={!isEditMode} />
						<span>{item.title}</span>
					</li>
				{/each}
			</ul>

			<label for="required-text-content" class="required-label"
				>{t('collab.guidelineform_required_text_content')}</label
			>
			<TextArea
				isError={validationErrors.requiredTextContent}
				bind:value={form.requiredTextContent}
				placeholder={t('collab.guidelineform_required_text_content_placeholder')}
				disabled={!isEditMode}
			/>

			<label for="required-picture-content" class="required-label"
				>{t('collab.guidelineform_required_picture_content.title')}</label
			>
			<ul id="required-picture-content">
				{#each t('collab.guidelineform_required_picture_content.items') as any as item, index}
					<li onclick={() => toggleRequiredPictureContent(index)} class:disabled={!isEditMode}>
						<SelectButton checked={selectedRequiredPictureContent[index]} disabled={!isEditMode} />
						<span>{item.title}</span>
					</li>
				{/each}
			</ul>
			<TextArea
				isError={validationErrors.requiredPictureContents}
				bind:value={form.requiredPictureContentsOther}
				placeholder={t('collab.guidelineform_required_picture_content_placeholder')}
				disabled={!isEditMode}
			/>

			<label for="important-instructions">{t('collab.guidelineform_important_instructions')}</label>
			<textarea
				class="textarea"
				placeholder={t('collab.guidelineform_important_instructions_placeholder')}
				bind:value={form.importantInstructions}
				disabled={!isEditMode}
			></textarea>

			<label for="etc">{t('collab.guidelineform_etc')}</label>
			<textarea
				class="textarea"
				placeholder={t('collab.guidelineform_etc_placeholder')}
				bind:value={form.etc}
				disabled={!isEditMode}
			></textarea>

			<label for="price">{t('collab.guidelineform_price')}</label>
		<InputText
			bind:value={form.productionFee}
			placeholder={t('collab.guidelineform_price')}
			disabled={true}
			isError={false}
		/>

			{#if isEditMode}
				<div class="guidelineform-edit-message">
					<h2 class="guidelineform-edit-message-title">
						<span class="guidelineform-edit-message-icon">!</span>{t(
							'collab.collab_advertiser_guideline-edit-message'
						)}
					</h2>
					<p class="guidelineform-edit-message-description">
						{t('collab.collab_advertiser_guideline-edit-description')}
					</p>
				</div>
			{/if}
			<button class="guidelineform-btn" type="submit">
				{#if !isEditMode}
					{t('collab.collab_advertiser_guideline-edit')}
				{:else if existingGuideline}
					{t('collab.collab_advertiser_guideline-edit-complete')}
				{:else}
					{t('collab.guidelineform_btn')}
				{/if}
			</button>

			{#if isEditMode}
				<button class="guidelineform-cancel-btn" type="button" onclick={handleEditCancel}
					>{t('collab.collab_advertiser_guideline-edit-cancel')}</button
				>
			{/if}
		</form>
	</section>
</div>

{#if showModal}
	<Modal
		modalTitle={t('collab.guidelineform_modal_title')}
		width="220px"
		maxWidth="650px"
		mobileMaxHeight="300px"
		tabletMaxHeight="270px"
	>
		<div class="guidelineform-modal-content">
			<h1 class="guidelineform-modal-subtitle">{t('collab.guidelineform_modal_subtitle')}</h1>
			<h2 class="guidelineform-modal-description">{t('collab.guidelineform_modal_description')}</h2>
		</div>
		<footer class="guidelineform-modal-footer">
			<button onclick={handleCloseModal}>{t('collab.guidelineform_modal_cancel_button')}</button>
			<button onclick={handleFinalSubmit}>{t('collab.guidelineform_modal_submit_button')}</button>
		</footer>
	</Modal>
{/if}

<style lang="scss">
	.guidelineform-container {
		@include flex-column-center;
		gap: 20px;
		margin-bottom: 30px;
		padding: 0 20px;
	}

	.guidelineform-header {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-self: center;
		align-items: center;
		width: 100%;

		.guidelineform-header-title {
			display: flex;
			align-items: center;

			a {
				position: absolute;
				left: 10px;
			}

			h1 {
				@include text-heading-0-bold;
			}
		}

		.guidelineform-header-subtitle {
			@include text-body-0-semibold;

			padding: 25px 10px;
			text-align: center;
		}
	}

	.guidelineform-form {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;

		form {
			display: flex;
			flex-direction: column;
			gap: 10px;
			box-sizing: border-box;
			width: 100%;
			max-width: 485px;
			padding: 0 20px;

			label {
				@include text-headline-0-semibold;
				position: relative;
				width: fit-content;
				margin-top: 20px;
			}

			.required-label {
				&::after {
					content: '';
					position: absolute;
					top: 3px;
					right: -8px;
					width: 6px;
					height: 6px;
					border-radius: 50%;
					background-color: red;
				}
			}

			ul {
				display: flex;
				flex-direction: column;
				gap: 5px;

				li {
					display: flex;
					align-items: center;
					gap: 10px;
					cursor: pointer;

					span {
						@include text-body-0-semibold;
					}
				}
			}

			.textarea {
				@include textarea;
			}

			.guidelineform-edit-message {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				gap: 5px;
				margin-bottom: 5px;
				text-align: center;

				.guidelineform-edit-message-title {
					@include error-message;

					.guidelineform-edit-message-icon {
						@include error-icon;
					}
				}

				.guidelineform-edit-message-description {
					@include text-body-0-semibold;
					width: 80%;
					color: $gray-600;
				}
			}

			.guidelineform-btn {
				@include main-button('primary');
				width: 100%;
			}

			.guidelineform-cancel-btn {
				@include main-button('gray');
				width: 100%;
			}
		}
	}

	.guidelineform-modal-content {
		@include text-headline-0-semibold;
		margin-top: 10px;
		margin-bottom: 25px;
		text-align: center;

		h1 {
			margin-bottom: 10px;
			color: #ff080c;
		}

		h2 {
			color: $gray-800;
		}
	}

	.guidelineform-modal-footer {
		display: flex;
		gap: 10px;

		button {
			&:first-child {
				@include main-button('gray');
				width: 130px;
			}

			&:last-child {
				@include main-button('light');
				width: 130px;
			}
		}
	}
</style>
