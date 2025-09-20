

import { Smile } from "lucide-react";
import { Link } from "react-router-dom";

const PlayfulBanner = () => (
  <div className="px-3 lg:px-5 mt-9 lg:mt-8">
    <div className="bg-gradient-to-r from-green-900 via-green-300 to-green-700 rounded-2xl p-10 min-h-[300px] flex items-center justify-center shadow-lg">
      <div className="flex flex-col lg:flex-row justify-between items-center w-full">
        
        {/* Left Content */}
        <div className="max-w-lg text-center lg:text-left">
          <div className="inline-flex items-center bg-white px-4 py-2 rounded-full mb-4 shadow">
            <Smile className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-sm font-medium text-gray-800">
              Happy Shopping
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Groceries Made Fun 🎉
          </h1>
          <p className="text-green-50 mb-6 text-lg">
            Shop everything you love with joy, speed & freshness 🥦🍎
          </p>
         <Link to="/search">
            
         <button className="bg-white text-green-600 px-8 py-3 rounded-full font-bold hover:bg-green-100 transition duration-300">
            Start Shopping
          </button>

          </Link>
        </div>

        {/* Right Emojis */}
        <div className="text-6xl lg:text-8xl mt-6 lg:mt-0">
          🥬 🍌 🥛 🍞
        </div>
      </div>
    </div>
  </div>
);

export default PlayfulBanner;

