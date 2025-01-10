const clientId = '2ee584ca1e9b4cddbe6af449527bd950';
const redirectUri = 'https://zandenkoh.github.io/Harmonic/';
const loginButton = document.getElementById('login-button');
const mainScreen = document.getElementById('main-screen');
const loginScreen = document.getElementById('login-screen');

let accessToken = '';

loginButton.addEventListener('click', () => {
  const scope = 'user-read-private playlist-read-private';
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}`;
  window.location.href = authUrl;
});

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

function loadPlaylists() {
  fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then(response => response.json())
    .then(data => {
      const playlistCarousel = document.getElementById('playlist-carousel');
      playlistCarousel.innerHTML = '';

      data.items.forEach(playlist => {
        const playlistDiv = document.createElement('div');
        playlistDiv.textContent = playlist.name;
        playlistDiv.addEventListener('click', () => loadPlaylistTracks(playlist.id));
        playlistCarousel.appendChild(playlistDiv);
      });
    });
}

function loadPlaylistTracks(playlistId) {
  fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then(response => response.json())
    .then(data => {
      const track = data.items[0].track;
      document.getElementById('album-cover').src = track.album.images[0].url;
      document.getElementById('album-title').textContent = track.album.name;
      document.getElementById('track-name').textContent = track.name;
      document.getElementById('artist-names').textContent = track.artists.map(a => a.name).join(', ');
    });
}
