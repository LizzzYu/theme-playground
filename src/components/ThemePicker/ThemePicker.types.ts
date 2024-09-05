import { ThemeKeys } from './ThemePicker.enums';
export interface Theme {
	[ThemeKeys.PRIMARY]: string;
	[ThemeKeys.SECONDARY]: string;
	[ThemeKeys.ACCENT]: string;
	[ThemeKeys.TEXT]: string;
}
