import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import {
  DECORATION_STYLES,
  LIGHTING_STYLES,
  TABLE_LAYOUTS,
} from "../config/roomOptions";

// --- UI STYLES ---
const s = {
  page: {
    display: "flex",
    flexDirection: "row",
    height: "calc(100vh - 65px)",
    background: "#fdfbf7",
    overflow: "hidden",
    fontFamily: "'Poppins', sans-serif",
  },
  sidebar: {
    width: "420px",
    background: "#fff",
    borderRight: "1px solid #efe3d3",
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 15px rgba(0,0,0,0.03)",
    zIndex: 10,
  },
  header: {
    padding: "20px 30px",
    borderBottom: "1px solid #efe3d3",
    background: "#fdfbf7",
  },
  title: {
    color: "#b76e4b",
    margin: "0 0 5px",
    fontSize: "1.4rem",
    fontWeight: "bold",
  },
  desc: { color: "#7d8c7a", margin: 0, fontSize: "0.9rem" },
  scrollArea: { flex: 1, overflowY: "auto", padding: "20px 30px" },
  section: { marginBottom: "25px" },
  sectionTitle: {
    color: "#5a4a3f",
    marginBottom: "15px",
    fontSize: "1.05rem",
    fontWeight: "600",
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  card: {
    padding: "15px",
    borderRadius: "12px",
    border: "2px solid #efe3d3",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s",
    background: "#fff",
  },
  cardActive: { borderColor: "#b76e4b", background: "#f9f2ec" },
  emoji: { fontSize: "1.8rem", marginBottom: "8px" },
  cardLabel: {
    fontWeight: "600",
    marginBottom: "4px",
    color: "#333",
    fontSize: "0.9rem",
  },
  cardPrice: { color: "#b76e4b", fontWeight: "500", fontSize: "0.85rem" },
  footer: {
    padding: "20px 30px",
    background: "#fff",
    borderTop: "1px solid #efe3d3",
  },
  priceTotal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  priceLabel: { color: "#5a4a3f", fontWeight: "500" },
  priceValue: { color: "#b76e4b", fontSize: "1.4rem", fontWeight: "bold" },
  canvasContainer: { flex: 1, position: "relative", background: "#1a1a1a" },
};

// --- THEMES ---
const DECO_THEMES = {
  zellige: {
    floor: "#4a6058",
    wall: "#D8C3A5",
    accent: "#D4AF37",
    cloth: "#ffffff",
    pillar: "#2E4C41",
    rug: "#8B2500",
    ceiling: "#D8C3A5",
  },
  traditionnel_marocain: {
    floor: "#8b4513",
    wall: "#EAE0C8",
    accent: "#b85042",
    cloth: "#fdfbf7",
    pillar: "#5A3A22",
    rug: "#b85042",
    ceiling: "#EAE0C8",
  },
  moderne: {
    floor: "#d9d9d9",
    wall: "#ffffff",
    accent: "#333333",
    cloth: "#ffffff",
    pillar: "#cccccc",
    rug: "#555555",
    ceiling: "#ffffff",
  },
};

// --- 3D COMPONENTS ---

const Ceiling = ({ theme }) => (
  <group position={[0, 8, 0]}>
    {/* Plafond principal */}
    <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 30]} />
      <meshStandardMaterial color={theme.ceiling} side={THREE.FrontSide} />
    </mesh>
    {/* Poutres apparentes décoratives (Croisillons) */}
    {[-10, 0, 10].map((z) => (
      <mesh key={`beam-z-${z}`} position={[0, -0.1, z]} receiveShadow>
        <boxGeometry args={[40, 0.2, 0.4]} />
        <meshStandardMaterial color={theme.pillar} roughness={0.9} />
      </mesh>
    ))}
    {[-15, -5, 5, 15].map((x) => (
      <mesh key={`beam-x-${x}`} position={[x, -0.1, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.2, 30]} />
        <meshStandardMaterial color={theme.pillar} roughness={0.9} />
      </mesh>
    ))}
  </group>
);

const WallSconce = ({ position, rotation }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0, 0.1]} castShadow>
      <boxGeometry args={[0.15, 0.5, 0.1]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.8} />
    </mesh>
    <mesh position={[0, 0.2, 0.2]} castShadow>
      <cylinderGeometry args={[0.12, 0.08, 0.3]} />
      <meshStandardMaterial color="#fff" transparent opacity={0.8} />
    </mesh>
    <pointLight
      position={[0, 0.2, 0.3]}
      intensity={4}
      distance={6}
      color="#ffaa00"
    />
  </group>
);

const Chair = ({ position, rotation, color }) => (
  <group position={position} rotation={rotation} castShadow>
    <mesh position={[0, 0.45, 0]} castShadow>
      <boxGeometry args={[0.45, 0.08, 0.45]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.9, -0.2]} castShadow>
      <boxGeometry args={[0.45, 0.55, 0.05]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.15, -0.19]} castShadow>
      <boxGeometry args={[0.46, 0.05, 0.06]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
    </mesh>
    {[-0.18, 0.18].map((x) =>
      [-0.18, 0.18].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.225, z]} castShadow>
          <cylinderGeometry args={[0.015, 0.01, 0.45]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
        </mesh>
      )),
    )}
  </group>
);

const PottedPlant = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.5, 0.3, 1.2, 16]} />
      <meshStandardMaterial color="#b76e4b" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.2, 0]} castShadow>
      <torusGeometry args={[0.5, 0.05, 16, 32]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.8} />
    </mesh>
    <mesh position={[0, 1.8, 0]} castShadow>
      <sphereGeometry args={[0.9, 16, 16]} />
      <meshStandardMaterial color="#2e5c3e" roughness={0.9} />
    </mesh>
    <mesh position={[0.4, 2.3, 0.3]} castShadow>
      <sphereGeometry args={[0.7, 16, 16]} />
      <meshStandardMaterial color="#3a704d" roughness={0.9} />
    </mesh>
    <mesh position={[-0.4, 2.1, -0.3]} castShadow>
      <sphereGeometry args={[0.75, 16, 16]} />
      <meshStandardMaterial color="#285036" roughness={0.9} />
    </mesh>
  </group>
);

const MoroccanArch = ({ position, rotation, theme, withSconce = false }) => (
  <group position={position} rotation={rotation}>
    {[-1.5, 1.5].map((x) => (
      <group key={x} position={[x, 3, 0]}>
        <mesh position={[0, -2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 1, 0.8]} />
          <meshStandardMaterial color={theme.accent} />
        </mesh>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, 6, 0.6]} />
          <meshStandardMaterial color={theme.pillar} />
        </mesh>
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.4, 0.9]} />
          <meshStandardMaterial color={theme.accent} />
        </mesh>
        {/* Applique murale optionnelle sur le pilier */}
        {withSconce && (
          <WallSconce position={[0, 1, 0.3]} rotation={[0, 0, 0]} />
        )}
      </group>
    ))}
    <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
      <torusGeometry args={[1.5, 0.3, 16, 32, Math.PI]} />
      <meshStandardMaterial color={theme.pillar} />
    </mesh>
    {/* Fond de l'arche (Miroir ou faux mur) */}
    <mesh position={[0, 4, 0.05]}>
      <planeGeometry args={[2.5, 5]} />
      <meshStandardMaterial
        color="#1a1a1a"
        roughness={0.1}
        metalness={0.8}
        side={THREE.FrontSide}
      />
    </mesh>
    <mesh position={[0, 7.5, 0.01]} castShadow receiveShadow>
      <planeGeometry args={[4.2, 2.5]} />
      <meshStandardMaterial color={theme.wall} side={THREE.FrontSide} />
    </mesh>
  </group>
);

const PatternedRug = ({ theme }) => (
  <group position={[0, 0.01, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[16, 22]} />
      <meshStandardMaterial color={theme.rug} roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[15, 21]} />
      <meshStandardMaterial color={theme.floor} roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
      <planeGeometry args={[14, 20]} />
      <meshStandardMaterial color={theme.rug} roughness={1} />
    </mesh>
    <mesh
      rotation={[-Math.PI / 2, 0, Math.PI / 4]}
      position={[0, 0.03, 0]}
      receiveShadow
    >
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial color={theme.accent} roughness={1} />
    </mesh>
    <mesh
      rotation={[-Math.PI / 2, 0, Math.PI / 4]}
      position={[0, 0.04, 0]}
      receiveShadow
    >
      <planeGeometry args={[2.5, 2.5]} />
      <meshStandardMaterial color={theme.floor} roughness={1} />
    </mesh>
  </group>
);

const WeddingStage = ({ position, rotation, theme }) => (
  <group position={position} rotation={rotation}>
    {/* Marches d'escalier */}
    <mesh position={[0, 0.1, 2.8]} castShadow receiveShadow>
      <boxGeometry args={[6, 0.2, 1]} />
      <meshStandardMaterial color={theme.floor} roughness={0.5} />
    </mesh>

    {/* Estrade principale */}
    <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
      <boxGeometry args={[12, 0.6, 5]} />
      <meshStandardMaterial color={theme.floor} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.61, 0]} receiveShadow>
      <planeGeometry args={[11.6, 4.6]} rotation={[-Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color={theme.rug} roughness={0.9} />
    </mesh>

    {/* Tentures de fond (Rideaux) */}
    <group position={[0, 3.6, -2.3]}>
      {Array.from({ length: 46 }).map((_, i) => (
        <mesh
          key={`curtain-${i}`}
          position={[-5.6 + i * 0.25, 0, Math.sin(i * 1.5) * 0.05]}
          castShadow
        >
          <cylinderGeometry args={[0.15, 0.15, 6.2, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      ))}
    </group>

    {/* Arche florale (Amariya Backdrop) */}
    <group position={[0, 0.6, -1.8]}>
      <mesh position={[0, 3, 0]} castShadow>
        <torusGeometry args={[3, 0.15, 16, 64, Math.PI]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <torusGeometry args={[3.2, 0.4, 16, 64, Math.PI]} />
        <meshStandardMaterial color="#ffc0cb" roughness={1} />
      </mesh>
      <mesh position={[-3, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} />
      </mesh>
      <mesh position={[3, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} />
      </mesh>
    </group>

    {/* Canapé Royal (Trône) */}
    <group position={[0, 0.6, 0]}>
      {/* Base */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[3.6, 0.8, 1.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {/* Dossier */}
      <mesh position={[0, 1.5, -0.4]} castShadow>
        <boxGeometry args={[3.6, 1.4, 0.3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {/* Coussins dorés */}
      <mesh
        position={[-1, 0.9, -0.1]}
        rotation={[Math.PI / 6, Math.PI / 4, 0]}
        castShadow
      >
        <boxGeometry args={[0.4, 0.4, 0.15]} />
        <meshStandardMaterial color="#D4AF37" />
      </mesh>
      <mesh
        position={[1, 0.9, -0.1]}
        rotation={[Math.PI / 6, -Math.PI / 4, 0]}
        castShadow
      >
        <boxGeometry args={[0.4, 0.4, 0.15]} />
        <meshStandardMaterial color="#D4AF37" />
      </mesh>
      {/* Accoudoirs */}
      <mesh position={[-1.9, 0.9, 0]} castShadow>
        <boxGeometry args={[0.4, 1, 1.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      <mesh position={[1.9, 0.9, 0]} castShadow>
        <boxGeometry args={[0.4, 1, 1.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {/* Finitions dorées */}
      <mesh position={[0, 2.2, -0.4]} castShadow>
        <boxGeometry args={[3.7, 0.15, 0.35]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} />
      </mesh>
      <mesh position={[-1.9, 1.4, 0]} castShadow>
        <boxGeometry args={[0.45, 0.15, 1.25]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} />
      </mesh>
      <mesh position={[1.9, 1.4, 0]} castShadow>
        <boxGeometry args={[0.45, 0.15, 1.25]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.5, -0.4]} castShadow>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} />
      </mesh>
    </group>

    {/* Guéridons (Tables latérales) avec grandes compositions florales */}
    {[-3.5, 3.5].map((x) => (
      <group key={`side-table-${x}`} position={[x, 0.6, 0]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.8]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.05]} />
          <meshStandardMaterial color={theme.cloth} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.4]} />
          <meshStandardMaterial color="#ffc0cb" roughness={1} />
        </mesh>
        <mesh position={[0, 1.6, 0]} castShadow>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial color="#ffa07a" roughness={1} />
        </mesh>
      </group>
    ))}
  </group>
);

const TableSetup = ({
  position,
  rotation = [0, 0, 0],
  type,
  theme,
  guests = 0,
}) => {
  const isRound = type === "round";
  const isCocktail = type === "cocktail";
  const guestsArray = Array.from({ length: guests });

  return (
    <group position={position} rotation={rotation}>
      {/* Plateau supérieur */}
      <mesh position={[0, isCocktail ? 1.1 : 0.75, 0]} castShadow receiveShadow>
        {isRound ? (
          <cylinderGeometry args={[1.5, 1.5, 0.05, 32]} />
        ) : isCocktail ? (
          <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
        ) : (
          <boxGeometry args={[3, 0.05, 1.5]} />
        )}
        <meshStandardMaterial color={theme.cloth} roughness={0.9} />
      </mesh>

      {/* Nappe tombante texturée */}
      {!isCocktail && (
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
          {isRound ? (
            <cylinderGeometry args={[1.45, 1.5, 0.74, 32]} />
          ) : (
            <boxGeometry args={[2.95, 0.74, 1.45]} />
          )}
          <meshStandardMaterial color={theme.cloth} roughness={1} />
        </mesh>
      )}

      {/* Mange-debout */}
      {isCocktail && (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.1, 8]} />
            <meshStandardMaterial color="#222" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
            <meshStandardMaterial color="#222" metalness={0.9} />
          </mesh>
        </group>
      )}

      {/* Grand Centre de table (Vase, Bougies, Bouquet) */}
      {!isCocktail && (
        <group position={[0, 0.77, 0]}>
          <mesh castShadow position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
            <meshStandardMaterial color={theme.accent} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.05, 0.1, 0.4]} />
            <meshStandardMaterial
              color={theme.accent}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Fleurs */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#ff6b6b" roughness={0.9} />
          </mesh>
          <mesh position={[0.15, 0.65, 0.1]} castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#ffa07a" roughness={0.9} />
          </mesh>
          <mesh position={[-0.15, 0.6, -0.1]} castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#ffc0cb" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* Couverts, Verres, Assiettes, Serviettes et Chaises */}
      {!isCocktail &&
        guestsArray.map((_, i) => {
          const angle = (i / guests) * Math.PI * 2;
          let cPos, cRot, pPos;

          if (isRound) {
            cPos = [Math.cos(angle) * 2.1, 0, Math.sin(angle) * 2.1];
            cRot = [0, -angle - Math.PI / 2, 0];
            pPos = [Math.cos(angle) * 1.1, 0.76, Math.sin(angle) * 1.1];
          } else {
            const isSide = i < guests - 2;
            if (isSide) {
              const sideIdx = Math.floor(i / ((guests - 2) / 2));
              const dir = sideIdx === 0 ? 1 : -1;
              const posZ =
                ((i % ((guests - 2) / 2)) - ((guests - 2) / 2 / 2 - 0.5)) *
                0.75;
              cPos = [dir * 1.25, 0, posZ];
              cRot = [0, (dir * -Math.PI) / 2, 0];
              pPos = [dir * 0.6, 0.76, posZ];
            } else {
              const endDir = i % 2 === 0 ? 1 : -1;
              cPos = [0, 0, endDir * 2.1];
              cRot = [0, endDir === 1 ? Math.PI : 0, 0];
              pPos = [0, 0.76, endDir * 0.6];
            }
          }

          return (
            <group key={`guest-${i}`}>
              <Chair position={cPos} rotation={cRot} color={theme.accent} />
              {/* Sous-assiette dorée/argentée */}
              <mesh position={pPos} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.01, 32]} />
                <meshStandardMaterial
                  color={theme.accent}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              {/* Assiette principale */}
              <mesh position={[pPos[0], pPos[1] + 0.015, pPos[2]]} castShadow>
                <cylinderGeometry args={[0.18, 0.15, 0.02, 32]} />
                <meshStandardMaterial
                  color="#ffffff"
                  metalness={0.1}
                  roughness={0.1}
                />
              </mesh>
              {/* Serviette pliée en pyramide */}
              <mesh
                position={[pPos[0], pPos[1] + 0.06, pPos[2]]}
                rotation={cRot}
                castShadow
              >
                <cylinderGeometry args={[0, 0.08, 0.1, 4]} />
                <meshStandardMaterial color={theme.cloth} roughness={0.9} />
              </mesh>
              {/* Couverts */}
              <mesh
                position={[
                  pPos[0] +
                    (isRound
                      ? Math.cos(angle) * 0.3
                      : cRot[1] === 0
                        ? 0.3
                        : cRot[1] === Math.PI
                          ? -0.3
                          : 0),
                  pPos[1],
                  pPos[2] +
                    (isRound
                      ? Math.sin(angle) * 0.3
                      : cRot[1] === -Math.PI / 2
                        ? 0.3
                        : cRot[1] === Math.PI / 2
                          ? -0.3
                          : 0),
                ]}
                rotation={cRot}
                castShadow
              >
                <boxGeometry args={[0.02, 0.005, 0.18]} />
                <meshStandardMaterial
                  color="#e0e0e0"
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
              {/* Verre à pied scintillant */}
              <group position={[pPos[0] + 0.18, 0.84, pPos[2] - 0.18]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.04, 0.03, 0.1, 16]} />
                  <meshStandardMaterial
                    color="#add8e6"
                    transparent
                    opacity={0.6}
                    metalness={0.9}
                    roughness={0.1}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[0, -0.07, 0]} castShadow>
                  <cylinderGeometry args={[0.01, 0.01, 0.06, 8]} />
                  <meshStandardMaterial
                    color="#add8e6"
                    transparent
                    opacity={0.6}
                    metalness={0.9}
                  />
                </mesh>
                <mesh position={[0, -0.1, 0]} castShadow>
                  <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
                  <meshStandardMaterial
                    color="#add8e6"
                    transparent
                    opacity={0.6}
                    metalness={0.9}
                  />
                </mesh>
              </group>
            </group>
          );
        })}
    </group>
  );
};

const RoomScene = ({ deco, layout, light }) => {
  const theme = DECO_THEMES[deco] || DECO_THEMES.moderne;

  return (
    <group>
      <Ceiling theme={theme} />

      {/* Sol */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color={theme.floor} roughness={0.6} />
      </mesh>

      {/* Tapis central très détaillé */}
      {deco !== "moderne" && <PatternedRug theme={theme} />}

      {/* Murs et plinthes (invisibles de l'extérieur) */}
      <group position={[0, 4, -12]}>
        <mesh receiveShadow>
          <planeGeometry args={[40, 8]} />
          <meshStandardMaterial color={theme.wall} side={THREE.FrontSide} />
        </mesh>
        <mesh position={[0, -3.8, 0.01]}>
          <planeGeometry args={[40, 0.4]} />
          <meshStandardMaterial color={theme.pillar} side={THREE.FrontSide} />
        </mesh>
      </group>
      <group position={[-18, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[30, 8]} />
          <meshStandardMaterial color={theme.wall} side={THREE.FrontSide} />
        </mesh>
        <mesh position={[0, -3.8, 0.01]}>
          <planeGeometry args={[30, 0.4]} />
          <meshStandardMaterial color={theme.pillar} side={THREE.FrontSide} />
        </mesh>
      </group>
      <group position={[18, 4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[30, 8]} />
          <meshStandardMaterial color={theme.wall} side={THREE.FrontSide} />
        </mesh>
        <mesh position={[0, -3.8, 0.01]}>
          <planeGeometry args={[30, 0.4]} />
          <meshStandardMaterial color={theme.pillar} side={THREE.FrontSide} />
        </mesh>
      </group>

      {/* Architecture (Arches Marocaines & Miroirs) */}
      {deco !== "moderne" && (
        <group>
          {Array.from({ length: 4 }).map((_, i) => {
            const x = i % 2 === 0 ? -17.5 : 17.5;
            const z = -6 + Math.floor(i / 2) * 10;
            return (
              <MoroccanArch
                key={`arch-${i}`}
                position={[x, 0, z]}
                rotation={[0, i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
                theme={theme}
                withSconce={light === "tamise"}
              />
            );
          })}
          {/* Grande Porte Centrale au fond */}
          <group position={[0, 0, -11.95]}>
            <MoroccanArch
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              theme={theme}
            />
            <mesh position={[0, 3, 0.01]} receiveShadow>
              <planeGeometry args={[2.6, 6]} />
              <meshStandardMaterial
                color="#3e2723"
                roughness={0.9}
                side={THREE.FrontSide}
              />
            </mesh>
            <mesh position={[-0.2, 3, 0.1]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.8} />
            </mesh>
            <mesh position={[0.2, 3, 0.1]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.8} />
            </mesh>
          </group>
        </group>
      )}

      {/* Estrade des Mariés */}
      <WeddingStage
        position={[0, 0, 11]}
        rotation={[0, Math.PI, 0]}
        theme={theme}
      />

      {/* Plantes d'angle */}
      <PottedPlant position={[-16, 0, -10]} />
      <PottedPlant position={[16, 0, -10]} />
      <PottedPlant position={[-16, 0, 8]} />
      <PottedPlant position={[16, 0, 8]} />

      {/* Disposition des tables */}
      {layout === "classique_rond" &&
        Array.from({ length: 6 }).map((_, i) => (
          <TableSetup
            key={`rnd-${i}`}
            position={[i % 2 === 0 ? -6 : 6, 0, Math.floor(i / 2) * 7 - 7]}
            type="round"
            theme={theme}
            guests={8}
          />
        ))}

      {layout === "rectangulaire" &&
        Array.from({ length: 6 }).map((_, i) => (
          <TableSetup
            key={`rect-${i}`}
            position={[i % 2 === 0 ? -6 : 6, 0, Math.floor(i / 2) * 7 - 7]}
            type="rect"
            theme={theme}
            guests={8}
          />
        ))}

      {layout === "cocktail" && <CocktailTables theme={theme} />}

      {layout === "u_shape" && (
        <group position={[0, 0, 2]}>
          <TableSetup
            position={[0, 0, -7]}
            rotation={[0, Math.PI / 2, 0]}
            type="rect"
            theme={theme}
            guests={10}
          />
          <group position={[-4.5, 0, -2.5]}>
            <TableSetup
              position={[0, 0, -2]}
              type="rect"
              theme={theme}
              guests={8}
            />
            <TableSetup
              position={[0, 0, 3]}
              type="rect"
              theme={theme}
              guests={8}
            />
          </group>
          <group position={[4.5, 0, -2.5]}>
            <TableSetup
              position={[0, 0, -2]}
              type="rect"
              theme={theme}
              guests={8}
            />
            <TableSetup
              position={[0, 0, 3]}
              type="rect"
              theme={theme}
              guests={8}
            />
          </group>
        </group>
      )}

      {/* Éclairage physique hyper-détaillé */}
      {light === "tamise" && (
        <>
          <ambientLight intensity={0.15} />
          {[
            [-8, -6],
            [8, -6],
            [-8, 6],
            [8, 6],
            [0, 0],
          ].map((pos, i) => (
            <group key={`l-${i}`} position={[pos[0], 6, pos[1]]}>
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 3]} />
                <meshBasicMaterial color="#111" />
              </mesh>
              <mesh position={[0, 0.2, 0]}>
                <coneGeometry args={[0.4, 0.5, 16]} />
                <meshStandardMaterial color={theme.accent} wireframe />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial color="#ffaa00" />
              </mesh>
              <pointLight
                intensity={15}
                distance={20}
                color="#ffaa00"
                castShadow
              />
            </group>
          ))}
        </>
      )}

      {light === "spots" && (
        <>
          <ambientLight intensity={0.4} />
          <spotLight
            position={[0, 15, 0]}
            angle={0.8}
            penumbra={0.6}
            intensity={25}
            castShadow
          />
          <spotLight
            position={[-10, 12, -10]}
            angle={0.6}
            penumbra={0.5}
            intensity={15}
          />
          <spotLight
            position={[10, 12, 10]}
            angle={0.6}
            penumbra={0.5}
            intensity={15}
          />
        </>
      )}

      {light === "lustres_traditionnels" && (
        <>
          <ambientLight intensity={0.3} />
          <group position={[0, 6, 0]}>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 3]} />
              <meshStandardMaterial color={theme.accent} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.8, 0.1, 0.5, 12]} />
              <meshStandardMaterial color={theme.accent} wireframe />
            </mesh>
            <mesh>
              <cylinderGeometry args={[1.5, 0.1, 0.8, 16]} />
              <meshStandardMaterial color={theme.accent} wireframe />
            </mesh>
            <mesh position={[0, -0.6, 0]}>
              <cylinderGeometry args={[0.5, 0.05, 0.4, 8]} />
              <meshStandardMaterial color={theme.accent} wireframe />
            </mesh>
            <pointLight
              intensity={40}
              distance={30}
              color="#fff1cc"
              castShadow
            />
          </group>
          {[
            [-10, 0],
            [10, 0],
          ].map((pos, i) => (
            <group key={`ll-${i}`} position={[pos[0], 5.5, pos[1]]}>
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 3]} />
                <meshStandardMaterial color={theme.accent} />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.8, 0.1, 0.6, 12]} />
                <meshStandardMaterial color={theme.accent} wireframe />
              </mesh>
              <pointLight
                intensity={20}
                distance={20}
                color="#fff1cc"
                castShadow
              />
            </group>
          ))}
        </>
      )}
    </group>
  );
};

const CocktailTables = ({ theme }) => {
  const [positions] = useState(() =>
    Array.from({ length: 15 }).map(() => [
      (Math.random() - 0.5) * 20,
      0,
      (Math.random() - 0.5) * 16,
    ]),
  );

  return (
    <>
      {positions.map((pos, i) => (
        <TableSetup
          key={`ct-${i}`}
          position={pos}
          type="cocktail"
          theme={theme}
          guests={0}
        />
      ))}
    </>
  );
};

export { RoomScene };

export default function Room3DSimulator() {
  const [deco, setDeco] = useState("traditionnel_marocain");
  const [light, setLight] = useState("lustres_traditionnels");
  const [layout, setLayout] = useState("classique_rond");

  const totalPrice = useMemo(() => {
    const pDeco = DECORATION_STYLES.find((d) => d.id === deco)?.price || 0;
    const pLight = LIGHTING_STYLES.find((l) => l.id === light)?.price || 0;
    const pLayout = TABLE_LAYOUTS.find((t) => t.id === layout)?.price || 0;
    return pDeco + pLight + pLayout;
  }, [deco, light, layout]);

  const renderCards = (options, current, setter) => (
    <div style={s.grid}>
      {options.map((opt) => {
        const isActive = current === opt.id;
        return (
          <div
            key={opt.id}
            style={{ ...s.card, ...(isActive ? s.cardActive : {}) }}
            onClick={() => setter(opt.id)}
          >
            <div style={s.emoji}>{opt.emoji}</div>
            <div style={s.cardLabel}>{opt.label}</div>
            <div style={s.cardPrice}>+ {opt.price.toLocaleString()} MAD</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={s.header}>
          <h2 style={s.title}>DOMINATORES 3D</h2>
          <p style={s.desc}>Simulateur Ultra-Réaliste</p>
        </div>

        <div style={s.scrollArea}>
          <div style={s.section}>
            <div style={s.sectionTitle}>Disposition des tables</div>
            {renderCards(TABLE_LAYOUTS, layout, setLayout)}
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Style de Décoration</div>
            {renderCards(DECORATION_STYLES, deco, setDeco)}
          </div>

          <div style={s.section}>
            <div style={s.sectionTitle}>Éclairage & Ambiance</div>
            {renderCards(LIGHTING_STYLES, light, setLight)}
          </div>
        </div>

        <div style={s.footer}>
          <div style={s.priceTotal}>
            <span style={s.priceLabel}>Prix total simulé</span>
            <span style={s.priceValue}>{totalPrice.toLocaleString()} MAD</span>
          </div>
        </div>
      </div>

      <div style={s.canvasContainer}>
        <Canvas shadows camera={{ position: [0, 8, 16], fov: 50 }}>
          <color attach="background" args={["#1a1a1a"]} />
          <RoomScene deco={deco} light={light} layout={layout} />
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.6}
            scale={50}
            blur={2.5}
            far={10}
          />
          <OrbitControls
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={5}
            maxDistance={35}
          />
        </Canvas>
      </div>
    </div>
  );
}
