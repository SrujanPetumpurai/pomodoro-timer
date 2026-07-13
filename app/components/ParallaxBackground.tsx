const LAYERS = [
  { src: "/skies/Sky_sky.png", duration: 240 },
  { src: "/skies/sky_moon.png", duration: 200 },
  { src: "/skies/sky_clouds.png", duration: 160 },
  { src: "/skies/Sky_back_mountain.png", duration: 130 },
  { src: "/skies/sky_cloud_floor_2.png", duration: 100 },
  { src: "/skies/sky_cloud_floor.png", duration: 80 },
  { src: "/skies/Sky_cloud_single.png", duration: 60 },
  { src: "/skies/sky_front_mountain.png", duration: 40 },
  { src: "/skies/Sky_front_cloud.png", duration: 25 },
];

export default function ParallaxBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {LAYERS.map((layer) => (
        <div
          key={layer.src}
          className="absolute inset-0 flex"
          style={{
            animation: `scroll-left ${layer.duration}s linear infinite`,
            width: "200%",
          }}
        >
          <img
            src={layer.src}
            alt=""
            className="w-1/2 h-full object-cover"
            style={{ imageRendering: "pixelated" }}
            draggable={false}
          />
          <img
            src={layer.src}
            alt=""
            className="w-1/2 h-full object-cover"
            style={{ imageRendering: "pixelated" }}
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}