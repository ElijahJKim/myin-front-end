<script>

	import DraftFileuploadCheck from '../../../../../components/collab/DraftFileuploadCheck.svelte';
	import FinalFileUploadCheck from '../../../../../components/collab/FinalFileUploadCheck.svelte';
	import GuideLineFormCheck from '../../../../../components/collab/GuideLineFormCheck.svelte';

	let { data } = $props();

	

	let influencerId = $derived(data.params.influencerId);
	 let type = $derived(data.type);

</script>

{#if type === 'guidelineform'}
<GuideLineFormCheck {influencerId} />
{:else if type === 'draftfileupload'}
<DraftFileuploadCheck {influencerId} />
{:else if type === 'finaldraftfileupload'}
<FinalFileUploadCheck {influencerId} />
{/if}
