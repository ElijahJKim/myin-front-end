<script>
	import FeedbackCompleted from "../../../../../components/collab/FeedbackCompleted.svelte";
	import FormCompleted from "../../../../../components/collab/FormCompleted.svelte";
	import ShipmentCompleted from "../../../../../components/collab/ShipmentCompleted.svelte";

	let { data } = $props();


	let campaignId = $derived(data.params.campaignId);
    let type = $derived(data.type);



</script>


{#if type === 'guidelineform'}
<FormCompleted {campaignId} />
{:else if type === 'shipmentinfoform'}
<ShipmentCompleted {campaignId} />
{:else if type === 'feedback'}
<FeedbackCompleted {campaignId} />
{/if}