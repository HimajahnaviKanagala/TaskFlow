import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../common/Button";
import ThemeToggle from "../common/ThemeToggle";

export default function Navbar({ toggleSidebar }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 gap-3 shrink-0">
      {/* Mobile Menu Button */}
      <button className="md:hidden text-xl" onClick={toggleSidebar}>
        ☰
      </button>

      <div className="flex items-center gap-3 ml-auto">
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
