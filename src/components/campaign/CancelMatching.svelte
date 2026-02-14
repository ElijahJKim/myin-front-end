<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';
	import Icons from '../Icons.svelte';
	import Paginations from './Paginations.svelte';
	import SelectButton from '../SelectButton.svelte';

	let reasons = $state([
		{ id: 1, textKey: 'status.cancel_matching_reason', checked: false },
		{ id: 2, textKey: 'status.cancel_matching_reason', checked: false },
		{ id: 3, textKey: 'status.cancel_matching_reason', checked: false },
		{ id: 4, textKey: 'status.cancel_matching_reason_etc', checked: false }
	]);

	const toggleSelection = (index: number) => {
		reasons[index].checked = !reasons[index].checked;
	};
</script>

{#snippet select(item: { id: number; textKey: string; checked: boolean }, index: number)}
	<div class="select-container">
		<SelectButton checked={item.checked} onclick={() => toggleSelection(index)} />
		<h3 class="select-text">{t(item.textKey)}</h3>
	</div>
{/snippet}

<main class="manage-container cancel-matching-container">
	<section class="cancel-matching-title-container">
		<h2 class="cancel-matching-title">{t('status.cancel_matching_title')}</h2>
		<p class="cancel-matching-subtitle">{t('status.cancel_matching_subtitle')}</p>
		<p class="cancel-matching-description">{t('status.cancel_matching_description')}</p>
	</section>
	<div class="cancel-matching-content-container">
		<section class="cancel-matching-image-info-container">
			<div class="cancel-matching-image-info-item">
				<img src="/sample-match-1.jpg" alt="cancel matching image" />
				<div class="matching-grid-info-container">
					<div class="matching-grid-info-country-container">
						<h3>한국</h3>
						<h2>홍길동</h2>
					</div>
					<div class="matching-grid-info-text-container">
						<div class="matching-grid-info-text-item">
							<h3>{t('status.matching_info_language')}</h3>
							<p>한국어</p>
						</div>
						<div class="matching-grid-info-text-item">
							<h3>{t('status.matching_info_platform')}</h3>
							<p>틱톡</p>
						</div>
						<div class="matching-grid-info-text-item">
							<h3>{t('status.matching_info_followers')}</h3>
							<p>1000000</p>
						</div>
						<div class="matching-grid-info-text-item">
							<h3>{t('status.matching_info_secondary_use_available')}</h3>
							<p>가능</p>
						</div>
					</div>
				</div>
			</div>
			<div></div>
		</section>
		<section class="cancel-matching-reason-container">
			{@render select(reasons[0], 0)}
			{@render select(reasons[1], 1)}
			{@render select(reasons[2], 2)}
			{@render select(reasons[3], 3)}
			<textarea class="etc-textarea" placeholder={t('status.cancel_matching_other_reason')}
			></textarea>
		</section>
	</div>
	<Paginations currPage={1} totalPages={10} />
	<button class="btn-submit">{t('status.cancel_matching_submit')}</button>
</main>

<style lang="scss">
	.manage-container {
		display: flex;
		flex-direction: column;

		padding-top: 50px;
	}

	.cancel-matching-content-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 30px;
		width: 100%;
	}

	.cancel-matching-title-container {
		@include flex-column-center;
		gap: 10px;
		padding-bottom: 20px;

		.cancel-matching-title {
			@include text-caption-0-semibold;
			color: $gray-600;
		}

		.cancel-matching-subtitle {
			@include text-headline-0-bold;
			color: $gray-900;
		}

		.cancel-matching-description {
			@include text-body-0-semibold;
			color: $gray-800;
		}
	}

	.cancel-matching-image-info-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;

		.cancel-matching-image-info-item {
			width: 100%;
			margin-right: 10px;
			margin-left: 10px;
			padding: 12px 20px;
			border-radius: 20px;
			background-color: $gray-100;

			img {
				width: 200px;
				height: 200px;
				margin-bottom: 20px;
				border-radius: 10px;
				object-fit: cover;
			}

			.matching-grid-info-container {
				display: flex;
				flex-direction: column;
				gap: 15px;

				.matching-grid-info-country-container {
					h3 {
						@include text-body-0-semibold;
						width: 30px;
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

	.cancel-matching-reason-container {
		display: flex;
		flex-direction: column;

		gap: 10px;
		box-sizing: border-box;
		width: 100%;
		padding-right: 10px;
		padding-left: 10px;

		.select-container {
			display: flex;
			align-items: center;
			gap: 10px;
			width: 100%;

			.select-text {
				@include text-body-0-semibold;
				color: $gray-800;
			}
		}

		.etc-textarea {
			height: 150px;
			margin-bottom: 30px;
			padding: 14px;
			border: 1px solid #d3d2d6;
			border-radius: 10px;
			outline: none;
			color: $gray-800;
			line-height: 1.5;
			resize: vertical;

			&::placeholder {
				color: #9d9ca1;

				@include text-body-0-semibold;
			}

			&:focus {
				border: 1px solid $primary-400;
			}
		}
	}

	.btn-submit {
		@include main-button('primary');
		align-self: center;
		width: 100%;
		max-width: 400px;
		margin-top: 30px;
		margin-bottom: 30px;
	}

	@include tablet-up {
		.manage-container {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.cancel-matching-title-container {
			.cancel-matching-title {
				@include text-headline-0-semibold;
			}

			.cancel-matching-subtitle {
				@include text-display-1-extrabold;
			}

			.cancel-matching-description {
				@include text-heading-0-semibold;
			}
		}

		.cancel-matching-image-info-container {
			.cancel-matching-image-info-item {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 50px;
				max-width: 650px;
				height: 300px;

				img {
					width: 210px;
					height: 230px;
				}
			}
		}

		.cancel-matching-reason-container {
			display: flex;

			align-items: center;
			width: 100%;
			max-width: 700px;

			.select-container {
				max-width: 580px;
			}

			.etc-textarea {
				width: 100%;
				max-width: 550px;
			}
		}

		.cancel-matching-content-container {
			display: flex;
			align-items: center;
		}
	}

	@include desktop-up {
		.cancel-matching-content-container {
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;

			.cancel-matching-reason-container {
				margin-top: 30px;
			}
		}
	}
</style>
