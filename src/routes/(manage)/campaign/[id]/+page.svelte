<script lang="ts">
	import Icons from '../../../../components/Icons.svelte';
	import Pending from '../../../../components/campaign/Pending.svelte';
	import Waiting from '../../../../components/campaign/Waiting.svelte';
	import Matching from '../../../../components/campaign/Matching.svelte';
	import CancelMatching from '../../../../components/campaign/CancelMatching.svelte';
	import type { GetCampaignData } from '../../../../types/campaign.ts';
	import type { RecommendedInfluencersResponse } from '../../../../types/matched.ts';

	interface PageData {
		campaign: GetCampaignData;
		recommendedInfluencers: RecommendedInfluencersResponse | null;
	}

	let { data }: { data: PageData } = $props();

	let cancelMatching = $state(false);

	console.log(data);

	let campaign = $derived(data.campaign);
	let influencers = $derived(data.recommendedInfluencers?.items);
	let campaignId = $derived(data.campaign.id);

	let hasRecommendations = $derived(influencers && influencers.length > 0);
</script>

<main>
	{#if campaign.status === 'pending'}
		<Pending />
	{/if}

	{#if campaign.status === 'approved'}
		{#if hasRecommendations && !cancelMatching}
			<Matching bind:isCancelMatching={cancelMatching} {influencers} {campaign} />
		{:else}
			<Waiting decliened={false} {campaign} />
		{/if}
	{/if}

	{#if campaign.status === 'rejected'}
		<Waiting decliened={true} {campaign} />
	{/if}

	<!-- {#if campaign.status === 'declined'}
		<Waiting decliened={true} {campaign} />
	{/if} -->
	<!-- {#if data.status === 'canceled'}
		<CancelMatching />
	{/if} -->
</main>

<style lang="scss">
	.button-container {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		width: 100%;
		margin-top: 30px;

		.pending-button {
			@include main-button('primary');
		}

		.searching-button {
			@include main-button('primary');
		}

		.declined-button {
			@include main-button('primary');
		}

		.matching-button {
			@include main-button('primary');
		}
	}
</style>
