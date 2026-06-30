import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, User } from "lucide-react";
import { authAPI } from "../api";
import logo from "../assets/LogoRadioactive.png";

const Navbar = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-change", syncUser);
    };
  }, []);

  useEffect(() => {
    const closeMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);

    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const logout = async () => {
    try {
      if (localStorage.getItem("token")) {
        await authAPI.logout();
      }
    } catch {
      // Local cleanup still happens if the token is already expired.
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
      setIsMenuOpen(false);
      navigate("/");
    }
  };

  return (
    <div>
      <nav className="bg-[#FF0990] px-6 h-18 flex items-center justify-between text-white">
        <div>
          <Link to="/">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </Link>
        </div>

        <ul className="hidden md:flex items-center gap-8 text-sm font-avrile text-white font-semibold ">
          <li>
            <a href="#" className="hover:text-white transition-colors tracking-wider">ABOUT</a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors tracking-wider">COMPETITION</a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors tracking-wider">SPONSOR</a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors tracking-wider">GALLERY</a>
          </li>
        </ul>

        <div className="relative flex items-center gap-4" ref={menuRef}>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-900/70"
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-600">
                  <User size={16} />
                </span>
                <span className="hidden max-w-32 truncate md:inline">
                  {user.name || "Profile"}
                </span>
                <Menu size={18} />
              </button>

              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-lg border border-pink-100 bg-white text-zinc-900 shadow-2xl"
                >
                  <div className="border-b border-pink-100 px-4 py-3">
                    <p className="truncate text-sm font-bold text-pink-600">
                      {user.name || "User"}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  </div>

                  <MenuLink to="/profile" label="Profile management" />
                  <MenuLink to="/my-competitions" label="Competitions registered" />

                  {user.role === "admin" && (
                    <MenuLink to="/admin" label="Admin dashboard" />
                  )}

                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="bg-black border border-white/10 px-5 py-1.5 rounded-xl hover:bg-zinc-900/70 transition-colors text-sm font-medium"
            >
              Login
            </Link>
          )}

          <button className="md:hidden text-white text-3xl">
            Menu
          </button>
        </div>
      </nav>

      <div className="pointer-events-none h-10 bg-gradient-to-b from-[#FF0990] to-transparent" />
    </div>
  );
};

function MenuLink({ to, label }) {
  return (
    <Link
      to={to}
      className="block px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-pink-50 hover:text-pink-600"
    >
      {label}
    </Link>
  );
}

export default Navbar;
