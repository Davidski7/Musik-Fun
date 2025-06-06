import { useState } from "react";

// Din Spotify access token (indsæt din token her)
const ACCESS_TOKEN = "BQBoZR4zaC09mrIX5h4coF3o6tDrnMQ3bVdu2JLoCMrcEbSSQqMccF9t64sLxTeb0wOmD6X6AsVYaOtHaBS67y2VuTofX5Uz3gXCaDu4u_9D23RefLABaUARbLtMhYHZIbKUP0-339U3U-ZYj77CCSrHxAYVR3qmm31bUNVXXqtmx34q9a-no4DiLE3P9J6u1FqtxgFe2Vn0fdd7Wt-Cqh4kD-Lzu6Zj_jorb8IewFL2o-PltGhJnf7xHXu3MMdf9JjN74VfGWlp1NnyUMscGd3N18nrTJEt_RDv";

function Musik() {
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTracks, setSelectedTracks] = useState([]);
    const [playlistName, setPlaylistName] = useState("Min nye playlist");
    const [loading, setLoading] = useState(false);
    const [playlistCreated, setPlaylistCreated] = useState(null);

    const token = ACCESS_TOKEN;

    // Søgefunktion mod Spotify API
    const searchTracks = async (e) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        try {
            const res = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            setSearchResults(data.tracks ? data.tracks.items : []);
        } catch (error) {
            console.error("Fejl i søgning:", error);
        }
        setLoading(false);
    };

    // Tilføj sang til valgt liste (undgå dubletter)
    const addTrack = (track) => {
        if (selectedTracks.find((t) => t.id === track.id)) return;
        setSelectedTracks([...selectedTracks, track]);
    };

    // Fjern sang fra valgt liste
    const removeTrack = (trackId) => {
        setSelectedTracks(selectedTracks.filter((t) => t.id !== trackId));
    };

    // Opret playlist på brugerens konto med valgte sange
    const createPlaylist = async () => {
        if (!playlistName || selectedTracks.length === 0) {
            alert("Indtast et playlist navn og vælg mindst én sang.");
            return;
        }
        setLoading(true);
        try {
            // Hent brugerens ID
            const userRes = await fetch("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userData = await userRes.json();
            const userId = userData.id;

            // Opret playlist
            const playlistRes = await fetch(
                `https://api.spotify.com/v1/users/${userId}/playlists`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: playlistName,
                        description: "Playlist created via React & Spotify API",
                        public: false,
                    }),
                }
            );
            const playlistData = await playlistRes.json();

            // Tilføj sange til playlist
            const uris = selectedTracks.map((track) => track.uri);
            await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uris }),
            });

            setPlaylistCreated(playlistData);
            setSelectedTracks([]);
            setSearchResults([]);
            setQuery("");
            alert("Playlist oprettet!");
        } catch (error) {
            console.error("Fejl ved oprettelse af playlist:", error);
            alert("Der skete en fejl under oprettelse af playlisten.");
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Opret din egen Spotify Playlist</h2>

            <form onSubmit={searchTracks} style={{ marginBottom: "1rem" }}>
                <input
                    type="text"
                    placeholder="Søg efter sange"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ width: "300px", marginRight: "1rem" }}
                />
                <button type="submit" disabled={loading}>
                    Søg
                </button>
            </form>

            {loading && <p>Indlæser...</p>}

            {searchResults.length > 0 && (
                <>
                    <h3>Søgeresultater</h3>
                    <ul>
                        {searchResults.map((track) => (
                            <li key={track.id} style={{ marginBottom: "0.5rem" }}>
                                {track.name} af {track.artists.map((a) => a.name).join(", ")}{" "}
                                <button onClick={() => addTrack(track)} disabled={selectedTracks.find((t) => t.id === track.id)}>
                                    Tilføj
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {selectedTracks.length > 0 && (
                <>
                    <h3>Valgte sange</h3>
                    <ul>
                        {selectedTracks.map((track) => (
                            <li key={track.id} style={{ marginBottom: "0.5rem" }}>
                                {track.name} af {track.artists.map((a) => a.name).join(", ")}{" "}
                                <button onClick={() => removeTrack(track.id)}>Fjern</button>
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Playlist navn"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            style={{ width: "300px", marginRight: "1rem" }}
                        />
                        <button onClick={createPlaylist} disabled={loading}>
                            Opret Playlist
                        </button>
                    </div>
                </>
            )}

            {playlistCreated && (
                <div style={{ marginTop: "2rem" }}>
                    <h3>Playlist oprettet:</h3>
                    <p>{playlistCreated.name}</p>
                    <iframe
                        title="Spotify Embed Playlist"
                        src={`https://open.spotify.com/embed/playlist/${playlistCreated.id}`}
                        width="100%"
                        height="360"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        style={{ minHeight: "360px" }}
                    />
                </div>
            )}
        </div>
    );
}

export default Musik;
