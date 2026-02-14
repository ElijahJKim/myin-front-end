<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';

	let { problemSolution } = $props();
</script>

<div class="solution-third-container">
	<h1 class="solution-third-title-text">{@html problemSolution.item_title}</h1>

	<div class="solution-third-item-container">
		<div class="solution-third-item-text-container">
			<div class="solution-third-item-text"><h1>{@html problemSolution.items[0].title}</h1></div>
			<div class="solution-third-item-text"><h1>{@html problemSolution.items[1].title}</h1></div>
			<div class="solution-third-item-text"><h1>{@html problemSolution.items[2].title}</h1></div>
			<div class="solution-third-item-text"><h1>{@html problemSolution.items[3].title}</h1></div>
		</div>
	</div>
	<a href="/campaign/register">
		<button class="solution-third-button btn-main dark"
			>{t('landing.problem_solution.2.last_text')}</button
		>
	</a>
</div>

<style lang="scss">
	.solution-third-container {
		@include flex-column-center;
		width: 100%;
	}

	.solution-third-title-text {
		@include text-title-1-bold;

		margin-bottom: 20px;
		color: $primary-400;
		text-align: center;
	}

	.solution-third-item-container {
		gap: 10px;
		padding: 15px;
		border: 2px solid $primary-200;
		border-radius: 18px;

		.solution-third-item-text-container {
			display: grid;
			grid-template-columns: repeat(2, 120px);
			gap: 10px;
			width: 100%;
			height: 100%;

			.solution-third-item-text {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 90px;
				border-radius: 18px;
				background-color: $gray-0;

				h1 {
					@include text-headline-0-semibold;
					color: $primary-400;
					text-align: center;
				}
			}
		}
	}

	.solution-third-button {
		margin-top: 50px;
	}

	@include tablet-up {
		.solution-third-title-text {
			@include text-title-1-bold;
		}

		.solution-third-item-container {
			.solution-third-item-text-container {
				display: grid;
				grid-template-columns: repeat(2, 190px);
				gap: 10px;
				width: 100%;
				height: 100%;

				.solution-third-item-text {
					height: 100px;

					h1 {
						@include text-heading-0-semibold;
						color: $primary-400;
						text-align: center;
					}
				}
			}
		}
	}
</style>
