<script>
	import { t } from '$lib/i18n-helper.ts';
</script>

<section class="hero-container">
	<div class="hero-content">
		<h1 class="hero-title">{@html t('landing.hero_title')}</h1>
		<p class="hero-description">{t('landing.hero_description')}</p>
		<a href="/campaign/register"
			><button class="btn-main light">{t('landing.hero_button')}</button></a
		>
	</div>
</section>

<style lang="scss">
	.hero-container {
		display: flex;
		align-items: center;
		height: 310px;
		background-image: url('/hero-background-img.png');
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
		box-sizing: border-box;
		margin-right: 20px;
		margin-left: 20px;
	}

	.hero-title {
		@include text-title-2-bold;
		color: $gray-200;
	}

	.hero-description {
		@include text-body-0-semibold;
		color: $gray-200;
	}

	@include tablet-up {
		.hero-container {
			height: 430px;
		}

		.hero-content {
			margin-left: 50px;
		}

		.hero-title {
			@include text-display-1-extrabold;
		}

		.hero-description {
			@include text-headline-1-semibold;
		}
	}
</style>
