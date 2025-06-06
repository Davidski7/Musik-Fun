import { useEffect, useState } from "react";

// Din Spotify access token (indsæt din token her)
const ACCESS_TOKEN = "BQBoZR4zaC09mrIX5h4coF3o6tDrnMQ3bVdu2JLoCMrcEbSSQqMccF9t64sLxTeb0wOmD6X6AsVYaOtHaBS67y2VuTofX5Uz3gXCaDu4u_9D23RefLABaUARbLtMhYHZIbKUP0-339U3U-ZYj77CCSrHxAYVR3qmm31bUNVXXqtmx34q9a-no4DiLE3P9J6u1FqtxgFe2Vn0fdd7Wt-Cqh4kD-Lzu6Zj_jorb8IewFL2o-PltGhJnf7xHXu3MMdf9JjN74VfGWlp1NnyUMscGd3N18nrTJEt_RDv";

function Musik() {
    const [topTracks, setTopTracks] = useState([]);
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vi bruger konstant token her
    const token = ACCESS_TOKEN;

    const fetchWebApi = async (endpoint, method, body) => {
        const res = await fetch(`https://api.spotify.com/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
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
        const data = await fetchWebApi("v1/me/top/tracks?time_range=short_term&limit=20", "GET");
        return data.items || [];
    };

    const createPlaylist = async (tracksUri) => {
        const user = await fetchWebApi("v1/me", "GET");
        const user_id = user.id;

        const playlist = await fetchWebApi(`v1/users/${user_id}/playlists`, "POST", {
            name: "My top tracks playlist",
            description: "Playlist created via React & Spotify API",
            public: false,
        });

        await fetchWebApi(`v1/playlists/${playlist.id}/tracks`, "POST", {
            uris: tracksUri,
        });

        return playlist;
    };

    useEffect(() => {
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
    }, []);

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
