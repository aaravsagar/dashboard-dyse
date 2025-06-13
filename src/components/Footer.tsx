import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2C2F33] border-t border-[#40444B] text-[#B9BBBE] text-sm py-6 px-4 text-center">
      <div className="space-x-4 mb-2">
        <a href="https://dyse.vercel.app/user-agreements/terms" className="hover:underline" target="_blank" rel="noopener noreferrer">
          Terms & Conditions
        </a>
        <a href="https://dyse.vercel.app/user-agreements/privacy" className="hover:underline" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
      </div>
      <p>© {new Date().getFullYear()} PBV INTERACTIVE TECHNOLOGIES SOLUTION. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
