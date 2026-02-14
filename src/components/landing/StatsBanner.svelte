<script>
	import { t } from '$lib/i18n-helper.ts';
</script>

<section class="stats-banner-container">
	<div class="stats-banner-top-container">
		<h1>{t('landing.stats_banner_top_title')}</h1>
		<div class="stats-banner-top-number">
			<h1 class="stats-banner-top-number-text">{t('landing.stats_banner_top_number')}+</h1>
		</div>
		<a href="/campaign/register">
			<button class="btn-main dark">{t('landing.stats_banner_top_button')}</button>
		</a>
	</div>
	<div class="stats-banner-bottom-container">
		<h1 class="stats-main-text stats-banner-bottom-title">
			{@html t('landing.stats_banner_bottom_title')}
		</h1>
		<div class="stats-banner-bottom-content-container">
			<div class="stats-banner-bottom-description-box">
				<h1>{@html t('landing.stats_banner_bottom_description_1')}</h1>
			</div>
			<div class="stats-banner-bottom-image-container">
				<div class="stats-banner-bottom-description-2-text">
					{@html t('landing.stats_banner_bottom_description_2')}
				</div>
				<img src="/stats-banner.png" alt="" />
			</div>
		</div>
	</div>
	<h1 class="stats-main-text">
		{@html t('landing.stats_banner_bottom_description_3')}
	</h1>
</section>

<style lang="scss">
	.stats-banner-container {
		@include flex-column-center;
	}

	.stats-banner-top-container {
		@include flex-column-center;
		width: 100%;
		background: linear-gradient(180deg, #cfc5fd 0%, rgb(207 197 253 / 0%) 100%);

		h1 {
			@include text-headline-1-bold;
			margin-top: 30px;
			margin-bottom: 10px;
		}

		.stats-banner-top-number {
			display: flex;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
			width: calc(100% - 40px);
			max-width: 333px;
			height: 108px;
			margin-top: 20px;
			margin-bottom: 20px;
			padding: 20px;
			border-radius: 18px;
			background-color: $gray-0;

			.stats-banner-top-number-text {
				@include text-heading-1-semibold;
				margin: 0;
				color: $primary-600;
				line-height: 1;
			}
		}
	}

	.stats-banner-bottom-container {
		@include flex-column-center;

		.stats-banner-bottom-title {
			margin-top: 60px;
		}

		.stats-banner-bottom-content-container {
			@include flex-column-center;

			.stats-banner-bottom-title {
				margin-top: 60px;
			}

			.stats-banner-bottom-description-box {
				width: 206px;
				height: 220px;
				margin-top: 30px;

				border-radius: 18px;
				background-color: $gray-300;

				h1 {
					@include text-body-0-semibold;
					padding: 30px;
					color: $gray-800;
				}
			}

			.stats-banner-bottom-image-container {
				position: relative;

				margin-top: 20px;

				.stats-banner-bottom-description-2-text {
					position: absolute;
					top: 40px;
					left: 30px;

					:global(.highlight) {
						color: $primary-500;
					}

					:global(h1) {
						@include text-headline-1-semibold;
					}

					:global(h2) {
						@include text-heading-0-bold;
						width: 200px;
					}
				}

				img {
					box-sizing: border-box;
					width: 100%;
					width: 266px;
					padding: 10px;
					border-radius: 18px;
					object-fit: cover;
				}
			}
		}
	}

	.stats-main-text {
		@include text-headline-1-bold;
		margin-top: 60px;
		margin-bottom: 30px;
		text-align: center;
	}

	@include tablet-up {
		.stats-banner-top-container {
			h1 {
				@include text-title-1-bold;
			}

			.stats-banner-top-number {
				max-width: 444px;
				height: 140px;

				.stats-banner-top-number-text {
					@include text-display-1-bold;
				}
			}
		}

		.stats-banner-bottom-container {
			.stats-banner-bottom-title {
				@include text-display-1-extrabold;
			}

			.stats-banner-bottom-content-container {
				flex-direction: row;
				gap: 20px;

				.stats-banner-bottom-description-box {
					width: 100%;
					max-width: 286px;
					height: 306px;

					border-radius: 18px;
					background-color: $gray-300;

					h1 {
						@include text-heading-0-semibold;
					}
				}

				.stats-banner-bottom-image-container {
					.stats-banner-bottom-description-2-text {
						:global(h1) {
							@include text-title-2-semibold;
						}

						:global(h2) {
							@include text-title-1-bold;
							width: 250px;
						}
					}

					img {
						width: 100%;
						max-width: 400px;
						height: 400px;
					}
				}
			}
		}

		.stats-main-text {
			@include text-display-1-extrabold;
		}
	}
</style>
