<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';
	import { register } from 'swiper/element/bundle';
	import Icons from '../Icons.svelte';
	import Paginations from './Paginations.svelte';

	let { influencers, selectedIds, onSelect } = $props();

	let currPage = $state(1);
	let totalItems = $state(influencers.length);
	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 0);
	let itemsPerPage = $derived(windowWidth >= 768 ? 6 : 3);
	let totalPages = $derived(Math.ceil(totalItems / itemsPerPage));
	let displayedData = $derived(
		influencers.slice((currPage - 1) * itemsPerPage, currPage * itemsPerPage)
	);

	register();

	// 윈도우 크기 변경 감지
	if (typeof window !== 'undefined') {
		window.addEventListener('resize', () => {
			windowWidth = window.innerWidth;
		});
	}
</script>

<section class="matching-grid-container">
	<ul class="matching-grid-ul">
		{#each displayedData as influencer}
			{@const influencerData = influencer.influencer_profile}
			<li>
				<button class="select-btn {selectedIds.includes(influencerData.id) ? 'active' : ''}">
					{#if selectedIds.includes(influencerData.id)}
						<Icons name="check_mark" width="20" height="20" color="currentColor" />
					{/if}
				</button>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<swiper-container
					onclick={() => onSelect(influencerData.id)}
					class="swiper"
					slides-per-view="1"
					speed="500"
					pagination="true"
				>
					{#if influencerData.photo_url && influencerData.photo_url.length > 0}
						{#each influencerData.photo_url as photo}
							<swiper-slide class="swiper-slide-item">
								<img src={photo} alt={`${influencerData.name} profile`} />
							</swiper-slide>
						{/each}
					{:else}
						<swiper-slide class="swiper-slide-item">
							<img src="/sample-img.jpg" alt="default profile" />
						</swiper-slide>
					{/if}
				</swiper-container>
				<div class="matching-grid-info-container">
					<div class="matching-grid-info-country-container">
						<h3>{influencerData.nationality}</h3>
						<h2>{influencerData.name}</h2>
					</div>
					<div class="matching-grid-info-text-container">
						<div class="matching-grid-info-text-item">
							<h3>{t('status.matching_info_language')}</h3>
							<div class="info-content">
								{#if influencerData.primary_languages && influencerData.primary_languages.length > 0}
									{#each influencerData.primary_languages as lang}
										<p>{lang}</p>
									{/each}
								{/if}
							</div>
						</div>

						<div class="matching-grid-info-text-item">
							<h3>{t('status.matching_info_platform')}</h3>
							<div class="info-content">
								{#if influencerData.platforms && influencerData.platforms.length > 0}
									{#each influencerData.platforms as platform}
										<p>{platform}</p>
									{/each}
								{/if}
							</div>
						</div>

						<div class="matching-grid-info-text-item">
							<h3>{t('status.matching_info_followers')}</h3>
							<div class="info-content">
								{#if influencerData.follower_counts && Object.keys(influencerData.follower_counts).length > 0}
									{#each Object.entries(influencerData.follower_counts) as [platform, count]}
										<div class="info-text">
											<p>
												{platform.charAt(0).toUpperCase() + platform.slice(1)}: {count.toLocaleString()}
											</p>
										</div>
									{/each}
								{/if}
							</div>
						</div>
						<div class="matching-grid-info-text-item">
							<h3>{t('status.matching_info_secondary_use_available')}</h3>
							<p>{t('status.matching_info_secondary_use_available')}</p>
						</div>
					</div>
				</div>
			</li>
		{/each}
	</ul>
</section>
<Paginations bind:currPage {totalPages} />

<style lang="scss">
	.matching-grid-container {
		padding-top: 20px;

		.matching-grid-ul {
			@include flex-column-center;
			gap: 50px;

			li {
				position: relative;

				.select-btn {
					position: absolute;
					z-index: 5;
					top: 20px;
					right: 20px;
					width: 35px;
					height: 35px;
					border: none;
					border-radius: 8px;
					outline: none;
					background-color: $gray-0;
					font-size: 16px;
					font-weight: bold;

					&.active {
						background-color: $gray-900;
						color: $gray-0;
					}
				}

				.swiper {
					width: 300px;
					height: 450px;

					cursor: pointer;

					--swiper-pagination-bullet-size: 12px;
					--swiper-pagination-bullet-inactive-color: #e9e8eb;
					--swiper-theme-color: #593fd9;
					--swiper-pagination-bottom: 0px;

					.swiper-slide-item {
						height: 450px;
						background-position: center;
						background-size: cover;

						img {
							display: block;
							width: 100%;
							height: 400px;
							object-fit: cover;
							border-radius: 18px;
						}
					}
				}

				.matching-grid-info-container {
					display: flex;
					flex-direction: column;
					gap: 15px;
					padding-top: 20px;

					.matching-grid-info-country-container {
						h3 {
							@include text-body-0-semibold;
							width: fit-content;
							padding: 4px 18px;
							border-radius: 90px;
							background-color: $gray-800;
							color: $primary-0;
							text-align: center;
						}

						h2 {
							@include text-heading-0-semibold;
							margin-top: 10px;
							color: $gray-900;
						}
					}

					.matching-grid-info-text-container {
						display: grid;
						grid-template-columns: 1fr 1fr;
						gap: 15px;

						.matching-grid-info-text-item {
							h3 {
								@include text-headline-1-semibold;

								color: $gray-800;

								&::before {
									content: '•';
									margin-right: 5px;
								}
							}

							p {
								@include text-body-0-semibold;

								color: $primary-900;

								&::before {
									content: '';
									margin-right: 13px;
								}
							}
						}
					}
				}
			}
		}
	}

	@include tablet-up {
		.matching-grid-container {
			.matching-grid-ul {
				li {
					.select-btn {
						top: 30px;
						right: 30px;
						width: 45px;
						height: 45px;
					}

					.swiper {
						width: 400px;
						height: 500px;

						.swiper-slide-item {
							height: 450px;

							img {
								height: 450px;
							}
						}
					}
				}
			}
		}
	}

	@include desktop-up {
		.matching-grid-container {
			.matching-grid-ul {
				display: flex;
				flex-direction: column;

				li {
					display: flex;
					flex-direction: row;
					gap: 70px;

					.select-btn {
						left: 325px;
					}
				}
			}
		}
	}
</style>
