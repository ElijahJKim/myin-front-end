<script lang="ts">
	import { goto } from '$app/navigation';
	import Icons from '../Icons.svelte';
	import { t } from '$lib/i18n-helper.ts';

	let { campaignId } = $props();

	const moveToDashboard = async () => {
		await goto(`/collab/advertiser/${campaignId}/dashboard`, { invalidateAll: true });
	};

	const moveToGuidelineForm = async () => {
		await goto(`/collab/advertiser/${campaignId}/guidelineform`, { invalidateAll: true });
	};
</script>

<main class="manage-container completed-container">
	<div class="check-mark-container">
		<div class="check-mark-wrapper">
			<Icons name="check_mark" color="#F7F5FF" />
		</div>
	</div>
	<h1 class="completed-title">{t('collab.guidelineform_advertiser_completed_title')}</h1>
	<p class="completed-description">
		{@html t('collab.guidelineform_advertiser_completed_description')}
	</p>
	<div class="completed-button-container">
		<button class="completed-button primary" onclick={moveToDashboard}>
			{t('collab.guidelineform_advertiser_completed_button')}
		</button>
		<button class="completed-button light" onclick={moveToGuidelineForm}>
			{t('collab.guidelineform_influencer_to_guidelineform')}
		</button>
	</div>
</main>

<style lang="scss">
	.manage-container {
		@include flex-column-center;
		gap: 20px;
		padding-top: 50px;
	}

	.completed-container {
		.check-mark-container {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 48px;
			height: 48px;
			border-radius: 50%;
			background-color: $primary-200;

			.check-mark-wrapper {
				width: 24px;
				height: 24px;

				:global(svg) {
					width: 100%;
					height: 100%;
				}
			}
		}

		.completed-title {
			@include text-title-1-bold;
			color: $gray-900;
			text-align: center;
		}

		.completed-description {
			@include text-body-0-semibold;
			color: $gray-700;
			text-align: center;
		}

		.completed-button-container {
			display: flex;
			flex-direction: column;
			gap: 10px;

			.completed-button {
				&.primary {
					@include main-button('primary');
				}

				&.light {
					@include main-button('light');
				}
			}
		}
	}

	@include tablet-up {
		.manage-container {
			padding-top: 100px;
		}

		.completed-container {
			.check-mark-container {
				width: 100px;
				height: 100px;

				.check-mark-wrapper {
					width: 50px;
					height: 50px;
				}
			}

			.completed-title {
				@include text-display-1-extrabold;
				color: $gray-900;
			}

			.completed-description {
				@include text-headline-0-semibold;
				color: $gray-700;
				text-align: center;
			}
		}
	}
</style>
