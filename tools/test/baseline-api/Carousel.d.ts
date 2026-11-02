// exports: Carousel, type CarouselPerView, type CarouselProps
interface CarouselLabels {
    previousSlide: string;
    nextSlide: string;
    slideOf: (slide: number, total: number) => string;
    slidesOf: (first: number, last: number, total: number) => string;
    carouselRole: string;
    slideRole: string;
}
interface CarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
    children?: React.ReactNode | undefined;
    label?: string | undefined;
    index?: number | undefined;
    defaultIndex?: number | undefined;
    onIndexChange?: ((index: number) => void) | undefined;
    loop?: boolean | undefined;
    arrows?: boolean | undefined;
    dots?: boolean | undefined;
    previousLabel?: string | undefined;
    nextLabel?: string | undefined;
    slideLabel?: ((index: number, count: number) => string) | undefined;
    perView?: CarouselPerView | number | undefined;
}
interface CarouselPerView {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
}
declare const Carousel: React.ForwardRefExoticComponent<CarouselProps & React.RefAttributes<HTMLElement>>;
