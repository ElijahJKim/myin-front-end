<script>
	import { t } from '$lib/i18n-helper.ts';
</script>

<main class="manage-container shipment-cancel-container">
	<h1 class="shipment-cancel-title">{t('collab.shipmentform_advertiser_cancel_title')}</h1>
	<p class="shipment-cancel-description">
		{t('collab.shipmentform_advertiser_cancel_description')}
	</p>
	<div class="shipment-cancel-button-container">
		<a href="/"
			><button class="shipment-cancel-button primary"
				>{t('collab.shipmentform_advertiser_cancel_home_button')}</button
			></a
		>
	</div>
</main>

<style lang="scss">
	.manage-container {
		@include flex-column-center;
		gap: 20px;
		padding-top: 50px;
	}

	.shipment-cancel-container {
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

		.shipment-cancel-title {
			@include text-title-1-bold;
			color: $gray-900;
			text-align: center;
		}

		.shipment-cancel-description {
			@include text-body-0-semibold;
			color: $gray-700;
			text-align: center;
		}

		.shipment-cancel-button-container {
			display: flex;
			flex-direction: column;
			gap: 10px;
			margin-top: 50px;

			a {
				.shipment-cancel-button {
					&.primary {
						@include main-button('primary', 'extra-large');
					}
				}
			}
		}
	}

	@include tablet-up {
		.manage-container {
			padding-top: 100px;
		}

		.shipment-cancel-container {
			.check-mark-container {
				width: 100px;
				height: 100px;

				.check-mark-wrapper {
					width: 50px;
					height: 50px;
				}
			}

			.shipment-cancel-title {
				@include text-display-1-extrabold;
				color: $gray-900;
			}

			.shipment-cancel-description {
				@include text-headline-0-semibold;
				color: $gray-700;
				text-align: center;
			}
		}
	}
</style>
