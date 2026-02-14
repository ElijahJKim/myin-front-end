<script lang="ts">
	interface ModalProps {
		modalTitle: string;
		children: any;
		width?: string;
		height?: string;
		maxWidth?: string;
		maxHeight?: string;
		mobileMaxHeight?: string;
		tabletMaxHeight?: string;
		warning?: boolean;
		onClose?: () => void;
	}

	let {
		modalTitle,
		children,
		width,
		height,
		maxWidth,
		maxHeight,
		mobileMaxHeight = '90vh',
		tabletMaxHeight = '880px',
		onClose,
		warning,
	}: ModalProps = $props();

	const handleContainerClick = (e: MouseEvent) => {
		// 모달 콘텐츠 자체를 클릭했으면 닫지 않음
		if (e.target === e.currentTarget && onClose) {
			onClose();
		}
	};
</script>

<div class="modal-container" onclick={handleContainerClick}>
	<div
		class="modal-content"
		style="
				min-width: {width}; 

				--max-width: {maxWidth};
				height: {height}; 
				max-height: {maxHeight};
				
				--mobile-max-height: {mobileMaxHeight};
				--tablet-max-height: {tabletMaxHeight};
			"
	>
		<h1 class="modal-title {warning ? 'warning-text' : ''}">{modalTitle}</h1>

		{@render children()}
	</div>
</div>

<style lang="scss">
	.modal-container {
		position: fixed;
		z-index: 999;
		top: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 20px;

		background: rgb(30 30 31 / 30%);
	}

	.warning-text{
		color: #ff080c !important;
}

	.modal-content {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;

		width: 100%;
		max-width: var(--max-width, auto);
		max-height: var(--mobile-max-height, 90vh);
		padding: 30px 42px;
		border-radius: 18px;
		background-color: $gray-100;
		
		@include tablet-up {
			max-height: var(--tablet-max-height, 880px);
		}
	}

	.modal-title {
		@include text-heading-1-bold;
		flex-shrink: 0;
		color: $gray-900;
		text-align: center;

		@include tablet-up {
			@include text-title-2-bold;
		}
	}
</style>
