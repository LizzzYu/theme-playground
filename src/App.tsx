import React, { useEffect, useState } from 'react';
import Menu from './components/Menu/Menu';
import { useAppContext } from './hooks/useAppContext';

const App: React.FC = () => {
	const { isCSS, isVideo, background } = useAppContext();
	const [videoLoaded, setVideoLoaded] = useState(false);

	useEffect(() => {
		setVideoLoaded(false);
	}, [background, isVideo, isCSS]);

	const handleVideoLoad = () => {
		setVideoLoaded(true);
	};

	const getBackgroundStyles = () => {
		if (isCSS) {
			return {};
		}

		if (isVideo) {
			return {
				backgroundColor: undefined,
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat',
				zIndex: -1,
			};
		}

		return {
			backgroundImage: background ? `url(${background})` : 'none',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			zIndex: -1,
			transition: 'all opacity ease-in-out',
		};
	};

	return (
		<div className="min-h-screen flex items-center justify-center relative">
			<div
				className={`absolute top-0 left-0 w-full h-full ${
					isCSS ? background : ''
				}`}
				style={getBackgroundStyles()}>
				{isVideo && background && !isCSS && (
					<video
						key={background}
						autoPlay
						loop
						muted
						onLoadedData={handleVideoLoad}
						className={`absolute top-0 left-0 w-full h-full object-cover z-[-1] transition-opacity duration-1000 ${
							videoLoaded ? 'opacity-100' : 'opacity-0'
						}`}>
						<source src={background} type="video/webm" />
						<source src={background} type="video/mp4" />
						Your browser does not support the video tag.
					</video>
				)}
			</div>

			<Menu />
		</div>
	);
};

export default App;
