<script>
	let { problemSolution } = $props();
</script>

<div class="solution-second-container">
	<div class="solution-second-item">
		<h1 class="solution-second-item-text">{@html problemSolution.item}</h1>
	</div>
	<div>
		<img src="/arrow-down.png" alt="" />
	</div>
	<div class="solution-second-last-text">
		<div class="solution-second-last-text-text">{@html problemSolution.last_text}</div>
	</div>
</div>

<style lang="scss">
	.solution-second-container {
		@include flex-column-center;
		gap: 35px;
		width: 100%;
	}

	.solution-second-item {
		@include flex-column-center;
		width: 100%;
		max-width: 300px;
		height: 100px;

		border-radius: 18px;
		background-color: $gray-0;

		text-align: center;

		h1 {
			@include text-headline-0-semibold;
			color: $primary-500;
		}
	}

	.solution-second-last-text {
		width: 220px;
		height: 162px;

		border-radius: 18px;
		background-color: $gray-0;
		text-align: center;

		@include flex-column-center;

		:global(h1) {
			@include text-headline-1-semibold;
			color: $gray-900;
		}

		:global(h2) {
			@include text-heading-0-semibold;
			color: $primary-600;
		}
	}

	@include tablet-up {
		.solution-second-item {
			max-width: 410px;
			height: 200px;
			padding: 30px 48px;

			h1 {
				@include text-title-2-semibold;
				color: $primary-500;
			}
		}

		.solution-second-last-text {
			width: 340px;
			height: 300px;

			:global(h1) {
				@include text-title-0-semibold;
				color: $gray-900;
			}

			:global(h2) {
				@include text-display-1-extrabold;
				color: $primary-600;
			}
		}
	}
</style>
