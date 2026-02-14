<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';
	import SelectButton from '../SelectButton.svelte';
	import type { RegisterForm } from '../../types/register.js';
	import InputText from '../InputText.svelte';

	let { form = $bindable(), errors = $bindable() }: { form: RegisterForm; errors: any } = $props();
	// 초기 선택 상태를 관리하는 state
	let countryItems = $derived(
		(t('campaign.register_target_country.items') as { title: string }[]) ?? []
	);
	let selectedCountries = $state<boolean[]>([]);

	// 초기화: 컴포넌트 마운트시 선택 상태 초기화
	$effect(() => {
		if (Array.isArray(countryItems) && countryItems.length > 0) {
			// form.targetCountry에 해당 타이틀이 포함되어 있는지 확인하여 true/false 설정
			selectedCountries = countryItems.map(
				(item: any) => form.targetCountry?.includes(item.title) ?? false
			);
		}
	});

	const toggleSelection = (index: number) => {
		if (!countryItems[index]) return;

		selectedCountries[index] = !selectedCountries[index];

		form.targetCountry = selectedCountries
			.map((isSelected, i) => (isSelected ? countryItems[i].title : ''))
			.filter(Boolean);
	};

	const handleBrandNameInput = () => {
		errors.brandName = false;
	};

	const handleCountrySelection = () => {
		if (form.targetCountry && form.targetCountry.length > 0) {
			errors.targetCountry = false;
		}
	};
</script>

<form class="first-form">
	<label for="brand-name" class="required-label">{t('campaign.register_brand_name')}</label>
	<InputText
		bind:value={form.brandName}
		placeholder={t('campaign.register_brand_name_example')}
		isError={errors.brandName}
		onInput={handleBrandNameInput}
	/>
	<label for="product-name"> {t('campaign.register_product_name')}</label>
	<InputText
		bind:value={form.productName}
		placeholder={t('campaign.register_product_name_example')}
		isError={false}
	/>
	<label for="campaign-purpose"> {t('campaign.register_campaign_purpose')}</label>
	<textarea
		class="textarea"
		placeholder={t('campaign.register_campaign_purpose_example')}
		bind:value={form.campaignPurpose}
	></textarea>
	<label for="target-country" class="required-label"
		>{t('campaign.register_target_country.title')}</label
	>
	<ul id="target-country">
		{#each t('campaign.register_target_country.items') as any as item, index}
			<li
				onclick={() => {
					toggleSelection(index);
					handleCountrySelection();
				}}
			>
				<SelectButton checked={selectedCountries[index]} />
				<span>{item.title}</span>
			</li>
		{/each}
	</ul>
	{#if errors.targetCountry}
		<p class="error-message"><span class="error-icon">!</span>{t('campaign.error_required')}</p>
	{/if}
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

			.target-country-required-dot {
				left: 142px;
			}
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

		.error-message {
			@include error-message;

			.error-icon {
				@include error-icon;
			}
		}
	}
</style>
