<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n-helper.ts';
	import InputText from '../../../../../components/InputText.svelte';


    let {data, form} = $props();

    console.log(data);

    let shipmentInfo = $derived(data.shipmentInfo);

    let influencerId = $derived(data.params.influencerId);
    let matchId = $derived(shipmentInfo.match_id);
    let recipientName = $state(shipmentInfo.recipient_name);
    let trackingNumber = $state(shipmentInfo.tracking_number);
    let shippingCompany = $state(shipmentInfo.shipping_company);

    let isSubmitting = $state(false);

    const handleCancelShipment = () => {
        goto(`/collab/influencer/${influencerId}/dashboard`);
    };
</script>




<main class="manage-container confirmshipment-container">
    <form 
    class="confirmshipment-content" 
    method="POST" 
    action="?/confirm" 
    use:enhance={() => {
        isSubmitting = true; // 제출 시작 시 로딩 상태 ON
        
        return async ({ result }) => {
            isSubmitting = false; // 응답 후 로딩 상태 OFF
            
            if (result.type === 'success') {
                // 성공 시 대시보드로 이동
                await goto(`/collab/influencer/${influencerId}/dashboard`, { invalidateAll: true });
            } else if (result.type === 'failure') {
                // 실패 시 에러 알림
                alert(result.data?.message || 'Error occurred');
            }
        };
    }}
>
    <h1 class="confirmshipment-title">{t('collab.shipment_confirmform_title')}</h1>
    <p class="confirmshipment-description">{t('collab.shipment_confirmform_description')}</p>
    <p class="confirmshipment-warning">{t('collab.shipment_confirmform_warning')}</p>
    <input type="hidden" name="matchId" value={matchId as string} />
    <label for="order-recipient-name" class="required-label"
    >{t('collab.shipment_infoform_order_recipient_name')}</label>
    <InputText
        bind:value={recipientName}
        isError={false}
        disabled={true}
    />
    <label for="order-number" class="required-label"
        >{t('collab.shipment_infoform_order_number')}</label>
    <InputText bind:value={trackingNumber} isError={false} disabled={true} />
    <label for="order-company" class="required-label"
        >{t('collab.shipment_infoform_order_company')}</label>
    <InputText bind:value={shippingCompany} isError={false} disabled={true} />
    <button type="submit" class="confirmshipment-button">{t('collab.shipment_confirmform_button')}</button>
    <button class="confirmshipment-cancel-button" onclick={handleCancelShipment}>{t('collab.shipment_confirmform_cancel_button')}</button>
   </form>
</main>


<style lang="scss">

    .manage-container {
        @include flex-column-center;
        gap: 20px;
        padding: 50px 20px;
    }
    .confirmshipment-container {
        display: flex;
        flex-direction: column;
        
       
    }
    .confirmshipment-content {
        display: flex;
        flex-direction: column;


        .confirmshipment-title {
            @include text-title-1-bold;
            color: $gray-900;
            text-align: center;
        }
        .confirmshipment-description {
            @include text-headline-0-semibold;
            color: $gray-700;
            text-align: center;
        }
        .confirmshipment-warning {
            @include text-headline-0-semibold;
            color:#ff080c;
            text-align: center;
            margin-bottom: 30px;

        }
        .required-label {
            @include text-headline-0-semibold;
          
        }

        .confirmshipment-button{
            @include main-button('primary', 'extra-large');
            width: 100%;
            margin-top: 20px;
            
        }
        .confirmshipment-cancel-button{
            @include main-button('light', 'extra-large');
            width: 100%;
            margin-top: 10px;
        }
    }


    @include tablet-up {
       .confirmshipment-title{
        @include text-display-1-extrabold;
       }

       .confirmshipment-description{
        @include text-title-2-semibold;
       }

       .confirmshipment-warning{
        @include text-title-2-semibold;
       }

       
    }
</style>