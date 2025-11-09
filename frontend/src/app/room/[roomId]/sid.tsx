<aside className="w-80 flex flex-col bg-gray-800 border-l border-gray-700">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-gray-700 rounded-lg p-3">
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-700 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 rounded-md px-4 py-2 font-semibold"
            >
              Send
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
