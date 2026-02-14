<script lang="ts">
	import { campaignsAPI } from '$lib/api/campaigns.ts';
	import { isLoading } from '../../../../../stores/loading.js';
	import { t } from '$lib/i18n-helper.ts';
	import CollabHeader from '../../../../../components/collab/CollabHeader.svelte';
	import Modal from '../../../../../components/Modal.svelte';
	import type { GetCampaignData } from '../../../../../types/campaign.ts';

	import type { AdvertiserMatchData, InfluencersMatchData } from '../../../../../types/matches.ts';
	import { goto } from '$app/navigation';
	
	let { data } = $props();

	let influencersMatchesData = $derived(data.influencersMatchesData as InfluencersMatchData[]);
	let advertiserMatchesData = $derived(data.advertiserMatchesData as AdvertiserMatchData[]);
	let campaignData = $derived(data.campaignData as GetCampaignData);
	let campaignId = $derived(data.params.campaignId);

	$effect(() => {
		console.log("influencersMatchesData", influencersMatchesData);
		console.log("advertiserMatchesData", advertiserMatchesData);
		console.log("campaignData", campaignData);
	});

	let showModal = $state(true); // 모달 표시 상태

	const getInfluencerStatusLabel = (status: string) => {
		
		return t(`collab.status_influencer_${status}`);
	};

	const getAdvertiserTodoLabel = (todo: string) =>{
		console.log("status", todo);
		return t(`collab.action_advertiser_${todo}`);
	}

	const closeModal = () => {
		showModal = false;
	};

	const handleWriteGuideline = async (campaignId: string) => {
		isLoading.set(true);
		await goto(`/collab/advertiser/${campaignId}/guidelineform`);
		isLoading.set(false);
	};

	const handleActionClick = async (actionKey: string, matchId: string, draftContentId:string) => {
		console.log(` Action: ${actionKey}, Match ID: ${matchId}`);

		if (actionKey === 'ship_product') {
			await goto(`/collab/advertiser/${campaignId}/shipments?matchId=${matchId}`)
		} 
		else if(actionKey === "review_draft"){
			await goto(`/collab/advertiser/${campaignId}/feedback?matchId=${matchId}&contentId=${draftContentId}`);
		}
	};
</script>

<CollabHeader title={t('collab.collab_advertiser_title')} campaign={campaignData} />
<div class="collab-advertiser-dashboard-container">
	{#if campaignData.has_guideline === false}
		<h1 class="collab-advertiser-dashboard-title">
			{t('collab.collab_advertiser_guideline-title')}
		</h1>
		<button class="collab-advertiser-write-button" onclick={() => handleWriteGuideline(campaignId)}
			>{t('collab.collab_advertiser_guideline-write')}</button
		>
	{:else}
		<button class="collab-advertiser-view-button" onclick={() => handleWriteGuideline(campaignId)}
			>{t('collab.collab_advertiser_guideline-view')}</button
		>
	{/if}

	<section class="collab-advertiser-container">
		<div
			class="common-list-container collab-advertiser-table-container"
			style="

--table-width: 650px"
		>
			<table>
				<thead>
					<tr>
						<th>{t('collab.collab_first_page_influencer_name')}</th>
						<th>{t('collab.collab_first_page_influencer_progress')}</th>
						{#if campaignData.has_guideline}
							<th>{t('collab.collab_first_page_advertiser_brand_required')}</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each influencersMatchesData as influencerMatch}
						<tr>
							<td>{influencerMatch.influencer_name}</td>
							<td>{getInfluencerStatusLabel(influencerMatch.influencer_progress)}</td>
							{#if campaignData.has_guideline}
								<td> <button class="action-btn" class:active={influencerMatch.advertiser_todo_enabled} disabled={!influencerMatch.advertiser_todo_enabled} onclick={() => handleActionClick(influencerMatch.advertiser_todo, influencerMatch.match_id, influencerMatch.draft_content_id)}>{getAdvertiserTodoLabel(influencerMatch.advertiser_todo)}</button></td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>

{#if showModal && campaignData.has_guideline === false}
	<Modal 
		modalTitle={t('collab.collab_modal_title')}
		width="220px"
		maxWidth="650px"
		mobileMaxHeight="210px"
		tabletMaxHeight="422px"
		onClose={closeModal}
	>
		<div class="collab-modal-content">
			<div class="collab-modal-subtitle">{t('collab.collab_modal_subtitle')}</div>
			<main class="collab-modal-description-container">
				<p>{t('collab.collab_modal_description')}</p>
				<p>{t('collab.collab_modal_description_2')}</p>
			</main>
			<footer class="collab-modal-footer">
				<button>{t('collab.collab_modal_close_button')}</button>
				<a href={`/collab/advertiser/${campaignId}/guidelineform`}
					><button class="collab-modal-write-button">{t('collab.collab_modal_write_button')}</button
					></a
				>
			</footer>
		</div>
	</Modal>
{/if}

<style lang="scss">
	.collab-advertiser-dashboard-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 20px;
	}

	.collab-advertiser-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 20px;
		margin-top: 30px;
		margin-bottom: 50px;
		
	}

	.collab-advertiser-dashboard-title {
		display: none;
	}

	.collab-advertiser-write-button {
		@include main-button('primary', 'extra-large');
	}

	.collab-advertiser-view-button {
		@include main-button('gray', 'extra-large');
		color: $primary-400;
	}

	.collab-modal-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.collab-modal-subtitle {
			@include text-headline-1-semibold;
			margin-top: 10px;
			color: $gray-800;
			text-align: center;
		}

		.collab-modal-description-container {
			@include text-headline-0-regular;
			display: none;
			color: $gray-800;
			text-align: center;
		}

		.collab-modal-footer {
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			gap: 10px;
			width: 100%;
			margin-top: 25px;

			button {
				&:first-child {
					@include main-button('gray');
					width: 130px;
				}

				&:last-child {
					@include main-button('primary');
					width: 130px;
				}
			}
		}
	}

	.action-btn {
		@include main-button('gray');

		&.active{
			@include main-button('primary');
			background-color: $gray-800;
			color: $gray-0;
		}

		&.active:hover{
			background-color: $gray-900;
		}

		&:disabled{
			cursor: not-allowed;
			
		}

		&:disabled:hover{
			background-color: $gray-400;
		}
		
	}


	@include tablet-up {
		.collab-advertiser-dashboard-title {
			display: inline-block;
			margin-top: 30px;
			color: $gray-600;
			line-height: 0;

			@include text-heading-1-semibold;
		}

		.collab-modal-content {
			.collab-modal-subtitle {
				@include text-heading-1-semibold;
			}

			.collab-modal-description-container {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				gap: 10px;
				width: 420px;
				margin-top: 25px;
			}

			.collab-modal-footer {
				button {
					width: 120px;

					&:last-child {
						width: 170px;
					}
				}
			}
		}
	}
</style>
