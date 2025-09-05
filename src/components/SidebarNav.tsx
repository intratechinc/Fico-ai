import React from 'react';
import { XMark } from './Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenInfo: () => void;
}

export default function SidebarNav({ open, onClose, onOpenInfo }: Props) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside className={`absolute left-0 top-0 h-full w-80 bg-white shadow-xl border-r transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Menu</div>
          <button onClick={onClose} className="text-neutral-600 hover:text-black"><XMark className="h-5 w-5" /></button>
        </div>
        <nav className="p-4 space-y-2 text-sm">
          <button className="w-full text-left rounded-lg px-3 py-2 hover:bg-neutral-100" onClick={() => { onOpenInfo(); onClose(); }}>What’s in a FICO Score</button>
        </nav>
      </aside>
    </div>
  );
}


