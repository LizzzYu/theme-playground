import React from 'react';
import BackgroundSelector from '../BackgroundSelector/BackgroundSelector';
import ThemePicker from '../ThemePicker/ThemePicker';
import { useAppContext } from '../../hooks/useAppContext';
import { hexToRgba } from '../../utils/hexToRgba';

const Menu: React.FC = () => {
	const { theme } = useAppContext();

	const primaryBackgroundColorWithOpacity = theme?.primary
		? hexToRgba(theme.primary, 0.8)
		: 'rgba(0, 0, 0, 0.9)';

	const seconDaryBackgroundColorWithOpacity = theme?.secondary
		? hexToRgba(theme.secondary, 0.8)
		: 'rgba(0, 0, 0, 0.9)';

	return (
		<div
			className="min-h-[700px] w-full shadow-lg flex z-[1]"
			style={{
				height: 'calc(100vh - 160px)',
				backgroundColor: seconDaryBackgroundColorWithOpacity,
			}}>
			<div
				className="w-3/5 m-4 mr-0 overflow-auto"
				style={{ backgroundColor: primaryBackgroundColorWithOpacity }}>
				<BackgroundSelector />
			</div>

			<div
				className="w-2/5 m-4"
				style={{ backgroundColor: primaryBackgroundColorWithOpacity }}>
				<ThemePicker />
			</div>
		</div>
	);
};

export default Menu;
