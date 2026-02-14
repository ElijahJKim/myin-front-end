<script lang="ts">
	import Icons from '../Icons.svelte';

	// Svelte 5: 양방향 바인딩을 위해 $bindable 사용
	let { currPage = $bindable(), totalPages } = $props();
</script>

<div class="matching-page-container">
	<h1 class="matching-page-number">{currPage}/{totalPages}</h1>
	<div class="matching-page-button-container">
		<button onclick={() => (currPage = currPage - 1)} disabled={currPage === 1}>
			<Icons name="arrow_left" width="24" height="24" color="currentColor" />
		</button>
		<button onclick={() => (currPage = currPage + 1)} disabled={currPage === totalPages}>
			<Icons name="arrow_right" width="24" height="24" color="currentColor" />
		</button>
	</div>
</div>

<style lang="scss">
	.matching-page-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		box-sizing: border-box;
		width: 100%;
		padding: 0 10px;

		.matching-page-number {
			@include text-caption-0-semibold;
			color: $gray-600;
		}

		.matching-page-button-container {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 20px;
			width: 80px; // GridView 너비 기준 통일
			height: 45px; // GridView 높이 기준 통일 (필요시 조정)
			padding: 10px 15px;
			border-radius: 90px;
			background-color: $gray-800;
			color: $gray-0;

			button {
				display: flex; /* 아이콘 정렬 위해 추가 */
				justify-content: center;
				align-items: center;
				border: none;
				border-radius: 50%;
				outline: none;
				background-color: transparent;
				cursor: pointer;

				&:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}
			}
		}
	}

	@include tablet-up {
		.matching-page-container {
			justify-content: flex-end;
			max-width: none;
			margin-right: 150px;

			.matching-page-number {
				@include text-heading-0-semibold;
				margin-right: 20px;
			}
		}
	}
</style>
