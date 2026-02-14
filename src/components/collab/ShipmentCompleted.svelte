<script>
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n-helper.ts';
	import Icons from '../Icons.svelte';


	let { campaignId } = $props();

	const handleClick = async () => {
		await goto(`/collab/advertiser/${campaignId}/dashboard`, { invalidateAll: true });
	}

</script>

<main class="manage-container shipment-completed-container">
	<div class="check-mark-container">
		<div class="check-mark-wrapper">
			<Icons name="check_mark" color="#F7F5FF" />
		</div>
	</div>
	<h1 class="shipment-completed-title">{t('collab.shipmentform_advertiser_completed_envoice_title')}</h1>
	<p class="shipment-completed-description">
		{t('collab.shipmentform_advertiser_completed_envoice_description')}
	</p>
	<div class="shipment-completed-button-container">
		
			<button onclick={handleClick} class="shipment-completed-button primary">{t('collab.shipmentform_advertiser_completed_button')}</button>
	
	</div>
</main>

<style lang="scss">

	.manage-container {
		@include flex-column-center;
		gap: 20px;
		padding-top: 50px;
	}
	
	.shipment-completed-container {
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

		.shipment-completed-title {
			@include text-title-1-bold;
			color: $gray-900;
			text-align: center;
		}

		.shipment-completed-description {
			@include text-body-0-semibold;
			color: $gray-700;
			text-align: center;
		}

		.shipment-completed-button-container {
			display: flex;
			flex-direction: column;
			gap: 10px;

			
				.shipment-completed-button {
					&.primary {
						@include main-button('primary', 'extra-large');
					}

				
				}
			
		}
	}
	

	@include tablet-up {
		.manage-container {
			padding-top: 100px;
		}

		.shipment-completed-container {
			.check-mark-container {
				width: 100px;
				height: 100px;

				.check-mark-wrapper {
					width: 50px;
					height: 50px;
				}
			}

			.shipment-completed-title {
				@include text-display-1-extrabold;
				color: $gray-900;
			}

			.shipment-completed-description {
				@include text-headline-0-semibold;
				color: $gray-700;
				text-align: center;
			}
		}
	}
</style>
