import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="px-8 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg">
        <div className="flex gap-10 text-sm text-gray-300">
          <button onClick={() => scrollTo("hero")} className="hover:text-white transition">Home</button>
          <button onClick={() => scrollTo("about")} className="hover:text-white transition">About</button>
          <button onClick={() => scrollTo("skills")} className="hover:text-white transition">Skills</button>
          <button onClick={() => scrollTo("experience")} className="hover:text-white transition">Experience</button>
          <button onClick={() => scrollTo("projects")} className="hover:text-white transition">Projects</button>
          <button onClick={() => scrollTo("contact")} className="hover:text-white transition">Contact</button>
        </div>
      </div>
    </div>
  );
}
