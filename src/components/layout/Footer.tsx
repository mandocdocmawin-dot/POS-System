import { T } from "../../i18n/T";
import { Link } from "react-router-dom";
import { useState } from 'react';
import { AboutDialog } from './AboutDialog';
export function Footer() {
  const [about, setAbout] = useState(false);
  return (
    <footer className="mt-auto flex flex-wrap justify-between gap-3 border-t border-slate-200 px-6 py-5 text-xs text-slate-400 dark:border-slate-800">
      <div>
        <button onClick={() => setAbout(true)} className="hover:text-indigo-500"><T text={"About"}/></button>
        <span className="px-2">·</span>
        <Link to="/help-center" className="hover:text-indigo-500"><T text={"Support"}/></Link>
      </div>
      <span>© 2026 TindaPOS</span>
      <AboutDialog open={about} close={() => setAbout(false)} />
    </footer>
  );
}
