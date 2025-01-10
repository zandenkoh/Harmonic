const clientId = '2ee584ca1e9b4cddbe6af449527bd950';
const redirectUri = 'https://zandenkoh.github.io/Harmonic/';
const loginButton = document.getElementById('login-button');
const mainScreen = document.getElementById('main-screen');
const loginScreen = document.getElementById('login-screen');

let accessToken = '';
let currentTrackIndex = 0;
let currentPlaylistTracks = [];
let audioPlayer = new Audio();

// Spotify Login Handler
loginButton.addEventListener('click', () => {
  const scope = 'user-read-private playlist-read-private';
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}`;
  window.location.href = authUrl;
});

// Handle Redirect and Extract Token
if (window.location.hash) {
  const hash = window.location.hash.substring(1).split('&');
  const params = {};
  hash.forEach(h => {
    const [key, value] = h.split('=');
    params[key] = value;
  });

  accessToken = params.access_token;
  if (accessToken) {
    loginScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    loadPlaylists();
  }
}

// Load Playlists with Pagination
function loadPlaylists(url = 'https://api.spotify.com/v1/me/playlists') {
  fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch playlists');
      return response.json();
    })
    .then(data => {
      const playlistCarousel = document.getElementById('playlist-carousel');
      data.items.forEach(playlist => addPlaylistToSidebar(playlist));

      if (data.next) {
        loadPlaylists(data.next); // Load next batch of playlists
      }
    })
    .catch(error => handleError(error));
}

// Add Playlist to Sidebar
function addPlaylistToSidebar(playlist) {
  const playlistDiv = document.createElement('div');
  const img = document.createElement('img');
  img.src = playlist.images[0]?.url || 'default-cover.jpg';
  const span = document.createElement('span');
  span.textContent = playlist.name;

  playlistDiv.appendChild(img);
  playlistDiv.appendChild(span);
  playlistDiv.classList.add('playlist-item');

  playlistDiv.addEventListener('click', () => loadPlaylistTracks(playlist.id, playlist.images[0]?.url, playlist.name));
  document.getElementById('playlist-carousel').appendChild(playlistDiv);
}

// Load Tracks from Selected Playlist
function loadPlaylistTracks(playlistId, coverUrl, playlistName) {
  document.getElementById('playlist-cover').src = coverUrl || 'default-cover.jpg';
  document.getElementById('playlist-name').textContent = playlistName;

  fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch tracks');
      return response.json();
    })
    .then(data => {
      const tracklist = document.getElementById('tracklist');
      tracklist.innerHTML = '';
      currentPlaylistTracks = data.items;

      data.items.forEach((item, index) => {
        const trackDiv = document.createElement('div');
        trackDiv.textContent = item.track.name;
        trackDiv.classList.add('track-item');

        trackDiv.addEventListener('click', () => loadTrack(item.track, index));
        tracklist.appendChild(trackDiv);
      });

      if (data.items.length > 0) {
        loadTrack(data.items[0].track, 0); // Autoplay the first track
      }
    })
    .catch(error => handleError(error));
}

// Load Selected Track
function loadTrack(track, index) {
  currentTrackIndex = index;
  document.getElementById('album-cover').src = track.album.images[0]?.url || 'default-cover.jpg';
  document.getElementById('track-name').textContent = track.name;
  document.getElementById('artist-names').textContent = track.artists.map(artist => artist.name).join(', ');

  // Play the selected track
  audioPlayer.src = track.preview_url || track.album.tracks.items[0].preview_url;  // If there's no preview_url, provide fallback for actual playback.
  audioPlayer.play();
  audioPlayer.onended = nextTrack;  // Move to the next track when current one ends
}

// Player Controls
document.getElementById('next-button').addEventListener('click', nextTrack);
document.getElementById('previous-button').addEventListener('click', previousTrack);
document.getElementById('pause-button').addEventListener('click', pauseTrack);
document.getElementById('play-button').addEventListener('click', playTrack);

function nextTrack() {
  if (currentTrackIndex < currentPlaylistTracks.length - 1) {
    loadTrack(currentPlaylistTracks[++currentTrackIndex].track, currentTrackIndex);
  }
}

function previousTrack() {
  if (currentTrackIndex > 0) {
    loadTrack(currentPlaylistTracks[--currentTrackIndex].track, currentTrackIndex);
  }
}

function pauseTrack() {
  audioPlayer.pause();
}

function playTrack() {
  if (audioPlayer.paused) {
    audioPlayer.play();
  }
}

// Error Handler
function handleError(error) {
  console.error('Error:', error);
  alert('Something went wrong. Please try again.');
}
