import { Carousel } from '@hashi/hds-ui'
import { useState } from 'react'

import { MagazineImage } from '@/pages/magazineDetail/components/MagazineImage'

interface MagazineCoverCarouselProps {
  imageUrls: string[]
  title: string
}

export const MagazineCoverCarousel = ({
  imageUrls,
  title,
}: MagazineCoverCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const images = imageUrls.length > 0 ? imageUrls : [undefined]
  const visibleIndex = Math.min(currentIndex, images.length - 1)

  return (
    <Carousel.Root
      aria-label="매거진 이미지"
      className="aspect-393/524"
      onIndexChange={setCurrentIndex}
    >
      <Carousel.Viewport className="size-full">
        <Carousel.Track>
          {images.map((imageUrl, index) => (
            <Carousel.Item key={`${imageUrl ?? 'fallback'}-${index}`}>
              <MagazineImage
                alt={`${title} 이미지 ${index + 1}`}
                className="size-full"
                src={imageUrl}
              />
            </Carousel.Item>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <p
        aria-live="polite"
        className="typo-body-7 text-primary-200 absolute top-7 right-6 rounded-full bg-white/40 px-2"
      >
        <span className="text-primary-400">{visibleIndex + 1}</span>/
        {images.length}
      </p>
    </Carousel.Root>
  )
}
