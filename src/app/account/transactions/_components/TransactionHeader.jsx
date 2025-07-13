import React from "react";

const TransactionHeader = () => {
  return (
    <div className="bg-white space-y-6">
      {/* Main Balance Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, #295557 0%, #e8a355 100%)",
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-4 translate-y-4"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">$14,542</div>
              <div className="text-white/80 text-lg">Total Balance</div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              <svg
                className="w-4 h-4 text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
              <span className="text-sm font-medium">+12.5%</span>
            </div>
            <div className="text-white/60 text-sm mt-1">vs last month</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div
              className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full"
              style={{ backgroundColor: "#295557" }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
            </div>
            <div className="text-lg font-bold" style={{ color: "#295557" }}>
              +$1,230
            </div>
            <div className="text-sm text-gray-500">This month</div>
          </div>

          <div className="text-center">
            <div
              className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full"
              style={{ backgroundColor: "#e8a355" }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 13l-5 5m0 0l-5-5m5 5V7"
                />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-700">-$520</div>
            <div className="text-sm text-gray-500">Expenses</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-700">24</div>
            <div className="text-sm text-gray-500">Transactions</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-700">89%</div>
            <div className="text-sm text-gray-500">Success rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHeader;
