const CLIENT_ID = "0a1f34c851e94dd6ada75b625bbbd89d"; // ← DIN EKSISTERENDE
const REDIRECT_URI = "https://musik-fun.onrender.com"; // ← MATCHER DIN APP
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = ["playlist-modify-private", "playlist-modify-public"];

function Login() {
    const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`;

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Login med Spotify</h1>
            <a href={loginUrl}>
                <button>Log ind med Spotify</button>
            </a>
        </div>
    );
}

export default Login;
