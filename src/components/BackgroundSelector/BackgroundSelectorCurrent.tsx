import React, { RefObject, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import FrameIcon from '../../assets/icons/Frame';
import AddIcon from '../../assets/icons/Add';

interface BackgroundSelectorCurrentProps {
	handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleUploadClick: () => void;
	fileInputRef: RefObject<HTMLInputElement>;
}

const BackgroundSelectorCurrent: React.FC<BackgroundSelectorCurrentProps> = ({
	handleFileChange,
	handleUploadClick,
	fileInputRef,
}) => {
	const { background, theme, setBackground } = useAppContext();

	useEffect(() => {
		const fetchStoredBackground = async () => {
			try {
				// Fetch settings from the main process
				const storedBackground = (await window.ipcRenderer.invoke(
					'userBackground'
				)) as string;
				if (storedBackground) {
					setBackground(storedBackground, false, false);
				}
			} catch (error) {
				console.error('Failed to fetch settings:', error);
			}
		};

		void fetchStoredBackground;
	}, [setBackground]);

	const handleFileChangeWithSave = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			const filePath = file.path;
			const isVideoFile = file.type.startsWith('video');

			window.ipcRenderer
				.invoke('save-background', filePath)
				.then((savedBackground: string) => {
					const savedBackgroundUrl = `file://${savedBackground.replace(
						/\\/g,
						'/'
					)}`;
					setBackground(savedBackgroundUrl, isVideoFile, false);
				})
				.catch((error) => {
					console.error('Failed to save background:', error);
				});
		}
		handleFileChange(event);
	};

	const renderSelectedBackground = () => {
		if (!background || typeof background !== 'string') {
			return (
				<div className="flex flex-col w-[480px] h-[270px] items-center justify-center">
					<span className="text-4xl">
						<FrameIcon width={24} height={24} fill={theme?.accent} />
					</span>
					<p className="mt-2 text-sm text-gray-400">No background selected</p>
				</div>
			);
		}

		if (background.includes('background-animate')) {
			return <div className={`w-full h-full ${background}`} />;
		}

		if (background.endsWith('.mp4') || background.endsWith('.webm')) {
			return (
				<video
					src={background}
					className="w-full h-full object-cover rounded"
					autoPlay
					loop
					muted
				/>
			);
		}

		return (
			<img
				src={background}
				alt="Selected Background"
				className="w-full h-full object-cover rounded"
			/>
		);
	};

	return (
		<div className="flex flex-col justify-start items-center">
			<h2
				className="typography-h2 mb-4 self-start"
				style={{ color: theme?.text }}>
				Theme
			</h2>
			<h2
				className="typography-h2 mb-4 self-start"
				style={{ color: theme?.text }}>
				Background
			</h2>

			<div className="w-full my-0 mx-auto flex justify-center items-center rounded">
				<div
					className="w-1/2 aspect-video overflow-hidden flex items-center justify-center bg-gray-700 rounded border-8"
					style={{ borderColor: theme?.secondary }}>
					{renderSelectedBackground()}
				</div>
			</div>

			{/* hide original upload input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*,video/*"
				onChange={handleFileChangeWithSave}
				className="hidden"
			/>

			{/* custom upload button */}
			<button
				onClick={handleUploadClick}
				className="typography-subtitle flex justify-center items-center text-white py-3 px-4 w-fit h-fit rounded my-6 transition hover:opacity-75"
				style={{ backgroundColor: theme?.accent }}>
				<p className="pr-2">Pick Your File</p>
				<AddIcon />
			</button>
		</div>
	);
};

export default BackgroundSelectorCurrent;
