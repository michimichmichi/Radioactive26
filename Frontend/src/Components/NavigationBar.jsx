import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, User, ShieldAlert, Award, Layers } from "lucide-react";
import { authAPI } from "../api";
import logo from "../assets/LogoRadioactive.png";

const preloadLogin = () => import("../Pages/Login.jsx");
const preloadCompetitionRegistration = () => import("../Pages/CompetitionRegistration.jsx");

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
      await authAPI.logout();
    } catch {
      // Local cleanup still happens if the token is already expired.
    } finally {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
      setIsMenuOpen(false);
      navigate("/");
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full">
      <nav className="bg-[#FF0990] px-6 h-16 flex items-center justify-between text-white shadow-md">
        {/* LOGO */}
        <div>
          <Link to="/">
            <img src={logo} alt="Logo" className="h-14 w-auto object-contain" />
          </Link>
        </div>

        {/* DESKTOP NAVIGATION LINKS */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-avrile text-zinc-100 font-semibold">
          <li><a href="#about" className="hover:text-white transition-colors tracking-wider">ABOUT</a></li>
          <li><a href="#competition" className="hover:text-white transition-colors tracking-wider">COMPETITION</a></li>
          <li><a href="#sponsor" className="hover:text-white transition-colors tracking-wider">SPONSOR</a></li>
          <li><a href="#gallery" className="hover:text-white transition-colors tracking-wider">GALLERY</a></li>
        </ul>

        {/* ACTION CONTROLS / DROPDOWN CONTAINER */}
        <div className="relative flex items-center gap-4" ref={menuRef}>
          
          {/* USER IS LOGGED IN */}
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm px-4 py-2 text-sm font-medium transition-all hover:bg-black/60"
                aria-expanded={isMenuOpen}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-600">
                  <User size={14} />
                </span>
                <span className="max-w-28 truncate hidden sm:inline">
                  {user.name || "Account"}
                </span>
                <Menu size={16} />
              </button>

              {/* UNIFIED DROPDOWN (Mobile + Desktop) */}
              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-xl border border-zinc-100 bg-white text-zinc-900 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* User Profile Summary Header */}
                  <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-3">
                    <p className="truncate text-sm font-bold text-pink-600 flex items-center gap-1.5">
                      {user.role === "admin" && <ShieldAlert size={14} className="text-amber-500" />}
                      {user.name || "User"}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  </div>

                  {/* MOBILE-ONLY NAVIGATION LINKS (Injected inside the menu wrapper) */}
                  <div className="md:hidden border-b border-zinc-100 py-1">
                    <MenuLink to="/#about" label="About" onClick={() => setIsMenuOpen(false)} />
                    <MenuLink to="/#competition" label="Competitions" onClick={() => setIsMenuOpen(false)} />
                    <MenuLink to="/#sponsor" label="Sponsors" onClick={() => setIsMenuOpen(false)} />
                    <MenuLink to="/#gallery" label="Gallery" onClick={() => setIsMenuOpen(false)} />
                  </div>

                  {/* USER CONTENT LINKS */}
                  <div className="py-1">
                    <MenuLink to="/competition-registration" label="Register Competition" icon={<Layers size={15} />} onClick={() => setIsMenuOpen(false)} />
                    <MenuLink to="/profile" label="Profile Management" icon={<User size={15} />} onClick={() => setIsMenuOpen(false)} />
                    <MenuLink to="/my-competitions" label="Registered Events" icon={<Award size={15} />} onClick={() => setIsMenuOpen(false)} />
                    
                    {/* ADMIN STRATEGIC DASHBOARD ROUTE */}
                    {user.role === "admin" && (
                      <MenuLink 
                        to="/admin" 
                        label="Admin Dashboard" 
                        icon={<ShieldAlert size={15} />} 
                        className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                        onClick={() => setIsMenuOpen(false)} 
                      />
                    )}
                  </div>

                  {/* LOGOUT ACTION */}
                  <div className="border-t border-zinc-100 bg-zinc-50/30 py-1">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* USER IS GUEST (NOT LOGGED IN) */
            <>
              {/* Desktop & Mobile Login Trigger Link */}
              <Link
                to="/login"
                onMouseEnter={preloadLogin}
                onFocus={preloadLogin}
                className="bg-black/40 border border-white/20 px-5 py-1.5 rounded-xl hover:bg-black/60 transition-colors text-sm font-medium tracking-wide"
              >
                Login
              </Link>
              
              {/* Mobile Guest Burger Option Menu */}
              <div className="md:hidden">
                <button 
                  onClick={() => setIsMenuOpen((current) => !current)}
                  className="p-1 text-white text-2xl focus:outline-none"
                >
                  <Menu size={24} />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 top-14 z-50 w-48 rounded-xl border border-zinc-100 bg-white text-zinc-900 shadow-2xl py-2">
                    <MenuLink to="/#about" label="About" onClick={() => setIsMenuOpen(false)} />
                    <MenuLink to="/#competition" label="Competitions" onClick={() => setIsMenuOpen(false)} />
                    <MenuLink to="/#sponsor" label="Sponsors" onClick={() => setIsMenuOpen(false)} />
                    <MenuLink to="/#gallery" label="Gallery" onClick={() => setIsMenuOpen(false)} />
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </nav>

      {/* BLENDED PINK RADIAL TRANSITION EDGE */}
      <div className="pointer-events-none h-4 bg-gradient-to-b from-[#FF0990] to-transparent" />
    </div>
  );
};

function MenuLink({ to, label, icon = null, className = "", onClick }) {
  const preload = to === "/competition-registration"
    ? preloadCompetitionRegistration
    : undefined;

  return (
    <Link
      to={to}
      onClick={onClick}
      onMouseEnter={preload}
      onFocus={preload}
      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-pink-50 hover:text-pink-600 ${className}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default Navbar;
