import { Button } from '@hashi/hds-ui'
import type { PlaceCandidate } from '@/features/restaurantLocation/api/restaurantLocationApi'
import { safeExternalUrl } from '@/features/restaurantLocation/locationOptions'

export const PlaceCandidates = ({
  candidates,
  disabled,
  onSelect,
}: {
  candidates: PlaceCandidate[]
  disabled: boolean
  onSelect: (candidate: PlaceCandidate) => void
}) => (
  <section className="space-y-4" aria-label="장소 후보">
    <h3 className="text-cool-gray-900 text-sm font-bold">Google Places 후보</h3>
    {!candidates.length && (
      <p className="text-cool-gray-500 text-sm">
        조건에 맞는 장소 후보가 없습니다.
      </p>
    )}
    <ol className="divide-cool-gray-100 divide-y">
      {candidates.map((candidate) => {
        const mapsUrl =
          safeExternalUrl(candidate.googleMapsUri) ??
          `https://www.google.com/maps/search/?api=1&query=${candidate.latitude},${candidate.longitude}`
        return (
          <li key={candidate.selectionToken} className="space-y-3 py-4">
            <h4 className="text-cool-gray-900 text-sm font-bold break-words">
              {candidate.displayName}
            </h4>
            <p className="text-cool-gray-600 text-sm break-words">
              {candidate.address}
            </p>
            <p className="text-cool-gray-500 text-xs">
              {candidate.countryCode} {candidate.administrativeArea}{' '}
              {candidate.businessStatus}
            </p>
            <iframe
              title={`${candidate.displayName} Google 지도`}
              className="aspect-video w-full rounded-md border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${candidate.latitude},${candidate.longitude}&z=17&output=embed`}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-200 text-sm underline"
              >
                Google 지도에서 보기
              </a>
              <Button
                size="sm"
                variant="neutral"
                disabled={disabled}
                onClick={() => onSelect(candidate)}
              >
                이 장소 선택
              </Button>
            </div>
            {candidate.attributions?.map((attribution, index) => {
              const url = safeExternalUrl(attribution.uri)
              return url ? (
                <a
                  key={`${attribution.displayName}-${index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cool-gray-500 block text-xs underline"
                >
                  {attribution.displayName}
                </a>
              ) : (
                <p
                  key={`${attribution.displayName}-${index}`}
                  className="text-cool-gray-500 text-xs"
                >
                  {attribution.displayName}
                </p>
              )
            })}
          </li>
        )
      })}
    </ol>
  </section>
)
