<script lang="ts">
	import Icons from './Icons.svelte';

	interface Props {
		checked: boolean; // 체크 여부 (필수)
		onclick?: () => void; // 클릭 시 실행할 함수 (필수)
		disabled?: boolean;
		class?: string; // 추가 스타일링용 클래스 (선택)
	}

	let { checked, onclick, class: className = '', disabled = false }: Props = $props();
</script>

<button type="button" class="select-btn {checked ? 'active' : ''} {className}" {onclick} {disabled}>
	{#if checked}
		<Icons name="check_mark" width="20" height="20" color="currentColor" />
	{/if}
</button>

<style lang="scss">
	.select-btn {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 24px;
		height: 24px;
		padding: 0;
		border: 1px solid $gray-400;
		border-radius: 4px;
		background-color: transparent;
		cursor: pointer;

		&.active {
			background-color: $gray-900;
			color: $gray-0;
		}
	}

	.select-text {
		@include text-body-0-semibold;
		color: $gray-800;
	}
</style>
