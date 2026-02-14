<script lang="ts">
	import Icons from '../Icons.svelte';

	let { problemSolution } = $props();
</script>

<div class="solution-first-container">
	<div class="solution-first-item-container">
		<div class="solution-first-item">
			<h1>{@html problemSolution.items[0].title}</h1>
		</div>
		<div class="solution-first-item">
			<h1>{@html problemSolution.items[1].title}</h1>
		</div>
		<div class="solution-first-item">
			<h1>{@html problemSolution.items[2].title}</h1>
		</div>
	</div>
	<div>
		<img src="/arrow-down.png" alt="" />
	</div>
	<div class="solution-first-last-text">
		<span><Icons name="check_mark" width="17" height="20" color="$primary-500" /></span>
		<h1>{@html problemSolution.last_text}</h1>
	</div>
</div>

<style lang="scss">
	.solution-first-container {
		@include flex-column-center;
		gap: 30px;
		width: 100%;
	}

	.solution-first-item-container {
		@include flex-column-center;
		gap: 20px;
		width: 100%;
	}

	.solution-first-item {
		@include flex-column-center;
		width: 100%;
		max-width: 280px;
		height: 100px;
		border-radius: 18px;
		text-align: center;

		&:first-child {
			background-color: #c5e4fd;
		}

		&:nth-child(2) {
			background-color: #eec5fd;
		}

		&:nth-child(3) {
			background-color: #c8c5fd;
		}

		h1 {
			@include text-headline-1-semibold;
		}
	}

	.solution-first-last-text {
		@include text-headline-1-semibold;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 15px;
		width: 300px;
		height: 170px;

		padding: 10px;
		border-radius: 18px;
		background-color: $gray-0;
		color: $primary-600;
		font-weight: 800;
		line-height: 1;
		text-align: center;
	}

	@include tablet-up {
		.solution-first-item {
			height: 145px;

			h1 {
				@include text-headline-0-semibold;
			}
		}

		.solution-first-last-text {
			@include text-title-0-semibold;
			gap: 25px;
			width: 600px;
			height: 300px;
			padding: 15px;
			font-weight: 800;

			span {
				transform: scale(1.75);
				margin-bottom: 5px;
			}
		}
	}

	@include desktop-up {
		.solution-first-item-container {
			flex-direction: row;
		}
	}
</style>
