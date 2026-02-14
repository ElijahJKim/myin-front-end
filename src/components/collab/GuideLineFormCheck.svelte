<script>
	import { page } from '$app/stores';
	import Icons from '../Icons.svelte';
	import { t } from '$lib/i18n-helper.ts';
	import { goto } from '$app/navigation';

	let { influencerId } = $props();
	let type = $derived($page.url.searchParams.get('type'));

	console.log(influencerId)

	const handleGoDashboard = async () => {
		await goto(`/collab/influencer/${influencerId}/dashboard`, { invalidateAll: true });
	};
</script>

<main class="manage-container pending-container">
	<div class="check-mark-container">
		<div class="check-mark-wrapper">
			<Icons name="check_mark" color="#F7F5FF" />
		</div>
	</div>
	<h1 class="pending-title">{t('collab.guidelineform_influencer_check_title')}</h1>
	{#if type === 'objection'}
		<p class="pending-description">
			{t('collab.guidelineform_influencer_check_objection')}
		</p>
	{:else}
		<p class="pending-description">
			{t('collab.guidelineform_influencer_check_description')}
		</p>
	{/if}
	<button class="pending-button" onclick={handleGoDashboard}>
		{t('collab.guidelineform_influencer_check_button')}
	</button>
</main>

<style lang="scss">
	.manage-container {
		@include flex-column-center;
		gap: 20px;
		padding-top: 50px;
	}

	.pending-container {
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

		.pending-title {
			@include text-title-1-bold;
			color: $gray-900;
			text-align: center;
		}

		.pending-description {
			@include text-body-0-semibold;
			padding: 0 20px;
			color: $gray-700;
			text-align: center;
		}

		.pending-button {
			@include main-button('primary');
		}
	}

	@include tablet-up {
		.manage-container {
			padding-top: 100px;
		}

		.pending-container {
			.check-mark-container {
				width: 100px;
				height: 100px;

				.check-mark-wrapper {
					width: 50px;
					height: 50px;
				}
			}

			.pending-title {
				@include text-display-1-extrabold;
				color: $gray-900;
			}

			.pending-description {
				@include text-headline-0-semibold;
				max-width: 700px;
				color: $gray-700;
				text-align: center;
			}
		}
	}
</style>
