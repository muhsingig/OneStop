import {Config} from '@remotion/cli/config';

// The scratch folder path is too long for Windows (MAX_PATH) to launch the bundled
// headless Chrome from node_modules, so reuse the identical build from the Toy Kingdom project.
export const BROWSER =
	'C:/Users/muhsi/Downloads/edits/toy-kingdom/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe';
Config.setBrowserExecutable(BROWSER);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
