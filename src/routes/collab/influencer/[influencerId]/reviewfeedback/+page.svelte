<script lang="ts">
    import { t } from '$lib/i18n-helper.ts';
	import CheckBrandFeedback from '../../../../../components/collab/CheckBrandFeedback.svelte';
	import FinalDraftFileUpload from '../../../../../components/collab/FinalDraftFileUpload.svelte';
    
    let { data } = $props();

  
    console.log(data)

    let matchId = $derived(data.matchId);
    let feedback = $derived(data.feedback);
    let influencerId = $derived(data.influencerId); 
    let draftContent = $derived(data.draftContent);


    
    // 상태 관리: CheckBrandFeedback 또는 FinalDraftFileUpload 표시
    let showFinalUpload = $state(false);
    
    const handleShowFinalUpload = () => {
        showFinalUpload = true;
    };
    
    const handleBackToCheckFeedback = () => {
        showFinalUpload = false;
    };
</script>

{#if !showFinalUpload}
    <CheckBrandFeedback {feedback} onFinalUpload={handleShowFinalUpload} {draftContent} />
{:else}
    <FinalDraftFileUpload {matchId} {influencerId} onBackToCheck={handleBackToCheckFeedback} />
{/if}
