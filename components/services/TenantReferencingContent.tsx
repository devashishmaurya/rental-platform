'use client'

import { useMemo, useRef, useState } from 'react'

const BASE_REFERENCE_PRICE = 799

interface ReferenceEntry {
  id: number
}

export function TenantReferencingContent() {
  const [entries, setEntries] = useState<ReferenceEntry[]>([{ id: 0 }])
  const nextIdRef = useRef(1)

  const addEntry = () => {
    setEntries((prev) => [...prev, { id: nextIdRef.current++ }])
  }

  const removeEntry = (id: number) => {
    setEntries((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((e) => e.id !== id)
    })
  }

  const { count, total } = useMemo(
    () => ({
      count: entries.length,
      total: entries.length * BASE_REFERENCE_PRICE,
    }),
    [entries.length]
  )

  const countLabel = `${count}× Reference`

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
        Tenant Referencing
      </h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-8">
        
        {/* Left column */}
        <section className="space-y-6">

          {/* Learn more card */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Want to learn more about referencing?
              </h2>
              <p className="mt-3 text-sm text-gray-700">
                Referencing helps you check a tenant’s identity, income and previous
                rental history before they sign a tenancy agreement.
              </p>
            </div>
          </div>

          {/* Property details */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Property Details
              </h2>
            </div>

            <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address Line 1
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Postcode
                </label>
                <input
                  type="text"
                  className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tenant / Guarantor */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Tenant / Guarantor Details
              </h2>
            </div>

            <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">

              {entries.map((entry, index) => {
                const namePrefix = `ref-${entry.id}`
                const canRemove = entries.length > 1

                return (
                  <div key={entry.id}>
                    <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>

                      {canRemove && (
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            className="rounded-md bg-red-500 px-3 py-2 text-white text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={`${namePrefix}-type`}
                          defaultChecked
                        />
                        Tenant
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={`${namePrefix}-type`}
                        />
                        Guarantor
                      </label>
                    </div>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={addEntry}
                className="mt-3 rounded-md border px-3 py-2 text-sm"
              >
                Add additional tenant or guarantor
              </button>

            </div>
          </div>
        </section>

        {/* Right column */}
        <aside>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">

            <h2 className="font-semibold mb-3">Order Summary</h2>

            <div className="flex justify-between text-sm">
              <span>{countLabel}</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between font-semibold mt-2">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <button
              className="mt-4 w-full rounded-md bg-emerald-600 text-white py-2"
              disabled
            >
              Checkout Securely
            </button>

          </div>
        </aside>

      </div>
    </main>
  )
}