'use client'


import React, { useEffect, useState } from 'react'

// Types for our data
type TimeSeriesData = {
  date: string
  value: number
}

type DashboardData = {
  cases: TimeSeriesData[]
  mortality: TimeSeriesData[]
  spread: TimeSeriesData[]
  mutations: TimeSeriesData[]
}

export default function Component() {
  // Mock data - in a real app, this would come from an API
  const [data, setData] = useState<DashboardData>({
    cases: Array.from({ length: 12 }, (_, i) => ({
      date: `2023-${i + 1}`,
      value: Math.floor(Math.random() * 1000),
    })),
    mortality: Array.from({ length: 12 }, (_, i) => ({
      date: `2023-${i + 1}`,
      value: Math.floor(Math.random() * 100),
    })),
    spread: Array.from({ length: 12 }, (_, i) => ({
      date: `2023-${i + 1}`,
      value: Math.floor(Math.random() * 50),
    })),
    mutations: Array.from({ length: 12 }, (_, i) => ({
      date: `2023-${i + 1}`,
      value: Math.floor(Math.random() * 20),
    })),
  })

  // Helper function to draw line graphs
  const LineGraph = ({ data, color, label }: { data: TimeSeriesData[], color: string, label: string }) => {
    const maxValue = Math.max(...data.map(d => d.value))
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - (d.value / maxValue) * 90
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="relative h-64 w-full">
        <div className="absolute top-0 left-0 text-sm text-gray-500">{label}</div>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="absolute bottom-0 right-0 text-sm text-gray-500">
          Latest: {data[data.length - 1].value}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
          Will H5N1 be a disaster?
        </h1>
        <p className="text-2xl text-gray-700 mb-4">
          Probably not - our risk index gives it 5 out of 100 (about 5%)
        </p>
        <p className="text-xl text-gray-600">
          Real-time monitoring of avian influenza trends
        </p>
      </div>

      {/* Main Graph */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Global H5N1 Cases</h2>
        <LineGraph
          data={data.cases}
          color="#ef4444"
          label="Cases over time"
        />
      </div>

      {/* Grid of smaller graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mortality Rate */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mortality Rate</h2>
          <LineGraph
            data={data.mortality}
            color="#3b82f6"
            label="Deaths per 100 cases"
          />
        </div>

        {/* Geographic Spread */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Geographic Spread</h2>
          <LineGraph
            data={data.spread}
            color="#10b981"
            label="Countries affected"
          />
        </div>

        {/* Mutation Rate */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mutation Rate</h2>
          <LineGraph
            data={data.mutations}
            color="#8b5cf6"
            label="New variants detected"
          />
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Current Risk Level</h2>
          <div className="flex items-center justify-center h-48">
            <div className="text-6xl font-bold text-yellow-500">MODERATE</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Data is simulated for demonstration purposes</p>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
}
