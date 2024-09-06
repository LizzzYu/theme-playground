import React, { useRef } from 'react';
import BackgroundSelectorCurrent from './BackgroundSelectorCurrent';
import BackgroundSelectorList from './BackgroundSelectorList';
import { useAppContext } from '../../hooks/useAppContext';

const BackgroundSelector: React.FC = () => {
	const { setBackground } = useAppContext();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const isFileVideo = file.type.startsWith('video/');

			const filePath = file.path;

			if (isFileVideo) {
				setBackground(filePath, true, false);
			} else {
				setBackground(filePath, false, false);
			}
		}
	};

	const handleUploadClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleApplyCSSBackground = (cssClass: string) => {
		setBackground(cssClass, false, true);
	};

	const handlePredefinedBackgroundSelect = (url: string, isVideo: boolean) => {
		setBackground(url, isVideo, false);
	};

	return (
		<div className="p-6 w-full h-full relative">
			<BackgroundSelectorCurrent
				fileInputRef={fileInputRef}
				handleFileChange={handleFileChange}
				handleUploadClick={handleUploadClick}
			/>
			<BackgroundSelectorList
				handleApplyCSSBackground={handleApplyCSSBackground}
				handlePredefinedBackgroundSelect={handlePredefinedBackgroundSelect}
			/>
		</div>
	);
};

export default BackgroundSelector;
