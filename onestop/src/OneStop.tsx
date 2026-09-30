import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C} from './theme';
import {T} from './timeline';
import {MEMBERS} from './data';
import {Background, Grain, PreloadGrain} from './components/Chrome';
import {HUD} from './components/HUD';
import {Blinds, StripeWipe, Whip} from './components/Transitions';
import {Opening} from './scenes/Opening';
import {MemberScene} from './scenes/MemberScene';
import {Crew} from './scenes/Crew';
import {Services} from './scenes/Services';
import {Outro} from './scenes/Outro';

export const OneStop: React.FC<{mute?: boolean}> = ({mute}) => {
	const g = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.ink}}>
			{mute ? null : <Html5Audio src={staticFile('audio/onestop.wav')} />}
			<PreloadGrain />

			<Sequence from={0} durationInFrames={T.muhsin} name="Hook + Logo">
				<Background f={g} />
				<Opening f={g} />
			</Sequence>

			<Sequence from={T.muhsin} durationInFrames={T.pavitra + 12 - T.muhsin} name="Muhsin">
				<Whip g={g} id="m" exit={{at: T.pavitra, dir: 'up'}}>
					<MemberScene m={MEMBERS[0]} t={g - T.muhsin} zoomIn />
				</Whip>
			</Sequence>

			<Sequence from={T.pavitra - 12} durationInFrames={T.hatim - T.pavitra + 24} name="Pavitra">
				<Whip g={g} id="p" enter={{at: T.pavitra, dir: 'up'}} exit={{at: T.hatim, dir: 'left'}}>
					<MemberScene m={MEMBERS[1]} t={g - T.pavitra} />
				</Whip>
			</Sequence>

			<Sequence from={T.hatim - 12} durationInFrames={T.crew - T.hatim + 12} name="Hatim">
				<Whip g={g} id="h" enter={{at: T.hatim, dir: 'left'}}>
					<MemberScene m={MEMBERS[2]} t={g - T.hatim} />
				</Whip>
			</Sequence>

			<Sequence from={T.crew} durationInFrames={T.services - T.crew} name="Crew">
				<Crew t={g - T.crew} />
			</Sequence>

			<Sequence from={T.services} durationInFrames={T.outro - T.services} name="Services">
				<Services t={g - T.services} />
			</Sequence>

			<Sequence from={T.outro} durationInFrames={T.end - T.outro} name="Outro">
				<Outro t={g - T.outro} />
			</Sequence>

			<StripeWipe g={g} at={T.crew} to={C.oxblood} />
			<Blinds g={g} at={T.services} color={C.ink} />
			<HUD f={g} />
			<Grain f={g} />
		</AbsoluteFill>
	);
};
