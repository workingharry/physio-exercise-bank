import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- Running VideoPlayer & YouTube URL Seam TDD Tests ---');

// Seam 1: Helper function extracted or imported for parsing YouTube URL and generating embed data
export const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getEmbedUrl = (ytId, isLooping = true) => {
  if (!ytId) return null;
  return `https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1&rel=0&loop=${isLooping ? '1' : '0'}&playlist=${ytId}`;
};

export const getYouTubeThumbnail = (ytId) => {
  if (!ytId) return null;
  return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
};

export const getDirectWatchUrl = (url, ytId) => {
  if (ytId) return `https://www.youtube.com/watch?v=${ytId}`;
  return url || '';
};

export const parseVideoType = (videoUrl) => {
  if (!videoUrl) return 'empty';
  const ytId = getYouTubeId(videoUrl);
  if (ytId) return 'youtube-embed';
  if (videoUrl.includes('youtube.com/results') || videoUrl.includes('/results?search_query=')) {
    return 'youtube-search';
  }
  return 'direct-video';
};

// --- Test Cases (Red -> Green verification) ---

// 1. YouTube standard watch URL
{
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const id = getYouTubeId(url);
  assert.strictEqual(id, 'dQw4w9WgXcQ', 'Standard watch URL should extract ID');
  assert.strictEqual(getEmbedUrl(id, true), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1&rel=0&loop=1&playlist=dQw4w9WgXcQ');
  assert.strictEqual(getYouTubeThumbnail(id), 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  assert.strictEqual(getDirectWatchUrl(url, id), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.strictEqual(parseVideoType(url), 'youtube-embed');
  console.log('✓ 1. Standard watch URL parsing and embed URL construction');
}

// 2. youtu.be short URL
{
  const url = 'https://youtu.be/dQw4w9WgXcQ';
  const id = getYouTubeId(url);
  assert.strictEqual(id, 'dQw4w9WgXcQ', 'Short youtu.be URL should extract ID');
  assert.strictEqual(parseVideoType(url), 'youtube-embed');
  console.log('✓ 2. Short youtu.be URL parsing');
}

// 3. YouTube embed URL with timestamp or extra query parameters
{
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=45s&feature=shared';
  const id = getYouTubeId(url);
  assert.strictEqual(id, 'dQw4w9WgXcQ', 'URL with extra params should extract ID');
  assert.strictEqual(parseVideoType(url), 'youtube-embed');
  console.log('✓ 3. YouTube URL with extra parameters');
}

// 4. YouTube search fallback query URL
{
  const url = 'https://www.youtube.com/results?search_query=acl+rehabilitation+exercises';
  const id = getYouTubeId(url);
  assert.strictEqual(id, null, 'Search URL should have no YouTube ID');
  assert.strictEqual(parseVideoType(url), 'youtube-search');
  assert.strictEqual(getDirectWatchUrl(url, id), url);
  console.log('✓ 4. YouTube search query URL detection');
}

// 5. Empty / missing video URL
{
  assert.strictEqual(getYouTubeId(null), null);
  assert.strictEqual(getYouTubeId(''), null);
  assert.strictEqual(parseVideoType(''), 'empty');
  console.log('✓ 5. Empty/null video URL handling');
}

// 6. Dataset integration audit (all 373 exercises in exercises.v2.json)
{
  const exercises = JSON.parse(fs.readFileSync('./src/data/exercises.v2.json', 'utf8'));
  assert.strictEqual(exercises.length, 373);
  let embedCount = 0;
  let searchCount = 0;
  let missingCount = 0;

  for (const ex of exercises) {
    const vType = parseVideoType(ex.media?.videoUrl);
    if (vType === 'youtube-embed') embedCount++;
    else if (vType === 'youtube-search') searchCount++;
    else missingCount++;
  }

  assert.strictEqual(embedCount, 360, `Expected 360 embeddable exercises, got ${embedCount}`);
  assert.strictEqual(searchCount, 13, `Expected 13 search-fallback exercises, got ${searchCount}`);
  assert.strictEqual(missingCount, 0, `Expected 0 missing video exercises, got ${missingCount}`);
  console.log(`✓ 6. Full dataset audit: ${embedCount} embeddable, ${searchCount} search fallbacks, 0 missing`);
}

console.log('🎉 ALL VideoPlayer TDD SEAM TESTS PASSED!');
