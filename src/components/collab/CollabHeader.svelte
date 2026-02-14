<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';
	import Icons from '../Icons.svelte';

	interface Props {
		header: string;
	}

	let { title, campaign, influencerName } = $props();

	let placeholder = $state(influencerName || '캠페인 이름');
	let isEditName = $state(false);

	const handleEditName = (event: Event) => {
		// influencerName이 있으면 편집 불가
		if (influencerName) return;
		event.stopPropagation();
		isEditName = true;
	};

	const handleSaveName = (event: Event) => {
		event.stopPropagation();
		isEditName = false;
	};

	const handleInput = (e: Event) => {
		placeholder = (e.target as HTMLInputElement).value;
	};

</script>

{#snippet stepItem(title: string, bgColor: string, textColor: string)}
	<div class="collab-process-step-item" style="background-color: {bgColor}; color: {textColor};">
		<h1>{title}</h1>
	</div>
{/snippet}

<main class="collab-main-container">
	<section class="collab-top-container page-top-container">
		<h2>{title}</h2>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="collab-title-name-container" role="button" tabindex="0" onclick={handleEditName}>
			<div class="input-wrapper">
				<span class="ghost-text">{placeholder || ' '}</span>

				<input
					type="text"
					value={placeholder}
					oninput={handleInput}
					onblur={() => (isEditName = false)}
					readonly={!!influencerName}
				/>
			</div>

			{#if isEditName}
				<button
					onclick={(e) => {
						e.stopPropagation();
						isEditName = false;
					}}
					class="save-name-button"
				>
					저장하기
				</button>
			{:else}
				{#if !influencerName}
					<span class="edit-icon">
						<Icons name="edit" width="20" height="20" color="currentColor" />
					</span>
				{/if}
			{/if}
		</div>

		{#if campaign}
			<div class="collab-title-brand-container">
				<div class="collab-title-brand-name">{campaign.brand_name}</div>
				<div class="collab-title-brand-name">{campaign.product_name}</div>
			</div>
		{/if}
	</section>
	<section class="collab-process-container">
		<div class="collab-process-step-container">
			<h1>{t('collab.collab_first_page_title')}</h1>
			<h2>{t('collab.collab_first_page_subtitle')}</h2>
		</div>

		<div class="collab-process-step-item-container">
			<img src="/line-50.png" alt="line-50" />
			<div class="collab-process-step-item-container-items">
				{@render stepItem(t('collab.collab_first_page_item1'), '#EAEAFF', '#4848FF')}
				{@render stepItem(t('collab.collab_first_page_item2'), '#F9E9FF', '#9B17D1')}
				{@render stepItem(t('collab.collab_first_page_item3'), '#DFF3CF', '#327301')}
				{@render stepItem(t('collab.collab_first_page_item4'), '#FFDDF6', '#A71881')}
			</div>
		</div>
	</section>
</main>

<style lang="scss">
	.collab-main-container {
		display: flex;
		flex-direction: column;
	}

	.collab-top-container {
		display: flex;
		flex-direction: column;
		justify-content: center;

		width: 100%;
		padding-top: 20px;
		padding-bottom: 20px;
		padding-left: 20px;
		background-image: url('/collab-hero-bg.png');
		background-size: cover;
		background-color: $primary-500;

		h2 {
			@include text-caption-0-semibold;
			margin-bottom: 18px;

			color: $gray-300;
			text-align: left;
		}

		.collab-title-name-container {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			width: fit-content; // 전체 컨테이너가 콘텐츠에 맞게 늘어남
			color: $primary-0;
			cursor: pointer;

			.input-wrapper {
				display: inline-grid; // 그리드를 사용하여 겹치게 배치
				grid-template-columns: min-content;
				align-items: center;
				max-width: 250px;

				.ghost-text {
					@include text-title-2-bold;
					overflow: hidden;
					min-width: 10px;
					padding: 0;
					grid-area: 1 / 1;
					visibility: hidden;
					white-space: nowrap;
				}

				input {
					@include text-title-2-bold;
					overflow: hidden;
					width: 100%;
					max-width: 250px;
					padding: 0;
					border: none;
					outline: none;
					background-color: transparent;
					color: inherit;
					text-overflow: hidden;
					grid-area: 1 / 1; // 가짜 텍스트와 겹침
				}
			}

			.save-name-button {
				@include text-body-0-semibold;
				padding: 8px 12px;
				border: 1px solid $gray-400;
				border-radius: 10px;
				outline: none;
				color: $primary-800;
				cursor: pointer;
			}

			.edit-icon {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 30px;
				height: 30px;
				border-radius: 50%;
				background-color: $gray-100;
				color: $primary-300;
				cursor: pointer;
			}
		}

		.collab-title-brand-container {
			display: flex;
			gap: 10px;
			margin-top: 10px;

			.collab-title-brand-name {
				@include text-body-0-semibold;
				width: 100px;
				padding: 8px 12px;
				border-radius: 90px;
				background-color: $primary-0;
				color: $gray-800;
				text-align: center;
			}
		}
	}

	.collab-process-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		align-items: center;

		.collab-process-step-container {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding-top: 30px;
			padding-bottom: 10px;

			h1 {
				@include text-headline-1-semibold;

				color: $primary-500;
			}

			h2 {
				@include text-body-0-semibold;
				color: $gray-900;
			}
		}

		.collab-process-step-item-container {
			position: relative;
			display: none;
			justify-content: center;
			align-items: center;
			width: 750px;
			height: 50px;
			margin-bottom: 30px;

			img {
				width: 700px;
				padding-left: 60px;
			}

			.collab-process-step-item-container-items {
				position: absolute;
				display: flex;
				justify-content: center;
				align-items: center;
				gap: 10px;

				.collab-process-step-item {
					padding: 4px 18px;

					@include text-body-0-semibold;
					border-radius: 8px;
				}
			}
		}
	}

	@include tablet-up {
		.collab-top-container {
			padding-left: 50px;

			h2 {
				@include text-heading-1-bold;
			}

			.collab-title-name-container {
				.input-wrapper {
					.ghost-text {
						@include text-display-1-extrabold;
					}

					input {
						@include text-display-1-extrabold;
					}
				}

				.edit-icon {
					width: 40px;
					height: 40px;
				}
			}

			.collab-title-brand-container {
				.collab-title-brand-name {
					@include text-headline-0-semibold;
				}
			}
		}

		.collab-process-container {
			.collab-process-step-container {
				h1 {
					@include text-title-2-bold;
				}

				h2 {
					@include text-headline-1-semibold;
				}
			}

			.collab-process-step-item-container {
				display: flex;
			}
		}
	}
</style>
