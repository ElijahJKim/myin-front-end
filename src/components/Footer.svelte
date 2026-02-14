<script>
	import { locale } from 'svelte-i18n';
	import { t } from '$lib/i18n-helper.ts';
	locale.set('ko');
</script>

<footer class="footer-container">
	<div class="footer-content">
		<div class="footer-content-item">
			<h1>{t('widget.footer_service')}</h1>
			<div class="footer-content-item-list">
				<a href="/">{t('widget.footer_register')}</a>
				<a href="/">{t('widget.footer_link')}</a>
			</div>
		</div>
		<div class="footer-content-item">
			<h1>{t('widget.footer_contact')}</h1>
			<div class="footer-content-item-list">
				<a href="/">{t('widget.footer_contact')}</a>
			</div>
		</div>
	</div>

	<h1 class="footer-copyright">{t('widget.footer_copyright')}</h1>
</footer>

<style lang="scss">
	.footer-container {
		display: flex;
		flex-direction: column;

		gap: 20px;
		width: 100%;
		height: 300px;
		padding-top: 40px;
		padding-left: 50px;
		background-color: $gray-100;
	}

	.footer-content {
		display: flex;
		gap: 20px;

		.footer-content-item {
			display: flex;
			flex-direction: column;
			flex: 1;
			gap: 10px;

			h1 {
				@include text-caption-0-semibold;
				color: $gray-900;
			}

			.footer-content-item-list {
				display: flex;
				flex-direction: column;
				gap: 10px;

				a {
					@include text-caption-0-semibold;
					color: $gray-600;
				}
			}
		}
	}

	.footer-copyright {
		@include text-caption-0-semibold;
		padding-top: 30px;
		color: $gray-900;
	}

	@include tablet-up {
		.footer-container {
			flex-direction: row;
			height: 240px;
		}

		.footer-content {
			flex: 1;
			gap: 50px;

			.footer-content-item {
				flex: none;

				h1 {
					@include text-heading-0-semibold;
				}

				.footer-content-item-list {
					a {
						@include text-heading-1-medium;
					}
				}
			}
		}

		.footer-copyright {
			flex: 1;
			height: 100%;
			padding: 0;

			@include text-heading-0-semibold;
		}
	}

	@include desktop-up {
		.footer-container {
			justify-content: center;
			gap: 150px;
		}

		.footer-content {
			flex: none;
		}

		.footer-copyright {
			flex: none;
		}
	}
</style>
