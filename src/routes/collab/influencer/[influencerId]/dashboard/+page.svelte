<script lang="ts">
	import { goto } from '$app/navigation';
	import { isLoading } from '../../../../../stores/loading.js';
	import { t } from '$lib/i18n-helper.ts';
	import CollabHeader from '../../../../../components/collab/CollabHeader.svelte';
	import Modal from '../../../../../components/Modal.svelte';
	import type { GetCampaignData } from '../../../../../types/campaign.ts';
	import type {
		AdvertiserMatchData,
		GuideLineFormData,
		InfluencersMatchData
	} from '../../../../../types/matches.ts';

	let { data } = $props();

	

	// let influencersMatchesData = $derived(data.influencersMatchesData as InfluencersMatchData[]);
	let advertiserMatchesData = $derived(data.advertiserMatchesData as AdvertiserMatchData[]);
	let influencerId = $derived(data.params.influencerId);
	let influencer = $derived(data.influencer);
	let campaignData = $state(false);
	let isShipmentReady = $derived(
    advertiserMatchesData.some(match => match.influencer_todo === 'upload_draft')
	
);

	$effect(() => {
		console.log("advertiserMatchesData", advertiserMatchesData);
		console.log("influencerId", influencerId);
		console.log("influencer", influencer);
	});

	const getInfluencerStatusLabel = (status: string) => {
		return t(`collab.status_advertiser_${status}`);
	};

	const getActionConfig = (status: string, todoEnabled: boolean) => {
		const configMap: Record<string, { key: string; }> = {
			// influencer_todo 기준 매핑
			'review_guideline': { key: 'review_guideline' },
			'check_invoice': { key: 'check_invoice' },
			'upload_draft': { key: 'upload_draft' },
			'draft_uploaded': { key: 'draft_uploaded' },
			'review_feedback': { key: 'review_feedback' },
			'review_and_upload_final': { key: 'review_and_upload_final' },
			'completed': { key: 'completed' },
			'pending': { key: 'pending' }
		};

		// 매칭되는 게 없으면 기본값 (대기 중, 비활성)
		return configMap[status] || { key: 'pending', enabled: false };
	};

	const handleActionClick = (actionKey: string, matchId: string, contentId:string, ) => {
		console.log(` Action: ${actionKey}, Match ID: ${matchId}`);

		if (actionKey === 'review_guideline' || actionKey === 'pending') {
			goto(`/collab/influencer/${influencerId}/guidelineform?matchId=${matchId}`);
		} else if (actionKey === 'check_invoice') {
			goto(`/collab/influencer/${influencerId}/confirmshipment?matchId=${matchId}`);
		} else if (actionKey === 'upload_draft') {
			goto(`/collab/influencer/${influencerId}/uploaddraft?matchId=${matchId}`);
		} else if (actionKey === 'review_feedback') {
			goto(`/collab/influencer/${influencerId}/reviewfeedback?matchId=${matchId}&contentId=${contentId}`);
		}
		
	};

	const handleCloseModal = () => {
		isShipmentReady = false;
	};
</script>

<CollabHeader title={t('collab.collab_influencer_title')} influencerName={influencer.name} campaign={campaignData} />

<!-- <div class="collab-influencer-pending-message-container">
	<div class="collab-influencer-pending-message-content">
		{@html t('collab.collab_influencer_pending_message')}
	</div>
	<button>{t('collab.collab_influencer_guideline')}</button>
</div> -->

<section class="common-list-container">
	<table>
		<thead>
			<tr>
				<th>{t('collab.collab_first_page_advertiser_brand_name')}</th>
				<th>{t('collab.collab_first_page_advertiser_brand_deadline')}</th>
				<th>{t('collab.collab_first_page_advertiser_brand_progress')}</th>
				<th>{t('collab.collab_first_page_advertiser_brand_required')}</th>
			</tr>
		</thead>
		<tbody>
			{#each advertiserMatchesData as advertiserMatch}
				{@const actionConfig = getActionConfig(advertiserMatch.influencer_todo, advertiserMatch.influencer_todo_enabled)}
			
				<tr>
					<td>{advertiserMatch.brand_name}</td>
					<td>{advertiserMatch.upload_deadline}  <a class="check-guideline-button" href={`/collab/influencer/${influencerId}/guidelineform?matchId=${advertiserMatch.match_id}`}>{t('collab.collab_first_page_advertiser_brand_check_guideline')}</a></td>
					<td>{getInfluencerStatusLabel(advertiserMatch.advertiser_progress)}</td>
				
					<td>
						<button
							class="action-btn"
							class:active={!advertiserMatch.advertiser_todo_enabled}
							disabled={advertiserMatch.advertiser_todo_enabled}
							onclick={() => handleActionClick(actionConfig.key, advertiserMatch.match_id, advertiserMatch.draft_content_id,)}
						>
							{t(`collab.action_influencer_${actionConfig.key}`)}
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

{#if isShipmentReady}
	<Modal modalTitle={t('collab.uploaddraft_check_title')} maxWidth="600px" > 
	<div class="uploaddraft-check-content">
		<p class="uploaddraft-check-description">{t('collab.uploaddraft_check_description')}</p>
		<p class="uploaddraft-check-warning">{@html t('collab.uploaddraft_check_warning')}</p>
	</div>
	<footer class="uploaddraft-check-footer">
		<button onclick={() => handleCloseModal()} class="uploaddraft-check-cancel-button">{t('collab.uploaddraft_check_cancel_button')}</button>
		<button onclick={() => handleCloseModal() } class="uploaddraft-check-button">{t('collab.uploaddraft_check_button')}</button>
	</footer>
	</Modal>
{/if}



<style lang="scss">
	.collab-influencer-pending-message-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 20px;
		margin-top: 100px;

		.collab-influencer-pending-message-content {
			@include text-headline-1-semibold;
			color: $gray-600;
			line-height: 0.8;
			text-align: center;
		}

		button {
			@include main-button('gray');
			width: 100%;
			max-width: 330px;
		}
	}

		.check-guideline-button{
			@include main-button('gray');
			width: 30px ;
			height: 30px;
			border-radius: 10px;
			background-color: $gray-800;
			color:$gray-0;

			&:hover{
			background-color: $gray-900;
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

	.uploaddraft-check-content{
		@include flex-column-center;
		text-align: center;
		 
		.uploaddraft-check-description{
			@include text-heading-1-medium;
			color: $gray-800;
		}
		.uploaddraft-check-warning{
			display: none;

		}
	}

	.uploaddraft-check-footer{
		display: flex;
		gap: 10px;
		margin-top: 30px ;
		.uploaddraft-check-button{
			@include main-button('light');
			width: 130px;
		}
		.uploaddraft-check-cancel-button{
			@include main-button('gray');
			width: 130px;
		}
		
	}

	@include tablet-up {
		.collab-influencer-pending-message-container {
			.collab-influencer-pending-message-content {
				@include text-heading-1-semibold;
				line-height: 0.8;
			}
		}

		.uploaddraft-check-content{
			width: 450px;
			.uploaddraft-check-description{
				@include text-heading-1-semibold;
				margin-top: 20px;
			}
			.uploaddraft-check-warning{
				display: block;
				@include text-headline-0-regular;
				color: $gray-800;
				margin-top: 20px;
			}
		}
	}
</style>
