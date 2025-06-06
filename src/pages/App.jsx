import Musik from "../components/musik";
import Login from "../components/login";

function App() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    if (!token && hash) {
      const _token = hash
        .substring(1)
        .split("&")
        .find((item) => item.startsWith("access_token"))
        ?.split("=")[1];

      if (_token) {
        setToken(_token);
        window.localStorage.setItem("spotifyToken", _token);
        window.location.hash = "";
      }
    } else {
      const savedToken = window.localStorage.getItem("spotifyToken");
      if (savedToken) setToken(savedToken);
    }
  }, [token]);

  const handleLogout = () => {
    setToken("");
    window.localStorage.removeItem("spotifyToken");
  };

  return (
    <main style={{ padding: "1rem" }}>
      {!token ? (
        <Login />
      ) : (
        <>
          <button onClick={handleLogout}>Log ud</button>
          <Musik token={token} />
        </>
      )}
    </main>
  );
}

export default App;