<script lang="ts">
	import { goto } from '$app/navigation';
	import { collaborationAPI } from '$lib/api/collaboration.ts';
	import { t } from '$lib/i18n-helper.ts';
	import InputText from '../InputText.svelte';
	import SelectButton from '../SelectButton.svelte';

	

	let { shipmentInfo = $bindable(), validationErrors = $bindable(), campaignId, matchId } = $props();

	

	let orderMethodItems = $derived(
		(t('collab.shipmentinfoform_order_method.items') as { title: string }[]) ?? []
	);
	let selectedOrderMethods = $state<boolean[]>([]);

	const toggleOrderMethodSelection = (index: number) => {
		if (!orderMethodItems[index]) return;

		selectedOrderMethods[index] = !selectedOrderMethods[index];
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		console.log('handleSubmit called');
		console.log('campaignId:', campaignId);
		console.log('matchId:', matchId);
		console.log('shipmentInfo:', shipmentInfo);
		
		if (!campaignId || !matchId) {
			alert('campaignId 또는 matchId가 없습니다');
			return;
		}
		
		try{
			await collaborationAPI.writeShipmentInfoForm(matchId, shipmentInfo);
			await goto(`/collab/advertiser/${campaignId}/complete?type=shipmentinfoform`);
		} catch (error) {
			console.error(error);
			alert('Failed to submit shipment info form');
		}

	
	};
</script>

<form onsubmit={handleSubmit}>
	<label for="order-recipient-name" class="required-label"
		>{t('collab.shipment_infoform_order_recipient_name')}</label
	>
	<InputText
		bind:value={shipmentInfo.recipient_name}
		isError={validationErrors.recipient_name}
	/>
	<label for="order-number" class="required-label"
		>{t('collab.shipment_infoform_order_number')}</label
	>
	<InputText bind:value={shipmentInfo.tracking_number} isError={validationErrors.tracking_number} />
	<label for="order-company" class="required-label"
		>{t('collab.shipment_infoform_order_company')}</label
	>
	<InputText bind:value={shipmentInfo.shipping_company} isError={validationErrors.shipping_company} />


	<p class="shipment-infoform-order-warning"> <span class="shipment-infoform-order-warning-icon">!</span> {t('collab.shipment_infoform_order_warning')}</p>
	<p class="shipment-infoform-order-warning-description">{t('collab.shipment_infoform_order_warning_description')}</p>
	<button>{t('collab.shipment_infoform_order_button')}</button>
</form>

<style lang="scss">
	form {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		width: 100%;
		max-width: 500px;
		padding: 20px;

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

		.error-message {
			@include error-message;

			.error-icon {
				@include error-icon;
			}
		}

		.shipment-infoform-order-warning {
			@include error-message;
			margin-top: 20px;
			align-self: center;
			

			.shipment-infoform-order-warning-icon {
				@include error-icon;
				
			}

		}
		.shipment-infoform-order-warning-description {
			@include text-body-0-semibold;
			color: $gray-600;
			margin-top: 10px;
		}

		button {
			@include main-button('primary', 'extra-large');
			width: 100%;
			margin-top: 20px;
			place-self: center center;
		}
	}
</style>
