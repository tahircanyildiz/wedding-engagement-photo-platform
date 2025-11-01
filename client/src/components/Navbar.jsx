import { Link } from 'react-router-dom';

const Navbar = ({ transparent = false }) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md shadow-md'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-elegant font-bold text-romantic-600">
            Nişan Anılarımız
          </Link>
          <div className="flex gap-4">
            <Link
              to="/gallery"
              className="text-gray-700 hover:text-romantic-600 transition-colors font-medium"
            >
              Galeri
            </Link>
            <Link
              to="/upload"
              className="text-gray-700 hover:text-romantic-600 transition-colors font-medium"
            >
              Fotoğraf Yükle
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
