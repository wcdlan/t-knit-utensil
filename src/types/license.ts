export interface LicenseProfile {
	id: string;
	name: string;
	spdxId: string;
	copyleft: number;
	patent: boolean;
	simplicity: number;
	osiApproved: boolean;
	domestic: boolean;
	summary: string;
	tags: string[];
	url: string;
	languages: { code: string; label: string }[];
}

export interface QuestionOption {
	value: string;
	label: string;
	description: string;
}

export interface Question {
	id: string;
	text: string;
	options: QuestionOption[];
}

export interface ScoredLicense {
	license: LicenseProfile;
	score: number;
	highlights: string[];
}
