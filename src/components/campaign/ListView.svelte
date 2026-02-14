<script lang="ts">
	import Icons from '../Icons.svelte';
	import SelectButton from '../SelectButton.svelte';
	import Paginations from './Paginations.svelte';
	import PictureModal from './PictureModal.svelte';
	import { t } from '$lib/i18n-helper.ts';

	let { influencers, selectedIds, onSelect } = $props();

	let currPage = $state(1);
	let totalItems = $state(influencers.length);
	let itemsPerPage = $state(10);
	let totalPages = $derived(Math.ceil(totalItems / itemsPerPage));
	let displayedData = $derived(
		influencers.slice((currPage - 1) * itemsPerPage, currPage * itemsPerPage)
	);
	let isModalOpen = $state(false);

	let selectedInfluencer = $state(null);

	const handleSelectInfluencer = (influencer: any) => {
		isModalOpen = true;
		selectedInfluencer = influencer;
	};

	const formatNumber = (num: number) => num.toLocaleString();

	const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
</script>

<section class="common-list-container">
	<table>
		<thead>
			<tr>
				<th>{t('status.matching_info_nationality')}</th>
				<th>{t('status.matching_info_name')}</th>
				<th>{t('status.matching_info_language')}</th>
				<th>{t('status.matching_info_platform')}</th>
				<th>{t('status.matching_info_followers')}</th>
				<th>{t('status.matching_info_secondary_use_available')}</th>
				<th>{t('status.matching_button')}</th>
			</tr>
		</thead>
		<tbody>
			{#each displayedData as influencer (influencer.match_id)}
				{@const influencerData = influencer.influencer_profile}
				<tr>
					<td>{influencerData.nationality}</td>
					<td class="name-container" onclick={() => handleSelectInfluencer(influencer)}>
						{influencerData.name}
						<Icons name="arrow_right" width="22" height="22" color="currentColor" />
					</td>

					<td>
						<div class="array-display">
							{#each influencerData.primary_languages as lang}
								<span class="array-item">{capitalize(lang)}</span>
							{/each}
						</div>
					</td>

					<td>
						<div class="array-display">
							{#each influencerData.platforms as platform}
								<span class="array-item">{capitalize(platform)}</span>
							{/each}
						</div>
					</td>

					<td>
						<div class="follower-display">
							{#if influencerData.follower_counts}
								{#each Object.entries(influencerData.follower_counts) as [platform, count]}
									<div class="follower-item">
										<span>{formatNumber(count as number)}</span>
									</div>
								{/each}
							{/if}
						</div>
					</td>

					<td>{influencerData.secondary_use_free ? 'Yes' : 'No'}</td>
					<td>
						<SelectButton
							checked={selectedIds.includes(influencerData.id)}
							onclick={() => onSelect(influencerData.id)}
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

{#if isModalOpen}
	<PictureModal {selectedInfluencer} bind:isModalOpen />
{/if}

<Paginations bind:currPage {totalPages} />

<style lang="scss">
	.matching-list-container {
		overflow-x: auto;
		width: 100%;
		max-width: 100%;

		table {
			width: 1200px;
			min-width: 1200px;
			margin: 0 auto;

			thead {
				tr {
					border-top: 1px solid $gray-600;
					border-bottom: 1px solid $gray-600;
					background-color: $gray-200;

					th {
						@include text-headline-1-semibold;
						padding: 10px 40px;
						color: $gray-900;
					}
				}
			}

			tbody {
				tr {
					border-bottom: 1px solid $gray-600;

					.name-container {
						display: flex;
						justify-content: center;
						align-items: center;
						gap: 5px;
						cursor: pointer;
					}

					td {
						height: 25px;
						padding: 18px 40px;
						text-align: center;
						vertical-align: middle;
					}

					.array-display {
						display: flex;
						justify-content: center;
						align-items: center;
						gap: 5px;
					}

					.follower-display {
						.follower-item {
							display: flex;
							justify-content: center;
							align-items: center;
						}
					}
				}
			}
		}

		&::-webkit-scrollbar {
			width: 5px;
		}

		/* Track */
		&::-webkit-scrollbar-track {
			background: $gray-0;
		}

		/* Handle */
		&::-webkit-scrollbar-thumb {
			border-radius: 90px;
			background: $gray-200;
			background-clip: padding-box;
		}

		/* Handle on hover */
		&::-webkit-scrollbar-thumb:hover {
			background: $gray-300;
		}
	}
</style>
