import type { Channel, EPGProgram } from '@/types';

export const DEMO_CHANNELS: Channel[] = [
  { id: 'ch1', name: 'Big Buck Bunny', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg', category: 'Movies', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', country: 'US', language: 'English' },
  { id: 'ch2', name: 'NASA Live', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/220px-NASA_logo.svg.png', category: 'Science', url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8', country: 'US', language: 'English' },
  { id: 'ch3', name: 'Tears of Steel', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Tears_of_Steel_poster.jpg/220px-Tears_of_Steel_poster.jpg', category: 'Movies', url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', country: 'NL', language: 'English' },
  { id: 'ch4', name: 'Blender Open Movies', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blender_logo_no_text.svg/220px-Blender_logo_no_text.svg.png', category: 'Animation', url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', country: 'NL', language: 'English' },
  { id: 'ch5', name: 'Sport Demo HD', logo: 'https://cdn-icons-png.flaticon.com/512/857/857430.png', category: 'Sports', url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8', country: 'DK', language: 'Danish' },
  { id: 'ch6', name: 'Music Stream', logo: 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png', category: 'Music', url: 'https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.m3u8', country: 'US', language: 'English' },
  { id: 'ch7', name: 'News Today', logo: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png', category: 'News', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', country: 'US', language: 'English' },
  { id: 'ch8', name: 'Kids Zone', logo: 'https://cdn-icons-png.flaticon.com/512/3069/3069170.png', category: 'Kids', url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', country: 'US', language: 'English' },
  { id: 'ch9', name: 'Tech Talk TV', logo: 'https://cdn-icons-png.flaticon.com/512/2620/2620394.png', category: 'Science', url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', country: 'US', language: 'English' },
  { id: 'ch10', name: 'Cinema World', logo: 'https://cdn-icons-png.flaticon.com/512/3820/3820287.png', category: 'Movies', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', country: 'FR', language: 'French' },
  { id: 'ch11', name: 'Fitness Channel', logo: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png', category: 'Sports', url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8', country: 'US', language: 'English' },
  { id: 'ch12', name: 'Nature Explore', logo: 'https://cdn-icons-png.flaticon.com/512/3064/3064197.png', category: 'Documentary', url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', country: 'GB', language: 'English' },
];

function makeProgram(channelId: string, title: string, desc: string, genre: string, offsetH: number, durH: number): EPGProgram {
  const start = new Date(); start.setHours(start.getHours() + offsetH, 0, 0, 0);
  const end = new Date(start); end.setTime(end.getTime() + durH * 3600000);
  return { id: `${channelId}-${offsetH}`, channelId, title, description: desc, startTime: start, endTime: end, genre };
}

export const DEMO_EPG: EPGProgram[] = [
  makeProgram('ch1', 'Big Buck Bunny', 'A large rabbit wreaks havoc on a small forest.', 'Animation', -1, 1),
  makeProgram('ch1', 'Sintel', 'A girl searches for her lost dragon.', 'Drama', 0, 2),
  makeProgram('ch1', 'Cosmos Laundromat', 'An ovine odyssey.', 'Fantasy', 2, 1.5),
  makeProgram('ch2', 'ISS Live Feed', 'Real-time feed from the ISS.', 'Science', -2, 4),
  makeProgram('ch2', 'NASA Press Conference', 'Latest updates from Mission Control.', 'News', 2, 1),
  makeProgram('ch3', 'Tears of Steel', 'A sci-fi short by Blender Institute.', 'Sci-Fi', -0.5, 0.5),
  makeProgram('ch3', 'Elephants Dream', 'Two strange characters explore a mechanical world.', 'Animation', 0, 1),
  makeProgram('ch4', 'Sintel Premiere', 'Opening night screening.', 'Drama', -1, 2),
  makeProgram('ch5', 'Live Football Match', 'Manchester City vs Arsenal.', 'Sports', 0, 2),
  makeProgram('ch5', 'Post-Match Analysis', 'Expert commentary.', 'Sports', 2, 0.5),
  makeProgram('ch6', 'Live Concert: Summer Vibes', 'Outdoor festival streaming live.', 'Music', 0, 3),
  makeProgram('ch7', 'Morning Headlines', "Today's top stories.", 'News', -1, 1),
  makeProgram('ch7', 'World Report', 'Global news coverage.', 'News', 0, 1),
  makeProgram('ch8', 'Cartoon Hour', 'Fun cartoons for kids.', 'Kids', -1, 1),
  makeProgram('ch9', 'AI Frontiers', 'Exploring artificial intelligence.', 'Tech', 1, 1),
  makeProgram('ch10', 'French Cinema Classic', 'A timeless French film.', 'Movies', -1, 2),
];
