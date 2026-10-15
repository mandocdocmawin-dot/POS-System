import { Link } from "react-router-dom";
export function Footer() {
  return (
    <footer className="mt-auto flex flex-wrap justify-between gap-3 border-t border-slate-200 px-6 py-5 text-[11px] text-slate-400 dark:border-slate-800">
      <div>
        <Link to="/contact-us" className="hover:text-indigo-500">
          About
        </Link>
        <span className="px-2">·</span>
        <Link to="/help-center" className="hover:text-indigo-500">
          Support
        </Link>
      </div>
      <span>© 2026 TindaPOS</span>
    </footer>
  );
}
