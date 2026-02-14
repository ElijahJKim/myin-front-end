import { env } from '$env/dynamic/public';
import type { UploadedFile, UploadFolder } from '../../types/upload.ts';

const getBaseURl = (): string => {
	return env.PUBLIC_API_BASE_URL || '';
};

// 1. 개별 파일 업로드 함수
export const uploadFileToS3 = async (file: File, folder: UploadFolder): Promise<UploadedFile> => {
	try {
		// [Step 1] 백엔드에서 Presigned URL 발급 받기
		const preSignRes = await fetch(`${getBaseURl()}/upload/url`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				file_name: file.name,
				content_type: file.type,
				folder: folder
			})
		});

		if (!preSignRes.ok) throw new Error('Presigned URL 발급 실패');

		const { presigned_url, file_url, file_key } = await preSignRes.json();

		// [Step 2] S3로 직접 업로드 (PUT)
		// 주의: S3는 Presigned URL 생성 시 지정한 Content-Type과 실제 헤더가 일치해야 함
		const s3Res = await fetch(presigned_url, {
			method: 'PUT',
			headers: { 'Content-Type': file.type },
			body: file
		});

		if (!s3Res.ok) throw new Error('S3 업로드 실패');

		// [Step 3] 결과 반환
		return {
			file_name: file.name,
			file_url: file_url,
			file_key: file_key,
			file_size: file.size
		};
	} catch (error) {
		console.error('파일 업로드 중 오류 발생:', error);
		throw error;
	}
};

// 2. 다중 파일 업로드 함수 (병렬 처리)
export const uploadMultipleFiles = async (files: File[], folder: UploadFolder) => {
	const promises = files.map((file) => uploadFileToS3(file, folder));
	return await Promise.all(promises);
};


// [수정됨] 3. 초안(Draft) 업로드 프로세스 통합 함수
export const uploadDraftFiles = async (files: File[], matchid: string) => {
    try {
        // (1) 먼저 S3에 파일들을 업로드합니다.
        // 이미지 설명에 따르면 초안용 폴더는 'content/draft' 입니다.
        const folderName: UploadFolder = 'content/draft'; 
        const uploadedFiles = await uploadMultipleFiles(files, folderName);

        // (2) 업로드된 결과에서 url과 key만 추출합니다.
        const fileUrls = uploadedFiles.map(f => f.file_url);
        const fileKeys = uploadedFiles.map(f => f.file_key);

        // (3) 백엔드 API에 메타데이터를 전송합니다.
        const response = await fetch(`${getBaseURl()}/collaboration/${matchid}/content/draft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file_urls: fileUrls,
                file_keys: fileKeys
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '초안 등록 실패');
        }

        return await response.json();
    } catch (error) {
        console.error('초안 업로드 프로세스 중 오류:', error);
        throw error;
    }
};


export const extractShipmentInfoFromImages = async (files: File[]) => {
    try {
        // 1. S3에 이미지 업로드 (폴더명은 API 문서 예시 참고: 'shipments/invoices')
        const uploadedFiles = await uploadMultipleFiles(files, 'shipments/invoices');
        
        const imageUrls = uploadedFiles.map(f => f.file_url);
        const fileKeys = uploadedFiles.map(f => f.file_key);

        // 2. OCR API 호출
        const response = await fetch(`${getBaseURl()}/ocr/invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_urls: imageUrls
            })
        });

        if (!response.ok) {
            throw new Error('OCR Analysis failed');
        }

        const ocrData = await response.json();

        // 3. OCR 결과와 업로드된 이미지 정보를 합쳐서 반환
        return {
            recipient_name: ocrData.recipient_name,
            tracking_number: ocrData.tracking_number,
            shipping_company: ocrData.shipping_company,
            tracking_image_urls: imageUrls,
            tracking_image_file_keys: fileKeys
        };

    } catch (error) {
        console.error('송장 OCR 프로세스 중 오류:', error);
        throw error;
    }
};

export const uploadShipmentInfoForm = async (form: any) => {

	try {
		const response = await fetch(`${getBaseURl()}/ocr/invoice`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		});
	} catch (error) {
		console.error('송장 업로드 프로세스 중 오류:', error);
		throw error;
	}
}