import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tenancy Creation | Rent Setu',
  description:
    'Professional tenancy creation with contracts, compliance checks, deposit handling and rent collection – modelled on OpenRent Rent Now.',
}

export default function TenancyCreationPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          Tenancy Creation – Rent Setu
        </h1>

        <div className="space-y-6">
          {/* Card 1 */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <header className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">
                What is Tenancy Creation?
              </h2>
            </header>

            <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <p className="text-sm text-gray-700 md:text-[15px]">
                Tenancy Creation is our professional tenancy setup service – it
                covers referencing, contract signing, deposit handling and
                first-rent collection and brings the whole process online in a
                clear, streamlined way.
              </p>

              <ul className="mt-4 space-y-1.5 text-sm text-gray-800 md:text-[15px]">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>Simple one-off fee per completed tenancy.</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>Receive applications instantly from interested tenants.</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>
                    Use watertight tenancy agreements, kept up-to-date with
                    legislation.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>
                    Get guidance from Rent Setu throughout the process, from
                    offer to move-in.
                  </span>
                </li>
              </ul>

              <div className="mt-5 rounded-md bg-sky-50 px-4 py-3 text-sm text-sky-900">
                <p>
                  Want to read more about how it works? Check our{' '}
                  <span className="font-medium text-sky-700 underline underline-offset-2">
                    Tenancy Creation help articles
                  </span>{' '}
                  or{' '}
                  <span className="font-medium text-sky-700 underline underline-offset-2">
                    ask the community
                  </span>.
                </p>
              </div>
            </div>
          </section>

          {/* Card 2 */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <header className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Moving forward with Tenancy Creation
              </h2>
            </header>

            <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="rounded-md bg-sky-50 px-4 py-4 text-sm text-sky-900">
                <p>
                  When you publish a property on Rent Setu, we&apos;ll show
                  enquiries and Tenancy Creation options for that listing here.
                  Until then, you can get set up by adding your first property.
                </p>

                <p className="mt-3">
                  Already have tenants lined up? You can still use Tenancy
                  Creation without advertising the property first.
                </p>
              </div> 

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/landlords/add-listing"
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                >
                  Add a Property to Rent Setu
                </Link>

                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-500/70"
                  disabled
                  title="Will start direct tenancy-creation flow without advertising"
                >
                  Use Tenancy Creation without advertising
                </button>
{/*                 
                <Link
                  href="/services/tenancy-creation"
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                >
                  Use Tenancy Creation without advertising
                </Link> */}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}