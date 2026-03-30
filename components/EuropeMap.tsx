import { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import { ISO_NUM_TO_A2, EUROPE_COUNTRIES } from "@/data/europeCountries";

const WORLD_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json";

// Fixed internal coordinate system — labels stay consistent at any window size
const MAP_WIDTH = 1600;
const MAP_HEIGHT = 900;

interface EuropeMapProps {
  translations: Record<string, string>;
  countryColors: Record<string, string>;
  fontSize: number;
  textColor: string;
  selectedCountry: string | null;
  onSelectCountry: (code: string | null) => void;
  visibleCountries?: string[];
}

interface GeoFeature {
  type: string;
  properties: { name: string; [key: string]: unknown };
  geometry: GeoPermissibleObjects;
  id?: string;
}

const EuropeMap = forwardRef<SVGSVGElement, EuropeMapProps>(({
  translations,
  countryColors,
  fontSize,
  textColor,
  selectedCountry,
  onSelectCountry,
  visibleCountries,
}, forwardedRef) => {
  const [geoData, setGeoData] = useState<GeoFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useImperativeHandle(forwardedRef, () => svgRef.current!);

  useEffect(() => {
    fetch(WORLD_TOPO_URL)
      .then((r) => r.json())
      .then((topo) => {
        const countries = feature(
          topo,
          (topo).objects.countries
        ) as any;
        setGeoData(countries.features);
      });
  }, []);

  // Fixed projection — never changes with window size
  const projection = useMemo(
    () =>
      geoMercator()
        .center([15, 54])
        .scale(MAP_HEIGHT * 1.15)
        .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]),
    []
  );

  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

  const europeFeatures = useMemo(
    () =>
      geoData.filter((f) => {
        const a2 = ISO_NUM_TO_A2[f.id || ""];
        return a2 && EUROPE_COUNTRIES[a2];
      }),
    [geoData]
  );

  // Manual label offsets for countries with irregular shapes
  const LABEL_OFFSETS: Record<string, [number, number]> = {
    HR: [10, -20],
    NO: [-130, 600],
    RU: [-1050, 350],
    SE: [-50, 180],
    FI: [-10, 110],
    FR: [80, -60],
    GB: [25, 70],
  };

  const getCentroid = (feat: GeoFeature): [number, number] => {
    const [cx, cy] = pathGenerator.centroid(feat.geometry);
    const code = getCountryCode(feat);
    const offset = LABEL_OFFSETS[code];
    if (offset) return [cx + offset[0], cy + offset[1]];
    return [cx, cy];
  };

  const getCountryCode = (feat: GeoFeature) =>
    ISO_NUM_TO_A2[feat.id || ""] || "";

  const isVisible = (code: string) => {
    if (!visibleCountries) return true;
    return visibleCountries.includes(code);
  };

  const getCountryFill = (code: string) => {
    if (!isVisible(code)) return "hsl(var(--map-land))";
    if (countryColors[code]) return countryColors[code];
    if (code === selectedCountry) return "hsl(var(--map-selected))";
    if (code === hoveredCountry) return "hsl(var(--map-hover))";
    return "hsl(var(--map-land))";
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="max-w-full max-h-full"
        style={{ background: "hsl(var(--map-water))", aspectRatio: "16/9" }}
      >
        {europeFeatures.map((feat) => {
          const code = getCountryCode(feat);
          const d = pathGenerator(feat.geometry);
          if (!d) return null;
          const visible = isVisible(code);
          return (
            <path
              key={code}
              d={d}
              fill={getCountryFill(code)}
              stroke="hsl(var(--map-border))"
              strokeWidth={0.5}
              className="cursor-pointer"
              style={{
                opacity: visible ? 1 : 0.6,
              }}
              onClick={() =>
                onSelectCountry(selectedCountry === code ? null : code)
              }
              onMouseEnter={() => setHoveredCountry(code)}
              onMouseLeave={() => setHoveredCountry(null)}
            />
          );
        })}

        {europeFeatures.map((feat) => {
          const code = getCountryCode(feat);
          if (!isVisible(code)) return null;
          const [cx, cy] = getCentroid(feat);
          if (!cx || !cy || isNaN(cx) || isNaN(cy)) return null;
          const label = translations[code] || "";
          if (!label) return null;
          return (
            <text
              key={`label-${code}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fill={textColor}
              fontFamily="'DM Sans', sans-serif"
              fontWeight={600}
              className="pointer-events-none select-none"
              style={{
                textShadow:
                  "0 0 4px #ffffff, 0 0 8px #ffffff",
              }}
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
});

EuropeMap.displayName = "EuropeMap";

export default EuropeMap;