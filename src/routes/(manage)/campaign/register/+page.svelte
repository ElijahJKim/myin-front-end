<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n-helper.ts';
	import FirstForm from '../../../../components/campaign/FirstForm.svelte';
	import SecondForm from '../../../../components/campaign/SecondForm.svelte';
	import Modal from '../../../../components/Modal.svelte';
	import type { RegisterForm } from '../../../../types/register.js';


	let {form} = $props();

	let currStep = $state(1);
	let isPrivacyPolicyAgreed = $state(false);
	let isPrivacySubmitModalOpen = $state(false);
	let isSubmitting = $state(false);
	let submitError = $state(false);
	let registerForm = $state<RegisterForm>({
		brandName: '',
		productName: '',
		campaignPurpose: '',
		targetCountry: [],
		uploadPlatform: [],
		budgetRange: [],
		uploadPeriod: '',
		productLink: '',
		chargeName: '',
		chargePhone: '',
		chargeEmail: '',
		etc: ''
	});

	let validationErrors = $state<any>({
		brandName: false,
		targetCountry: false,
		chargeName: false,
		chargePhone: false,
		chargeEmail: false,
		isPrivacyPolicyAgreed: false
	});

	const handleSubmit = () => {
		if (currStep === 1) {
			let hasError = false;

			if (!registerForm.brandName || registerForm.brandName.trim() === '') {
				validationErrors.brandName = true;
				hasError = true;
			} else {
				validationErrors.brandName = false;
			}

			if (registerForm.targetCountry.length === 0) {
				validationErrors.targetCountry = true;
				hasError = true;
			}

			if (hasError) return;

			currStep = 2;
		} else {
			let hasError = false;

			if (!registerForm.chargeName || registerForm.chargeName.trim() === '') {
				validationErrors.chargeName = true;
				hasError = true;
			}

			if (!registerForm.chargePhone || registerForm.chargePhone.trim() === '') {
				validationErrors.chargePhone = true;
				hasError = true;
			}

			if (!registerForm.chargeEmail || registerForm.chargeEmail.trim() === '') {
				validationErrors.chargeEmail = true;
				hasError = true;
			}

			if (!isPrivacyPolicyAgreed) {
				validationErrors.isPrivacyPolicyAgreed = true;
				hasError = true;
			}

			if (hasError) return;

			isPrivacySubmitModalOpen = true;
		}
	};
</script>

<main class="register-container">
	<section class="register-title-container">
		<h1>{t('campaign.register_title')}</h1>
	</section>
	<section class="register-form-container">
		{#if currStep === 1}
			<FirstForm bind:form={registerForm} bind:errors={validationErrors} />
		{/if}

		{#if currStep === 2}
			<SecondForm
				bind:form={registerForm}
				bind:errors={validationErrors}
				bind:isPrivacyPolicyAgreed
			/>
		{/if}

		<div class="step-container-section">
			<div class="step-container">
				<button
					onclick={() => (currStep = 1)}
					class="step-box {currStep === 1 ? 'active' : 'inactive'}"
				>
					1
				</button>

				<div class="line"></div>

				<button
					onclick={() => (currStep = 2)}
					class="step-box {currStep === 2 ? 'active' : 'inactive'}"
					disabled={registerForm.brandName === ' ' || registerForm.targetCountry.length === 0}
				>
					2
				</button>
			</div>
			<div class="btn-container">
				{#if currStep === 2}
					<button onclick={() => (currStep = 1)} class="btn-main btn-prev">
						{t('campaign.register_prev_button')}
					</button>
				{/if}
				<button
					onclick={() => {
						handleSubmit();
					}}
					class="btn-main btn-next"
					>{currStep === 1
						? t('campaign.register_next_button')
						: t('campaign.register_submit_button')}</button
				>
			</div>
		</div>


	</section>
</main>

{#if isPrivacySubmitModalOpen}
	<Modal
		modalTitle={t('campaign.privacy_submit_title')}
		width="220px"
		maxWidth="300px"
		height="auto"
	>
		<main class="privacy-submit-modal-content">
			<p class="privacy-description">{t('campaign.privacy_submit_description')}</p>
			{#if submitError}
				<p class="submit-error-message">{t('campaign.privacy_submit_error')}</p>
			{/if}
		</main>
		<footer class="privacy-submit-button-container">
			<button
				class="privacy-submit-cancel-button"
				onclick={() => {
					isPrivacySubmitModalOpen = false;
					submitError = false;
				}}
				disabled={isSubmitting}
				>{t('campaign.privacy_submit_cancel_button')}</button
			>
			<form
				method="POST"
				action="?/createCampaign"
				use:enhance={() => {
					isSubmitting = true;
					submitError = false;
					return async ({ result }) => {
						isSubmitting = false;

						if (result.type === 'redirect') {
							window.location.href = result.location;
						} else if (result.type === 'failure' || result.type === 'error') {
							submitError = true;
						}
					};
				}}
			>
				<input type="hidden" name="brand_name" value={registerForm.brandName} />
				<input type="hidden" name="product_name" value={registerForm.productName} />
				<input type="hidden" name="campaign_purpose" value={registerForm.campaignPurpose} />
				<input type="hidden" name="upload_period" value={registerForm.uploadPeriod} />
				<input type="hidden" name="product_link" value={registerForm.productLink} />
				<input type="hidden" name="charge_name" value={registerForm.chargeName} />
				<input type="hidden" name="charge_phone" value={registerForm.chargePhone} />
				<input type="hidden" name="charge_email" value={registerForm.chargeEmail} />
				<input type="hidden" name="etc" value={registerForm.etc} />

				{#each registerForm.targetCountry as country}
					<input type="hidden" name="target_countries" value={country} />
				{/each}

				{#each registerForm.uploadPlatform as platform}
					<input type="hidden" name="platforms" value={platform} />
				{/each}

				{#if registerForm.budgetRange && registerForm.budgetRange.length === 2}
					<input type="hidden" name="budget_min" value={registerForm.budgetRange[0]} />
					<input type="hidden" name="budget_max" value={registerForm.budgetRange[1]} />
				{/if}

				<button class="privacy-submit-button" disabled={isSubmitting}>
					{isSubmitting
						? t('campaign.privacy_submit_processing')
						: t('campaign.privacy_submit_button')}
				</button>
			</form>
		</footer>
	</Modal>
{/if}

<style lang="scss">
	.register-container {
		@include flex-column-center;
		width: 100%;
	}

	.register-title-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 200px;
		background-color: $primary-0;

		h1 {
			@include text-heading-0-bold;
		}
	}

	.register-form-container {
		display: flex;
		flex-direction: column;
		gap: 20px;
		box-sizing: border-box;
		width: 100%;
		max-width: 500px;
		padding: 20px;
	}

	.step-container-section {
		display: flex;
		justify-content: space-between;

		.step-container {
			display: flex;
			align-items: center; // 수직 중앙 정렬 (이게 핵심!)
			gap: 0; // 박스와 선 사이 간격 없음
		}
		margin-top: 30px;

		.step-box {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 20px;
			height: 20px;
			border: none;
			border-radius: 2px;
			outline: none;
			background-color: transparent;
			cursor: pointer;

			@include text-caption-0-semibold;

			&.active {
				background-color: $gray-900;
				color: $gray-0;
			}

			&.inactive {
				background-color: $gray-300;
				color: $gray-0;
			}
		}

		.line {
			width: 30px; // 선의 길이 (원하는 만큼 조절)
			height: 2px; // 선의 두께
			background-color: #ececec; // 2번 박스와 같은 색상
		}

		.btn-container {
			display: flex;
			gap: 10px;
		}

		.btn-prev,
		.btn-next {
			width: 90px;
			height: 50px;
		}
	}

	.privacy-submit-modal-content {
		.submit-error-message {
			margin-top: 10px;
			color: #c62828;
			font-size: 13px;
			text-align: center;
		}
	}

	.privacy-submit-button-container {
		display: flex;
		gap: 10px;
		margin-top: 20px;

		.privacy-submit-cancel-button {
			@include main-button;
			width: 100px;
			background-color: $gray-200;
			color: $gray-600;
			cursor: pointer;
			transition: all 0.2s ease;

			&:hover:not(:disabled) {
				background-color: $gray-300;
				color: $gray-900;
			}

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}

		.privacy-submit-button {
			@include main-button('light');
			width: 100px;
			cursor: pointer;
		}
	}

	@include tablet-up {
		.register-form-container {
			max-width: 600px;
		}

		.register-title-container {
			height: 250px;

			h1 {
				@include text-display-1-extrabold;
			}
		}
	}
</style>
