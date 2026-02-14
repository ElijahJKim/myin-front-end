<script lang="ts">
	interface Props {
		problem: {
			index: Number;
			main_title: string;
			description: string;
			problemList: [
				{
					title: string;
				}
			];
		};
	}

	let { problem }: Props = $props();
</script>

<section class="problem-list-container">
	<div class="problem-list-logo">Problem</div>
	<div class="problem-list-title-container">
		<div class="problem-list-title-index-container">
			<span class="problem-list-title-index">{problem.index}</span>
		</div>
		<h1 class="problem-list-title-text">{@html problem.main_title}</h1>
	</div>
	<p class="problem-list-description">{problem.description}</p>
	<div class="problem-list-problem-list">
		{#each problem.problemList as item}
			<div class="problem-list-problem-list-item">
				<h1 class="problem-list-problem-list-item-text">{item.title}</h1>
			</div>
		{/each}
	</div>
</section>

<style lang="scss">
	.problem-list-container {
		@include flex-column-center;
		gap: 30px;
		padding: 60px 0;
		background-color: $gray-900;
	}

	.problem-list-logo {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 85px;
		height: 40px;

		border-radius: 90px;

		@include text-body-0-semibold;
		background-color: $primary-800;
		color: $gray-100;
	}

	.problem-list-title-container {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		gap: 15px;

		.problem-list-title-index-container {
			margin-top: 5px;

			.problem-list-title-index {
				@include text-body-0-semibold;
				display: flex;
				justify-content: center;
				align-items: center;
				width: 18px;
				height: 18px;
				border-radius: 50%;
				background-color: $primary-0;
			}
		}

		.problem-list-title-text {
			@include text-headline-0-semibold;
			color: $gray-0;

			text-align: center;
		}
	}

	.problem-list-description {
		@include text-body-0-semibold;
		width: 250px;
		color: $gray-400;
		text-align: center;
	}

	.problem-list-problem-list {
		display: grid;
		grid-template-columns: 1fr;
		place-items: center center;
		gap: 20px;
		width: 100%;

		.problem-list-problem-list-item {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			max-width: 280px;
			height: 100px;

			border-radius: 18px;
			background-color: $gray-100;

			h1 {
				text-align: center;
			}
		}
	}

	@include tablet-up {
		.problem-list-logo {
			width: 100px;
			height: 50px;

			@include text-headline-0-semibold;
		}

		.problem-list-title-container {
			.problem-list-title-index-container {
				.problem-list-title-index {
					width: 40px;
					height: 40px;
					margin-top: 4px;

					@include text-title-1-semibold;
				}
			}

			.problem-list-title-text {
				@include text-title-0-bold;
			}
		}

		.problem-list-description {
			@include text-headline-0-semibold;
			width: 100%;
		}

		.problem-list-problem-list {
			.problem-list-problem-list-item {
				height: 145px;

				@include text-headline-0-semibold;
			}
		}
	}
</style>
