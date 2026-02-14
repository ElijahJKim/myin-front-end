<script lang="ts">
	import { goto } from '$app/navigation';
	import { collaborationAPI } from '$lib/api/collaboration.ts';
	import { t } from '$lib/i18n-helper.ts';
	import Icons from '../../../../../components/Icons.svelte';
	import InputText from '../../../../../components/InputText.svelte';
	import Modal from '../../../../../components/Modal.svelte';
	import SelectButton from '../../../../../components/SelectButton.svelte';
	import TextArea from '../../../../../components/TextArea.svelte';

	let { data } = $props();

    console.log(data, "guidelineform data")

    let influencerId = $derived(data.params.influencerId);
    let campaignId = $derived(data.campaignId);
    let isEditMode = $state(false);
    let matchId = $derived(data.matchId);
    let rawGuideLineData = $derived(data.guidelineFormData);

    let showModal = $state(false);
    let showObjectionModal = $state(false);
    let objectionReason = $state('');

    const form = $state({
        brandName: '',
        productName: '',
        date: '',
        platforms: [],
        purpose: '',
        videoMoods: [],
        videoLength: '',
        videoSubtitle: [],
        requiredTextContent: '',
        requiredPictureContents: [],
        requiredPictureContentsOther: '',
        importantInstructions: '',
        etc: ''
    });

    // 변경된 부분: API 호출 대신 rawGuideLineData를 사용하여 폼 데이터 초기화
    $effect(() => {
        if (rawGuideLineData) {
            form.brandName = rawGuideLineData.brand_name || '';
            form.productName = rawGuideLineData.product_name || '';
            form.date = rawGuideLineData.campaign_period || '';
            form.platforms = rawGuideLineData.platforms || [];
            form.purpose = rawGuideLineData.campaign_purpose || '';
            form.videoMoods = rawGuideLineData.tone_mood || [];
            form.videoLength = rawGuideLineData.video_length || '';
            form.videoSubtitle = rawGuideLineData.subtitle_required || [];
            form.requiredTextContent = rawGuideLineData.required_mentions || '';
            form.requiredPictureContents = rawGuideLineData.required_shots || [];
            form.requiredPictureContentsOther = rawGuideLineData.required_shots_other || '';
            form.importantInstructions = rawGuideLineData.precautions || '';
            form.etc = rawGuideLineData.other || '';
        }
    });

    const handleCloseModal = () => {
        showModal = false;
    };

    const handleConfirmSubmit = async () => {
        showModal = false;
        try {
            await collaborationAPI.confirmGuideLineForm(matchId as string);
            await goto(`/collab/influencer/${influencerId}/complete?type=guidelineform`);
        } catch (error) {
            console.error('Failed to submit guideline form:', error);
        }
    };

    const handleOpenModal = () => {
        showModal = true;
    };

    const handleOpenObjectionModal = () => {
        showObjectionModal = true;
    };

    const handleCloseObjectionModal = () => {
        showObjectionModal = false;
    };

    const handleSubmitObjection = async () => {
        showObjectionModal = false;
        try {
            await collaborationAPI.objectionGuideLineForm(campaignId as string, objectionReason);
            await goto(`/collab/influencer/${influencerId}/complete?type=objection`);
        } catch (error) {
            console.error('Failed to submit objection form:', error);
        }
    };
</script>

<div class="guidelineform-container">
	<section class="guidelineform-header">
		<div class="guidelineform-header-title">
			<a href={`/collab/influencer/${influencerId}/dashboard`}
				><Icons name="arrow_left" width="20" height="20" color="currentColor" /></a
			>
			<h1>{t('collab.guidelineform_influencer_title')}</h1>
		</div>
		<div class="guidelineform-header-subtitle">
			{@html t('collab.guidelineform_influencer_warning')}
		</div>
	</section>

	<section class="guidelineform-form">
		<form>
		

		

			<label for="purpose">{t('collab.guidelineform_purpose')}</label>
			<InputText
				isError={false}
				bind:value={form.purpose}
				placeholder={t('collab.guidelineform_purpose_placeholder')}
				disabled={true}
			/>

			<label for="video-mood">{t('collab.guidelineform_video_mood.title')}</label>
			<InputText isError={false} bind:value={form.videoMoods} disabled={true} placeholder={t('collab.guidelineform_video_mood.placeholder')} />

			<label for="video-length">{t('collab.guidelineform_video_length')}</label>
			<InputText
				isError={false}
				bind:value={form.videoLength}
				placeholder={t('collab.guidelineform_video_length')}
				disabled={true}
			/>

			<label for="required-text-content">{t('collab.guidelineform_required_text_content')}</label>
			<TextArea
				isError={false}
				bind:value={form.requiredTextContent}
				placeholder={t('collab.guidelineform_required_text_content_placeholder')}
				disabled={true}
			/>

			<label for="required-picture-content"
				>{t('collab.guidelineform_required_picture_content.title')}</label
			>
			<InputText isError={false} bind:value={form.requiredPictureContents} disabled={true} placeholder={t('collab.guidelineform_required_picture_content.placeholder')} />

			<TextArea
				isError={false}
				bind:value={form.requiredPictureContentsOther}
				placeholder={t('collab.guidelineform_required_picture_content_placeholder')}
				disabled={true}
			/>

			<label for="important-instructions">{t('collab.guidelineform_important_instructions')}</label>
			<textarea
				class="textarea"
				placeholder={t('collab.guidelineform_important_instructions_placeholder')}
				bind:value={form.importantInstructions}
				disabled={true}
			></textarea>

			<label for="etc">{t('collab.guidelineform_etc')}</label>
			<textarea
				class="textarea"
				placeholder={t('collab.guidelineform_etc_placeholder')}
				bind:value={form.etc}
				disabled={true}
			></textarea>
		</form>
	</section>
	<section class="guidelineform-footer">
		<button class="guidelineform-confirm-btn" onclick={handleOpenModal}
			>{t('collab.guidelineform_influencer_confirm_button')}</button
		>
		<button class="guidelineform-objection-btn" onclick={handleOpenObjectionModal}
			>{t('collab.guidelineform_influencer_objection_button')}</button
		>
	</section>
</div>

{#if showModal}
	<Modal
		modalTitle={t('collab.guidelineform_influencer_confirm_modal_title')}
		width="220px"
		maxWidth="650px"
		mobileMaxHeight="300px"
		tabletMaxHeight="270px"
	>
		<div class="guidelineform-modal-content">
			<h2 class="guidelineform-modal-description">
				{t('collab.guidelineform_influencer_confirm_modal_description')}
			</h2>
		</div>
		<footer class="guidelineform-modal-footer">
			<button onclick={handleCloseModal}
				>{t('collab.guidelineform_influencer_confirm_modal_cancel_button')}</button
			>
			<button onclick={handleConfirmSubmit}
				>{t('collab.guidelineform_influencer_confirm_modal_submit_button')}</button
			>
		</footer>
	</Modal>
{/if}

{#if showObjectionModal}
	<Modal
		modalTitle={t('collab.guidelineform_influencer_objection_title')}
		width="220px"
		maxWidth="700px"
	>
		<div class="guidelineform-modal-content">
			<div class="guidelineform-modal-description">
				<p class="guidelineform-modal-description-1">
					{t('collab.guidelineform_influencer_objection_description_1')}
				</p>
				<p class="guidelineform-modal-description-2">
					{t('collab.guidelineform_influencer_objection_description_2')}
				</p>
			</div>

			<div class="guidelineform-modal-textarea">
				<TextArea
					isError={false}
					bind:value={objectionReason}
					placeholder={t('collab.guidelineform_influencer_objection_placeholder')}
				/>
			</div>
		</div>
		<footer class="guidelineform-modal-footer">
			<button onclick={handleCloseObjectionModal}
				>{t('collab.guidelineform_influencer_objection_cancel_button')}</button
			>
			<button onclick={handleSubmitObjection}
				>{t('collab.guidelineform_influencer_objection_submit_button')}</button
			>
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

			margin-top: 20px;
			color: $primary-600;
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

			.price-display {
				@include input-filed;
				display: flex;
				align-items: center;
				box-sizing: border-box;
				width: 100%;
				margin-bottom: 5px;
				padding: 0 20px;
				border: none;
				outline: none;
				background-color: $gray-200;
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

	.guidelineform-footer {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		max-width: 485px;

		.guidelineform-confirm-btn {
			@include main-button('primary', 'extra-large');
			width: 100%;
		}

		.guidelineform-objection-btn {
			@include main-button('light', 'extra-large');
			width: 100%;
		}
	}

	.guidelineform-modal-content {
		@include text-headline-0-semibold;
		width: 100%;
		margin-top: 10px;
		margin-bottom: 10px;

		@include flex-column-center;

		text-align: center;

		h1 {
			margin-bottom: 10px;
			color: #ff080c;
		}

		h2 {
			color: $gray-800;
		}

		.guidelineform-modal-description {
			@include text-caption-0-medium;
			margin-bottom: 10px;
			color: $gray-800;

			.guidelineform-modal-description-1 {
				display: none;
			}
		}

		.guidelineform-modal-textarea {
			width: 100%;
			max-width: 500px;
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

	@include tablet-up {
		.guidelineform-header {
			.guidelineform-header-title {
				h1 {
					@include text-display-1-extrabold;
				}
			}

			.guidelineform-header-subtitle {
				@include text-title-2-semibold;
			}
		}

		.guidelineform-modal-content {
			.guidelineform-modal-description {
				@include text-headline-0-medium;

				.guidelineform-modal-description-1 {
					display: block;
				}
			}
		}
	}
</style>
