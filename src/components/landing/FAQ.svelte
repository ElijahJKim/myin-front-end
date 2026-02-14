<script>
	import Icons from '../Icons.svelte';
	import { globalState } from '$lib/stores/i18n-stores.svelte.ts';
	import { t } from '$lib/i18n-helper.ts';
</script>

<section class="faq-container">
	<div class="faq-title-container">
		<Icons name="question_flag" width="24" height="24" color="currentColor" />
		<h1>{t('landing.faq_title')}</h1>
	</div>
	<div class="faq-list-container">
		{#each globalState.messages?.landing?.faq_list as faq}
			<div class="faq-list-item">
				<h2 class="faq-list-item-question">{@html faq.question}</h2>
				<p class="faq-list-item-answer">{@html faq.answer}</p>
			</div>
		{/each}
	</div>
</section>

<style lang="scss">
	.faq-container {
		padding: 80px 25px;
	}

	.faq-title-container {
		display: flex;
		align-items: center;
		gap: 10px;

		h1 {
			@include text-heading-1-bold;
			color: $gray-900;
		}
	}

	.faq-list-container {
		display: flex;
		flex-direction: column;
		gap: 20px;

		.faq-list-item {
			display: flex;
			flex-direction: column;
			gap: 10px;
			padding: 40px 0;
			border-bottom: 2px solid $gray-400;

			&:last-child {
				border-bottom: none;
			}

			.faq-list-item-question {
				@include text-headline-0-semibold;
				color: $gray-900;
			}

			.faq-list-item-answer {
				@include text-body-0-semibold;
				color: $gray-800;
			}
		}
	}

	@include tablet-up {
		.faq-container {
			max-width: 1100px;
			padding: 100px 50px;
		}

		.faq-title-container {
			h1 {
				@include text-display-1-extrabold;
			}
		}

		.faq-list-container {
			.faq-list-item {
				.faq-list-item-question {
					@include text-title-0-extrabold;
				}

				.faq-list-item-answer {
					@include text-title-2-medium;
				}
			}
		}
	}
</style>
