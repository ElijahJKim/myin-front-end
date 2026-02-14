<script lang="ts">
	import { json } from 'svelte-i18n';
	import { t } from '$lib/i18n-helper.ts';
	import Icons from '../Icons.svelte';
	import SelectButton from '../SelectButton.svelte';

	let {
		isPrivacyPolicyAgreed = $bindable(),
		isError = $bindable()
	}: { isPrivacyPolicyAgreed: boolean; isError: boolean } = $props();

	const handleSelectClick = () => {
		// event.preventDefault(); // 기본 동작 방지
		// event.stopPropagation(); // 이벤트 전파 방지
		isPrivacyPolicyAgreed = !isPrivacyPolicyAgreed;
	};
</script>

<div class="privacy-policy-form">
	<h1 class="privacy-main-title required-label">{t('campaign.privacy_title')}</h1>

	<main class="privacy-content-container">
		<div class="privacy-content-wrapper">
			<p class="privacy-description">{t('campaign.privacy_description')}</p>
			<div>
				<h2 class="privacy-title">{t('campaign.privacy_section1_title')}</h2>
				<ul class="privacy-list">
					{#each $json('campaign.privacy_section1_items') as any as item}
						<li>{item}</li>
					{/each}
				</ul>
				<h2 class="privacy-title">{t('campaign.privacy_section2_title')}</h2>
				<ul class="privacy-list">
					{#each $json('campaign.privacy_section2_items') as any as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
			<div>
				<h2 class="privacy-title">{t('campaign.privacy_section3_title')}</h2>
				<ul class="privacy-list">
					{#each $json('campaign.privacy_section3_items') as any as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
			<div>
				<h2 class="privacy-title">{t('campaign.privacy_section4_title')}</h2>
				<ul class="privacy-list">
					{#each $json('campaign.privacy_section4_items') as any as item}
						<li>{@html item}</li>
					{/each}
				</ul>
			</div>
			<div>
				<p class="privacy-description">{@html t('campaign.privacy_section5_description')}</p>
				<p class="privacy-description">{t('campaign.privacy_contact')}</p>
			</div>
		</div>
	</main>
	<div class="select-btn-container" onclick={handleSelectClick}>
		<SelectButton checked={isPrivacyPolicyAgreed} />
		<h2>{t('campaign.privacy_agree_button')}</h2>
		{#if isError && !isPrivacyPolicyAgreed}
			<p class="error-message"><span class="error-icon">!</span>{t('campaign.error_required')}</p>
		{/if}
	</div>
</div>

<style lang="scss">
	.privacy-policy-form {
		display: flex;
		flex-direction: column;
		gap: 15px;
		overflow-y: auto;

		margin-top: 20px;

		.privacy-main-title {
			@include text-heading-0-semibold;
		}

		.required-label {
			position: relative;
			width: fit-content;

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

		p {
			@include text-body-0-regular;
			color: $gray-900;
		}

		.privacy-content-container {
			overflow-y: scroll;
			height: 150px;
			border-radius: 8px;
			background-color: $gray-0;

			.privacy-content-wrapper {
				padding: 10px;
				background-color: $gray-100;
			}

			&::-webkit-scrollbar {
				width: 15px;
			}

			/* Track */
			&::-webkit-scrollbar-track {
				background: $gray-0;
			}

			/* Handle */
			&::-webkit-scrollbar-thumb {
				height: 45px;
				border-radius: 90px;
				background: $gray-200;
				background-clip: padding-box;
			}

			/* Handle on hover */
			&::-webkit-scrollbar-thumb:hover {
				background: $gray-300;
			}

			.privacy-title {
				@include text-body-0-semibold;
				color: $gray-900;
			}

			.privacy-list {
				list-style: none;

				li {
					@include text-body-0-regular;

					color: $gray-900;

					&::before {
						content: '-';
						margin-right: 5px;
					}
				}
			}
		}

		.select-btn-container {
			display: flex;
			align-items: center;
			gap: 10px;

			cursor: pointer;

			.error-message {
				@include error-message;

				.error-icon {
					@include error-icon;
				}
			}
		}
	}

	@include tablet-up {
		.privacy-policy-form {
			.privacy-content-container {
				.privacy-content-wrapper {
					width: 500px;
				}
			}
		}
	}
</style>
