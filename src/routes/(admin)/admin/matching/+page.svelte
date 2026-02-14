<script lang="ts">
	import { onMount } from 'svelte';
	import { matchingAPI } from '$lib/api/matching.ts';
	import {
		campaignsState,
		influencersState,
		matchingState,
		loadCampaigns,
		loadInfluencers,
		loadAllMatches as loadAllMatchesFromStore,
		refreshCampaignMatches
	} from '$lib/stores/admin.svelte.ts';

	// Store에서 데이터 참조
	let campaigns = $derived(campaignsState.data);
	let influencers = $derived(influencersState.data);
	let matchesMap = $derived(matchingState.matchesMap);

	// 로딩 상태 (Store의 로딩 상태 조합)
	let isLoading = $derived(
		campaignsState.isLoading || influencersState.isLoading || matchingState.isLoading
	);

	// UI 상태
	let expandedCampaignId = $state<string | null>(null); // 현재 열려있는 캠페인 ID
	let loadingMatches = $state(false); // 매칭 정보 로딩 중

	// 모달 관련
	let createModal = $state({ show: false });
	let isCreating = $state(false);
	let selectedCampaignId = $state<string | null>(null);
	let selectedInfluencerIds = $state<string[]>([]);
	let campaignSearch = $state('');
	let influencerSearch = $state('');

	// ID 보기 모달 관련
	let idModal = $state<{ show: boolean; id: string | null; type: string }>({
		show: false,
		id: null,
		type: ''
	});
	let idCopySuccess = $state(false);

	// 선택된 캠페인 객체
	let selectedCampaign = $derived(campaigns.find((c) => c.id === selectedCampaignId) || null);

	// 파생된 상태 (검색)
	let filteredCampaigns = $derived(
		campaigns.filter(
			(c) =>
				c.brand_name.toLowerCase().includes(campaignSearch.toLowerCase()) ||
				c.product_name.toLowerCase().includes(campaignSearch.toLowerCase())
		)
	);

	// 선택된 캠페인 기준으로 인플루언서 필터링
	let filteredInfluencers = $derived(() => {
		let result = influencers;

		// 캠페인이 선택되면 타겟 국가 기준 필터링
		if (selectedCampaign) {
			const targetCountries = selectedCampaign.target_countries || [];
			const targetPlatforms = selectedCampaign.platforms || [];

			if (targetCountries.length > 0) {
				result = result.filter(
					(i) =>
						// 인플루언서의 국적 또는 거주국이 타겟 국가에 포함되는지 확인
						targetCountries.includes(i.nationality) || targetCountries.includes(i.residence_country)
				);
			}

			// 캠페인의 플랫폼 필터 (선택사항 - 하나라도 일치하면 OK)
			if (targetPlatforms.length > 0) {
				result = result.filter((i) => i.platforms.some((p) => targetPlatforms.includes(p)));
			}
		}

		// 검색어 필터
		if (influencerSearch.trim()) {
			const search = influencerSearch.toLowerCase();
			result = result.filter(
				(i) =>
					(i.sns_id || '').toLowerCase().includes(search) ||
					(i.email || '').toLowerCase().includes(search)
			);
		}

		return result;
	});

	onMount(async () => {
		await loadInitialData();
	});

	async function loadInitialData() {
		// 캠페인, 인플루언서, 매칭 데이터 병렬 로드 (캐시가 유효하면 API 호출 안 함)
		await Promise.all([loadCampaigns(), loadInfluencers()]);
		await loadAllMatchesFromStore();
	}
	// ✅ 캠페인 클릭 시 매칭 정보 로드 (아코디언 토글)
	async function toggleRow(campaignId: string) {
		if (expandedCampaignId === campaignId) {
			// 이미 열려있으면 닫기
			expandedCampaignId = null;
			return;
		}

		expandedCampaignId = campaignId;

		// 이미 불러온 적이 없다면 API 호출
		if (!matchesMap[campaignId]) {
			try {
				loadingMatches = true;
				await refreshCampaignMatches(campaignId);
			} catch (e) {
				console.error(e);
			} finally {
				loadingMatches = false;
			}
		}
	}

	// --- 모달 관련 함수들 (기존과 동일, 일부 생략) ---
	function openCreateModal() {
		selectedCampaignId = null;
		selectedInfluencerIds = [];
		campaignSearch = '';
		influencerSearch = '';
		createModal.show = true;
	}

	function closeCreateModal() {
		createModal.show = false;
	}

	function selectCampaign(campaignId: string) {
		if (selectedCampaignId !== campaignId) {
			selectedCampaignId = campaignId;
			selectedInfluencerIds = []; // 캠페인 변경 시 인플루언서 선택 초기화
			influencerSearch = ''; // 검색어도 초기화
		}
	}

	function toggleInfluencerSelection(id: string) {
		if (selectedInfluencerIds.includes(id)) {
			selectedInfluencerIds = selectedInfluencerIds.filter((i) => i !== id);
		} else {
			selectedInfluencerIds = [...selectedInfluencerIds, id];
		}
	}

	async function confirmCreate() {
		if (!selectedCampaignId || selectedInfluencerIds.length === 0) {
			alert('캠페인과 인플루언서를 선택해주세요.');
			return;
		}
		try {
			isCreating = true;
			const result = await matchingAPI.createMatching(selectedCampaignId, selectedInfluencerIds);
			console.log('클라이언트에서 받은 데이터:', result);
			alert('매칭 생성 완료');

			// ⭐️ 매칭 생성 후, 해당 캠페인의 매칭 목록을 강제로 다시 불러옴
			await refreshCampaignMatches(selectedCampaignId);
			expandedCampaignId = selectedCampaignId; // 해당 캠페인을 열어서 보여줌

			closeCreateModal();
		} catch (e) {
			alert('실패: ' + (e instanceof Error ? e.message : '오류'));
		} finally {
			isCreating = false;
		}
	}

	function formatDate(dateString: string) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('ko-KR');
	}

	// ID 모달 관련 함수
	function openIdModal(id: string, type: string, event: MouseEvent) {
		event.stopPropagation(); // 행 클릭 이벤트 전파 방지
		idModal = { show: true, id, type };
		idCopySuccess = false;
	}

	function closeIdModal() {
		idModal = { show: false, id: null, type: '' };
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

<div class="page-container">
	<div class="page-header">
		<div class="header-left">
			<h1>매칭 관리 (캠페인별)</h1>
			<p>총 {campaigns.length}개의 캠페인</p>
		</div>
		<button class="create-btn" onclick={openCreateModal}>+ 새 매칭 만들기</button>
	</div>

	{#if isLoading}
		<div class="loading">로딩 중...</div>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th style="width: 50px;"></th>
						<th>캠페인 ID</th>
						<th>브랜드</th>
						<th>제품명</th>
						<th>담당자</th>
						<th>등록일</th>
						<th>매칭 상태</th>
					</tr>
				</thead>
				<tbody>
					{#each campaigns as campaign (campaign.id)}
						{@const isExpanded = expandedCampaignId === campaign.id}

						<tr
							class="main-row {isExpanded ? 'expanded' : ''}"
							onclick={() => toggleRow(campaign.id)}
						>
							<td class="toggle-cell">
								<span class="arrow {isExpanded ? 'open' : ''}">▶</span>
							</td>
							<td class="id-cell">
								<button
									class="id-view-btn"
									onclick={(e) => openIdModal(campaign.id, '캠페인', e)}
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
							<td class="brand">{campaign.brand_name}</td>
							<td class="product">{campaign.product_name}</td>
							<td>{campaign.manager_name || '-'}</td>
							<td>{formatDate(campaign.created_at)}</td>
							<td>
								{#if matchesMap[campaign.id]}
									<span class="count-badge">{matchesMap[campaign.id].length}명 매칭됨</span>
								{:else}
									<span class="count-badge gray">조회 대기</span>
								{/if}
							</td>
						</tr>

						{#if isExpanded}
							<tr class="detail-row">
								<td colspan="7">
									<div class="detail-content">
										<h4>매칭된 인플루언서 목록</h4>

										{#if loadingMatches}
											<div class="mini-loading">인플루언서 목록을 불러오는 중...</div>
										{:else if matchesMap[campaign.id] && matchesMap[campaign.id].length > 0}
											<table class="sub-table">
												<thead>
													<tr>
														<th>매칭 ID</th>
														<th>이름</th>
														<th>국적</th>
														<th>언어</th>
														<th>플랫폼</th>
														<th>2차 사용</th>
														<th>상태</th>
														<th>매칭일</th>
													</tr>
												</thead>
												<tbody>
													{#each matchesMap[campaign.id] as match}
														{@const profile = match.influencer_profile}
														<tr>
															<td class="id-cell">
																<button
																	class="id-view-btn"
																	onclick={(e) => openIdModal(match.match_id, '매칭', e)}
																	title="매칭 ID 보기"
																>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		width="14"
																		height="14"
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
															<td class="name-cell"><strong>{profile?.name || '-'}</strong></td>
															<td>{profile?.nationality || '-'}</td>
															<td>
																{#if profile?.primary_languages?.length > 0}
																	{profile.primary_languages.join(', ')}
																{:else}
																	-
																{/if}
															</td>
															<td class="platform-cell">
																{#if profile?.platforms?.length > 0}
																	<div class="platform-tags">
																		{#each profile.platforms as platform}
																			<span class="platform-badge">
																				{platform}
																				{#if profile.follower_counts && profile.follower_counts[platform]}
																					<span class="follower-count">
																						{profile.follower_counts[platform].toLocaleString()}
																					</span>
																				{/if}
																			</span>
																		{/each}
																	</div>
																{:else}
																	-
																{/if}
															</td>
															<td>
																<span class="secondary-use {profile?.secondary_use_free ? 'free' : 'paid'}">
																	{profile?.secondary_use_free ? '무료' : '유료'}
																</span>
															</td>
															<td>
																<span class="status-pill {match.status?.toLowerCase()}">
																	{match.status || 'PENDING'}
																</span>
															</td>
															<td>{formatDate(match.created_at)}</td>
														</tr>
													{/each}
												</tbody>
											</table>
										{:else}
											<div class="no-data">아직 매칭된 인플루언서가 없습니다.</div>
										{/if}
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if idModal.show && idModal.id}
	<div class="modal-overlay" onclick={closeIdModal}>
		<div class="modal id-modal" onclick={(e) => e.stopPropagation()}>
			<h2>{idModal.type} ID</h2>
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

{#if createModal.show}
	<div class="modal-overlay" onclick={closeCreateModal}>
		<div class="modal create-matching-modal" onclick={(e) => e.stopPropagation()}>
			<h2>새 매칭 만들기</h2>

			<div class="modal-body">
				<!-- 캠페인 선택 섹션 -->
				<div class="section campaign-section">
					<h3>1. 캠페인 선택 <span class="required">*</span></h3>
					<input
						type="text"
						class="search-input"
						placeholder="브랜드명 또는 제품명 검색..."
						bind:value={campaignSearch}
					/>
					<div class="list-container">
						{#each filteredCampaigns as campaign (campaign.id)}
							<label class="campaign-item {selectedCampaignId === campaign.id ? 'selected' : ''}">
								<input
									type="radio"
									name="campaign"
									value={campaign.id}
									checked={selectedCampaignId === campaign.id}
									onchange={() => selectCampaign(campaign.id)}
								/>
								<div class="campaign-info">
									<div class="campaign-header">
										<span class="brand-name">{campaign.brand_name}</span>
										<span class="product-name">{campaign.product_name}</span>
									</div>
									<div class="campaign-meta">
										<div class="meta-row">
											<span class="meta-label">타겟 국가</span>
											<div class="tag-list">
												{#each campaign.target_countries || [] as country}
													<span class="tag country-tag">{country}</span>
												{/each}
												{#if !campaign.target_countries || campaign.target_countries.length === 0}
													<span class="tag empty-tag">미지정</span>
												{/if}
											</div>
										</div>
										<div class="meta-row">
											<span class="meta-label">SNS</span>
											<div class="tag-list">
												{#each campaign.platforms || [] as platform}
													<span class="tag platform-tag">{platform}</span>
												{/each}
												{#if !campaign.platforms || campaign.platforms.length === 0}
													<span class="tag empty-tag">미지정</span>
												{/if}
											</div>
										</div>
									</div>
								</div>
							</label>
						{/each}
						{#if filteredCampaigns.length === 0}
							<div class="no-result">검색 결과가 없습니다.</div>
						{/if}
					</div>
				</div>

				<!-- 인플루언서 선택 섹션 -->
				<div class="section influencer-section">
					<h3>2. 인플루언서 선택 <span class="required">*</span></h3>
					<input
						type="text"
						class="search-input"
						placeholder="SNS ID 또는 이메일 검색..."
						bind:value={influencerSearch}
					/>
					<div class="selection-header">
						<span class="filtered-count">
							{#if selectedCampaign}
								필터링: {filteredInfluencers().length}명
							{:else}
								전체: {influencers.length}명 (캠페인을 먼저 선택하세요)
							{/if}
						</span>
						<span class="selected-count">선택: {selectedInfluencerIds.length}명</span>
					</div>
					<div class="list-container">
						{#if !selectedCampaign}
							<div class="no-result">캠페인을 먼저 선택해주세요.</div>
						{:else}
							{#each filteredInfluencers() as influencer (influencer.id)}
								<label
									class="influencer-item {selectedInfluencerIds.includes(influencer.id)
										? 'selected'
										: ''}"
								>
									<input
										type="checkbox"
										checked={selectedInfluencerIds.includes(influencer.id)}
										onchange={() => toggleInfluencerSelection(influencer.id)}
									/>
									<div class="influencer-info">
										<div class="influencer-title">
											<span class="influencer-name">{influencer.name}</span>
										</div>
										<div class="influencer-details">
											<div class="detail-row">
												<span class="detail-label">SNS ID</span>
												<span class="detail-value sns-id-value">{influencer.sns_id}</span>
											</div>
											<div class="detail-row">
												<span class="detail-label">이메일</span>
												<span class="detail-value">{influencer.email}</span>
											</div>
											<div class="detail-row">
												<span class="detail-label">국적</span>
												<span class="detail-value">
													{influencer.nationality}
													{#if influencer.residence_country && influencer.residence_country !== influencer.nationality}
														<span class="residence">(거주: {influencer.residence_country})</span>
													{/if}
												</span>
											</div>
											<div class="detail-row">
												<span class="detail-label">플랫폼</span>
												<div class="platform-tags">
													{#each influencer.platforms as platform}
														<span class="platform-tag-item">
															{platform}
															{#if influencer.follower_counts && influencer.follower_counts[platform]}
																<span class="follower-num">
																	{influencer.follower_counts[platform].toLocaleString()}
																</span>
															{/if}
														</span>
													{/each}
												</div>
											</div>
										</div>
									</div>
								</label>
							{/each}
							{#if filteredInfluencers().length === 0}
								<div class="no-result">
									조건에 맞는 인플루언서가 없습니다.
									<br />
									<small>타겟 국가: {selectedCampaign.target_countries?.join(', ') || '없음'}</small
									>
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="modal-actions">
				<button class="cancel-btn" onclick={closeCreateModal} disabled={isCreating}>취소</button>
				<button
					class="confirm-create-btn"
					onclick={confirmCreate}
					disabled={isCreating || !selectedCampaignId || selectedInfluencerIds.length === 0}
				>
					{isCreating ? '매칭 생성 중...' : `매칭 생성 (${selectedInfluencerIds.length}명)`}
				</button>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	// ----------------------------------------------------------------
	// 1. 공통 변수 및 유틸리티 (이전 스타일 대체)
	// ----------------------------------------------------------------
	$primary-color: #1976d2;
	$primary-hover: #1565c0;
	$text-dark: #1e1e2d;
	$text-gray: #666;
	$border-color: #dee2e6;
	$bg-light: #f8f9fa;
	$white: #fff;

	// ----------------------------------------------------------------
	// 2. 페이지 레이아웃
	// ----------------------------------------------------------------
	.page-container {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 30px;
		background-color: #f5f7fb; // 전체 배경색 살짝 회색
	}

	.page-header {
		display: flex;
		flex-shrink: 0;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;

		.header-left h1 {
			margin: 0 0 8px;
			color: $text-dark;
			font-size: 28px;
			font-weight: bold;
		}

		.header-left p {
			margin: 0;
			color: $text-gray;
			font-size: 14px;
		}

		.create-btn {
			padding: 10px 20px;
			border: none;
			border-radius: 6px;
			background: $primary-color;
			color: $white;
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			transition: background 0.2s;

			&:hover {
				background: $primary-hover;
			}
		}
	}

	// 로딩 및 빈 상태
	.loading,
	.empty {
		padding: 40px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
		background: $white;
		color: $text-gray;
		text-align: center;
	}

	// ----------------------------------------------------------------
	// 3. 메인 테이블 (아코디언 구조)
	// ----------------------------------------------------------------
	.table-container {
		flex: 1;
		overflow: auto;
		min-height: 0;
		margin-top: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
		background: $white;

		table {
			width: 100%;
			border-collapse: collapse;
			font-size: 14px;

			// 헤더 고정
			thead {
				position: sticky;
				z-index: 10;
				top: 0;
				background: $bg-light;

				th {
					position: sticky;
					top: 0;
					padding: 16px 12px;
					border-bottom: 2px solid $border-color;
					background: $bg-light;
					color: #495057;
					font-weight: 600;
					text-align: center;
					white-space: nowrap;
				}
			}

			tbody {
				// 1. 메인 행 (캠페인) 스타일
				.main-row {
					border-bottom: 1px solid #e9ecef;
					cursor: pointer;
					transition: background-color 0.2s;

					&:hover {
						background-color: #f1f3f5;
					}

					// 펼쳐졌을 때 스타일 (배경색 변경 & 하단 보더 제거)
					&.expanded {
						border-bottom: none;
						background-color: #e3f2fd;
						font-weight: 500;
					}

					td {
						padding: 14px 12px;
						color: $text-dark;
						text-align: center;
						vertical-align: middle;
					}

					.brand {
						color: $primary-color;
						font-weight: 600;
					}

					// 화살표 아이콘 회전 애니메이션
					.toggle-cell {
						width: 40px;
						text-align: center;
					}

					.arrow {
						display: inline-block;
						color: $text-gray;
						font-size: 12px;
						transition: transform 0.2s ease;

						&.open {
							transform: rotate(90deg); // 펼쳐지면 90도 회전
						}
					}

					// 매칭 수 뱃지
					.count-badge {
						display: inline-block;
						padding: 4px 10px;
						border-radius: 12px;
						background-color: #d1e7dd;
						color: #0f5132;
						font-size: 11px;
						font-weight: 600;

						&.gray {
							background-color: #e9ecef;
							color: $text-gray;
						}
					}
				}

				// 2. 상세 행 (아코디언 내용) 스타일
				.detail-row {
					background-color: #fafbfc;

					td {
						padding: 0;
						border-bottom: 2px solid $border-color;
					}

					.detail-content {
						padding: 24px 32px;

						h4 {
							margin: 0 0 20px;
							padding-left: 12px;
							border-left: 4px solid $primary-color;
							color: #333;
							font-size: 15px;
							font-weight: 600;
						}
					}
				}
			}
		}
	}

	// ----------------------------------------------------------------
	// 서브 테이블 (매칭된 인플루언서 목록) 스타일
	// ----------------------------------------------------------------
	.sub-table {
		width: 100%;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background-color: $white;
		font-size: 13px;
		border-spacing: 0;
		border-collapse: separate;
		overflow: hidden;

		thead tr th {
			padding: 14px 16px !important;
			border-bottom: 2px solid #e0e0e0;
			background-color: #f5f5f5;
			color: #333;
			font-size: 12px;
			font-weight: 600;
			text-align: center;
			white-space: nowrap;
			letter-spacing: -0.3px;
		}

		tbody tr td {
			padding: 16px 14px !important;
			border-bottom: 1px solid #f0f0f0;
			color: #555;
			font-size: 13px;
			text-align: center;
			vertical-align: middle;
		}

		tbody tr:last-child td {
			border-bottom: none;
		}

		tbody tr {
			transition: background-color 0.15s ease;

			&:hover {
				background-color: #fafafa;
			}
		}

		.name-cell {
			color: $text-dark;
			font-size: 14px;

			strong {
				font-weight: 600;
			}
		}

		.platform-cell {
			.platform-tags {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				gap: 6px;

				.platform-badge {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					padding: 5px 10px;
					border-radius: 6px;
					background: #f0f4f8;
					color: #495057;
					font-size: 12px;
					font-weight: 500;

					.follower-count {
						padding-left: 6px;
						border-left: 1px solid #d0d7de;
						color: $primary-color;
						font-weight: 600;
					}
				}
			}
		}

		.secondary-use {
			display: inline-block;
			padding: 4px 12px;
			border-radius: 4px;
			font-size: 12px;
			font-weight: 600;

			&.free {
				background-color: #e8f5e9;
				color: #2e7d32;
			}

			&.paid {
				background-color: #fff3e0;
				color: #e65100;
			}
		}
	}

	// 상태 표시 뱃지 (Pill 모양)
	.status-pill {
		display: inline-block;
		padding: 5px 12px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.3px;

		&.pending {
			background-color: #fef3c7;
			color: #92400e;
		}

		&.recommended {
			background-color: #dbeafe;
			color: #1e40af;
		}

		&.selected,
		&.accepted,
		&.approved {
			background-color: #d1fae5;
			color: #065f46;
		}

		&.completed {
			background-color: #cffafe;
			color: #155e75;
		}

		&.rejected,
		&.declined {
			background-color: #fee2e2;
			color: #991b1b;
		}
	}

	// 로딩 및 데이터 없음 메시지
	.mini-loading,
	.no-data {
		padding: 30px;
		border: 1px solid $border-color;
		border-radius: 6px;
		background: $white;
		color: $text-gray;
		text-align: center;
	}

	// ----------------------------------------------------------------
	// 5. 모달 스타일 (2단 분할 레이아웃)
	// ----------------------------------------------------------------
	.modal-overlay {
		position: fixed;
		z-index: 1000;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgb(0 0 0 / 50%);
		backdrop-filter: blur(2px);
	}

	.modal {
		padding: 30px;
		border-radius: 12px;
		box-shadow: 0 10px 40px rgb(0 0 0 / 20%);
		background: $white;

		&.create-matching-modal {
			display: flex;
			flex-direction: column;
			width: 90%;
			max-width: 900px; // 넓은 모달
			height: 80vh; // 화면 높이의 80%
		}

		h2 {
			margin: 0 0 20px;
			color: $text-dark;
			font-size: 20px;
		}
	}

	.modal-body {
		display: flex;
		flex: 1;
		gap: 20px;
		overflow: hidden; // 내부 섹션별 스크롤을 위해

		.section {
			display: flex;
			flex-direction: column;
			flex: 1;
			padding: 15px;
			border: 1px solid $border-color;
			border-radius: 8px;
			background: #fafafa;

			h3 {
				margin: 0 0 10px;
				color: $text-dark;
				font-size: 15px;

				.required {
					margin-left: 2px;
					color: #e74c3c;
				}
			}

			.search-input {
				box-sizing: border-box;
				width: 100%;
				margin-bottom: 10px;
				padding: 10px;
				border: 1px solid $border-color;
				border-radius: 6px;
				font-size: 13px;

				&:focus {
					border-color: $primary-color;
					outline: none;
				}
			}

			// 리스트 영역 (스크롤 가능)
			.list-container {
				flex: 1;
				overflow-y: auto;
				border: 1px solid $border-color;
				border-radius: 6px;
				background: $white;
			}

			.list-item {
				display: flex;
				align-items: center;
				padding: 12px;
				border-bottom: 1px solid #f1f3f5;
				cursor: pointer;
				transition: background 0.15s;

				&:hover {
					background: #f8f9fa;
				}

				// 선택된 상태 스타일
				&.selected {
					border-left: 3px solid $primary-color;
					background: #e3f2fd;
				}

				input {
					margin-right: 12px;
					cursor: pointer;
				}

				.item-info {
					display: flex;
					flex-direction: column;
					gap: 2px;

					.main-text {
						color: $text-dark;
						font-size: 14px;
						font-weight: 600;
					}

					.sub-text {
						color: $text-gray;
						font-size: 12px;
					}
				}
			}
		}
	}

	// 캠페인 아이템 스타일
	.campaign-item {
		display: flex;
		align-items: flex-start;
		padding: 14px;
		border-bottom: 1px solid #f1f3f5;
		cursor: pointer;
		transition: background 0.15s;

		&:hover {
			background: #f8f9fa;
		}

		&.selected {
			border-left: 3px solid $primary-color;
			background: #e3f2fd;
		}

		input[type='radio'] {
			margin-right: 12px;
			margin-top: 4px;
			cursor: pointer;
		}

		.campaign-info {
			flex: 1;

			.campaign-header {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 8px;
				margin-bottom: 8px;

				.brand-name {
					color: $primary-color;
					font-size: 14px;
					font-weight: 600;
				}

				.product-name {
					color: $text-dark;
					font-size: 13px;
				}
			}

			.campaign-meta {
				display: flex;
				flex-direction: column;
				gap: 6px;

				.meta-row {
					display: flex;
					align-items: center;
					gap: 8px;

					.meta-label {
						flex-shrink: 0;
						width: 60px;
						color: $text-gray;
						font-size: 11px;
						font-weight: 500;
					}

					.tag-list {
						display: flex;
						flex-wrap: wrap;
						gap: 4px;
					}
				}
			}
		}
	}

	// 태그 스타일
	.tag {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;

		&.country-tag {
			background: #e8f5e9;
			color: #2e7d32;
		}

		&.platform-tag {
			background: #e3f2fd;
			color: #1565c0;
		}

		&.empty-tag {
			background: #f5f5f5;
			color: #9e9e9e;
		}
	}

	// 인플루언서 아이템 스타일
	.influencer-item {
		display: flex;
		align-items: flex-start;
		padding: 14px 16px;
		border-bottom: 1px solid #e9ecef;
		cursor: pointer;
		transition: background 0.15s;

		&:hover {
			background: #f8f9fa;
		}

		&.selected {
			border-left: 3px solid $primary-color;
			background: #e3f2fd;
		}

		input[type='checkbox'] {
			flex-shrink: 0;
			margin-right: 14px;
			margin-top: 2px;
			width: 16px;
			height: 16px;
			cursor: pointer;
		}

		.influencer-info {
			flex: 1;
			min-width: 0;

			.influencer-title {
				margin-bottom: 10px;

				.influencer-name {
					color: $text-dark;
					font-size: 15px;
					font-weight: 600;
				}
			}

			.influencer-details {
				display: flex;
				flex-direction: column;
				gap: 6px;
				padding: 10px 12px;
				border-radius: 6px;
				background: #f8f9fa;

				.detail-row {
					display: flex;
					align-items: flex-start;
					gap: 12px;
					font-size: 12px;
					line-height: 1.4;

					.detail-label {
						flex-shrink: 0;
						width: 45px;
						color: #868e96;
						font-weight: 500;
					}

					.detail-value {
						flex: 1;
						color: #495057;
						word-break: break-all;

						&.sns-id-value {
							color: $primary-color;
							font-weight: 500;
						}

						.residence {
							margin-left: 4px;
							color: #868e96;
						}
					}

					.platform-tags {
						display: flex;
						flex-wrap: wrap;
						gap: 5px;

						.platform-tag-item {
							display: inline-flex;
							align-items: center;
							gap: 4px;
							padding: 2px 8px;
							border-radius: 4px;
							background: #e9ecef;
							color: #495057;
							font-size: 11px;
							font-weight: 500;

							.follower-num {
								padding-left: 5px;
								border-left: 1px solid #ced4da;
								color: $primary-color;
								font-weight: 600;
							}
						}
					}
				}
			}
		}
	}

	// 선택 헤더 스타일
	.selection-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;

		.filtered-count {
			color: $text-gray;
			font-size: 12px;
		}

		.selected-count {
			color: $primary-color;
			font-size: 12px;
			font-weight: 600;
		}
	}

	// 필터 정보 스타일
	.filter-info {
		color: #666;
		font-size: 12px;
		font-weight: 400;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 20px;

		button {
			padding: 10px 20px;
			border: none;
			border-radius: 6px;
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			transition: opacity 0.2s;

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

		.confirm-create-btn {
			background: $primary-color;
			color: $white;

			&:hover:not(:disabled) {
				background: $primary-hover;
			}
		}
	}

	.no-result {
		padding: 30px;
		color: $text-gray;
		font-size: 13px;
		text-align: center;
	}

	// ID 보기 버튼 및 모달 스타일
	.id-cell {
		display: flex;
		justify-content: center;
		align-items: center;

		.id-view-btn {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 28px;
			height: 28px;
			padding: 0;
			border: 1px solid $border-color;
			border-radius: 6px;
			background: $bg-light;
			color: $text-gray;
			cursor: pointer;
			transition: all 0.2s;

			&:hover {
				background: #e9ecef;
				color: $primary-color;
				border-color: $primary-color;
			}
		}
	}

	.id-modal {
		max-width: 450px;

		h2 {
			margin: 0 0 20px;
			color: $text-dark;
			font-size: 20px;
		}

		.id-display {
			margin: 20px 0;
			padding: 15px;
			border-radius: 6px;
			background-color: $bg-light;
			border: 1px solid $border-color;

			.id-text {
				margin: 0;
				color: $primary-color;
				font-size: 14px;
				font-family: monospace;
				word-break: break-all;
				line-height: 1.6;
				text-align: center;
			}
		}

		.copy-btn {
			background: #28a745;
			color: $white;

			&:hover:not(:disabled) {
				background: #218838;
			}
		}
	}
</style>
