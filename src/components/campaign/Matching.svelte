<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';

	import { register } from 'swiper/element/bundle';
	import 'swiper/css';
	import 'swiper/css/effect-flip';
	import 'swiper/css/pagination';
	import 'swiper/css/navigation';
	import Icons from '../Icons.svelte';
	import Modal from '../Modal.svelte';
	import GridView from './GridView.svelte';
	import ListView from './ListView.svelte';
import { matchingAPI } from '$lib/api/matching.ts';
import { goto, invalidateAll } from '$app/navigation';

	let { isCancelMatching = $bindable(), influencers, campaign } = $props();

	let viewMode = $state('grid');

	let isModalOpen = $state(false);

	let selectedInfluencer = $state<number[]>([]);
		let isSubmitting = $state(false);

	const handleSelectInfluencer = (id: number) => {
		if (selectedInfluencer.includes(id)) {
			selectedInfluencer = selectedInfluencer.filter((selectedId) => selectedId !== id);
		} else {
			selectedInfluencer = [...selectedInfluencer, id];
		}
	};

	const handleModalOpen = () => {
		isModalOpen = true;
	};

	const handleModalClose = () => {
		isModalOpen = false;
	};

	

	const handleSelectInfluencers = async () => {
        if (isSubmitting) return; 
        isSubmitting = true;

        try {
      
            await matchingAPI.selectMultipleInfluencers(campaign.id, selectedInfluencer);
             await goto(`/collab/advertiser/${campaign.id}/dashboard`, { invalidateAll: true });
        } catch (error) {
            console.error("매칭 선택 실패:", error);
            alert("처리 중 오류가 발생했습니다.");
            isSubmitting = false; 
        }
    };

	const handleCancelMatching = async () => {
		try {
			await matchingAPI.cancelMatching(campaign.id);
			await invalidateAll();
		} catch (error) {
			console.error("매칭 취소 실패:", error);
			alert("처리 중 오류가 발생했습니다.");
		}
	}
</script>

<main class="manage-container">
	<section class="matching-title-container">
		<h2 class="matching-title">
			{t('status.matching_title')} [{campaign.brand_name}] [{campaign.manager_name}] {t(
				'status.matching_title_sir'
			)}
		</h2>
		<p class="matching-sub-title">{@html t('status.matching_sub_title')}</p>
	</section>
	<section class="matching-view-container">
		<div class="matching-view-button-container">
			<button onclick={() => (viewMode = 'list')} class={viewMode === 'list' ? 'active' : ''}>
				<Icons name="list" width="24" height="24" color="currentColor" /></button
			>
			<button onclick={() => (viewMode = 'grid')} class={viewMode === 'grid' ? 'active' : ''}>
				<Icons name="grid" width="24" height="24" color="currentColor" /></button
			>
		</div>
	</section>
	{#if viewMode === 'grid'}
		<GridView {influencers} selectedIds={selectedInfluencer} onSelect={handleSelectInfluencer} />
	{/if}
	{#if viewMode === 'list'}
		<ListView {influencers} selectedIds={selectedInfluencer} onSelect={handleSelectInfluencer} />
	{/if}
	<footer>
		<p class="matching-alert-text">
			<span class="matching-alert-icon">!</span>{t('status.matching_alert')}
		</p>
		<button class="matching-select-button" onclick={handleSelectInfluencers}
			>{t('status.matching_button')}</button
		>
		<button onclick={handleCancelMatching} class="matching-rematch-button"
			>{t('status.matching_rematch_button')}</button
		>
	</footer>
</main>

<!-- {#if isModalOpen}
	<Modal
		modalTitle={t('status.matching_modal_cancel_title')}
		width="220px"
		maxWidth="300px"
		height="130px"
	>
		<main class="matching-modal-cancel-content">
			<p class="matching-modal-cancel-description">
				{t('status.matching_modal_cancel_description')}
			</p>
		</main>
		<footer class="matching-modal-cancel-footer">
			<button class="matching-modal-cancel-close-button" onclick={handleModalClose}
				>{t('status.matching_modal_cancel_close')}</button
			>
			<button class="matching-modal-cancel-button" onclick={() => (isCancelMatching = true)}
				>{t('status.matching_modal_cancel_button')}</button
			>
		</footer>
	</Modal>
{/if} -->

<style lang="scss">
	.manage-container {
		@include flex-column-center;
		gap: 20px;
		padding-top: 50px;
	}

	.matching-title-container {
		@include flex-column-center;
		gap: 10px;
		padding-bottom: 20px;

		.matching-title {
			@include text-caption-0-semibold;
			color: $gray-600;
		}

		.matching-sub-title {
			@include text-headline-0-bold;
			color: $gray-900;
			text-align: center;
		}
	}

	.matching-view-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;

		.matching-view-button-container {
			display: flex;
			justify-content: center;
			gap: 10px;
			width: 180px;
			padding: 6px 0;
			border-radius: 10px;
			background-color: $gray-200;
			color: $gray-500;

			button {
				width: 80px;
				padding: 6px 0;
				border: none;
				border-radius: 8px;
				outline: none;
				background-color: transparent;
				cursor: pointer;

				&.active {
					background-color: $gray-0;
					color: $gray-900;
				}
			}
		}
	}

	footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 30px 0;

		.matching-alert-text {
			@include error-message;

			.matching-alert-icon {
				@include error-icon;
			}
		}

		.matching-select-button {
			@include main-button('primary');
			width: 300px;
		}

		.matching-rematch-button {
			@include main-button('light');
			width: 300px;
		}

		.matching-reject-button {
			@include main-button('primary');
			width: 300px;
		}
	}

	.matching-modal-cancel-content {
		.matching-modal-cancel-description {
			@include text-headline-1-medium;
			color: $gray-800;
		}
	}

	.matching-modal-cancel-footer {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 10px;
		width: 100%;

		.matching-modal-cancel-close-button {
			@include main-button('gray');
			width: 130px;
		}

		.matching-modal-cancel-button {
			@include main-button('light');
			width: 130px;
		}
	}

	@include tablet-up {
		.matching-title-container {
			.matching-title {
				@include text-headline-0-semibold;
			}

			.matching-sub-title {
				@include text-display-1-extrabold;
			}

			&::after {
				width: 500px;
				height: 3px;
				margin-top: 20px;
				background-color: $gray-200;
				content: '';
			}
		}

		.matching-view-container {
			justify-content: flex-end;
			margin-right: 150px;
		}
	}

	@include desktop-up {
		.matching-title-container {
			&::after {
				width: 1200px;
				height: 3px;
				margin-top: 20px;
				background-color: $gray-200;
			}
		}
	}
</style>
