import React from 'react';
import {Composition} from 'remotion';
import {OneStop} from './OneStop';
import {DURATION, FPS, H, W} from './timeline';

export const Root: React.FC = () => (
	<>
		<Composition
			id="OneStop"
			component={OneStop}
			durationInFrames={DURATION}
			fps={FPS}
			width={W}
			height={H}
			defaultProps={{mute: false}}
		/>
	</>
);
