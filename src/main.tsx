import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppProvider>
			<App />
		</AppProvider>
	</React.StrictMode>
);

window.ipcRenderer.on('main-process-message', (_event, message) => {
	console.log(message);
});
