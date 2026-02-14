<script lang="ts">
	import { json } from 'svelte-i18n';
	import { t } from '$lib/i18n-helper.ts';
	import PrivacyPolicyForm from './PrivacyPolicyForm.svelte';
	import type { RegisterForm } from '../../types/register.js';
	import SelectButton from '../SelectButton.svelte';
	import InputText from '../InputText.svelte';

	let {
		form = $bindable(),
		errors = $bindable(),
		isPrivacyPolicyAgreed = $bindable()
	}: { form: RegisterForm; errors: any; isPrivacyPolicyAgreed: boolean } = $props();

	let uploadPlatformItems =
		($json('campaign.register_upload_platform.items') as { title: string }[]) ?? [];
	let selectedUploadPlatforms = $state<boolean[]>([]);

	let minBudget = $state(0);
	let maxBudget = $state(20);
	let min = 0;
	let max = 100;

	// [변경] 퍼센트 계산 (왼쪽 원 위치, 오른쪽 원 위치)
	let minPercent = $derived(((minBudget - min) / (max - min)) * 100);
	let maxPercent = $derived(((maxBudget - min) / (max - min)) * 100);

	$effect(() => {
		if (Array.isArray(form.budgetRange) && form.budgetRange.length === 2) {
			minBudget = form.budgetRange[0];
			maxBudget = form.budgetRange[1];
		}

		if (Array.isArray(uploadPlatformItems) && uploadPlatformItems.length > 0) {
			selectedUploadPlatforms = uploadPlatformItems.map(
				(item: any) => form.uploadPlatform?.includes(item.title) ?? false
			);
		}
	});

	// [변경] 서로 교차되지 않게 막는 로직
	const handleMinChange = () => {
		if (minBudget > maxBudget) minBudget = maxBudget;
		form.budgetRange = [minBudget, maxBudget];
	};

	const handleMaxChange = () => {
		if (maxBudget < minBudget) maxBudget = minBudget;
		form.budgetRange = [minBudget, maxBudget];
	};

	// [변경] CSS 변수로 범위 전달 (트랙 색칠용)
	$effect(() => {
		document.documentElement.style.setProperty('--min-pos', `${minPercent}%`);
		document.documentElement.style.setProperty('--max-pos', `${maxPercent}%`);

		form.budgetRange = [minBudget, maxBudget];
	});

	const toggleSelection = (index: number) => {
		if (!uploadPlatformItems[index]) return;

		selectedUploadPlatforms[index] = !selectedUploadPlatforms[index];

		form.uploadPlatform = selectedUploadPlatforms
			.map((isSelected, i) => (isSelected ? uploadPlatformItems[i].title : ''))
			.filter(Boolean);
	};

	const handleChargeNameInput = () => {
		errors.chargeName = false;
	};

	const handleChargePhoneInput = () => {
		errors.chargePhone = false;
	};

	const handleChargeEmailInput = () => {
		errors.chargeEmail = false;
		emailFormatError = false;
	};

	// 이메일 형식 검증
	const isValidEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	let emailFormatError = $state(false);

	const handleChargeEmailBlur = () => {
		if (form.chargeEmail && form.chargeEmail.trim() !== '') {
			emailFormatError = !isValidEmail(form.chargeEmail);
		} else {
			emailFormatError = false;
		}
	};

	// 오늘 날짜를 yyyy-mm-dd 형식으로 반환 (min 속성용)
	const getTodayDate = () => {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const day = String(today.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const minDate = getTodayDate();

	// 날짜 표시용 (yyyy/mm/dd 형식)
	let displayDate = $state('');
	let dateInputRef: HTMLInputElement;

	// form.uploadPeriod가 변경되면 displayDate 업데이트
	$effect(() => {
		if (form.uploadPeriod) {
			// yyyy-mm-dd -> yyyy/mm/dd
			displayDate = form.uploadPeriod.replace(/-/g, '/');
		}
	});

	const handleDateChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		form.uploadPeriod = target.value; // yyyy-mm-dd 형식으로 저장
	};

	const openDatePicker = () => {
		dateInputRef?.showPicker();
	};
</script>

<form class="second-form">
	<label for="upload-platform">{t('campaign.register_upload_platform.title')}</label>
	<ul id="upload-platform">
		{#each $json('campaign.register_upload_platform.items') as any as item, index (item.title)}
			<li onclick={() => toggleSelection(index)}>
				<SelectButton checked={selectedUploadPlatforms[index]} />
				<span>{item.title}</span>
			</li>
		{/each}
	</ul>
	<label for="budget-range" class="budget-title">
		{t('campaign.register_budget.title')}
	</label>
	<div class="budget-container">
		<div class="range-wrapper">
			<div class="slider-track"></div>
			<div class="slider-range"></div>

			<input
				type="range"
				{min}
				{max}
				step="1"
				bind:value={minBudget}
				oninput={handleMinChange}
				class="dual-range-input"
			/>
			<input
				type="range"
				{min}
				{max}
				step="1"
				bind:value={maxBudget}
				oninput={handleMaxChange}
				class="dual-range-input"
			/>
		</div>

		<div class="range-labels">
			{#if $json('campaign.register_budget.items') as any}
				{#each $json('campaign.register_budget.items') as any as item}
					<span class="label-text">{item.title}</span>
				{/each}
			{/if}
		</div>
	</div>
	<label for="upload-period">{t('campaign.register_upload_period')}</label>
	<div class="date-input-wrapper">
		<input
			type="text"
			class="date-display"
			value={displayDate}
			placeholder={t('campaign.register_upload_period_example')}
			readonly
			onclick={openDatePicker}
		/>
		<input
			type="date"
			bind:this={dateInputRef}
			class="date-picker-hidden"
			value={form.uploadPeriod}
			min={minDate}
			onchange={handleDateChange}
		/>
	</div>
	<label for="product-link">{t('campaign.register_product_link')}</label>
	<InputText
		bind:value={form.productLink}
		placeholder={t('campaign.register_product_link_example')}
		isError={false}
	/>
	<label for="charge-name" class="required-label">{t('campaign.register_charge_name')}</label>
	<InputText
		bind:value={form.chargeName}
		placeholder={t('campaign.register_charge_name_example')}
		isError={errors.chargeName}
		onInput={handleChargeNameInput}
	/>
	<label for="charge-phone" class="required-label">{t('campaign.register_charge_phone')}</label>
	<InputText
		bind:value={form.chargePhone}
		placeholder={t('campaign.register_charge_phone_example')}
		isError={errors.chargePhone}
		onInput={handleChargePhoneInput}
	/>
	<label for="charge-email" class="required-label">{t('campaign.register_charge_email')}</label>
	<InputText
		bind:value={form.chargeEmail}
		placeholder={t('campaign.register_charge_email_example')}
		isError={errors.chargeEmail || emailFormatError}
		errorMessage={emailFormatError ? t('campaign.error_email_format') : undefined}
		onInput={handleChargeEmailInput}
		onBlur={handleChargeEmailBlur}
	/>
	<label for="etc">{t('campaign.register_etc')}</label>
	<textarea
		class="etc-textarea"
		placeholder={t('campaign.register_etc_example')}
		bind:value={form.etc}
	></textarea>
	<PrivacyPolicyForm bind:isPrivacyPolicyAgreed isError={errors.isPrivacyPolicyAgreed} />
</form>

<style lang="scss">
	form {
		display: flex;
		flex-direction: column;

		width: 100%;

		label {
			@include text-headline-0-semibold;
			position: relative;
			width: fit-content;
			margin-top: 20px;
			margin-bottom: 5px;
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

		.budget-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 100%;
		}

		.budget-title {
			@include text-headline-0-semibold;
			color: $gray-900;
		}

		.range-wrapper {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 80%;
			height: 30px;
			padding-top: 5px;
			padding-bottom: 15px;
		}

		.slider-track {
			position: absolute;
			z-index: 1;
			top: 50%;
			transform: translateY(-50%);
			width: 100%;
			height: 6px;
			border-radius: 4px;
			background-color: #ececec;
		}

		.slider-range {
			position: absolute;
			z-index: 2;
			top: 50%;
			right: calc(100% - var(--max-pos));

			// Svelte $effect에서 업데이트하는 변수 사용
			left: var(--min-pos);
			transform: translateY(-50%);
			height: 6px;
			border-radius: 4px;
			background-color: $primary-500; // 브랜드 컬러
		}

		// 3. 실제 Input (투명하게 만들어서 위로 겹침)
		.dual-range-input {
			position: absolute;
			z-index: 3;
			top: 0; // wrapper 기준 상단 정렬
			left: 0;
			width: 100%;
			height: 100%; // wrapper 높이만큼 채움
			margin: 0;
			background: none; // 배경 투명
			pointer-events: none; // ★중요: 인풋 영역 클릭 무시 (뒤에 있는 인풋 클릭 가능하게)
			appearance: none;

			&:focus {
				outline: none;
			}

			// --- Webkit (Chrome, Safari) Thumb 스타일 ---
			&::-webkit-slider-thumb {
				width: 24px;
				height: 24px;
				margin-top: 3px; // 높이 중앙 정렬 미세조정 (wrapper 30px, thumb 24px)
				border-radius: 50%;
				box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
				background: $primary-500;
				pointer-events: auto; // ★중요: 원(Thumb) 부분만 클릭 가능하게 복구
				cursor: pointer;
				appearance: none;
			}

			// --- Firefox Thumb 스타일 ---
			&::-moz-range-thumb {
				width: 24px;
				height: 24px;
				border: none;
				border-radius: 50%;
				box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
				background: $primary-500;
				pointer-events: auto;
				cursor: pointer;
			}
		}

		.range-labels {
			display: flex;
			justify-content: space-between;
			width: 80%;
			margin-top: -5px;

			.label-text {
				@include text-body-0-medium;
				color: #666;

				&:first-child {
					transform: translateX(2px);
				}

				&:last-child {
					transform: translateX(-2px);
				}
			}
		}

		.date-input-wrapper {
			position: relative;
			width: 100%;

			.date-display {
				@include input-filed;
				box-sizing: border-box;
				width: 100%;
				margin-bottom: 5px;
				padding: 0 20px;
				cursor: pointer;
			}

			.date-picker-hidden {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				opacity: 0;
				pointer-events: none;
			}
		}

		.etc-textarea {
			@include textarea;

			&::-webkit-scrollbar {
				width: 15px;
			}

			/* Track */
			&::-webkit-scrollbar-track {
				background: $gray-0;
			}

			/* Handle */
			&::-webkit-scrollbar-thumb {
				border-radius: 90px;
				background: $gray-200;
				background-clip: padding-box;
			}

			/* Handle on hover */
			&::-webkit-scrollbar-thumb:hover {
				background: $gray-300;
			}
		}
	}
</style>
