<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';
	import Icons from '../Icons.svelte';
	import { page } from '$app/stores'; 

	let { files = $bindable([]),onFileSelect } = $props();
	// 파일 입력 요소를 참조할 변수
	let fileInput = $state<HTMLInputElement>();


	let isShipmentPage = $derived($page.url.pathname.includes('/shipments'));
	let isDraftPage = $derived($page.url.pathname.includes('/uploaddraft'));
	let isFinalDraftPage = $derived($page.url.pathname.includes('/reviewfeedback'));

	let allowedConfig = $derived.by(() => {
        if (isDraftPage || isFinalDraftPage) {
            return {
                extensions: ['.avi', '.mp4', '.mov'],
                accept: '.avi, .mp4, .mov',
                label: 'AVI, MP4, MOV'
            };
        } else {
            // 기본값은 Shipment (이미지)
            return {
                extensions: ['.jpeg', '.jpg', '.png', '.heic'],
                accept: '.jpeg, .jpg, .png, .heic',
                label: 'JPEG, JPG, PNG, HEIC'
            };
        }
    });
	// 파일 크기 포맷팅 (예: 1.20MB)
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0.00MB';
		const mb = bytes / (1024 * 1024);
		return `${mb.toFixed(2)}MB`;
	};

	const validateFiles = (newFiles: FileList | File[]): File[] => {
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];
        const list = Array.isArray(newFiles) ? newFiles : Array.from(newFiles);

        list.forEach(file => {
            // 파일 이름의 끝부분(확장자)이 허용 목록에 있는지 대소문자 무시하고 확인
            const isMatch = allowedConfig.extensions.some(ext => 
                file.name.toLowerCase().endsWith(ext.toLowerCase())
            );

            if (isMatch) {
                validFiles.push(file);
            } else {
                invalidFiles.push(file.name);
            }
        });

        // 허용되지 않은 파일이 있으면 알림 (선택 사항)
        if (invalidFiles.length > 0) {
            alert(`${t('collab.invalid_file_type') || 'Invalid file type:'}\n${invalidFiles.join(', ')}`);
        }

        return validFiles;
    };

	const handleBoxClick = () => {
        fileInput?.click();
    };

    // 파일 선택 (Input)
    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            // 유효성 검사를 통과한 파일만 추가
            const validNewFiles = validateFiles(target.files);
            files = [...files, ...validNewFiles];
			if (validNewFiles.length > 0 && onFileSelect) {
                onFileSelect(validNewFiles);
            }
        }
        if (fileInput) fileInput.value = '';
    };

    // 드래그 앤 드롭
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            // 유효성 검사를 통과한 파일만 추가
            const validNewFiles = validateFiles(e.dataTransfer.files);
            files = [...files, ...validNewFiles];
			if (validNewFiles.length > 0 && onFileSelect) {
                onFileSelect(validNewFiles);
            }
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // 개별 파일 삭제
    const handleRemoveFile = (e: Event, index: number) => {
        e.stopPropagation();
        files = files.filter((_, i) => i !== index);
    };

    $inspect(files);
</script>

<div class="picture-file-upload-field-container">
    {#if isShipmentPage}
        <h2 class="picture-file-upload-field-title">{t('collab.picturefileupload_field_title')}</h2>

    {/if}

    <input
        type="file"
        accept={allowedConfig.accept} 
        multiple
        bind:this={fileInput}
        onchange={handleFileChange}
        style="display: none;"
    />

    <div
        class="picture-file-upload-field-placeholder-container"
        class:has-files={files.length > 0}
        ondrop={handleDrop}
        ondragover={handleDragOver}
        onclick={handleBoxClick}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && handleBoxClick()}
    >
        {#if files.length === 0}
            <p class="picture-file-upload-field-placeholder">
                {@html t('collab.picturefileupload_field_placeholder')}
            </p>
            <button class="picture-file-upload-field-button">
                {t('collab.picturefileupload_field_button')}
            </button>
            
            {#if isDraftPage || isFinalDraftPage}
                <p class="file-type-placeholder-2">{t('collab.uploaddraft_file_category')}</p>
            {:else}
                <p class="file-type-placeholder-2">{t('collab.picturefileupload_field_placeholder_2')}</p>
            {/if}

        {:else}
            <div class="file-list-wrapper">
                {#each files as file, index}
                    <div class="file-item">
                        <span class="file-name">{file.name}</span>
                        <div class="file-info-right">
                            <span class="file-size">{formatFileSize(file.size)}</span>
                            <button class="remove-button" onclick={(e) => handleRemoveFile(e, index)}>
                                <Icons name="close" width="20" height="20" color="#151515" />
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
   
</div>


<style lang="scss">
	.picture-file-upload-field-container {
		@include flex-column-center;
		gap: 10px;
		width: 100%;
		margin-top: 20px;
		margin-bottom: 30px;

		.picture-file-upload-field-title {
			@include text-headline-1-semibold;
			color: $gray-900;
		}

		.picture-file-upload-field-placeholder-container {
			@include flex-column-center;
			box-sizing: border-box;
			width: 310px;
			height: auto;

			min-height: 233px;

			padding: 20px;

			border: 2px dashed $primary-300;
			border-radius: 12px;
			background-color: $primary-0;
			cursor: pointer;
			transition: all 0.2s;

			&.has-files {
				justify-content: flex-start;
				border-style: dashed;
			}

			// [상태 1] 안내 문구 스타일
			.picture-file-upload-field-placeholder {
				@include text-caption-0-medium;
				margin-top: auto;
				color: $gray-800;
				text-align: center;
			}

			.picture-file-upload-field-button {
				margin-top: 24px;
				margin-bottom: auto;

				@include main-button('light', 'default');
				pointer-events: none;
			}

			.file-list-wrapper {
				display: flex;
				flex-direction: column;
				gap: 8px;
				width: 100%;

				.file-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					width: 100%;
					padding: 8px 0;
					border-bottom: 1px solid rgb(0 0 0 / 5%);

					.file-name {
						@include text-body-0-medium;
						overflow: hidden;
						max-width: 60%;
						color: $gray-900;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					.file-info-right {
						display: flex;
						align-items: center;
						gap: 10px;

						.file-size {
							@include text-caption-0-medium;
							color: $gray-400;
						}

						.remove-button {
							display: flex;
							justify-content: center;
							align-items: center;
							padding: 4px;
							border: none;
							border-radius: 50%;
							background: none;
							cursor: pointer;

							&:hover {
								background-color: rgb(0 0 0 / 10%);
							}
						}
					}
				}

				.add-more-hint {
					@include text-caption-0-medium;
					margin-top: 10px;
					color: $primary-400;
					text-align: center;
					opacity: 0.8;
				}
			}
		}

		.picture-file-upload-field-add-more-file-button {
			@include main-button('light', 'default');
		}
	}

	@include tablet-up {
		.picture-file-upload-field-container {
			gap: 30px;

			.picture-file-upload-field-title {
				@include text-title-0-semibold;
			}

			.picture-file-upload-field-placeholder-container {
				width: 440px;
				min-height: 330px;

				.picture-file-upload-field-placeholder {
					@include text-headline-0-semibold;
				}
			}
		}
	}
</style>
