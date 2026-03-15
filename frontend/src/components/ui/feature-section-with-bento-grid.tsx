import React from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export function FeaturesSectionWithBentoGrid() {
  const features = [
    {
      title: "Immutable and Secure",
      description:
        "Once issued, credentials cannot be altered or forged. Blockchain ensures permanent records.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 md:col-span-4 lg:col-span-4 border-b md:border-r dark:border-neutral-800",
    },
    {
      title: "Instant Verification",
      description:
        "Verify credentials in seconds. No waiting, no paperwork, no middlemen.",
      skeleton: <SkeletonTwo />,
      className: "col-span-1 md:col-span-2 lg:col-span-2 border-b dark:border-neutral-800",
    },
    {
      title: "Global Accessibility",
      description:
        "Access your credentials from anywhere in the world. Truly portable and borderless.",
      skeleton: <SkeletonFour />,
      className:
        "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-r dark:border-neutral-800",
    },
    {
      title: "Soulbound Tokens",
      description:
        "Non-transferable credentials tied to your identity. Cannot be sold or transferred.",
      skeleton: <SkeletonThree />,
      className: "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-none",
    },
  ];

  return (
    <div className="relative z-20 py-10 lg:py-20 max-w-7xl mx-auto bg-slate-50">
      <div className="px-8">
        <h4 className="text-3xl lg:text-4xl lg:leading-tight max-w-5xl mx-auto text-center font-extrabold tracking-tight text-slate-900">
          Why Blockchain?
        </h4>

        <p className="text-sm lg:text-base max-w-2xl mt-2 mb-10 mx-auto text-slate-500 text-center font-normal">
          Built for trust, designed for the future
        </p>
      </div>

      <div className="relative px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 mt-12 bg-white border border-slate-100 rounded-2xl shadow-sm dark:border-neutral-800 overflow-hidden">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden bg-white`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <h3 className="max-w-5xl mx-auto text-left tracking-tight text-slate-900 text-xl font-bold md:leading-snug">
      {children}
    </h3>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-slate-500 text-center font-normal",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-white dark:bg-neutral-900 shadow-2xl group h-full rounded-lg outline outline-1 outline-gray-100">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <img
            src="https://images.unsplash.com/photo-1639762681485-074b7f4ec651?q=80&w=2070&auto=format&fit=crop"
            alt="Blockchain Security"
            className="h-full w-full aspect-square object-cover object-center rounded-sm"
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white via-white/50 to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="relative flex gap-10 h-full group/image mt-8">
      <div className="w-full mx-auto bg-transparent dark:bg-transparent group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2 relative">
          <div className="absolute z-10 inset-0 flex items-center justify-center pointer-events-none">
             <div className="bg-sky-500/20 p-4 rounded-full backdrop-blur-md">
                <Lock className="h-12 w-12 text-sky-600" />
             </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1614064641913-a53ec1107d39?q=80&w=2062&auto=format&fit=crop"
            alt="Soulbound Tokens"
            className="h-full w-full aspect-square object-cover object-center rounded-sm blur-none group-hover/image:blur-md transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export const SkeletonTwo = () => {
  const images = [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2664&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=2664&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2664&auto=format&fit=crop",
  ];

  const imageVariants = {
    whileHover: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
    whileTap: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
  };
  return (
    <div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden mt-4">
      <div className="flex flex-row -ml-20">
        {images.map((image, idx) => (
          <motion.div
            variants={imageVariants}
            key={"images-first" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white border border-slate-100 flex-shrink-0 overflow-hidden shadow-sm"
          >
            <img
              src={image}
              alt="Verification images"
              className="rounded-lg h-20 w-20 md:h-32 md:w-32 object-cover flex-shrink-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {images.map((image, idx) => (
          <motion.div
            key={"images-second" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white border border-slate-100 flex-shrink-0 overflow-hidden shadow-sm"
          >
            <img
              src={image}
              alt="Verification images"
              className="rounded-lg h-20 w-20 md:h-32 md:w-32 object-cover flex-shrink-0"
            />
          </motion.div>
        ))}
      </div>

      <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-white to-transparent h-full pointer-events-none" />
      <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-white to-transparent h-full pointer-events-none" />
      <div className="absolute bottom-0 z-[100] inset-x-0 h-20 bg-gradient-to-t from-white to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60 flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
      <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
    </div>
  );
};

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.95, 0.95, 0.95],
      markerColor: [0.012, 0.4, 0.63],
      glowColor: [0.9, 0.9, 0.9],
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};
