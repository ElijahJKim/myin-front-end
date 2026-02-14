export interface RegisterForm {
	brandName: string;
	productName?: string;
	campaignPurpose?: string;
	targetCountry: string[];
	uploadPlatform?: string[];
	budgetRange?: number[];
	uploadPeriod: string;
	productLink: string;
	chargeName: string;
	chargePhone: string;
	chargeEmail: string;
	etc?: string;
}
