import { Link } from 'react-router-dom';
import { BookOpen, CircleHelp, Headset } from 'lucide-react';
export function SupportResources() {
  return <div className="grid gap-4 md:grid-cols-3">{[
    {title:'Frequently asked questions',description:'Find answers about sales, inventory, and your account.',path:'/faq-s',icon:CircleHelp},
    {title:'Help center',description:'Create a ticket and follow the replies from your team.',path:'/help-center',icon:Headset},
    {title:'Contact support',description:'Share an issue or ask for help with your workspace.',path:'/contact-us',icon:BookOpen},
  ].map(item=><Link className="card space-y-3 transition-colors hover:border-indigo-400" to={item.path} key={item.path}><item.icon size={28} className="text-indigo-500"/><h2 className="font-semibold">{item.title}</h2><p className="text-sm leading-relaxed">{item.description}</p><span className="inline-block text-sm font-medium text-indigo-600 dark:text-indigo-300">View details →</span></Link>)}</div>;
}
