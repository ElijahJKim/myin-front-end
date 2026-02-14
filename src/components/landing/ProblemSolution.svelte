<script lang="ts">
	// interface Props {
	// 	problemSolution: {
	// 		main_title: string;
	// 		items: {
	// 			title: string;
	// 		}[];
	// 	};
	// }

	let { problemSolution, children } = $props();
</script>

<section class="problem-solution-container">
	<div class="problem-solution-logo">Solution</div>
	<h1 class="problem-solution-title">{@html problemSolution.main_title}</h1>
	<div class="problem-solution-content">
		{@render children()}
	</div>
</section>

<style lang="scss">
	.problem-solution-container {
		gap: 30px;
		padding-top: 60px;
		padding-bottom: 100px;
		background-color: $gray-100;

		@include flex-column-center;
	}

	.problem-solution-logo {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 85px;
		height: 40px;

		border-radius: 90px;

		@include text-body-0-semibold;
		background-color: $primary-300;
		color: $gray-100;
	}

	.problem-solution-title {
		@include text-headline-0-semibold;

		color: $gray-900;
		text-align: center;

		:global(h2) {
			@include text-caption-0-semibold;
			color: $gray-800;
		}

		:global(h1) {
			@include text-headline-0-semibold;
			margin-top: 15px;
			color: $gray-900;
		}
	}

	.problem-solution-content {
		width: 100%;
		margin-top: 20px;
	}

	@include tablet-up {
		.problem-solution-logo {
			width: 100px;
			height: 50px;

			@include text-headline-0-semibold;
		}

		.problem-solution-title {
			@include text-title-0-bold;

			:global(h2) {
				@include text-headline-0-semibold;
			}

			:global(h1) {
				@include text-title-0-semibold;
			}
		}
	}
</style>
