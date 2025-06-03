import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { company_promo_table } from "@prisma/client";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  promoBanner: company_promo_table[];
};

const DashboardPromobanner = ({ promoBanner }: Props) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  useEffect(() => {
    if (!api) {
      return;
    }

    setActiveSlide(api.selectedScrollSnap() + 1 - 1);

    api.on("select", () => {
      setActiveSlide(api.selectedScrollSnap() + 1 - 1);
    });
  }, [api]);
  return (
    <div className="w-full h-full rounded-md relative">
      <Carousel
        className="w-full"
        plugins={[plugin.current]}
        opts={{
          align: "start",
        }}
        setApi={setApi}
      >
        <CarouselContent>
          {promoBanner.length > 0 &&
            promoBanner.map((item, index) => (
              <CarouselItem
                className="flex justify-center items-center"
                key={item.company_promo_id}
              >
                <Image
                  src={item.company_promo_image}
                  alt="guide"
                  width={500}
                  height={500}
                  className="w-[500px] h-[500px] rounded-md"
                  priority={index === activeSlide}
                />
              </CarouselItem>
            ))}
        </CarouselContent>
      </Carousel>

      <div className="flex justify-center space-x-2 mt-4">
        {promoBanner.length > 0 &&
          Array.from({ length: promoBanner.length }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full cursor-pointer transition ${
                activeSlide === index ? "bg-violet-950" : "bg-gray-400"
              }`}
              onClick={() => setActiveSlide(index)}
            ></div>
          ))}
      </div>
    </div>
  );
};

export default DashboardPromobanner;
