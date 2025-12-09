export default function Chatroombox(){
  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl bg-black p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white truncate">ROOM NAME</h3>
          <p className="text-gray-300 text-base">by owner name</p>
          <p className="text-green-400 text-sm flex items-center gap-2">
            <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            12 members joined
          </p>
        </div>

        <button className="w-full bg-white text-black font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors duration-200 active:scale-95 transform text-lg">
          JOIN ROOM
        </button>


        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-white text-base font-medium">TIME REMAINING</p>
          <p className="text-gray-300 text-sm mt-1">2h 30m</p>
        </div>
      </div>
    </div>
  )
}
