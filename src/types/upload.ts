// S3 업로드 폴더 종류 (백엔드 Enum과 일치시킴)
export type UploadFolder =
	| 'influencers/photos'
	| 'content/draft'
	| 'content/final'
	| 'shipments/invoices';

// 업로드 완료 후 가질 데이터 구조
export interface UploadedFile {
	file_name: string; // 원본 파일명
	file_url: string; // S3 URL (이미지 미리보기용)
	file_key: string; // S3 Key (DB 저장용)
	file_size: number;
}


export interface FeedbackFormData {
  content_id: string;
  files:[
	file_key:"string",
	file_url:"string",
	transcription:"string",
	translated_transcription:"string"
  ]
}