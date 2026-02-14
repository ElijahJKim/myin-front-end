<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';

	let { decliened, campaign } = $props();
</script>

<main class="manage-container waiting-container">
	<h2 class="waiting-title">
		{t('status.waiting_title')} [{campaign.brand_name}] [{campaign.manager_name}] {t(
			'status.matching_title_sir'
		)}
	</h2>
	{#if decliened}
		<h1 class="waiting-title-declined">{t('status.waiting_title_declined')}</h1>
	{/if}
	<h1 class="waiting-sub-title">
		{decliened ? t('status.waiting_title_declined_subtitle') : t('status.waiting_sub_title')}
	</h1>
	<p class="waiting-description">{@html t('status.waiting_description')}</p>
	<p class="waiting-alert">
		<span class="waiting-alert-icon">!</span>{t('status.waiting_alert')}
	</p>
	<a href="/campaign/register">
		<button class="waiting-button">{t('status.waiting_button')}</button>
	</a>
</main>

<style lang="scss">
	.manage-container {
		@include flex-column-center;
		gap: 20px;
		padding-top: 50px;
	}

	.waiting-container {
		.waiting-title {
			@include text-body-0-semibold;
			color: $gray-900;
		}

		.waiting-title-declined {
			@include text-body-0-semibold;
			color: $primary-400;
			text-align: center;
		}

		.waiting-sub-title {
			@include text-heading-0-bold;
			color: $gray-900;
		}

		.waiting-description {
			@include text-caption-0-regular;
			color: $gray-600;
			text-align: center;
		}

		.waiting-alert {
			@include text-body-0-semibold;
			display: flex;
			align-items: center;
			gap: 5px;
			color: #ff080c;
			text-align: center;

			.waiting-alert-icon {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 20px;
				height: 20px;
				border-radius: 50%;
				background-color: #ffb8b9;
				color: $gray-0;
			}
		}

		.waiting-button {
			@include main-button('primary');
		}
	}

	@include tablet-up {
		.manage-container {
			padding-top: 100px;
		}

		.waiting-container {
			.waiting-title {
				@include text-headline-0-semibold;
			}

			.waiting-title-declined {
				@include text-heading-0-semibold;
			}

			.waiting-sub-title {
				@include text-display-1-bold;
			}

			.waiting-description {
				@include text-title-2-semibold;
			}

			.waiting-alert {
				@include text-body-0-semibold;

				.waiting-alert-icon {
					width: 30px;
					height: 30px;
				}
			}
		}
	}
</style>
