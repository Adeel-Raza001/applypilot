'use client';

import { Eye, EyeOff } from 'lucide-react';
import { InputHTMLAttributes, useState } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>;

export default function PasswordInput(props: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className="field pr-10" />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-fg"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}