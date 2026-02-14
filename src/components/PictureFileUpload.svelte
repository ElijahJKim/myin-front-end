<script lang="ts">
	import { uploadMultipleFiles } from '$lib/api/upload.ts';
	import { t } from '$lib/i18n-helper.ts';
	import type { UploadedFile, UploadFolder } from '../types/upload.ts';
	import Icons from './Icons.svelte';

	// Props 정의
	let {
		folder, // 어떤 폴더에 올릴지 (외부에서 주입)
		uploadedData = $bindable([]), // 업로드 완료된 데이터 (부모와 연동됨)
		title = '',
		placeholder = '',
		buttonText = '',
		addMoreText = '',
		showTitle = true
	} = $props<{
		folder: UploadFolder;
		uploadedData?: UploadedFile[];
		title?: string;
		placeholder?: string;
		buttonText?: string;
		addMoreText?: string;
		showTitle?: boolean;
	}>();

	// 기본값 처리 (i18n 또는 커스텀)
	const displayTitle = $derived(title || t('collab.picturefileupload_field_title'));
	const displayPlaceholder = $derived(placeholder || t('collab.picturefileupload_field_placeholder'));
	const displayButtonText = $derived(buttonText || t('collab.picturefileupload_field_button'));
	const displayAddMoreText = $derived(addMoreText || '+ 추가');

	let fileInput = $state<HTMLInputElement>();
	let isUploading = $state(false); // 로딩 상태

	// 파일 크기 포맷팅
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0.00MB';
		const mb = bytes / (1024 * 1024);
		return `${mb.toFixed(2)}MB`;
	};

	const handleBoxClick = () => {
		if (!isUploading) fileInput?.click();
	};

	// [핵심] 파일 선택 시 -> 즉시 S3 업로드 수행
	const handleFileChange = async (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			await processFiles(Array.from(target.files));
		}
		if (fileInput) fileInput.value = '';
	};

	const handleDrop = async (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			await processFiles(Array.from(e.dataTransfer.files));
		}
	};

	// 업로드 로직 통합
	const processFiles = async (newFiles: File[]) => {
		isUploading = true;
		try {
			// API 호출하여 S3 업로드
			const results = await uploadMultipleFiles(newFiles, folder);

			// 업로드된 결과를 기존 배열에 추가
			uploadedData = [...uploadedData, ...results];
		} catch (error) {
			alert('파일 업로드에 실패했습니다.');
		} finally {
			isUploading = false;
		}
	};

	const handleRemoveFile = (e: Event, index: number) => {
		e.stopPropagation();
		// 배열에서 해당 인덱스 제거 (Svelte 5 방식)
		uploadedData = uploadedData.filter((_, i) => i !== index);
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};
</script>

<div class="picture-file-upload-field-container">
	{#if showTitle}
		<h2 class="picture-file-upload-field-title">{displayTitle}</h2>
	{/if}

	<input
		type="file"
		accept="image/*, video/*"
		multiple
		bind:this={fileInput}
		onchange={handleFileChange}
		style="display: none;"
	/>

	<div
		class="picture-file-upload-field-placeholder-container"
		class:has-files={uploadedData.length > 0}
		ondrop={handleDrop}
		ondragover={handleDragOver}
		onclick={handleBoxClick}
	>
		{#if isUploading}
			<div class="uploading-indicator">
				<span>업로드 중...</span>
			</div>
		{:else if uploadedData.length === 0}
			<p class="picture-file-upload-field-placeholder">
				{@html displayPlaceholder}
			</p>
			<button class="picture-file-upload-field-button">
				{displayButtonText}
			</button>
		{:else}
			<div class="file-list-wrapper">
				{#each uploadedData as file, index}
					<div class="file-item">
						<span class="file-name">
							<a href={file.file_url} target="_blank" onclick={(e) => e.stopPropagation()}>
								{file.file_name}
							</a>
						</span>
						<div class="file-info-right">
							<span class="file-size">{formatFileSize(file.file_size)}</span>
							<button class="remove-button" onclick={(e) => handleRemoveFile(e, index)}>
								<Icons name="close" width="20" height="20" color="#151515" />
							</button>
						</div>
					</div>
				{/each}
				<div class="add-more-hint">{displayAddMoreText}</div>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.picture-file-upload-field-container {
		width: 100%;
	}

	.picture-file-upload-field-title {
		margin: 0 0 12px;
		color: #495057;
		font-size: 14px;
		font-weight: 500;
	}

	.picture-file-upload-field-placeholder-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 12px;
		min-height: 120px;
		padding: 24px;
		border: 2px dashed #dee2e6;
		border-radius: 8px;
		background: #fafafa;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			border-color: #1976d2;
			background: #f5f9ff;
		}

		&.has-files {
			padding: 16px;
			border-style: solid;
			border-color: #dee2e6;
			background: white;

			&:hover {
				border-color: #1976d2;
				background: #f5f9ff;
			}
		}
	}

	.picture-file-upload-field-placeholder {
		margin: 0;
		color: #868e96;
		font-size: 14px;
		text-align: center;
		line-height: 1.6;

		:global(h1) {
			margin: 0;
			font-size: 14px;
			font-weight: 400;
		}
	}

	.picture-file-upload-field-button {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		background: #1976d2;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;

		&:hover {
			background: #1565c0;
		}
	}

	.uploading-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		color: #1976d2;
		font-size: 14px;
		font-weight: 500;
	}

	.file-list-wrapper {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}

	.file-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		border: 1px solid #e9ecef;
		border-radius: 6px;
		background: #f8f9fa;
		transition: all 0.2s;

		&:hover {
			border-color: #1976d2;
			background: #f5f9ff;
		}
	}

	.file-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		a {
			color: #1976d2;
			font-size: 14px;
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}
		}
	}

	.file-info-right {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-left: 16px;
	}

	.file-size {
		color: #868e96;
		font-size: 13px;
		white-space: nowrap;
	}

	.remove-button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: #868e96;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			background: #fee2e2;
			color: #dc2626;
		}
	}

	.add-more-hint {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10px;
		border: 1px dashed #dee2e6;
		border-radius: 6px;
		background: transparent;
		color: #1976d2;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			border-color: #1976d2;
			background: #f5f9ff;
		}
	}
</style>
