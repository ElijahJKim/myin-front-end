<script lang="ts">
	import { onMount } from 'svelte';

	import type { Influencer } from '../../../../types/admin.js';
	import { influencersAPI } from '$lib/api/influencers.ts';
	import type { UploadedFile } from '../../../../types/upload.ts';
	import PictureFileUpload from '../../../../components/PictureFileUpload.svelte';
	import {
		influencersState,
		loadInfluencers as loadInfluencersFromStore,
		invalidateInfluencersCache
	} from '$lib/stores/admin.svelte.ts';

	// Store에서 데이터 참조
	let influencers = $derived(influencersState.data);
	let isLoading = $derived(influencersState.isLoading);
	let error = $derived(influencersState.error);



	// 페이지네이션
	let currentPage = $state(1);
	let itemsPerPage = 20;

	// 모달 상태
	let deleteModal = $state<{ show: boolean; influencer: Influencer | null }>({
		show: false,
		influencer: null
	});
	let editModal = $state<{ show: boolean; influencer: Influencer | null }>({
		show: false,
		influencer: null
	});
	let createModal = $state<{ show: boolean }>({ show: false });
	let isDeleting = $state(false);
	let isUpdating = $state(false);
	let isCreating = $state(false);
	let uploadedPhotos = $state<UploadedFile[]>([]);

	let idModal = $state<{ show: boolean; id: string | null }>({
        show: false,
        id: null
    });
    let idCopySuccess = $state(false);

	// 국가 및 플랫폼 옵션 (캠페인과 동일)
	const COUNTRY_OPTIONS = [
		{ label: '태국', value: 'thailand' },
		{ label: '베트남', value: 'vietnam' },
		{ label: '싱가포르', value: 'singapore' }
	];

	const PLATFORM_OPTIONS = [
		{ label: '틱톡', value: 'tiktok' },
		{ label: '인스타그램', value: 'instagram' },
		{ label: '유튜브', value: 'youtube' }
	];

	// 새 인플루언서 등록 폼 데이터
	let newInfluencer = $state({
		name: '',
		sns_id: '',
		email: '',
		messenger_id: '',
		nationality: [] as string[],
		residence_country: [] as string[],
		primary_languages: '',
		platforms: [] as string[],
		follower_counts: '',
		agency_name: '',
		desired_fee: '',
		secondary_use_free: false,
		secondary_use_conditions: '',
		reference_links: '',
		notes: ''
	});

	// 유효성 검사 에러
	let validationErrors = $state<Record<string, string>>({});

	let totalPages = $derived(Math.ceil(influencers.length / itemsPerPage));
	let paginatedInfluencers = $derived(
		influencers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	onMount(async () => {
		await loadInfluencersFromStore(); // 캐시가 유효하면 API 호출 안 함
	});

	// 강제 새로고침이 필요한 경우 (삭제, 수정, 등록 등)
	async function refreshInfluencers() {
		invalidateInfluencersCache();
		await loadInfluencersFromStore(true);

		// 페이지네이션 초기화
		if (currentPage > Math.ceil(influencers.length / itemsPerPage)) {
			currentPage = 1;
		}
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}

	function formatFollowerCounts(counts: Record<string, number>): string {
		return Object.entries(counts)
			.map(([platform, count]) => `${platform}: ${count.toLocaleString()}`)
			.join(', ');
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('ko-KR');
	}

	// 삭제 관련 함수
	function openDeleteModal(influencer: Influencer) {
		deleteModal = { show: true, influencer };
	}

	function closeDeleteModal() {
		deleteModal = { show: false, influencer: null };
	}

	async function confirmDelete() {
		if (!deleteModal.influencer) return;

		try {
			isDeleting = true;
			await influencersAPI.delete(deleteModal.influencer.id);
			await refreshInfluencers();
			closeDeleteModal();
		} catch (e) {
			alert('삭제에 실패했습니다: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
		} finally {
			isDeleting = false;
		}
	}

	// 수정 관련 함수
	function openEditModal(influencer: Influencer) {
		editModal = { show: true, influencer: { ...influencer } };
	}

	function closeEditModal() {
		editModal = { show: false, influencer: null };
	}

	async function confirmUpdate() {
		if (!editModal.influencer) return;

		try {
			isUpdating = true;
			const { id, created_at, updated_at, ...updateData } = editModal.influencer;
			await influencersAPI.update(id, updateData);
			await refreshInfluencers();
			closeEditModal();
		} catch (e) {
			alert('수정에 실패했습니다: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
		} finally {
			isUpdating = false;
		}
	}

	function updateEditField(field: string, value: any) {
		if (editModal.influencer) {
			editModal.influencer = { ...editModal.influencer, [field]: value };
		}
	}

	// 수정 모달용 토글 함수
	function toggleEditNationality(value: string) {
		if (!editModal.influencer) return;
		// 단일 선택
		if (editModal.influencer.nationality === value) {
			editModal.influencer = { ...editModal.influencer, nationality: '' };
		} else {
			editModal.influencer = { ...editModal.influencer, nationality: value };
		}
	}

	function toggleEditResidenceCountry(value: string) {
		if (!editModal.influencer) return;
		// 단일 선택
		if (editModal.influencer.residence_country === value) {
			editModal.influencer = { ...editModal.influencer, residence_country: '' };
		} else {
			editModal.influencer = { ...editModal.influencer, residence_country: value };
		}
	}

	function toggleEditPlatform(value: string) {
		if (!editModal.influencer) return;
		const platforms = editModal.influencer.platforms || [];
		if (platforms.includes(value)) {
			editModal.influencer = {
				...editModal.influencer,
				platforms: platforms.filter((v) => v !== value)
			};
		} else {
			editModal.influencer = {
				...editModal.influencer,
				platforms: [...platforms, value]
			};
		}
	}

	// 등록 관련 함수
	function openCreateModal() {
		createModal = { show: true };
		resetCreateForm();
	}

	function closeCreateModal() {
		createModal = { show: false };
		resetCreateForm();
	}

	function resetCreateForm() {
		newInfluencer = {
			name: '',
			sns_id: '',
			email: '',
			messenger_id: '',
			nationality: [],
			residence_country: [],
			primary_languages: '',
			platforms: [],
			follower_counts: '',
			agency_name: '',
			desired_fee: '',
			secondary_use_free: false,
			secondary_use_conditions: '',
			reference_links: '',
			notes: ''
		};
		uploadedPhotos = [];
		validationErrors = {};
	}

	// 체크박스 토글 함수
	function toggleNationality(value: string) {
		// 국적은 단일 선택만 허용
		if (newInfluencer.nationality.includes(value)) {
			newInfluencer.nationality = [];
		} else {
			newInfluencer.nationality = [value];
		}
	}

	function toggleResidenceCountry(value: string) {
		// 거주 국가도 단일 선택만 허용
		if (newInfluencer.residence_country.includes(value)) {
			newInfluencer.residence_country = [];
		} else {
			newInfluencer.residence_country = [value];
		}
	}

	function togglePlatform(value: string) {
		if (newInfluencer.platforms.includes(value)) {
			newInfluencer.platforms = newInfluencer.platforms.filter((v) => v !== value);
		} else {
			newInfluencer.platforms = [...newInfluencer.platforms, value];
		}
	}

	function validateCreateForm(): boolean {
		const errors: Record<string, string> = {};

		// 필수 필드 검증
		if (!newInfluencer.name.trim()) {
			errors.name = '이름은 필수입니다.';
		}
		if (!newInfluencer.sns_id.trim()) {
			errors.sns_id = 'SNS ID는 필수입니다.';
		}
		if (!newInfluencer.email.trim()) {
			errors.email = '이메일은 필수입니다.';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newInfluencer.email)) {
			errors.email = '올바른 이메일 형식이 아닙니다.';
		}
		if (newInfluencer.nationality.length === 0) {
			errors.nationality = '국적은 필수입니다.';
		}
		if (newInfluencer.residence_country.length === 0) {
			errors.residence_country = '거주 국가는 필수입니다.';
		}
		if (!newInfluencer.primary_languages.trim()) {
			errors.primary_languages = '언어는 필수입니다.';
		}
		if (newInfluencer.platforms.length === 0) {
			errors.platforms = '플랫폼은 필수입니다.';
		}
		if (!newInfluencer.follower_counts.trim()) {
			errors.follower_counts = '팔로워 수는 필수입니다.';
		}
		if (uploadedPhotos.length > 2) {
			// alert로 띄우거나 validationErrors에 넣을 수 있습니다. 여기선 alert 사용
			alert('사진은 최대 2장까지만 업로드 가능합니다.');
			return false;
		}

		validationErrors = errors;
		return Object.keys(errors).length === 0;
	}

	async function confirmCreate() {
		if (!validateCreateForm()) {
			return;
		}

		try {
			isCreating = true;

			// 문자열을 배열/객체로 변환
			const primaryLanguages = newInfluencer.primary_languages
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			const followerCounts: Record<string, number> = {};

			// 팔로워 수 파싱 (예: "Instagram: 150000, YouTube: 80000")
			newInfluencer.follower_counts.split(',').forEach((item) => {
				const [platform, count] = item.split(':').map((s) => s.trim());
				if (platform && count) {
					followerCounts[platform] = parseInt(count, 10) || 0;
				}
			});

			const referenceLinks = newInfluencer.reference_links
				? newInfluencer.reference_links
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: null;

			// 국적과 거주국가는 배열에서 첫 번째 값을 사용 (단일 선택 시) 또는 쉼표로 연결
			const nationality = newInfluencer.nationality.length > 0 ? newInfluencer.nationality[0] : '';
			const residence_country = newInfluencer.residence_country.length > 0 ? newInfluencer.residence_country[0] : '';
			const photoUrls = uploadedPhotos.map((file) => file.file_url);
			const photoFileKeys = uploadedPhotos.map((file) => file.file_key);

			const createData = {
				name: newInfluencer.name,
				sns_id: newInfluencer.sns_id,
				email: newInfluencer.email,
				messenger_id: newInfluencer.messenger_id || null,
				nationality: nationality,
				residence_country: residence_country,
				primary_languages: primaryLanguages,
				platforms: newInfluencer.platforms,
				follower_counts: followerCounts,
				agency_name: newInfluencer.agency_name || null,
				desired_fee: newInfluencer.desired_fee || null,
				secondary_use_free: newInfluencer.secondary_use_free,
				secondary_use_conditions: newInfluencer.secondary_use_conditions || null,
				reference_links: referenceLinks,
				notes: newInfluencer.notes || null,
				photo_url: photoUrls,
				photo_file_key: photoFileKeys
			};

			await influencersAPI.create(createData);
			await refreshInfluencers();
			closeCreateModal();
		} catch (e) {
			alert('등록에 실패했습니다: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
		} finally {
			isCreating = false;
		}
	}

	function openIdModal(id: string) {
        idModal = { show: true, id };
        idCopySuccess = false;
    }

    function closeIdModal() {
        idModal = { show: false, id: null };
        idCopySuccess = false;
    }

    async function copyIdToClipboard() {
        if (!idModal.id) return;

        try {
            await navigator.clipboard.writeText(idModal.id);
            idCopySuccess = true;
            setTimeout(() => {
                idCopySuccess = false;
            }, 2000);
        } catch (e) {
            alert('클립보드 복사에 실패했습니다.');
        }
    }
</script>

<div class="influencers-page">
	<div class="page-header">
		<div class="header-left">
			<h1>인플루언서 관리</h1>
			<p>총 {influencers.length}명</p>
		</div>
		<button class="create-btn" onclick={openCreateModal}>+ 인플루언서 등록</button>
	</div>

	{#if isLoading}
		<div class="loading">데이터를 불러오는 중...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if influencers.length === 0}
		<div class="empty">등록된 인플루언서가 없습니다.</div>
	{:else}
		<div class="table-container">
			<table class="influencers-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>이름</th>
						<th>SNS ID</th>
						<th>이메일</th>
						<th>메신저 ID</th>
						<th>국적</th>
						<th>거주 국가</th>
						<th>언어</th>
						<th>플랫폼</th>
						<th>팔로워 수</th>
						<th>에이전시</th>
						<th>희망 비용</th>
						<th>2차 사용</th>
						<th>2차 사용 조건</th>
						<th>참고 링크</th>
						<th>메모</th>
						<th>등록일</th>
						<th>수정일</th>
						<th>액션</th>
					</tr>
				</thead>
				<tbody>
					{#each paginatedInfluencers as influencer (influencer.id)}
						<tr>
							<td class="id-cell">
								<button
									class="id-view-btn"
									onclick={() => openIdModal(influencer.id)}
									title="ID 보기"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
										<circle cx="12" cy="12" r="3"></circle>
									</svg>
								</button>
							</td>
							<td>{influencer.name}</td>
							<td>{influencer.sns_id}</td>
							<td>{influencer.email}</td>
							<td>{influencer.messenger_id || '-'}</td>
							<td>{influencer.nationality}</td>
							<td>{influencer.residence_country}</td>
							<td>{influencer.primary_languages.join(', ')}</td>
							<td>{influencer.platforms.join(', ')}</td>
							<td>{formatFollowerCounts(influencer.follower_counts)}</td>
							<td>{influencer.agency_name || '-'}</td>
							<td>{influencer.desired_fee || '-'}</td>
							<td class={influencer.secondary_use_free ? 'free' : 'paid'}>
								{influencer.secondary_use_free ? '무료' : '유료'}
							</td>
							<td>{influencer.secondary_use_conditions || '-'}</td>
							<td class="links-cell">
								{#if influencer.reference_links && influencer.reference_links.length > 0}
									{#each influencer.reference_links as link, i}
										<a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
										{#if i < influencer.reference_links.length - 1}<br />{/if}
									{/each}
								{:else}
									-
								{/if}
							</td>
							<td>{influencer.notes || '-'}</td>
							<td>{formatDate(influencer.created_at)}</td>
							<td>{formatDate(influencer.updated_at)}</td>
							<td class="action-cell">
								<button class="edit-btn" onclick={() => openEditModal(influencer)}>수정</button>
								<button class="delete-btn" onclick={() => openDeleteModal(influencer)}>삭제</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if totalPages > 1}
			<div class="pagination">
				<button
					class="page-btn"
					disabled={currentPage === 1}
					onclick={() => goToPage(currentPage - 1)}
				>
					이전
				</button>

				<div class="page-numbers">
					{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
						<button
							class="page-number {page === currentPage ? 'active' : ''}"
							onclick={() => goToPage(page)}
						>
							{page}
						</button>
					{/each}
				</div>

				<button
					class="page-btn"
					disabled={currentPage === totalPages}
					onclick={() => goToPage(currentPage + 1)}
				>
					다음
				</button>
			</div>
		{/if}
	{/if}
</div>

<!-- 삭제 확인 모달 -->
{#if deleteModal.show && deleteModal.influencer}
	<div class="modal-overlay" onclick={closeDeleteModal}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h2>인플루언서 삭제</h2>
			<p>정말로 <strong>{deleteModal.influencer.sns_id}</strong>님을 삭제하시겠습니까?</p>
			<p class="warning">이 작업은 되돌릴 수 없습니다.</p>
			<div class="modal-actions">
				<button class="cancel-btn" onclick={closeDeleteModal} disabled={isDeleting}>취소</button>
				<button class="confirm-delete-btn" onclick={confirmDelete} disabled={isDeleting}>
					{isDeleting ? '삭제 중...' : '삭제'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- 수정 모달 -->
{#if editModal.show && editModal.influencer}
	<div class="modal-overlay" onclick={closeEditModal}>
		<div class="modal edit-modal" onclick={(e) => e.stopPropagation()}>
			<h2>인플루언서 수정</h2>
			<div class="modal-content">
				<div class="form-row">
					<label>이름 <span class="required">*</span>:</label>
					<input type="text" bind:value={editModal.influencer.name} placeholder="이름" />
				</div>

				<div class="form-row">
					<label>SNS ID <span class="required">*</span>:</label>
					<input type="text" bind:value={editModal.influencer.sns_id} placeholder="SNS ID" />
				</div>

				<div class="form-row">
					<label>이메일 <span class="required">*</span>:</label>
					<input type="email" bind:value={editModal.influencer.email} placeholder="example@email.com" />
				</div>

				<div class="form-row">
					<label>메신저 ID:</label>
					<input
						type="text"
						bind:value={editModal.influencer.messenger_id}
						placeholder="메신저 ID (선택사항)"
					/>
				</div>

				<div class="form-row">
					<label>국적 <span class="required">*</span>:</label>
					<div class="checkbox-group">
						{#each COUNTRY_OPTIONS as option}
							<label class="checkbox-item">
								<input
									type="checkbox"
									checked={editModal.influencer.nationality === option.value}
									onchange={() => toggleEditNationality(option.value)}
								/>
								<span>{option.label}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="form-row">
					<label>거주 국가 <span class="required">*</span>:</label>
					<div class="checkbox-group">
						{#each COUNTRY_OPTIONS as option}
							<label class="checkbox-item">
								<input
									type="checkbox"
									checked={editModal.influencer.residence_country === option.value}
									onchange={() => toggleEditResidenceCountry(option.value)}
								/>
								<span>{option.label}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="form-row">
					<label>언어 <span class="required">*</span>:</label>
					<input
						type="text"
						value={editModal.influencer.primary_languages?.join(', ') || ''}
						oninput={(e) => updateEditField('primary_languages', e.currentTarget.value.split(',').map(s => s.trim()).filter(Boolean))}
						placeholder="쉼표로 구분 (예: Korean, English)"
					/>
				</div>

				<div class="form-row">
					<label>플랫폼(SNS) <span class="required">*</span>:</label>
					<div class="checkbox-group">
						{#each PLATFORM_OPTIONS as option}
							<label class="checkbox-item">
								<input
									type="checkbox"
									checked={editModal.influencer.platforms?.includes(option.value) || false}
									onchange={() => toggleEditPlatform(option.value)}
								/>
								<span>{option.label}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="form-row">
					<label>팔로워 수 <span class="required">*</span>:</label>
					<input
						type="text"
						value={Object.entries(editModal.influencer.follower_counts || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
						oninput={(e) => {
							const counts: Record<string, number> = {};
							e.currentTarget.value.split(',').forEach((item) => {
								const [platform, count] = item.split(':').map(s => s.trim());
								if (platform && count) counts[platform] = parseInt(count, 10) || 0;
							});
							updateEditField('follower_counts', counts);
						}}
						placeholder="플랫폼: 숫자 형식 (예: tiktok: 150000, youtube: 80000)"
					/>
				</div>

				<div class="form-row">
					<label>에이전시:</label>
					<input
						type="text"
						bind:value={editModal.influencer.agency_name}
						placeholder="에이전시 이름 (선택사항)"
					/>
				</div>

				<div class="form-row">
					<label>희망 비용:</label>
					<input
						type="text"
						bind:value={editModal.influencer.desired_fee}
						placeholder="예: 1000-2000 USD (선택사항)"
					/>
				</div>

				<div class="form-row">
					<label>2차 사용 조건:</label>
					<input
						type="text"
						bind:value={editModal.influencer.secondary_use_conditions}
						placeholder="2차 사용 조건 (선택사항)"
					/>
				</div>

				<div class="form-row">
					<label>참고 링크:</label>
					<input
						type="text"
						value={editModal.influencer.reference_links?.join(', ') || ''}
						oninput={(e) => updateEditField('reference_links', e.currentTarget.value.split(',').map(s => s.trim()).filter(Boolean))}
						placeholder="쉼표로 구분 (예: https://instagram.com/..., https://youtube.com/...)"
					/>
				</div>

				<div class="form-row">
					<label>메모:</label>
					<textarea bind:value={editModal.influencer.notes} placeholder="메모 (선택사항)" rows="3"
					></textarea>
				</div>

				<div class="form-row checkbox-row">
					<label>
						<input type="checkbox" bind:checked={editModal.influencer.secondary_use_free} />
						2차 사용 무료
					</label>
				</div>
			</div>
			<div class="modal-actions">
				<button class="cancel-btn" onclick={closeEditModal} disabled={isUpdating}>취소</button>
				<button class="confirm-update-btn" onclick={confirmUpdate} disabled={isUpdating}>
					{isUpdating ? '수정 중...' : '수정'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- 등록 모달 -->
{#if createModal.show}
	<div class="modal-overlay" onclick={closeCreateModal}>
		<div class="modal create-modal" onclick={(e) => e.stopPropagation()}>
			<h2>인플루언서 등록</h2>
			<div class="modal-content">
				<div class="form-row">
					<label>프로필 사진 (최대 2장):</label>
					<PictureFileUpload
						folder="influencers/photos"
						bind:uploadedData={uploadedPhotos}
						showTitle={false}
						placeholder="프로필 사진을 드래그하거나 선택해주세요"
						buttonText="사진 선택"
						addMoreText="+ 사진 추가"
					/>
					{#if uploadedPhotos.length > 2}
						<span class="error-message">사진은 최대 2장까지만 선택해주세요.</span>
					{/if}
				</div>
				<div class="form-row">
					<label>이름 <span class="required">*</span>:</label>
					<input
						type="text"
						bind:value={newInfluencer.name}
						placeholder="이름"
						class={validationErrors.name ? 'error' : ''}
					/>
					{#if validationErrors.name}
						<span class="error-message">{validationErrors.name}</span>
					{/if}
				</div>

				<div class="form-row">
					<label>SNS ID <span class="required">*</span>:</label>
					<input
						type="text"
						bind:value={newInfluencer.sns_id}
						placeholder="SNS ID"
						class={validationErrors.sns_id ? 'error' : ''}
					/>
					{#if validationErrors.sns_id}
						<span class="error-message">{validationErrors.sns_id}</span>
					{/if}
				</div>

				<div class="form-row">
					<label>이메일 <span class="required">*</span>:</label>
					<input
						type="email"
						bind:value={newInfluencer.email}
						placeholder="example@email.com"
						class={validationErrors.email ? 'error' : ''}
					/>
					{#if validationErrors.email}
						<span class="error-message">{validationErrors.email}</span>
					{/if}
				</div>

				<div class="form-row">
					<label>메신저 ID:</label>
					<input
						type="text"
						bind:value={newInfluencer.messenger_id}
						placeholder="메신저 ID (선택사항)"
					/>
				</div>

				<div class="form-row">
					<label>국적 <span class="required">*</span>:</label>
					<div class="checkbox-group {validationErrors.nationality ? 'error' : ''}">
						{#each COUNTRY_OPTIONS as option}
							<label class="checkbox-item">
								<input
									type="checkbox"
									checked={newInfluencer.nationality.includes(option.value)}
									onchange={() => toggleNationality(option.value)}
								/>
								<span>{option.label}</span>
							</label>
						{/each}
					</div>
					{#if validationErrors.nationality}
						<span class="error-message">{validationErrors.nationality}</span>
					{/if}
				</div>

				<div class="form-row">
					<label>거주 국가 <span class="required">*</span>:</label>
					<div class="checkbox-group {validationErrors.residence_country ? 'error' : ''}">
						{#each COUNTRY_OPTIONS as option}
							<label class="checkbox-item">
								<input
									type="checkbox"
									checked={newInfluencer.residence_country.includes(option.value)}
									onchange={() => toggleResidenceCountry(option.value)}
								/>
								<span>{option.label}</span>
							</label>
						{/each}
					</div>
					{#if validationErrors.residence_country}
						<span class="error-message">{validationErrors.residence_country}</span>
					{/if}
				</div>

				<div class="form-row">
					<label>언어 <span class="required">*</span>:</label>
					<input
						type="text"
						bind:value={newInfluencer.primary_languages}
						placeholder="쉼표로 구분 (예: Korean, English)"
						class={validationErrors.primary_languages ? 'error' : ''}
					/>
					{#if validationErrors.primary_languages}
						<span class="error-message">{validationErrors.primary_languages}</span>
					{/if}
				</div>

				<div class="form-row">
					<label>플랫폼(SNS) <span class="required">*</span>:</label>
					<div class="checkbox-group {validationErrors.platforms ? 'error' : ''}">
						{#each PLATFORM_OPTIONS as option}
							<label class="checkbox-item">
								<input
									type="checkbox"
									checked={newInfluencer.platforms.includes(option.value)}
									onchange={() => togglePlatform(option.value)}
								/>
								<span>{option.label}</span>
							</label>
						{/each}
					</div>
					{#if validationErrors.platforms}
						<span class="error-message">{validationErrors.platforms}</span>
					{/if}
				</div>

				<div class="form-row">
					<label>팔로워 수 <span class="required">*</span>:</label>
					<input
						type="text"
						bind:value={newInfluencer.follower_counts}
						placeholder="플랫폼: 숫자 형식 (예: Instagram: 150000, YouTube: 80000)"
						class={validationErrors.follower_counts ? 'error' : ''}
					/>
					{#if validationErrors.follower_counts}
						<span class="error-message">{validationErrors.follower_counts}</span>
					{/if}
				</div>

				<div class="form-row">
					<label>에이전시:</label>
					<input
						type="text"
						bind:value={newInfluencer.agency_name}
						placeholder="에이전시 이름 (선택사항)"
					/>
				</div>

				<div class="form-row">
					<label>희망 비용:</label>
					<input
						type="text"
						bind:value={newInfluencer.desired_fee}
						placeholder="예: 1000-2000 USD (선택사항)"
					/>
				</div>

				<div class="form-row">
					<label>2차 사용 조건:</label>
					<input
						type="text"
						bind:value={newInfluencer.secondary_use_conditions}
						placeholder="2차 사용 조건 (선택사항)"
					/>
				</div>

				<div class="form-row">
					<label>참고 링크:</label>
					<input
						type="text"
						bind:value={newInfluencer.reference_links}
						placeholder="쉼표로 구분 (예: https://instagram.com/..., https://youtube.com/...)"
					/>
				</div>

				<div class="form-row">
					<label>메모:</label>
					<textarea bind:value={newInfluencer.notes} placeholder="메모 (선택사항)" rows="3"
					></textarea>
				</div>

				<div class="form-row checkbox-row">
					<label>
						<input type="checkbox" bind:checked={newInfluencer.secondary_use_free} />
						2차 사용 무료
					</label>
				</div>
			</div>
			<div class="modal-actions">
				<button class="cancel-btn" onclick={closeCreateModal} disabled={isCreating}>취소</button>
				<button class="confirm-create-btn" onclick={confirmCreate} disabled={isCreating}>
					{isCreating ? '등록 중...' : '등록'}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if idModal.show && idModal.id}
    <div class="modal-overlay" onclick={closeIdModal}>
        <div class="modal id-modal" onclick={(e) => e.stopPropagation()}>
            <h2>인플루언서 ID</h2>
            <div class="id-display">
                <p class="id-text">{idModal.id}</p>
            </div>

            <div class="modal-actions">
                <button class="cancel-btn" onclick={closeIdModal}>닫기</button>
                <button class="copy-btn" onclick={copyIdToClipboard}>
                    {idCopySuccess ? '복사됨!' : '클립보드 복사'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
	.influencers-page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 30px;
	}

	.page-header {
		display: flex;
		flex-shrink: 0;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;

		.header-left {
			h1 {
				margin: 0 0 8px;
				color: #1e1e2d;
				font-size: 28px;
				font-weight: bold;
			}

			p {
				margin: 0;
				color: #666;
				font-size: 14px;
			}
		}

		.create-btn {
			padding: 10px 20px;
			border: none;
			border-radius: 6px;
			background: #1976d2;
			color: white;
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			transition: background 0.2s;
			white-space: nowrap;

			&:hover {
				background: #1565c0;
			}
		}
	}

	.loading,
	.error,
	.empty {
		padding: 40px;
		border-radius: 8px;
		background: white;
		color: #666;
		text-align: center;
	}

	.error {
		background: #fee;
		color: #c33;
	}

	.table-container {
		flex: 1;
		overflow: auto;
		min-height: 0;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
		background: white;
	}

	.influencers-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;

		thead {
			position: sticky;
			z-index: 10;
			top: 0;
			background: #f8f9fa;

			tr th {
				position: sticky;
				top: 0;
				padding: 16px 12px;
				border-bottom: 2px solid #dee2e6;
				background: #f8f9fa;
				color: #495057;
				font-weight: 600;
				text-align: center;
				white-space: nowrap;
			}
		}

		tbody tr {
			border-bottom: 1px solid #e9ecef;
			transition: background-color 0.15s;

			&:hover {
				background-color: #f8f9fa;
			}

			td {
				overflow: hidden;
				max-width: 300px;
				padding: 12px;
				color: #212529;
				white-space: nowrap;
				text-overflow: ellipsis;
				text-align: center;
				vertical-align: middle;

				&.free {
					color: #4caf50;
					font-weight: 500;
				}

				&.paid {
					color: #ff9800;
					font-weight: 500;
				}

				&.links-cell {
					white-space: normal;
					max-width: 200px;

					a {
						color: #1976d2;
						font-size: 13px;
						text-decoration: none;

						&:hover {
							text-decoration: underline;
						}
					}
				}

				&.action-cell {
					white-space: nowrap;

					button {
						margin-right: 4px;
						padding: 6px 12px;
						border: none;
						border-radius: 4px;
						font-size: 12px;
						font-weight: 500;
						cursor: pointer;
						transition: all 0.2s;

						&.edit-btn {
							background: #4caf50;
							color: white;

							&:hover {
								background: #45a049;
							}
						}

						&.delete-btn {
							background: #f44336;
							color: white;

							&:hover {
								background: #da190b;
							}
						}
					}
				}
			}
		}
	}

	.pagination {
		display: flex;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		gap: 10px;
		padding: 20px 0;

		.page-btn {
			padding: 8px 16px;
			border: 1px solid #dee2e6;
			border-radius: 6px;
			background: white;
			color: #495057;
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.2s;

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}

			&:hover:not(:disabled) {
				background: #e9ecef;
			}
		}

		.page-numbers {
			display: flex;
			gap: 5px;
		}

		.page-number {
			min-width: 36px;
			height: 36px;
			padding: 0 8px;
			border: 1px solid #dee2e6;
			border-radius: 6px;
			background: white;
			color: #495057;
			font-size: 14px;
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				background: #e9ecef;
			}

			&.active {
				border-color: #1976d2;
				background: #1976d2;
				color: white;
			}
		}
	}

	// 모달 스타일
	.modal-overlay {
		position: fixed;
		z-index: 1000;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgb(0 0 0 / 50%);
	}

	.modal {
		width: 90%;
		max-width: 500px;
		padding: 30px;
		border-radius: 12px;
		box-shadow: 0 10px 40px rgb(0 0 0 / 20%);
		background: white;

		h2 {
			margin: 0 0 20px;
			color: #1e1e2d;
			font-size: 24px;
		}

		& > p {
			margin: 0 0 10px;
			color: #666;
			font-size: 16px;

			&.warning {
				color: #ff4757;
				font-weight: 500;
			}

			strong {
				color: #1e1e2d;
			}
		}

		&.edit-modal {
			overflow-y: auto;
			max-width: 600px;
			max-height: 80vh;
		}
	}

	.modal-content {
		margin-bottom: 20px;
	}

	.form-row {
		margin-bottom: 16px;

		label {
			display: block;
			margin-bottom: 6px;
			color: #495057;
			font-size: 14px;
			font-weight: 500;
		}

		textarea {
			resize: vertical;
			font-family: inherit;
		}

		input,
		textarea {
			box-sizing: border-box;
			width: 100%;
			padding: 10px 12px;
			border: 1px solid #dee2e6;
			border-radius: 6px;
			font-size: 14px;
			transition: border-color 0.2s;

			&:focus {
				border-color: #1976d2;
				outline: none;
			}
		}

		&.checkbox-row {
			display: flex;
			align-items: center;

			label {
				display: flex;
				align-items: center;
				margin: 0;
				cursor: pointer;

				input[type='checkbox'] {
					width: auto;
					margin-right: 8px;
					cursor: pointer;
				}
			}
		}
	}

	// 체크박스 그룹 스타일
	.checkbox-group {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		padding: 10px;
		border: 1px solid #dee2e6;
		border-radius: 6px;
		background: #fafafa;

		&.error {
			border-color: #f44336;
		}

		.checkbox-item {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 6px 12px;
			border: 1px solid #dee2e6;
			border-radius: 4px;
			background: white;
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				border-color: #1976d2;
				background: #e3f2fd;
			}

			input[type='checkbox'] {
				width: auto;
				margin: 0;
				cursor: pointer;
			}

			span {
				font-size: 14px;
				color: #495057;
			}
		}
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 24px;

		button {
			padding: 10px 20px;
			border: none;
			border-radius: 6px;
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.2s;

			&:disabled {
				opacity: 0.6;
				cursor: not-allowed;
			}
		}

		.cancel-btn {
			background: #e9ecef;
			color: #495057;

			&:hover:not(:disabled) {
				background: #dee2e6;
			}
		}

		.confirm-delete-btn {
			background: #f44336;
			color: white;

			&:hover:not(:disabled) {
				background: #da190b;
			}
		}

		.confirm-update-btn {
			background: #4caf50;
			color: white;

			&:hover:not(:disabled) {
				background: #45a049;
			}
		}

		.confirm-create-btn {
			background: #1976d2;
			color: white;

			&:hover:not(:disabled) {
				background: #1565c0;
			}
		}
	}

	// 등록 모달 추가 스타일
	.create-modal {
		overflow-y: auto;
		max-width: 600px;
		max-height: 80vh;
	}

	// 필수 필드 표시
	.required {
		color: #f44336;
		font-weight: bold;
	}

	// Validation 에러 메시지
	.error-message {
		display: block;
		margin-top: 4px;
		color: #f44336;
		font-size: 12px;
		font-weight: 500;
	}

	// 에러가 있는 입력 필드
	input.error,
	textarea.error {
		border-color: #f44336;

		&:focus {
			border-color: #f44336;
			box-shadow: 0 0 0 3px rgb(244 67 54 / 10%);
		}
	}

	.id-cell {
		display: flex;
		justify-content: center;
		align-items: center;

		.id-view-btn {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 32px;
			height: 32px;
			padding: 0;
			border: 1px solid #dee2e6;
			border-radius: 6px;
			background: #f8f9fa;
			color: #666;
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				background: #e9ecef;
				color: #1976d2;
				border-color: #1976d2;
			}
		}
	}

	.id-modal {
		max-width: 450px;

		.id-display {
			margin: 20px 0;
			padding: 15px;
			border-radius: 6px;
			background-color: #f8f9fa;
			border: 1px solid #dee2e6;

			.id-text {
				margin: 0;
				color: #1976d2;
				font-size: 14px;
				font-family: monospace;
				word-break: break-all;
				line-height: 1.6;
				text-align: center;
			}
		}
	}

	.modal-actions {
		.copy-btn {
			background: #28a745;
			color: white;

			&:hover:not(:disabled) {
				background: #218838;
			}
		}
	}
</style>
