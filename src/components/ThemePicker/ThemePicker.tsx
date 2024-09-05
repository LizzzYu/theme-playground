import React, { useState, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import { Theme } from './ThemePicker.types';
import { predefinedThemes } from '../../data/themes';
import { useAppContext } from '../../hooks/useAppContext';
import { ThemeKeys } from './ThemePicker.enums';
import PaletteIcon from '../../assets/icons/Palette';

const ThemePicker: React.FC = () => {
	const { theme, setTheme } = useAppContext();
	const [currentPicker, setCurrentPicker] = useState<keyof Theme>(
		ThemeKeys.PRIMARY
	);

	useEffect(() => {}, [theme]);

	const handleColorChange = (color: { hex: string }) => {
		const updatedTheme = { ...theme!, [currentPicker]: color.hex };
		setTheme(updatedTheme);
	};

	const handlePickerClick = (key: keyof Theme) => {
		setCurrentPicker(key);
	};

	const handleThemeSelect = (theme: Theme) => {
		setTheme(theme);
	};

	return (
		<div className="p-6 text-white h-full overflow-auto flex flex-col gap-4">
			<h2 className="typography-h2 pt-[52px]" style={{ color: theme?.text }}>
				Foreground
			</h2>
			<div className="flex justify-start items-center">
				<PaletteIcon fill={theme?.accent} width={24} height={24} />
				<h2 className="typography-h2 ml-2" style={{ color: theme?.text }}>
					Colorways
				</h2>
			</div>

			<div className="flex space-x-2">
				{predefinedThemes.map((predefinedTheme) => (
					<button
						key={predefinedTheme.accent}
						className="w-8 h-8 rounded-full border-2"
						style={{
							backgroundColor: predefinedTheme.secondary,
							borderColor:
								theme?.accent === predefinedTheme.accent
									? theme?.text
									: 'transparent',
						}}
						onClick={() => handleThemeSelect(predefinedTheme)}
					/>
				))}
			</div>

			<div className="grid grid-cols-4 gap-3 mb-4">
				{Object.values(ThemeKeys).map((key) => (
					<div
						key={key}
						onClick={() => handlePickerClick(key)}
						className="flex flex-col items-center">
						<p
							className="w-full text-xs pb-1 text-left capitalize"
							style={{ color: theme?.text }}>
							{key}
						</p>

						<div
							className="w-full aspect-video rounded cursor-pointer border"
							style={{
								backgroundColor: theme?.[key],
								borderColor: theme?.text,
							}}
						/>
					</div>
				))}
			</div>

			<div className="flex justify-center">
				<div className="relative w-full h-40 bg-gray-700 rounded-lg flex justify-center items-center">
					{currentPicker && (
						<div className="absolute top-0 left-0 w-full pb-[20px]">
							{/* Customizing the width of the ChromePicker by wrapping it in a styled div */}
							<ChromePicker
								className="!w-full"
								color={theme?.[currentPicker]}
								onChangeComplete={handleColorChange}
								disableAlpha
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ThemePicker;
