<script>
	import FormCompleted from '../../../../../components/collab/FormCompleted.svelte';
	import PictureFileUpload from '../../../../../components/collab/PictureFileUpload.svelte';
	import ShipmentCancel from '../../../../../components/collab/ShipmentCancel.svelte';
	import ShipmentCompleted from '../../../../../components/collab/ShipmentCompleted.svelte';

	let { data } = $props();

	let campaignId = $derived(data.params.campaignId);
	let matchId = $derived(data.matchId);
	
	console.log('shipments page - campaignId:', campaignId);
	console.log('shipments page - matchId:', matchId);
	
</script>

<!-- <FormCompleted {campaignId} /> -->

<!-- <ShipmentCancel /> -->

<PictureFileUpload {campaignId} {matchId}/>
