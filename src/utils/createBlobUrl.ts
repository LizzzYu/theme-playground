export const createBlobUrl = async (url: string): Promise<string> => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}

		const blob = await response.blob();
		const blobUrl = URL.createObjectURL(blob);
		return blobUrl;
	} catch (error) {
		console.error('Failed to create blob URL:', error);
		throw error;
	}
};
