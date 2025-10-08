export interface StorageObject {
	id: number;
	bucket: string;
	objectKey: string;
	contentType: string;
	sizeBytes: number;
	etag: string;
	publicUrl: string;
	createdAt: string;
}
