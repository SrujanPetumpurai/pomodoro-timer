const LAYERS = [
  // Back — moves slowest
  {
    src: "/Naruto_mountain_bg/sky_layer.png",
    duration: 900,
    top: "0%",
    height: "100%",
  },

  // Clouds
  {
    src: "/Naruto_mountain_bg/distant_mountains.png",
    duration: 900,
    top: "20%",
    height: "70%",
  },

  // Back mountains
  {
    src: "/Naruto_mountain_bg/statue_layer.png",
    duration: 900,
    top: "30%",
    height: "75%",
  },

  // Front mountains — moves fastest
  {
    src: "/Naruto_mountain_bg/river_layer.png",
    duration: 900,
    top: "65%",
    height: "70%",
  },
  {
    src: "/Naruto_mountain_bg/bottom_rocks_layer.png",
    duration: 900,
    top: "75%",
    height: "70%",
  },
];


export default function ParallaxBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-sky-300">
      {/* ^ this is the actual fix — solid backdrop so transparent art shows blue, not checker */}
      {LAYERS.map((layer) => (
        <div
          key={layer.src}
          className="absolute left-0 w-[300%]"
          style={{
            top: layer.top,
            height: layer.height,
            backgroundImage: `url(${layer.src})`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            animation: `scroll-left ${layer.duration}s linear infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}