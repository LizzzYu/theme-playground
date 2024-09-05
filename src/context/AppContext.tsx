import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Theme } from '../components/ThemePicker/ThemePicker.types';
import { createBlobUrl } from '../utils/createBlobUrl';
import { predefinedThemes } from '../data/themes';
import { predefinedBackgrounds } from '../data/backgrounds';

interface AppContextType {
	background: string | null;
	setBackground: (
		background: string | null,
		isVideo: boolean,
		isCSS: boolean
	) => void;
	isVideo: boolean;
	setIsVideo: (isVideo: boolean) => void;
	isCSS: boolean;
	setIsCSS: (isCSS: boolean) => void;
	theme: Theme | null;
	setTheme: (theme: Theme) => void;
}

interface Settings {
	background?: string;
	isVideo?: boolean;
	isCSS?: boolean;
	theme?: Theme;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [background, setBackgroundState] = useState<string | null>(null);
	const [isVideo, setIsVideo] = useState<boolean>(true);
	const [isCSS, setIsCSS] = useState<boolean>(false);
	const [theme, setThemeState] = useState<Theme | null>(null);

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				// Fetch settings from the main process
				const settings = (await window.ipcRenderer.invoke(
					'get-settings'
				)) as Settings;

				// Default settings
				const defaultSettings = {
					isVideo: true,
					isCSS: false,
					theme: predefinedThemes[0], // Default theme
					background: predefinedBackgrounds[3].value, // Default background
				};

				// Merge settings with defaults
				const mergedSettings = {
					...defaultSettings,
					...settings,
				};

				// Apply settings to the state
				setIsVideo(mergedSettings.isVideo);
				setIsCSS(mergedSettings.isCSS);
				setThemeState(mergedSettings.theme);

				if (mergedSettings.background) {
					if (mergedSettings.isVideo) {
						const blobUrl = await createBlobUrl(mergedSettings.background);
						setBackgroundState(blobUrl);
					} else {
						setBackgroundState(mergedSettings.background);
					}
				} else {
					setBackgroundState(null);
				}
			} catch (error) {
				console.error('Failed to fetch settings:', error);
			}
		};

		// Fetch settings on mount
		void fetchSettings();
	}, []);

	// Function to set background and handle settings update
	const setBackground = (
		newBackground: string | null,
		video: boolean,
		css: boolean
	) => {
		// If there is a previous video blob, revoke the object URL to avoid memory leaks
		if (isVideo && background && background.startsWith('blob:')) {
			URL.revokeObjectURL(background);
		}

		const updateBackground = async () => {
			try {
				if (video && newBackground) {
					// If the new background is a video, create a blob URL
					const blobUrl = await createBlobUrl(newBackground);
					setBackgroundState(blobUrl);

					// Update settings in the main process
					window.ipcRenderer.send('update-settings', {
						background: newBackground,
						isVideo: video,
						isCSS: css,
					});
				} else {
					// For non-video background, set directly
					setBackgroundState(newBackground);
					window.ipcRenderer.send('update-settings', {
						background: newBackground,
						isVideo: video,
						isCSS: css,
					});
				}
			} catch (error) {
				console.error('Failed to set background:', error);
			}
		};

		// Update the background state and settings
		void updateBackground();

		// Update the isVideo and isCSS states
		setIsVideo(video);
		setIsCSS(css);
	};

	// Function to set the theme and update settings
	const setTheme = (newTheme: Theme | null) => {
		setThemeState(newTheme);
		window.ipcRenderer.send('update-settings', { theme: newTheme });
	};

	return (
		<AppContext.Provider
			value={{
				background,
				setBackground,
				isVideo,
				setIsVideo,
				isCSS,
				setIsCSS,
				theme,
				setTheme,
			}}>
			{children}
		</AppContext.Provider>
	);
};
