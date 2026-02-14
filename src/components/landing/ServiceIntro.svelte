<script>
	import { t } from '$lib/i18n-helper.ts';
</script>

<section class="service-intro-container col-m-4 col-t-8 col-d-12">
	<h2 class="service-intro-title">{@html t('landing.service_intro_title')}</h2>
	<!-- 모바일: 기본 메시지, 태블릿 이상: br이 있는 메시지 -->
	<h3 class="service-intro-description service-intro-description-mobile">
		{@html t('landing.service_intro_description')}
	</h3>
	<h3 class="service-intro-description service-intro-description-tablet">
		{@html t('landing.service_intro_description_tablet')}
	</h3>
	<div class="banner-grid">
		<div class="service-intro-banner-container">
			<div class="service-intro-banner-text-1">
				{@html t('landing.service_intro_banner_text1')}
			</div>
			<img src="/sample-img.jpg" alt="" />
		</div>
		<div class="service-intro-banner-container">
			<div class="service-intro-banner-text-1">
				{@html t('landing.service_intro_banner_text2')}
			</div>
			<img src="/sample-img.jpg" alt="" />
		</div>
		<div class="service-intro-banner-container">
			<div class="service-intro-banner-text-1">
				{@html t('landing.service_intro_banner_text3')}
			</div>
			<img src="/sample-img.jpg" alt="" />
		</div>
	</div>
</section>

<style lang="scss">
	.service-intro-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 20px;
		padding: 50px;
	}

	.service-intro-title {
		@include text-body-0-semibold;
		text-align: center;

		:global(.highlight) {
			color: $primary-500;
		}
	}

	.service-intro-description {
		@include text-headline-0-bold;
		text-align: center;
	}

	/* 모바일: 기본 메시지만 표시 */
	.service-intro-description-mobile {
		display: block;
	}

	.service-intro-description-tablet {
		display: none;
	}

	/* 태블릿 이상: br이 있는 메시지만 표시 */
	@include tablet-up {
		.service-intro-description-mobile {
			display: none;
		}

		.service-intro-description-tablet {
			display: block;
		}
	}

	.banner-grid {
		display: grid;
		grid-template-columns: 1fr;
		justify-items: center;
		gap: 20px;
	}

	.service-intro-banner-container {
		position: relative;

		.service-intro-banner-text-1 {
			position: absolute;

			top: 30px;
			left: 20px;
			display: flex;
			flex-direction: column;

			:global(.sub-title) {
				@include text-caption-0-semibold;
				color: $gray-0;
			}

			:global(.main-title) {
				@include text-headline-0-semibold;
				color: $gray-0;
				line-height: 1;
			}
		}

		img {
			box-sizing: border-box;
			width: 100%;
			min-width: 270px;
			max-width: 340px;
			height: 330px;

			border-radius: 18px;
			object-fit: cover;
		}
	}

	@include tablet-up {
		.banner-grid {
			grid-template-columns: repeat(4, 1fr);
		}

		.service-intro-banner-container {
			grid-column: span 2;
		}

		.service-intro-banner-container:nth-child(3) {
			grid-column: 2 / span 2;
		}

		.service-intro-title {
			@include text-headline-1-semibold;
		}

		.service-intro-description {
			@include text-title-1-bold;
		}
	}

	@include desktop-up {
		.banner-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.service-intro-banner-container,
		.service-intro-banner-container:nth-child(3) {
			grid-column: span 1;
		}
	}
</style>
