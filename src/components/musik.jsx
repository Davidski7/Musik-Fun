import { useEffect, useState } from "react";

// 🔐 Sæt dine Spotify app-oplysninger her
const client_id = "0a1f34c851e94dd6ada75b625bbbd89d";
const client_secret = "AQCIctpj5kBEH8bjboGj7Gb7q9AjYsazukkCOMePKsETd3FxUSiURLo5z7JvQ76ehaLrhYMH2Ab35pyReMIbHAFwYHSF9lskKAgF0CGHNi422NOD_sG8kQ6-gay66zUwePG0HzFwtoV4ZyvCIqXFV8mWCz07NVa2IGgElZ9489mYv5Ggft7pc7Xeb4F3aze5636y6sjL_PglKJhMW9Uiqp7D1LwZIw"; // <-- vigtigt!
const redirect_uri = "https://musik-fun.onrender.com";

function Musik() {
    const [topTracks, setTopTracks] = useState([]);
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");

    const fetchWebApi = async (endpoint, method, body) => {
        const res = await fetch(`https://api.spotify.com/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            method,
            body: body ? JSON.stringify(body) : null,
        });

        if (res.status === 401) {
            console.error("Token udløbet eller ugyldig.");
        }

        return await res.json();
    };

    const getTopTracks = async () => {
        const data = await fetchWebApi('v1/me/top/tracks?time_range=short_term&limit=20', 'GET');
        return data.items || [];
    };

    const createPlaylist = async (tracksUri) => {
        const { id: user_id } = await fetchWebApi('v1/me', 'GET');

        const playlist = await fetchWebApi(`v1/users/${user_id}/playlists`, 'POST', {
            name: "My top tracks playlist",
            description: "Playlist created via React & Spotify API",
            public: false,
        });

        await fetchWebApi(
            `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`,
            'POST'
        );

        return playlist;
    };

    // 🔁 Step: Fang "code" fra URL og hent access token
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!token && code) {
            const fetchToken = async () => {
                const body = new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri,
                    client_id,
                    client_secret,
                });

                const response = await fetch("https://accounts.spotify.com/api/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body,
                });

                const data = await response.json();

                if (data.access_token) {
                    localStorage.setItem("spotify_token", data.access_token);
                    setToken(data.access_token);
                    window.history.replaceState({}, document.title, "/"); // fjern ?code=... fra URL
                } else {
                    console.error("Fejl ved token-forsøg", data);
                }
            };

            fetchToken();
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;

        async function fetchData() {
            try {
                const tracks = await getTopTracks();
                setTopTracks(tracks);

                const uris = tracks.map((track) => track.uri);
                const newPlaylist = await createPlaylist(uris);
                setPlaylist(newPlaylist);
            } catch (error) {
                console.error("Fejl ved hentning af data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [token]);

    const authorize = () => {
        const scopes = [
            "playlist-modify-private",
            "user-read-private",
            "user-read-email",
            "user-top-read",
        ];
        window.location = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scopes.join("%20")}`;
    };

    if (!token) {
        return (
            <div style={{ padding: "1rem" }}>
                <h2>Log ind med Spotify</h2>
                <button onClick={authorize}>Log ind</button>
            </div>
        );
    }

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Mine Top Tracks</h2>
            {loading && <p>Indlæser dine top tracks og opretter playlisten...</p>}

            {!loading && (
                <>
                    <ul>
                        {topTracks.map((track) => (
                            <li key={track.id}>
                                {track.name} af {track.artists.map((a) => a.name).join(", ")}
                            </li>
                        ))}
                    </ul>

                    {playlist && (
                        <>
                            <h3>Oprettet Playlist: {playlist.name}</h3>
                            <iframe
                                title="Spotify Embed: Recommendation Playlist"
                                src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator&theme=0`}
                                width="100%"
                                height="360"
                                style={{ minHeight: "360px" }}
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default Musik;
