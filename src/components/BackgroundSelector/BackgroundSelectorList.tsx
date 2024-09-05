import React, { useState } from 'react';
import { predefinedBackgrounds } from '../../data/backgrounds';
import { BackgroundProps } from './BackgroundSelector.types';

interface BackgroundSelectorListProps {
	handleApplyCSSBackground: (cssClass: string) => void;
	handlePredefinedBackgroundSelect: (url: string, isVideo: boolean) => void;
}

const BackgroundSelectorList: React.FC<BackgroundSelectorListProps> = ({
	handleApplyCSSBackground,
	handlePredefinedBackgroundSelect,
}) => {
	const [activeItem, setActiveItem] = useState<number | null>(null);

	const onButtonClick = (bg: BackgroundProps, index: number) => {
		bg.isCSS
			? handleApplyCSSBackground(bg.value)
			: handlePredefinedBackgroundSelect(bg.value, bg.isVideo || false);
		setActiveItem(index);
	};

	return (
		<div className="grid grid-cols-3 gap-4 pb-6">
			{predefinedBackgrounds.map((bg, index) => {
				const isActiveBackground = index === activeItem;

				return (
					<button
						key={bg.value}
						onClick={() => onButtonClick(bg, index)}
						className={`w-full aspect-video bg-gray-700 rounded overflow-hidden hover:bg-gray-600 transition flex items-center justify-center ${
							isActiveBackground ? 'opacity-100' : 'opacity-70'
						} hover:opacity-100`}
						style={{
							border: isActiveBackground ? '2px solid white' : 'none',
						}}>
						<div
							className={`w-full h-full ${bg.isCSS ? bg.value : ''}`}
							style={{
								backgroundImage:
									!bg.isCSS && !bg.isVideo ? `url(${bg.value})` : undefined,
								backgroundSize: 'cover',
								backgroundRepeat: 'no-repeat',
							}}>
							{!bg.isCSS && bg.isVideo ? (
								<video className="w-full h-full object-cover" autoPlay muted>
									<source src={bg.value} type="video/webm" />
								</video>
							) : null}
						</div>
					</button>
				);
			})}
		</div>
	);
};

export default BackgroundSelectorList;
