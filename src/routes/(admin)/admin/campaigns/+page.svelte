<script lang="ts">
	import { onMount } from 'svelte';
	import type { GetCampaignData } from '../../../../types/campaign.js';
	import { campaignsAPI } from '$lib/api/campaigns.ts';
	import {
		campaignsState,
		loadCampaigns as loadCampaignsFromStore,
		invalidateCampaignsCache
	} from '$lib/stores/admin.svelte.ts';

	// Store에서 데이터 참조
	let campaigns = $derived(campaignsState.data);
	let isLoading = $derived(campaignsState.isLoading);
	let error = $derived(campaignsState.error);

	let currentPage = $state(1);
	let itemsPerPage = 20;

	let approveModal = $state<{ show: boolean; campaign: GetCampaignData | null }>({
		show: false,
		campaign: null
	});
	let isApproving = $state(false);

	let tokenUrlModal = $state<{ show: boolean; url: string | null }>({
		show: false,
		url: null
	});
	let copySuccess = $state(false);

	// ID 보기 모달 관련
	let idModal = $state<{ show: boolean; id: string | null }>({
		show: false,
		id: null
	});
	let idCopySuccess = $state(false);

	let totalPages = $derived(Math.ceil(campaigns.length / itemsPerPage));
	let paginatedCampaigns = $derived(
		campaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	onMount(async () => {
		await loadCampaignsFromStore(); // 캐시가 유효하면 API 호출 안 함
	});

	// 강제 새로고침이 필요한 경우 (삭제, 승인 등)
	async function refreshCampaigns() {
		invalidateCampaignsCache();
		await loadCampaignsFromStore(true);

		// 페이지네이션 초기화
		if (currentPage > Math.ceil(campaigns.length / itemsPerPage)) {
			currentPage = 1;
		}
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}

	function formatDate(dateString: string): string {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('ko-KR');
	}

	// 상태에 따른 뱃지 스타일
	function getStatusClass(status: string) {
		switch (status?.toLowerCase()) {
			case 'pending':
				return 'status-pending';
			case 'approved':
			case 'searching':
				return 'status-approved';
			case 'declined':
				return 'status-declined';
			case 'completed':
				return 'status-completed';
			default:
				return '';
		}
	}

	function openApproveModal(campaign: GetCampaignData) {
		approveModal = { show: true, campaign };
	}

	function closeApproveModal() {
		approveModal = { show: false, campaign: null };
	}

	async function confirmApprove() {
		if (!approveModal.campaign) return;

		try {
			isApproving = true;

			// 1. 현재 브라우저의 도메인 주소를 가져옵니다.
			// (예: 로컬이면 http://localhost:5173, 배포하면 https://your-domain.com)
			const currentBaseUrl = window.location.origin;

			// 2. API 호출 (ID와 URL을 함께 전달)
			await campaignsAPI.getCampaignApprove(approveModal.campaign.id, currentBaseUrl);

			// 3. 목록 새로고침 및 모달 닫기
			await refreshCampaigns();
			closeApproveModal();
			alert('캠페인이 성공적으로 승인되었습니다.');
		} catch (e) {
			alert('승인에 실패했습니다: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
		} finally {
			isApproving = false;
		}
	}

	async function deleteCampaign(id: string) {
		try {
			await campaignsAPI.deleteCampaign(id);
			await refreshCampaigns();
		} catch (e) {
			alert('삭제에 실패했습니다: ' + (e instanceof Error ? e.message : '알 수 없는 오류'));
		}
	}

	// 토큰 URL 모달 관련 함수
	function openTokenUrlModal(url: string) {
		tokenUrlModal = { show: true, url };
		copySuccess = false;
	}

	function closeTokenUrlModal() {
		tokenUrlModal = { show: false, url: null };
		copySuccess = false;
	}

	async function copyToClipboard() {
		if (!tokenUrlModal.url) return;

		try {
			await navigator.clipboard.writeText(tokenUrlModal.url);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (e) {
			alert('클립보드 복사에 실패했습니다.');
		}
	}

	// ID 모달 관련 함수
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

<div class="dashboard-page">
	<div class="page-header">
		<div class="header-left">
			<h1>캠페인 관리</h1>
			<p>총 {campaigns.length}개</p>
		</div>
	</div>

	{#if isLoading}
		<div class="loading">데이터를 불러오는 중...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if campaigns.length === 0}
		<div class="empty">등록된 캠페인이 없습니다.</div>
	{:else}
		<div class="table-container">
			<table class="data-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>상태</th>
						<th>브랜드명</th>
						<th>제품명</th>
						<th>타겟 국가</th>
						<th>플랫폼</th>
						<th>담당자</th>
						<th>연락처</th>
						<th>등록일</th>
						<th>업로드 희망일</th>
						<th>토큰 URL</th>
						<th>액션</th>
						<th>삭제</th>
					</tr>
				</thead>
				<tbody>
					{#each paginatedCampaigns as campaign (campaign.id)}
						<tr>
							<td class="id-cell">
								<button
									class="id-view-btn"
									onclick={() => openIdModal(campaign.id)}
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
							<td>
								<span class="status-badge {getStatusClass(campaign.status)}">
									{campaign.status || 'PENDING'}
								</span>
							</td>
							<td class="bold-text">{campaign.brand_name}</td>
							<td>{campaign.product_name}</td>
							<td>
								{Array.isArray(campaign.target_countries)
									? campaign.target_countries.join(', ')
									: campaign.target_countries}
							</td>
							<td>
								{Array.isArray(campaign.platforms)
									? campaign.platforms.join(', ')
									: campaign.platforms}
							</td>
							<td>{campaign.manager_name || '-'}</td>
							<td>{campaign.manager_phone || '-'}</td>
							<td>{formatDate(campaign.created_at)}</td>
							<td>{campaign.upload_deadline || '-'}</td>
							<td class="token-url-cell">
								{#if campaign.token_url}
									<button
										class="token-view-btn"
										onclick={() => openTokenUrlModal(campaign.token_url)}
									>
										보기
									</button>
								{:else}
									<span class="no-token">-</span>
								{/if}
							</td>
							<td class="action-cell">
								{#if campaign.status === 'pending' || !campaign.status}
									<button class="approve-btn" onclick={() => openApproveModal(campaign)}>
										승인
									</button>
								{:else}
									<span class="action-text">-</span>
								{/if}
							</td>
							<td>
								<button class="delete-btn" onclick={() => deleteCampaign(campaign.id)}>삭제</button>
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

{#if approveModal.show && approveModal.campaign}
	<div class="modal-overlay" onclick={closeApproveModal}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h2>캠페인 승인</h2>
			<p>
				<strong>{approveModal.campaign.brand_name}</strong>의
				<strong>{approveModal.campaign.product_name}</strong> 캠페인을 승인하시겠습니까?
			</p>
			<p class="info">승인 후에는 인플루언서 매칭 프로세스가 시작됩니다.</p>

			<div class="modal-actions">
				<button class="cancel-btn" onclick={closeApproveModal} disabled={isApproving}>
					취소
				</button>
				<button class="confirm-approve-btn" onclick={confirmApprove} disabled={isApproving}>
					{isApproving ? '승인 중...' : '승인 확인'}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if tokenUrlModal.show && tokenUrlModal.url}
	<div class="modal-overlay" onclick={closeTokenUrlModal}>
		<div class="modal token-url-modal" onclick={(e) => e.stopPropagation()}>
			<h2>토큰 URL</h2>
			<div class="url-display">
				<p class="url-text">{tokenUrlModal.url}</p>
			</div>

			<div class="modal-actions">
				<button class="cancel-btn" onclick={closeTokenUrlModal}> 닫기 </button>
				<button class="copy-btn" onclick={copyToClipboard}>
					{copySuccess ? '복사됨!' : '클립보드 복사'}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if idModal.show && idModal.id}
	<div class="modal-overlay" onclick={closeIdModal}>
		<div class="modal id-modal" onclick={(e) => e.stopPropagation()}>
			<h2>캠페인 ID</h2>
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
	// --- 스타일은 인플루언서 페이지와 동일하게 유지하되, 일부 클래스명만 조정 ---

	.dashboard-page {
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

		// create-btn 스타일은 필요시 유지
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

	.data-table {
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

				&.bold-text {
					font-weight: 600;
				}

				.status-badge {
					display: inline-block;
					padding: 4px 8px;
					border-radius: 4px;
					font-size: 12px;
					font-weight: 600;

					&.status-pending {
						background-color: #fff3cd;
						color: #856404;
					}

					&.status-approved {
						background-color: #d4edda;
						color: #155724;
					}

					&.status-declined {
						background-color: #f8d7da;
						color: #721c24;
					}

					&.status-completed {
						background-color: #cce5ff;
						color: #004085;
					}
				}

				&.token-url-cell {
					.token-view-btn {
						padding: 6px 12px;
						border: none;
						border-radius: 4px;
						background: #e3f2fd;
						color: #1976d2;
						font-size: 12px;
						font-weight: 500;
						cursor: pointer;
						transition: all 0.2s;

						&:hover {
							background: #bbdefb;
							color: #1565c0;
						}
					}

					.no-token {
						color: #aaa;
					}
				}

				&.action-cell {
					.approve-btn {
						padding: 6px 12px;
						border: none;
						border-radius: 4px;
						background: #1976d2; // 메인 블루 컬러
						color: white;
						font-size: 12px;
						font-weight: 500;
						cursor: pointer;
						transition: all 0.2s;

						&:hover {
							background: #1565c0;
						}
					}

					.action-text {
						color: #aaa;
					}
				}

				.delete-btn {
					padding: 6px 12px;
					border: none;
					border-radius: 4px;
					background: #dc3545;
					color: white;
					font-size: 12px;
					font-weight: 500;
					cursor: pointer;
					transition: all 0.2s;

					&:hover {
						background: #c82333;
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

			&:hover:not(:disabled) {
				background: #e9ecef;
			}

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
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
		max-width: 450px;
		padding: 30px;
		border-radius: 12px;
		box-shadow: 0 10px 40px rgb(0 0 0 / 20%);
		background: white;

		h2 {
			margin: 0 0 20px;
			color: #1e1e2d;
			font-size: 24px;
		}

		p {
			margin: 0 0 10px;
			color: #444;
			font-size: 16px;
			line-height: 1.5;

			&.info {
				margin-top: 15px;
				padding: 10px;
				border-radius: 6px;
				background-color: #f8f9fa;
				color: #666;
				font-size: 14px;
			}

			strong {
				color: #1e1e2d;
				font-weight: 600;
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

			.confirm-approve-btn {
				background: #1976d2;
				color: white;

				&:hover:not(:disabled) {
					background: #1565c0;
				}
			}

			.copy-btn {
				background: #28a745;
				color: white;

				&:hover:not(:disabled) {
					background: #218838;
				}
			}
		}
	}

	.token-url-modal {
		max-width: 600px;

		.url-display {
			margin: 20px 0;
			padding: 15px;
			border-radius: 6px;
			background-color: #f8f9fa;
			border: 1px solid #dee2e6;

			.url-text {
				margin: 0;
				color: #1976d2;
				font-size: 14px;
				font-family: monospace;
				word-break: break-all;
				line-height: 1.6;
			}
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
</style>
