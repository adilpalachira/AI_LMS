import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Settings, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  BrainCircuit, 
  Layers,
  Sparkles
} from 'lucide-react';

const SidebarPlaceholder = ({ role }) => {
  // Define menu structure by role
  const getSidebarLinks = () => {
    const common = [
      { name: 'Overview', icon: Layers, path: '#' },
      { name: 'AI Tutor chat', icon: BrainCircuit, path: '#', badge: 'AI' }
    ];

    const adminLinks = [
      ...common,
      { name: 'User Directory', icon: Users, path: '#' },
      { name: 'System Logs', icon: FileText, path: '#' },
      { name: 'Global Settings', icon: Settings, path: '#' }
    ];

    const facultyLinks = [
      ...common,
      { name: 'Course Manager', icon: BookOpen, path: '#' },
      { name: 'Student Grades', icon: FileText, path: '#' },
      { name: 'Performance Analytics', icon: TrendingUp, path: '#' }
    ];

    const studentLinks = [
      ...common,
      { name: 'My Enrolled Courses', icon: GraduationCap, path: '#' },
      { name: 'Gradebook', icon: FileText, path: '#' }
    ];

    switch (role) {
      case 'Admin':
        return adminLinks;
      case 'Faculty':
        return facultyLinks;
      case 'Student':
      default:
        return studentLinks;
    }
  };

  const links = getSidebarLinks();

  return (
    <div className="glass-panel w-full md:w-64 rounded-3xl p-6 flex flex-col space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
          Workspace Panel
        </h3>
        <nav className="space-y-1">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.path}
              className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                idx === 0 
                  ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon 
                  size={18} 
                  className={idx === 0 ? 'text-brand-400' : 'text-slate-400 group-hover:text-brand-400 transition-colors'} 
                />
                <span>{link.name}</span>
              </div>
              {link.badge && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white animate-pulse">
                  <Sparkles size={8} />
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-800/80">
        <div className="bg-gradient-to-r from-brand-900/40 to-blue-900/40 border border-brand-500/20 rounded-2xl p-4 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/10 rounded-full blur-xl"></div>
          <p className="text-xs text-brand-400 font-semibold mb-1 flex items-center justify-center gap-1">
            <Sparkles size={12} />
            EduAI Assist
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Need lesson plans or assignment drafts? Use AI tools on the next module.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SidebarPlaceholder;
