'use client'

interface RevenueData {
  month: string
  revenue: number
  transactions: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
        <p className="text-gray-500">Nema podataka za prikaz</p>
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue))
  const maxHeight = 200

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h3 className="mb-6 text-lg font-semibold text-gray-900">
        Prihodi po mjesecima
      </h3>

      <div className="relative">
        {/* Chart */}
        <div className="flex items-end justify-between gap-2" style={{ height: maxHeight }}>
          {data.map((item, index) => {
            const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * maxHeight : 0

            return (
              <div key={index} className="group flex flex-1 flex-col items-center">
                {/* Bar */}
                <div className="relative w-full">
                  <div
                    className="w-full cursor-pointer rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                    style={{ height: `${height}px` }}
                  >
                    {/* Tooltip */}
                    <div className="invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                      <div className="font-semibold">
                        €{item.revenue.toLocaleString()}
                      </div>
                      <div className="text-gray-300">
                        {item.transactions} transakcija
                      </div>
                      {/* Arrow */}
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>

                {/* Month label */}
                <div className="mt-2 text-xs text-gray-600">{item.month}</div>
              </div>
            )
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute -left-12 top-0 flex h-full flex-col justify-between text-xs text-gray-500">
          <div>€{maxRevenue.toLocaleString()}</div>
          <div>€{Math.round(maxRevenue / 2).toLocaleString()}</div>
          <div>€0</div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
        <div>
          <div className="text-sm text-gray-600">Ukupno</div>
          <div className="text-xl font-bold text-gray-900">
            €{data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Prosječno</div>
          <div className="text-xl font-bold text-gray-900">
            €{Math.round(
              data.reduce((sum, d) => sum + d.revenue, 0) / data.length
            ).toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Transakcije</div>
          <div className="text-xl font-bold text-gray-900">
            {data.reduce((sum, d) => sum + d.transactions, 0)}
          </div>
        </div>
      </div>
    </div>
  )
}
