import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-stone-900 text-stone-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <span className="text-white font-bold text-xl">Naija</span>
              <span className="text-amber-500 font-bold text-xl"> Bites</span>
            </div>
          </div>
          <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
            Bringing the authentic flavours of Nigeria to your doorstep. 
            Made with love, seasoned with tradition, and delivered with warmth.
          </p>
          <div className="flex gap-4 mt-4">
            <span className="text-stone-500 text-sm">📍 Lagos, Nigeria</span>
            <span className="text-stone-500 text-sm">📞 +234 800 NAIJA</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-amber-500 transition-colors">Home</Link></li>
            <li><Link to="/menu" className="hover:text-amber-500 transition-colors">Our Menu</Link></li>
            <li><Link to="/register" className="hover:text-amber-500 transition-colors">Create Account</Link></li>
            <li><Link to="/login" className="hover:text-amber-500 transition-colors">Sign In</Link></li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-white font-semibold mb-4">Opening Hours</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Mon – Fri</span><span className="text-amber-500">8am – 10pm</span></li>
            <li className="flex justify-between"><span>Saturday</span><span className="text-amber-500">9am – 11pm</span></li>
            <li className="flex justify-between"><span>Sunday</span><span className="text-amber-500">10am – 9pm</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-stone-500 text-sm">© {new Date().getFullYear()} Naija Bites. All rights reserved.</p>
        <p className="text-stone-500 text-sm">Made with ❤️ for Nigerian food lovers</p>
      </div>
    </div>
  </footer>
);

export default Footer;
